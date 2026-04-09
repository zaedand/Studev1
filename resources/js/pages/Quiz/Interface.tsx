import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import {
    Clock, ChevronLeft, ChevronRight, Flag, AlertTriangle,
    CheckCircle, Circle, Shield, Send
} from 'lucide-react';

interface Question {
    id: number;
    question: string;
    options: { A: string; B: string; C: string; D: string };
}

interface QuizInterfaceProps {
    module: { id: number; title: string; color: string };
    questions: Question[];
    quizConfig: {
        time_limit: number;
        total_questions: number;
        session_id: string;
        attempt_number: number;
        max_attempts: number;
    };
}

// ─── Helper: ambil CSRF token dari meta tag Laravel ───────────────────────────
function getCsrfToken(): string {
    return (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '';
}

export default function Interface({ module, questions, quizConfig }: QuizInterfaceProps) {
    const [currentQuestion, setCurrentQuestion]     = useState(0);
    const [answers, setAnswers]                     = useState<Record<number, string>>({});
    const [timeLeft, setTimeLeft]                   = useState(quizConfig.time_limit * 60);
    const [isSubmitting, setIsSubmitting]           = useState(false);
    const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
    const [showIncomplete, setShowIncomplete]       = useState(false);
    const [isTimeUp, setIsTimeUp]                   = useState(false);
    const [tabViolations, setTabViolations]         = useState(0);
    const [showCheatWarning, setShowCheatWarning]   = useState(false);
    const [cheatMsg, setCheatMsg]                   = useState('');
    const [isPageVisible, setIsPageVisible]         = useState(true);

    // Gunakan ref untuk nilai yang dipakai di dalam closure timer/submit
    // agar selalu mendapat nilai terbaru tanpa perlu re-create effect
    const timeLeftRef  = useRef(quizConfig.time_limit * 60);
    const answersRef   = useRef<Record<number, string>>({});
    const timerRef     = useRef<ReturnType<typeof setInterval> | null>(null);
    const submitCalled = useRef(false);

    // Sync state → ref setiap render
    timeLeftRef.current  = timeLeft;
    answersRef.current   = answers;

    const answeredCount      = useMemo(() => Object.keys(answers).length, [answers]);
    const isAllAnswered      = useMemo(() => answeredCount === questions.length, [answeredCount, questions.length]);
    const progressPercentage = useMemo(() => (answeredCount / questions.length) * 100, [answeredCount, questions.length]);

    const unansweredNums = useMemo(
        () => questions.filter(q => !answers[q.id]).map((_, i) => i + 1),
        [questions, answers]
    );

    // ── Anti-cheat: tab/window switch ────────────────────────
    useEffect(() => {
        const onVisibility = () => {
            if (document.visibilityState === 'hidden' && !submitCalled.current) {
                setTabViolations(n => {
                    const next = n + 1;
                    setCheatMsg(`⚠️ Peringatan #${next}: Berpindah tab/window terdeteksi!`);
                    setShowCheatWarning(true);
                    toast.error(`Peringatan tab switch (${next}x)`, { duration: 4000, icon: '🚨' });
                    return next;
                });
                setIsPageVisible(false);
            } else {
                setIsPageVisible(true);
            }
        };
        document.addEventListener('visibilitychange', onVisibility);
        return () => document.removeEventListener('visibilitychange', onVisibility);
    }, []);

    // ── Anti-cheat: devtools shortcuts & right-click ─────────
    useEffect(() => {
        const onCtx = (e: MouseEvent) => e.preventDefault();
        const onKey = (e: KeyboardEvent) => {
            if (
                e.key === 'F12' ||
                (e.ctrlKey && e.shiftKey && ['I','J','C'].includes(e.key.toUpperCase())) ||
                (e.ctrlKey && ['U','S'].includes(e.key.toUpperCase())) ||
                e.key === 'PrintScreen'
            ) e.preventDefault();
        };
        document.addEventListener('contextmenu', onCtx);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('contextmenu', onCtx);
            document.removeEventListener('keydown', onKey);
        };
    }, []);

    // ── Anti-cheat: copy/cut ──────────────────────────────────
    useEffect(() => {
        const block = (e: ClipboardEvent) => e.preventDefault();
        document.addEventListener('copy', block);
        document.addEventListener('cut', block);
        return () => {
            document.removeEventListener('copy', block);
            document.removeEventListener('cut', block);
        };
    }, []);

    // ── Prevent browser back/unload ───────────────────────────
    useEffect(() => {
        const onUnload = (e: BeforeUnloadEvent) => {
            if (!submitCalled.current) { e.preventDefault(); e.returnValue = ''; }
        };
        const onPop = () => {
            if (!submitCalled.current) {
                window.history.pushState(null, '', window.location.href);
                toast.error('Tidak bisa keluar dari quiz!', { duration: 3000 });
            }
        };
        window.addEventListener('beforeunload', onUnload);
        window.addEventListener('popstate', onPop);
        window.history.pushState(null, '', window.location.href);
        return () => {
            window.removeEventListener('beforeunload', onUnload);
            window.removeEventListener('popstate', onPop);
        };
    }, []);

    // ── Timer ─────────────────────────────────────────────────
    // Dibuat sekali saja (deps kosong) — baca nilai terbaru lewat ref
    useEffect(() => {
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                const next = prev - 1;
                timeLeftRef.current = next;

                if (next === 300) toast('⏰ Sisa 5 menit!', { icon: '⏰', duration: 5000 });
                if (next === 60)  toast.error('⚠️ Sisa 1 menit!', { duration: 5000 });
                if (next === 30)  toast.error('🚨 Sisa 30 detik!', { duration: 5000 });

                if (next <= 0) {
                    clearInterval(timerRef.current!);
                    setIsTimeUp(true);
                    if (!submitCalled.current) {
                        submitCalled.current = true;
                        toast.loading('Waktu habis! Menyimpan jawaban...', { duration: 4000 });
                        setTimeout(() => performSubmit(), 800);
                    }
                    return 0;
                }
                return next;
            });
        }, 1000);

        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // ─────────────────────────────────────────────────────────
    // CORE SUBMIT — menggunakan fetch langsung (bukan router.post)
    // Alasan: router.post dari @inertiajs/react kadang gagal memproses
    // redirect 302 dengan benar saat halaman quiz tidak memiliki AppLayout
    // (Interface.tsx adalah fullscreen page tanpa layout), menyebabkan
    // "Cannot read properties of null (reading 'page')".
    //
    // Solusi: fetch POST biasa → server redirect → window.location.href
    // Ini juga mengatasi masalah 419 karena kita refresh CSRF token dahulu.
    // ─────────────────────────────────────────────────────────
    const performSubmit = useCallback(async () => {
        if (timerRef.current) clearInterval(timerRef.current);
        setIsSubmitting(true);

        const timeTaken = (quizConfig.time_limit * 60) - Math.max(timeLeftRef.current, 0);
        const currentAnswers = answersRef.current;

        try {
            // 1. Refresh CSRF token terlebih dahulu (fix 419 di hosting)
            let csrfToken = getCsrfToken();
            if (!csrfToken) {
                try {
                    await fetch('/sanctum/csrf-cookie', { credentials: 'include' });
                    csrfToken = getCsrfToken();
                } catch {
                    // lanjut meski refresh gagal
                }
            }

            // 2. POST jawaban ke server
            const response = await fetch(`/module/${module.id}/quiz/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json, text/html, */*',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Inertia': 'true',
                    'X-Inertia-Version': (window as any).__inertia_version__ ?? '',
                },
                credentials: 'include',
                redirect: 'follow',
                body: JSON.stringify({
                    session_id: quizConfig.session_id,
                    answers: currentAnswers,
                    time_taken: timeTaken,
                }),
            });

            // 3. Navigasi ke result page
            if (response.ok || response.redirected) {
                // Paksa full page navigate ke result untuk menghindari Inertia SPA issue
                window.location.href = `/module/${module.id}/quiz/result`;
            } else if (response.status === 419) {
                // CSRF expired — coba refresh dan redirect ke show
                toast.error('Sesi expired. Mengalihkan...', { duration: 3000 });
                setTimeout(() => { window.location.href = `/module/${module.id}/quiz`; }, 2000);
            } else {
                // Error lain — tetap coba navigasi ke result (data mungkin sudah tersimpan)
                const text = await response.text();
                console.error('Submit response:', response.status, text);
                toast.error('Ada masalah saat submit. Mencoba ke halaman hasil...', { duration: 3000 });
                setTimeout(() => { window.location.href = `/module/${module.id}/quiz/result`; }, 2500);
            }
        } catch (err) {
            console.error('Submit fetch error:', err);
            // Network error — coba navigasi ke result tetap
            toast.error('Koneksi bermasalah. Mencoba ke halaman hasil...', { duration: 3000 });
            setTimeout(() => { window.location.href = `/module/${module.id}/quiz/result`; }, 2500);
        }
    }, [module.id, quizConfig]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleAnswerChange = useCallback((questionId: number, answer: string) => {
        if (isTimeUp || isSubmitting) return;
        setAnswers(prev => ({ ...prev, [questionId]: answer }));
    }, [isTimeUp, isSubmitting]);

    const handleSubmitClick = useCallback(() => {
        if (isSubmitting || isTimeUp || submitCalled.current) return;
        if (!isAllAnswered) { setShowIncomplete(true); return; }
        setShowConfirmSubmit(true);
    }, [isSubmitting, isTimeUp, isAllAnswered]);

    const confirmSubmit = useCallback(() => {
        setShowConfirmSubmit(false);
        if (!submitCalled.current) {
            submitCalled.current = true;
            performSubmit();
        }
    }, [performSubmit]);

    const goToPrev = useCallback(() => setCurrentQuestion(p => Math.max(0, p - 1)), []);
    const goToNext = useCallback(() => setCurrentQuestion(p => Math.min(questions.length - 1, p + 1)), [questions.length]);

    const formattedTime = useMemo(() => {
        const m = Math.floor(timeLeft / 60), s = timeLeft % 60;
        return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    }, [timeLeft]);

    const timeColor = useMemo(() => {
        if (timeLeft > 300) return 'text-emerald-400';
        if (timeLeft > 60)  return 'text-amber-400';
        return 'text-red-400 animate-pulse';
    }, [timeLeft]);

    const timeBg = useMemo(() => {
        if (timeLeft > 300) return 'bg-emerald-500/20 border-emerald-500/30';
        if (timeLeft > 60)  return 'bg-amber-500/20 border-amber-500/30';
        return 'bg-red-500/20 border-red-500/30';
    }, [timeLeft]);

    const currentQ           = questions[currentQuestion];
    const isQuestionAnswered = answers[currentQ?.id] !== undefined;

    if (!currentQ) return null;

    return (
        <div className="min-h-screen bg-gray-950 select-none" style={{ userSelect: 'none' }}>
            <Toaster
                position="top-right"
                toastOptions={{
                    style:   { background: '#1f2937', color: '#f9fafb', borderRadius: '12px', border: '1px solid #374151' },
                    success: { style: { background: '#065f46', color: '#ecfdf5', border: '1px solid #10b981' } },
                    error:   { style: { background: '#7f1d1d', color: '#fef2f2', border: '1px solid #ef4444' } },
                }}
            />

            {/* Page-hidden anti-cheat overlay */}
            {!isPageVisible && (
                <div className="fixed inset-0 bg-gray-950 z-[100] flex items-center justify-center">
                    <div className="text-center">
                        <Shield className="h-16 w-16 mx-auto mb-4 text-red-500" />
                        <p className="text-xl font-bold text-white">Kembali ke quiz...</p>
                    </div>
                </div>
            )}

            {/* Submitting / time-up overlay */}
            {(isTimeUp || isSubmitting) && (
                <div className="fixed inset-0 bg-gray-950/90 z-[90] flex items-center justify-center backdrop-blur-sm">
                    <div className="bg-gray-900 border border-blue-500/40 rounded-2xl p-8 text-center max-w-sm mx-4 shadow-2xl">
                        {isTimeUp && !isSubmitting && (
                            <Clock className="h-14 w-14 text-red-400 mx-auto mb-4 animate-pulse" />
                        )}
                        <h2 className="text-2xl font-bold text-white mb-2">
                            {isTimeUp ? 'Waktu Habis!' : 'Menyimpan Quiz...'}
                        </h2>
                        <p className="text-gray-400 mb-5">
                            {isTimeUp ? 'Jawaban sedang disimpan otomatis...' : 'Harap tunggu sebentar'}
                        </p>
                        <div className="flex justify-center">
                            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-6xl mx-auto p-3 sm:p-4 lg:p-6">

                {/* ── Sticky Header ───────────────────────────────────── */}
                <div className="bg-gray-900 border border-gray-700/50 rounded-2xl p-3 sm:p-4 mb-4 sticky top-2 z-20 shadow-2xl shadow-black/50">
                    <div className="flex items-center justify-between gap-2">

                        {/* Module info */}
                        <div className="flex items-center gap-2 min-w-0">
                            <div className={`p-1.5 rounded-lg ${module.color} flex-shrink-0`}>
                                <Flag className="h-4 w-4 text-white" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-white truncate">Quiz {module.title}</p>
                                <p className="text-xs text-gray-500">
                                    {currentQuestion + 1}/{questions.length} · Coba {quizConfig.attempt_number}/{quizConfig.max_attempts}
                                </p>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
                            {tabViolations > 0 && (
                                <div className="hidden sm:flex items-center gap-1 bg-red-500/20 border border-red-500/30 rounded-lg px-2 py-1">
                                    <Shield className="h-3 w-3 text-red-400" />
                                    <span className="text-xs text-red-400 font-bold">{tabViolations}x</span>
                                </div>
                            )}
                            <div className="hidden sm:block text-center">
                                <p className="text-xs text-gray-500">Dijawab</p>
                                <p className={`text-sm font-bold ${isAllAnswered ? 'text-emerald-400' : 'text-white'}`}>
                                    {answeredCount}/{questions.length}
                                </p>
                            </div>
                            <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border ${timeBg}`}>
                                <Clock className={`h-3.5 w-3.5 ${timeColor}`} />
                                <span className={`text-sm font-bold tabular-nums ${timeColor}`}>{formattedTime}</span>
                            </div>
                            <button
                                onClick={handleSubmitClick}
                                disabled={isSubmitting || isTimeUp || submitCalled.current}
                                className={`flex items-center gap-1.5 py-1.5 px-3 rounded-xl font-semibold text-sm transition-all ${
                                    isAllAnswered && !isTimeUp && !submitCalled.current
                                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/40 active:scale-95'
                                        : 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                                }`}
                            >
                                <Send className="h-3.5 w-3.5" />
                                <span>{isSubmitting ? '...' : 'Submit'}</span>
                            </button>
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-2.5 w-full bg-gray-800 rounded-full h-1.5">
                        <div
                            className={`h-1.5 rounded-full transition-all duration-500 ${isAllAnswered ? 'bg-emerald-500' : 'bg-blue-500'}`}
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>

                    {/* Mobile stats */}
                    <div className="sm:hidden flex justify-between mt-1.5 text-xs text-gray-500">
                        <span>{answeredCount}/{questions.length} dijawab</span>
                        {tabViolations > 0 && <span className="text-red-400">{tabViolations}x ⚠️</span>}
                        {!isAllAnswered && <span className="text-amber-400">{questions.length - answeredCount} belum</span>}
                    </div>
                    {!isAllAnswered && (
                        <div className="hidden sm:flex mt-1.5 items-center gap-1.5 text-xs text-amber-400">
                            <AlertTriangle className="h-3 w-3" />
                            <span>{questions.length - answeredCount} soal belum dijawab</span>
                        </div>
                    )}
                </div>

                {/* ── Main layout ──────────────────────────────────────── */}
                <div className="flex flex-col lg:grid lg:grid-cols-4 gap-4">

                    {/* Sidebar – question navigation */}
                    <div className="lg:col-span-1 order-2 lg:order-1">
                        <div className="bg-gray-900 border border-gray-700/50 rounded-2xl p-3 sm:p-4 lg:sticky lg:top-28">
                            <p className="text-xs font-semibold text-gray-400 mb-2.5">Navigasi Soal</p>
                            <div className="flex flex-wrap gap-1.5">
                                {questions.map((q, i) => (
                                    <button
                                        key={`nav-${q.id}-${i}`}
                                        onClick={() => setCurrentQuestion(i)}
                                        className={`w-8 h-8 rounded-lg font-bold text-xs transition-all duration-200 ${
                                            currentQuestion === i
                                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50 scale-110'
                                                : answers[q.id]
                                                    ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-700/50 hover:bg-emerald-800/50'
                                                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-700/50'
                                        }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                            {/* Legend (desktop only) */}
                            <div className="hidden lg:flex flex-col gap-1.5 mt-3 text-xs">
                                {[
                                    { cls: 'bg-blue-600', label: 'Aktif' },
                                    { cls: 'bg-emerald-900/50 border border-emerald-700/50', label: 'Dijawab' },
                                    { cls: 'bg-gray-800 border border-gray-700/50', label: 'Belum' },
                                ].map(({ cls, label }) => (
                                    <div key={`legend-${label}`} className="flex items-center gap-2">
                                        <div className={`w-3.5 h-3.5 rounded ${cls}`} />
                                        <span className="text-gray-500">{label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Question card */}
                    <div className="lg:col-span-3 order-1 lg:order-2">
                        <div className="bg-gray-900 border border-gray-700/50 rounded-2xl p-4 sm:p-6">

                            {/* Card header */}
                            <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                                        <span className="text-sm font-bold text-blue-400">{currentQuestion + 1}</span>
                                    </div>
                                    <span className="text-xs text-gray-500">dari {questions.length} soal</span>
                                </div>
                                {isQuestionAnswered
                                    ? <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2 py-1 text-xs">
                                        <CheckCircle className="h-3.5 w-3.5" /><span className="hidden sm:inline">Terjawab</span>
                                      </div>
                                    : <div className="flex items-center gap-1.5 text-gray-500 bg-gray-800/50 border border-gray-700/50 rounded-lg px-2 py-1 text-xs">
                                        <Circle className="h-3.5 w-3.5" /><span className="hidden sm:inline">Belum dijawab</span>
                                      </div>
                                }
                            </div>

                            {/* Question text */}
                            <p className="text-base sm:text-lg text-gray-100 leading-relaxed font-medium mb-6">
                                {currentQ.question}
                            </p>

                            {/* Options */}
                            <div className="space-y-2.5 mb-6">
                                {(Object.entries(currentQ.options) as [string, string][]).map(([opt, txt]) => {
                                    const selected = answers[currentQ.id] === opt;
                                    const disabled = isTimeUp || isSubmitting;
                                    return (
                                        <label
                                            key={`opt-${currentQ.id}-${opt}`}
                                            className={[
                                                'flex items-start gap-3 p-3 sm:p-4 rounded-xl border transition-all duration-200',
                                                disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
                                                selected
                                                    ? 'border-blue-500 bg-blue-500/10'
                                                    : disabled
                                                        ? 'border-gray-700/50 bg-gray-800/30'
                                                        : 'border-gray-700/50 bg-gray-800/30 hover:border-gray-600 hover:bg-gray-800/60',
                                            ].join(' ')}
                                        >
                                            <input
                                                type="radio"
                                                name={`q_${currentQ.id}`}
                                                value={opt}
                                                checked={selected}
                                                onChange={() => handleAnswerChange(currentQ.id, opt)}
                                                disabled={disabled}
                                                className="sr-only"
                                            />
                                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-sm transition-all ${
                                                selected ? 'bg-blue-600 text-white' : 'bg-gray-700/70 text-gray-400'
                                            }`}>
                                                {opt}
                                            </div>
                                            <span className={`flex-1 text-sm sm:text-base leading-relaxed mt-0.5 ${selected ? 'text-white' : 'text-gray-300'}`}>
                                                {txt}
                                            </span>
                                            {selected && <CheckCircle className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />}
                                        </label>
                                    );
                                })}
                            </div>

                            {/* Prev / Next navigation */}
                            <div className="flex items-center justify-between gap-3">
                                <button
                                    onClick={goToPrev}
                                    disabled={currentQuestion === 0}
                                    className="flex items-center gap-1.5 py-2 px-3 sm:px-5 rounded-xl border border-gray-700/50 text-gray-400 hover:text-white hover:border-gray-600 hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm font-medium"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    <span>Sebelumnya</span>
                                </button>
                                <span className="text-xs text-gray-600 hidden sm:block">{currentQuestion + 1} / {questions.length}</span>
                                <button
                                    onClick={goToNext}
                                    disabled={currentQuestion === questions.length - 1}
                                    className="flex items-center gap-1.5 py-2 px-3 sm:px-5 rounded-xl border border-gray-700/50 text-gray-400 hover:text-white hover:border-gray-600 hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm font-medium"
                                >
                                    <span>Selanjutnya</span>
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Modals ────────────────────────────────────────────── */}
            {showCheatWarning && (
                <Modal onClose={() => setShowCheatWarning(false)}>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-red-500/20 rounded-xl"><Shield className="h-6 w-6 text-red-400" /></div>
                        <h3 className="text-lg font-bold text-white">Pelanggaran Terdeteksi!</h3>
                    </div>
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-5">
                        <p className="text-red-300 text-sm">{cheatMsg}</p>
                        <p className="text-red-400/60 text-xs mt-1">Pelanggaran ke-{tabViolations} — aktivitas ini dicatat</p>
                    </div>
                    <button onClick={() => setShowCheatWarning(false)}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-colors">
                        Kembali ke Quiz
                    </button>
                </Modal>
            )}

            {showIncomplete && (
                <Modal onClose={() => setShowIncomplete(false)}>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-amber-500/20 rounded-xl"><AlertTriangle className="h-6 w-6 text-amber-400" /></div>
                        <h3 className="text-lg font-bold text-white">Soal Belum Lengkap</h3>
                    </div>
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-5">
                        <p className="text-amber-300 text-sm mb-2">Soal yang belum dijawab:</p>
                        <div className="flex flex-wrap gap-1.5">
                            {unansweredNums.map(n => (
                                <span key={`unanswered-${n}`}
                                    className="bg-amber-500/20 text-amber-300 text-xs font-bold px-2 py-0.5 rounded border border-amber-500/30">
                                    {n}
                                </span>
                            ))}
                        </div>
                        <p className="text-amber-400/60 text-xs mt-2">{questions.length - answeredCount} soal belum terjawab</p>
                    </div>
                    <button onClick={() => setShowIncomplete(false)}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-colors">
                        Lanjutkan Mengerjakan
                    </button>
                </Modal>
            )}

            {showConfirmSubmit && (
                <Modal onClose={() => setShowConfirmSubmit(false)}>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-emerald-500/20 rounded-xl"><CheckCircle className="h-6 w-6 text-emerald-400" /></div>
                        <h3 className="text-lg font-bold text-white">Konfirmasi Submit Quiz</h3>
                    </div>
                    <div className="space-y-2 mb-5 text-sm">
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex gap-2 items-center">
                            <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                            <span className="text-emerald-300">Semua {answeredCount} soal telah dijawab</span>
                        </div>
                        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-3 flex gap-2 items-center">
                            <Clock className="h-4 w-4 text-blue-400 flex-shrink-0" />
                            <span className="text-gray-300">Sisa waktu: <strong className="text-white">{formattedTime}</strong></span>
                        </div>
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex gap-2 items-start">
                            <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                            <span className="text-red-300 text-xs">Jawaban tidak dapat diubah setelah submit</span>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => setShowConfirmSubmit(false)}
                            className="flex-1 py-2.5 border border-gray-600 text-gray-400 hover:text-white hover:border-gray-500 rounded-xl transition-colors text-sm font-medium">
                            Batal
                        </button>
                        <button onClick={confirmSubmit}
                            className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold transition-colors text-sm">
                            Ya, Submit Quiz
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-gray-900 border border-gray-700/50 rounded-2xl p-5 sm:p-6 max-w-md w-full shadow-2xl shadow-black/50">
                {children}
            </div>
        </div>
    );
}
