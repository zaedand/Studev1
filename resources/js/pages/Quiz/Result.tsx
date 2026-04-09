import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import {
    Trophy, Clock, CheckCircle, XCircle, Target, Flame,
    RotateCcw, ArrowRight, Award, TrendingUp, BookOpen,
    AlertTriangle, Star, Home, Zap, Info
} from 'lucide-react';

interface AttemptSummary {
    attempt_number: number;
    score: number;
    correct_count: number;
    points_earned: number;
    completed_at: string | null;
}

interface QuizResultProps {
    module: { id: number; title: string; color: string };
    result: {
        quiz_id: number;
        score: number;
        correct_count: number;
        total_questions: number;
        percentage: number;
        grade: string;
        points_earned: number;
        base_points: number;
        attempt_number: number;
    };
    submission: {
        quiz_id: number;
        module_id: number;
        user_id: number;
        answers: Record<string, string>;
        score: number;
        correct_count: number;
        total_questions: number;
        time_taken: number;
        submitted_at: string;
        points_earned: number;
        attempt_number: number;
    };
    questions_review: Array<{
        id: number;
        question: string;
        options: Record<string, string>;
        correct_answer: string;
        user_answer: string | null;
        is_correct: boolean;
    }>;
    attempts_summary: {
        all_attempts: AttemptSummary[];
        attempts_used: number;
        max_attempts: number;
        best_score: number;
        can_retry: boolean;
        had_perfect: boolean;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Quiz Result', href: '#' },
];

export default function Result({ module, result, submission, questions_review, attempts_summary }: QuizResultProps) {
    const score         = result?.score ?? 0;
    const grade         = result?.grade ?? 'F';
    const correctCount  = result?.correct_count ?? 0;
    const totalQ        = result?.total_questions ?? 0;
    const percentage    = result?.percentage ?? score;
    const pointsEarned  = result?.points_earned ?? 0;
    const attemptNumber = result?.attempt_number ?? submission?.attempt_number ?? 1;
    const basePoints    = result?.base_points ?? 0;
    const bonusPoints   = pointsEarned - basePoints;

    const attemptsUsed = attempts_summary?.attempts_used ?? 1;
    const maxAttempts  = attempts_summary?.max_attempts ?? 3;
    const canRetry     = attempts_summary?.can_retry ?? false;
    const hadPerfect   = attempts_summary?.had_perfect ?? (score === 100);
    const allAttempts  = attempts_summary?.all_attempts ?? [];

    // Show toast on load
    useEffect(() => {
        if (score >= 100) {
            toast.success(`Sempurna! Skor 100 🎉 +${pointsEarned} poin`, { duration: 5000 });
        } else if (score >= 80) {
            toast.success(`Nilai ${score} — Bagus! +${pointsEarned} poin`, { duration: 4000 });
        } else if (score >= 60) {
            toast(`Nilai ${score} · +${pointsEarned} poin`, { duration: 3000, icon: '📊' });
        } else {
            toast.error(`Nilai ${score} · Pelajari lagi materinya!`, { duration: 4000 });
        }
    }, []);

    if (!module || !result || !submission) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Quiz Error" />
                <div className="max-w-lg mx-auto p-6 text-center mt-20">
                    <XCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-white mb-3">Gagal Memuat Hasil</h1>
                    <p className="text-gray-400 mb-6">Data hasil quiz tidak tersedia.</p>
                    <Link href="/dashboard" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-2.5 px-5 rounded-xl font-semibold">
                        <Home className="h-4 w-4" />Dashboard
                    </Link>
                </div>
            </AppLayout>
        );
    }

    const formatTime = (s: number) => {
        if (!s || s <= 0) return '—';
        const m = Math.floor(s / 60), sec = s % 60;
        return m === 0 ? `${sec}d` : `${m}m ${sec}d`;
    };

    const gradeStyle = (g: string) => ({
        A: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30',
        B: 'text-blue-400 bg-blue-500/20 border-blue-500/30',
        C: 'text-amber-400 bg-amber-500/20 border-amber-500/30',
        D: 'text-orange-400 bg-orange-500/20 border-orange-500/30',
        F: 'text-red-400 bg-red-500/20 border-red-500/30',
    }[g] ?? 'text-red-400 bg-red-500/20 border-red-500/30');

    const scoreMsg = () => {
        if (score >= 100) return { msg: 'Sempurna!', emoji: '🌟' };
        if (score >= 80)  return { msg: 'Bagus Sekali!', emoji: '🎯' };
        if (score >= 70)  return { msg: 'Cukup Baik!', emoji: '📈' };
        if (score >= 60)  return { msg: 'Lumayan', emoji: '📚' };
        return { msg: 'Tetap Semangat!', emoji: '💪' };
    };
    const { msg, emoji } = scoreMsg();

    // Determine retry warning message
    const getRetryWarning = () => {
        if (hadPerfect) {
            return {
                show: true,
                type: 'danger' as const,
                title: 'Skor Sudah Sempurna!',
                body: `Anda sudah mendapat skor 100 di percobaan ke-${allAttempts.find(a => a.score === 100)?.attempt_number ?? '?'}. Jika memaksa coba lagi, skor tidak akan dikonversi ke fire points (+0 poin).`,
            };
        }
        if (!canRetry) return null;
        const nextAttempt = attemptsUsed + 1;
        const bonus = nextAttempt <= 3 ? [20, 10, 0][nextAttempt - 1] : 0;
        return {
            show: true,
            type: 'info' as const,
            title: `Percobaan ke-${nextAttempt} dari ${maxAttempts}`,
            body: bonus > 0
                ? `Jika mendapat 100 di percobaan ke-${nextAttempt}, Anda akan mendapat bonus +${bonus} fire points di atas poin dasar.`
                : `Ini adalah percobaan terakhir. Tidak ada bonus tambahan, hanya poin dasar dari jawaban benar.`,
        };
    };
    const retryWarning = getRetryWarning();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Hasil Quiz - ${module.title}`} />
            <Toaster
                position="top-right"
                toastOptions={{
                    style:   { background: '#1f2937', color: '#f9fafb', borderRadius: '12px', border: '1px solid #374151' },
                    success: { style: { background: '#065f46', color: '#ecfdf5', border: '1px solid #10b981' } },
                    error:   { style: { background: '#7f1d1d', color: '#fef2f2', border: '1px solid #ef4444' } },
                }}
            />

            <div className="max-w-3xl mx-auto p-4 sm:p-6">
                {/* Header */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl mb-4 shadow-lg shadow-amber-900/50">
                        <Trophy className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-white mb-1">Quiz Selesai!</h1>
                    <p className="text-gray-400">{msg} {emoji} · Percobaan ke-{attemptNumber}</p>
                </div>

                {/* Score Card */}
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700/50 rounded-2xl p-5 sm:p-8 mb-5">
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mb-6">
                        <div className="text-center">
                            <div className="text-6xl sm:text-7xl font-black text-white tabular-nums">{score}</div>
                            <div className="text-gray-500 text-sm mt-1">dari 100 poin</div>
                        </div>
                        <div className="hidden sm:block w-px h-20 bg-gray-700" />
                        <div className="sm:hidden h-px w-20 bg-gray-700" />
                        <div className="text-center">
                            <div className={`text-5xl sm:text-6xl font-black px-5 py-2.5 rounded-2xl border ${gradeStyle(grade)}`}>{grade}</div>
                            <div className="text-gray-500 text-sm mt-1">Grade</div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                            { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', label: 'Benar', val: correctCount },
                            { icon: XCircle,     color: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/20',         label: 'Salah', val: totalQ - correctCount },
                            { icon: Clock,       color: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/20',        label: 'Waktu', val: formatTime(submission.time_taken) },
                            { icon: Flame,       color: 'text-orange-400',  bg: 'bg-orange-500/10 border-orange-500/20',    label: 'Fire Pts', val: pointsEarned > 0 ? `+${pointsEarned}` : '0' },
                        ].map(({ icon: Icon, color, bg, label, val }) => (
                            <div key={label} className={`${bg} border rounded-xl p-3 text-center`}>
                                <Icon className={`h-5 w-5 ${color} mx-auto mb-1`} />
                                <div className="text-lg font-bold text-white">{val}</div>
                                <div className="text-xs text-gray-500">{label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Fire points breakdown */}
                    {pointsEarned > 0 && (
                        <div className="mt-3 bg-orange-500/10 border border-orange-500/20 rounded-xl p-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                            <div className="flex items-center gap-1.5">
                                <Flame className="h-3.5 w-3.5 text-orange-400" />
                                <span className="text-orange-300 font-semibold">Rincian Poin:</span>
                            </div>
                            <span className="text-orange-400/80">Basis: +{basePoints}</span>
                            {bonusPoints > 0 && <span className="text-amber-400/80">Bonus Coba-{attemptNumber}: +{bonusPoints}</span>}
                            {bonusPoints === 0 && score === 100 && attemptNumber >= 3 && (
                                <span className="text-gray-500">Bonus: +0 (percobaan ke-3)</span>
                            )}
                            <span className="text-white font-bold ml-auto">Total: +{pointsEarned}</span>
                        </div>
                    )}
                    {pointsEarned === 0 && (
                        <div className="mt-3 bg-gray-800/50 border border-gray-700/30 rounded-xl p-3 flex items-center gap-2 text-xs text-gray-500">
                            <Info className="h-3.5 w-3.5" />
                            <span>Fire points tidak diberikan karena skor sempurna sudah pernah dicapai sebelumnya.</span>
                        </div>
                    )}
                </div>

                {/* Attempts History */}
                {allAttempts.length > 1 && (
                    <div className="bg-gray-900 border border-gray-700/50 rounded-2xl p-4 sm:p-5 mb-5">
                        <h3 className="font-semibold text-gray-200 mb-3 flex items-center gap-2 text-sm">
                            <TrendingUp className="h-4 w-4 text-blue-400" />
                            Riwayat Semua Percobaan
                        </h3>
                        <div className="space-y-2">
                            {allAttempts.map(a => (
                                <div
                                    key={a.attempt_number}
                                    className={`flex items-center justify-between p-3 rounded-xl border text-sm ${
                                        a.attempt_number === attemptNumber
                                            ? 'bg-blue-500/10 border-blue-500/30'
                                            : 'bg-gray-800/40 border-gray-700/30'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                                            a.score === 100 ? 'bg-emerald-600 text-white' : 'bg-gray-700 text-gray-300'
                                        }`}>
                                            {a.attempt_number}
                                        </div>
                                        <div>
                                            <span className="text-gray-300">Percobaan ke-{a.attempt_number}</span>
                                            {a.attempt_number === attemptNumber && (
                                                <span className="ml-2 text-xs text-blue-400 bg-blue-500/20 px-1.5 py-0.5 rounded">Ini</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 text-right">
                                        <div>
                                            <span className={`font-bold ${a.score >= 80 ? 'text-emerald-400' : a.score >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                                                {a.score}
                                            </span>
                                            <span className="text-gray-500 text-xs"> /100</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-orange-400">
                                            <Flame className="h-3.5 w-3.5" />
                                            <span className="text-xs font-semibold">+{a.points_earned}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Performance */}
                <div className="bg-gray-900 border border-gray-700/50 rounded-2xl p-4 sm:p-5 mb-5">
                    <h3 className="font-semibold text-gray-200 mb-3 flex items-center gap-2 text-sm">
                        <Target className="h-4 w-4 text-purple-400" />
                        Analisis Performa
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { emoji: percentage >= 80 ? '🎯' : percentage >= 60 ? '📊' : '📈', label: 'Akurasi', val: `${percentage}%`, color: percentage >= 80 ? 'text-emerald-400' : percentage >= 60 ? 'text-amber-400' : 'text-red-400' },
                            { emoji: (submission.time_taken ?? 0) < 1200 ? '⚡' : '⏱️', label: 'Per Soal', val: totalQ > 0 ? `${Math.round((submission.time_taken || 0) / totalQ)}d` : '—', color: 'text-blue-400' },
                            { emoji: grade === 'A' ? '🏆' : grade === 'B' ? '🥈' : grade === 'C' ? '🥉' : '📚', label: 'Grade', val: grade, color: gradeStyle(grade).split(' ')[0] },
                        ].map(item => (
                            <div key={item.label} className="bg-gray-800/50 border border-gray-700/40 rounded-xl p-3 text-center">
                                <div className="text-xl mb-1">{item.emoji}</div>
                                <div className={`text-base font-bold ${item.color}`}>{item.val}</div>
                                <div className="text-xs text-gray-500">{item.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Question Review */}
                <div className="bg-gray-900 border border-gray-700/50 rounded-2xl p-4 sm:p-5 mb-5">
                    <h3 className="font-semibold text-gray-200 mb-3 flex items-center gap-2 text-sm">
                        <BookOpen className="h-4 w-4 text-purple-400" />
                        Review Jawaban
                        <span className="ml-auto text-xs text-gray-500 font-normal">{correctCount}/{totalQ} benar</span>
                    </h3>
                    {!questions_review?.length ? (
                        <p className="text-gray-500 text-sm text-center py-6">Data review tidak tersedia.</p>
                    ) : (
                        <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                            {questions_review.map((q, i) => (
                                <div key={q.id} className={`p-3 rounded-xl border-l-4 ${q.is_correct ? 'border-l-emerald-500 bg-emerald-500/5 border border-emerald-500/15' : 'border-l-red-500 bg-red-500/5 border border-red-500/15'}`}>
                                    <div className="flex items-start gap-2.5">
                                        <div className={`flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${q.is_correct ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>{i + 1}</div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-gray-200 mb-1.5 leading-relaxed">{q.question}</p>
                                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                                                <span className="text-gray-500">Anda: <span className={`font-semibold ${q.user_answer ? (q.is_correct ? 'text-emerald-400' : 'text-red-400') : 'text-gray-600'}`}>
                                                    {q.user_answer ? `${q.user_answer}. ${q.options?.[q.user_answer] ?? ''}` : 'Tidak dijawab'}
                                                </span></span>
                                                {!q.is_correct && (
                                                    <span className="text-gray-500">Benar: <span className="font-semibold text-emerald-400">{q.correct_answer}. {q.options?.[q.correct_answer] ?? ''}</span></span>
                                                )}
                                            </div>
                                        </div>
                                        {q.is_correct ? <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0" /> : <XCircle className="h-4 w-4 text-red-400 flex-shrink-0" />}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recommendation */}
                <div className="bg-gray-900 border border-gray-700/50 rounded-2xl p-4 sm:p-5 mb-5">
                    <h3 className="font-semibold text-gray-200 mb-3 flex items-center gap-2 text-sm">
                        <Award className="h-4 w-4 text-amber-400" />
                        Rekomendasi
                    </h3>
                    <div className={`rounded-xl p-4 border mb-3 ${score >= 80 ? 'bg-emerald-500/10 border-emerald-500/20' : score >= 60 ? 'bg-amber-500/10 border-amber-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                        <p className={`font-semibold text-sm mb-1 ${score >= 80 ? 'text-emerald-300' : score >= 60 ? 'text-amber-300' : 'text-red-300'}`}>
                            {score >= 100 ? '🌟 Sempurna! Kuasai Materi Selanjutnya' : score >= 80 ? '🎯 Bagus! Lanjutkan ke Modul Berikut' : score >= 60 ? '📊 Cukup. Review Materi yang Salah' : '📚 Perlu Belajar Lebih Banyak'}
                        </p>
                        <p className={`text-xs ${score >= 80 ? 'text-emerald-400/70' : score >= 60 ? 'text-amber-400/70' : 'text-red-400/70'}`}>
                            {score >= 100 ? 'Penguasaan materi sempurna. Lanjutkan ke modul berikutnya!' : score >= 80 ? 'Pemahaman baik. Lanjutkan materi berikutnya atau praktikum.' : score >= 60 ? 'Pahami kembali soal yang salah sebelum melanjutkan.' : 'Pelajari ulang semua materi dan tonton video pengayaan.'}
                        </p>
                    </div>
                    {pointsEarned > 0 && (
                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3 flex items-center gap-2 text-xs">
                            <Zap className="h-3.5 w-3.5 text-orange-400 flex-shrink-0" />
                            <span className="text-orange-300"><strong>+{pointsEarned} fire points</strong> telah ditambahkan ke leaderboard!</span>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3">
                    {/* Main actions */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Link href={`/module/${module.id}`} className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-3 px-5 rounded-xl font-semibold transition-all text-sm hover:scale-105">
                            <ArrowRight className="h-4 w-4" />Kembali ke Modul
                        </Link>
                        <Link href="/leaderboard" className="flex-1 inline-flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white py-3 px-5 rounded-xl font-semibold transition-all text-sm hover:scale-105">
                            <Trophy className="h-4 w-4" />Leaderboard
                        </Link>
                    </div>

                    {/* Retry section */}
                    {canRetry && retryWarning && (
                        <div className={`rounded-2xl p-4 border ${retryWarning.type === 'danger' ? 'bg-red-500/10 border-red-500/30' : 'bg-blue-500/10 border-blue-500/20'}`}>
                            <div className="flex items-start gap-3 mb-3">
                                {retryWarning.type === 'danger'
                                    ? <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                                    : <Info className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                                }
                                <div>
                                    <p className={`font-semibold text-sm mb-1 ${retryWarning.type === 'danger' ? 'text-red-300' : 'text-blue-300'}`}>
                                        {retryWarning.title}
                                    </p>
                                    <p className={`text-xs leading-relaxed ${retryWarning.type === 'danger' ? 'text-red-400/70' : 'text-blue-400/70'}`}>
                                        {retryWarning.body}
                                    </p>
                                </div>
                            </div>
                            <Link
                                href={`/module/${module.id}/quiz`}
                                className={`w-full inline-flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl font-semibold transition-all text-sm ${
                                    retryWarning.type === 'danger'
                                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                                        : 'bg-blue-600 hover:bg-blue-500 text-white'
                                }`}
                            >
                                <RotateCcw className="h-4 w-4" />
                                {retryWarning.type === 'danger' ? 'Tetap Coba Lagi (Tanpa Poin)' : `Coba Lagi (Percobaan ke-${attemptsUsed + 1})`}
                            </Link>
                        </div>
                    )}

                    {/* No more retries */}
                    {!canRetry && (
                        <div className="bg-gray-800/50 border border-gray-700/30 rounded-xl p-3 text-center">
                            <p className="text-gray-500 text-xs">Semua {maxAttempts} percobaan telah digunakan.</p>
                            {attempts_summary?.best_score != null && (
                                <p className="text-gray-400 text-sm font-semibold mt-1">
                                    <Star className="h-4 w-4 text-amber-400 inline mr-1" />
                                    Skor terbaik: {attempts_summary.best_score}
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Timestamp */}
                <div className="text-center mt-5">
                    <div className="inline-flex items-center gap-2 bg-gray-800/40 border border-gray-700/20 px-4 py-2 rounded-full">
                        <Clock className="h-3.5 w-3.5 text-gray-600" />
                        <span className="text-xs text-gray-600">
                            {submission.submitted_at ? new Date(submission.submitted_at).toLocaleString('id-ID', { day:'numeric', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' }) : '—'}
                        </span>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
