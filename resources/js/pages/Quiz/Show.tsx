import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import { useEffect } from 'react';
import {
    ArrowLeft,
    Clock,
    HelpCircle,
    Trophy,
    AlertTriangle,
    Play,
    CheckCircle,
    XCircle,
    RotateCcw,
    Flame,
    Shield,
    Star
} from 'lucide-react';

interface QuizShowProps {
    module: {
        id: number;
        title: string;
        color: string;
    };
    quiz: {
        id: number;
        title: string;
        description: string;
        total_questions: number;
        time_limit: number;
        max_attempts: number;
        points_per_question: number;
    };
    userAttempts: {
        attempts_used: number;
        max_attempts: number;
        best_score?: number | null;
        last_attempt_date?: string | null;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Modul', href: '/dashboard' },
    { title: 'Quiz', href: '#' },
];

export default function Show({ module, quiz, userAttempts }: QuizShowProps) {
    // FIX: Use actual max_attempts from quiz or userAttempts
    const maxAttempts = quiz.max_attempts ?? userAttempts.max_attempts;
    const attemptsUsed = userAttempts.attempts_used ?? 0;
    const canTakeQuiz = attemptsUsed < maxAttempts;
    const totalPoints = quiz.total_questions * quiz.points_per_question;

    // Show flash messages as toasts
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        // handled via Inertia flash - could wire up here if needed
    }, []);

    const handleStartQuiz = () => {
        const toastId = toast.loading('Mempersiapkan quiz...');
        router.post(`/module/${module.id}/quiz/start`, {}, {
            onError: () => {
                toast.error('Gagal memulai quiz. Coba lagi.', { id: toastId });
            },
            onSuccess: () => {
                toast.dismiss(toastId);
            }
        });
    };

    const getScoreColor = (score: number) => {
        if (score >= 90) return 'text-emerald-400';
        if (score >= 80) return 'text-blue-400';
        if (score >= 70) return 'text-amber-400';
        if (score >= 60) return 'text-orange-400';
        return 'text-red-400';
    };

    const getScoreBg = (score: number) => {
        if (score >= 90) return 'bg-emerald-500/20 border-emerald-500/30';
        if (score >= 80) return 'bg-blue-500/20 border-blue-500/30';
        if (score >= 70) return 'bg-amber-500/20 border-amber-500/30';
        if (score >= 60) return 'bg-orange-500/20 border-orange-500/30';
        return 'bg-red-500/20 border-red-500/30';
    };

    const getGrade = (score: number) => {
        if (score >= 90) return 'A';
        if (score >= 80) return 'B';
        if (score >= 70) return 'C';
        if (score >= 60) return 'D';
        return 'F';
    };

    const attemptsLeft = maxAttempts - attemptsUsed;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Quiz - ${module.title}`} />
            <Toaster
                position="top-right"
                toastOptions={{
                    style: { background: '#1f2937', color: '#f9fafb', borderRadius: '12px', border: '1px solid #374151' },
                    success: { style: { background: '#065f46', color: '#ecfdf5', border: '1px solid #10b981' } },
                    error: { style: { background: '#7f1d1d', color: '#fef2f2', border: '1px solid #ef4444' } },
                    loading: { style: { background: '#1e3a5f', color: '#bfdbfe', border: '1px solid #3b82f6' } },
                }}
            />

            <div className="max-w-3xl mx-auto p-4 sm:p-6">
                {/* Back link */}
                <Link
                    href={`/module/${module.id}`}
                    className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors mb-6 text-sm font-medium"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Kembali ke Modul
                </Link>

                {/* Header Card */}
                <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 border border-gray-700/50 rounded-2xl p-5 sm:p-6 mb-5 sm:mb-6">
                    <div className="flex items-start gap-3 sm:gap-4 mb-5 sm:mb-6">
                        <div className={`p-2.5 sm:p-3 rounded-xl ${module.color} flex-shrink-0`}>
                            <HelpCircle className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">{quiz.title}</h1>
                            <p className="text-sm text-gray-400 leading-relaxed">{quiz.description}</p>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                            { icon: HelpCircle, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', label: 'Jumlah Soal', value: `${quiz.total_questions}` },
                            { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', label: 'Batas Waktu', value: `${quiz.time_limit} menit` },
                            { icon: RotateCcw, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20', label: 'Percobaan', value: `${attemptsUsed}/${maxAttempts}` },
                            { icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20', label: 'Max Poin', value: `${totalPoints}` },
                        ].map(({ icon: Icon, color, bg, label, value }) => (
                            <div key={label} className={`${bg} border rounded-xl p-3 sm:p-4`}>
                                <div className="flex items-center gap-1.5 mb-1.5">
                                    <Icon className={`h-4 w-4 ${color}`} />
                                    <span className="text-xs text-gray-500">{label}</span>
                                </div>
                                <p className="text-lg sm:text-xl font-bold text-white">{value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* FIX: Only show best score if it's not null/undefined and > 0 */}
                {userAttempts.best_score != null && userAttempts.best_score > 0 && attemptsUsed > 0 && (
                    <div className={`border rounded-2xl p-4 sm:p-5 mb-5 sm:mb-6 ${getScoreBg(userAttempts.best_score)}`}>
                        <h3 className="font-semibold text-gray-300 text-sm mb-3 flex items-center gap-2">
                            <Trophy className="h-4 w-4 text-amber-400" />
                            Hasil Terbaik Anda
                        </h3>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`text-4xl sm:text-5xl font-black ${getScoreColor(userAttempts.best_score)}`}>
                                    {userAttempts.best_score}
                                </div>
                                <div>
                                    <div className="text-gray-400 text-sm">dari 100</div>
                                    <div className={`text-lg font-bold ${getScoreColor(userAttempts.best_score)}`}>
                                        Grade {getGrade(userAttempts.best_score)}
                                    </div>
                                </div>
                            </div>
                            {userAttempts.last_attempt_date && (
                                <div className="text-right">
                                    <div className="text-xs text-gray-500">Terakhir dimainkan</div>
                                    <div className="text-sm text-gray-400">
                                        {new Date(userAttempts.last_attempt_date).toLocaleDateString('id-ID', {
                                            day: 'numeric', month: 'short', year: 'numeric'
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Rules */}
                <div className="bg-gray-900 border border-gray-700/50 rounded-2xl p-4 sm:p-6 mb-5 sm:mb-6">
                    <h3 className="font-semibold text-gray-200 mb-4 flex items-center gap-2 text-sm sm:text-base">
                        <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-amber-400" />
                        Aturan & Ketentuan Quiz
                    </h3>
                    <div className="space-y-2.5">
                        {[
                            { icon: CheckCircle, color: 'text-emerald-400', text: `${quiz.total_questions} soal pilihan ganda (A/B/C/D)` },
                            { icon: CheckCircle, color: 'text-emerald-400', text: `Waktu pengerjaan maksimal ${quiz.time_limit} menit` },
                            { icon: CheckCircle, color: 'text-emerald-400', text: `Setiap jawaban benar bernilai ${quiz.points_per_question} poin` },
                            { icon: CheckCircle, color: 'text-emerald-400', text: `Maksimal ${maxAttempts} kali percobaan per mahasiswa` },
                            { icon: Shield, color: 'text-blue-400', text: 'Sistem anti-cheat aktif — aktivitas mencurigakan dicatat' },
                            { icon: XCircle, color: 'text-red-400', text: 'Quiz tidak dapat dihentikan setelah dimulai' },
                            { icon: XCircle, color: 'text-red-400', text: 'Jawaban otomatis tersimpan saat waktu habis' },
                        ].map(({ icon: Icon, color, text }) => (
                            <div key={text} className="flex items-start gap-3 text-sm">
                                <Icon className={`h-4 w-4 ${color} flex-shrink-0 mt-0.5`} />
                                <span className="text-gray-400">{text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Action Section */}
                <div className="text-center">
                    {canTakeQuiz ? (
                        <div className="space-y-3">
                            <button
                                onClick={handleStartQuiz}
                                className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white py-3.5 sm:py-4 px-8 sm:px-10 rounded-2xl text-base sm:text-lg font-bold transition-all duration-200 shadow-lg shadow-emerald-900/50 hover:shadow-emerald-900/70 hover:scale-105 active:scale-95"
                            >
                                <Play className="h-5 w-5 sm:h-6 sm:w-6" />
                                Mulai Quiz
                            </button>
                            <p className="text-sm text-gray-500">
                                Sisa percobaan: <strong className="text-gray-300">{attemptsLeft}x</strong>
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 sm:p-8">
                                <XCircle className="h-12 w-12 sm:h-14 sm:w-14 text-red-400 mx-auto mb-3 sm:mb-4" />
                                <h3 className="text-lg font-bold text-red-400 mb-2">Percobaan Habis</h3>
                                <p className="text-sm text-red-300/70">
                                    Anda telah menggunakan semua {maxAttempts} percobaan quiz.
                                </p>
                                {userAttempts.best_score != null && (
                                    <div className={`mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl border ${getScoreBg(userAttempts.best_score)}`}>
                                        <Star className={`h-4 w-4 ${getScoreColor(userAttempts.best_score)}`} />
                                        <span className={`font-bold ${getScoreColor(userAttempts.best_score)}`}>
                                            Skor terbaik: {userAttempts.best_score}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <Link
                                    href={`/module/${module.id}/quiz/result`}
                                    className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-2.5 px-5 rounded-xl font-semibold transition-colors text-sm"
                                >
                                    <Trophy className="h-4 w-4" />
                                    Lihat Hasil Terakhir
                                </Link>
                                <Link
                                    href={`/module/${module.id}`}
                                    className="inline-flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-gray-300 py-2.5 px-5 rounded-xl font-semibold transition-colors text-sm"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Kembali ke Modul
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
