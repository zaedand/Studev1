import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    Trophy,
    Clock,
    CheckCircle,
    XCircle,
    Target,
    Flame,
    RotateCcw,
    ArrowRight,
    Award,
    TrendingUp,
    BookOpen
} from 'lucide-react';

interface QuizResultProps {
    module: {
        id: number;
        title: string;
        color: string;
    };
    result: {
        score: number;
        correct_count: number;
        total_questions: number;
        percentage: number;
        grade: string;
    };
    submission: {
        module_id: number;
        user_id: number;
        answers: Record<string, string>;
        score: number;
        correct_count: number;
        total_questions: number;
        time_taken: number; // seconds
        submitted_at: string;
    };
    questions_review: Array<{
        id: number;
        question: string;
        options: Record<string, string>;
        correct_answer: string;
        user_answer: string | null;
        is_correct: boolean;
    }>;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Quiz Result', href: '#' },
];

export default function Result({ module, result, submission, questions_review }: QuizResultProps) {
    // Debug logging
    console.log('Quiz Result Props:', { module, result, submission, questions_review });

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins} menit ${secs} detik`;
    };

    const getGradeColor = (grade: string) => {
        switch (grade) {
            case 'A': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
            case 'B': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
            case 'C': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
            case 'D': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
            default: return 'text-red-600 bg-red-100 dark:bg-red-900/20';
        }
    };

    const getScoreMessage = (score: number) => {
        if (score >= 90) return { message: "Luar biasa! 🎉", emoji: "🌟" };
        if (score >= 80) return { message: "Bagus sekali! 👏", emoji: "🎯" };
        if (score >= 70) return { message: "Cukup baik! 👍", emoji: "📈" };
        if (score >= 60) return { message: "Perlu sedikit perbaikan", emoji: "📚" };
        return { message: "Tetap semangat belajar!", emoji: "💪" };
    };

    const scoreMessage = getScoreMessage(result?.score || 0);
    const pointsEarned = (result?.correct_count || 0) * 10; // 10 points per correct answer

    // Safety checks
    if (!module || !result || !submission) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Quiz Error" />
                <div className="max-w-4xl mx-auto p-6">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Quiz Result</h1>
                        <p className="text-gray-600 mb-4">Terjadi masalah saat memuat hasil quiz.</p>
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
                        >
                            Kembali ke Dashboard
                        </Link>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Quiz Result - ${module.title}`} />

            <div className="max-w-4xl mx-auto p-6">
                {/* Header Result */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-4">
                        <Trophy className="h-10 w-10 text-white" />
                    </div>

                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Quiz Selesai!
                    </h1>

                    <p className="text-lg text-gray-600 dark:text-gray-300">
                        {scoreMessage.message} {scoreMessage.emoji}
                    </p>
                </div>

                {/* Score Card */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-8 mb-8">
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center gap-3 mb-4">
                            <div className={`px-6 py-3 rounded-full ${getGradeColor(result.grade || 'F')} font-bold text-2xl`}>
                                Grade {result.grade || 'F'}
                            </div>
                        </div>

                        <div className="text-6xl font-bold text-gray-900 dark:text-white mb-2">
                            {result.score || 0}
                        </div>
                        <p className="text-xl text-gray-600 dark:text-gray-300">
                            dari 100 poin
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg text-center">
                            <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {result.correct_count || 0}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Benar</p>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg text-center">
                            <XCircle className="h-6 w-6 text-red-500 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {(result.total_questions || 0) - (result.correct_count || 0)}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Salah</p>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg text-center">
                            <Clock className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                                {formatTime(submission.time_taken || 0)}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Waktu</p>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg text-center">
                            <Flame className="h-6 w-6 text-orange-500 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {pointsEarned}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Points</p>
                        </div>
                    </div>
                </div>

                {/* Performance Analysis */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-8 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-blue-500" />
                        Analisis Performance
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <div className="text-3xl mb-2">
                                {(result.percentage || 0) >= 80 ? '🎯' : (result.percentage || 0) >= 60 ? '📊' : '📈'}
                            </div>
                            <p className="font-semibold text-gray-900 dark:text-white">Akurasi</p>
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {result.percentage || 0}%
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="text-3xl mb-2">
                                {(submission.time_taken || 0) < 1200 ? '⚡' : (submission.time_taken || 0) < 1800 ? '⏱️' : '🐌'}
                            </div>
                            <p className="font-semibold text-gray-900 dark:text-white">Kecepatan</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {result.total_questions > 0 ? ((submission.time_taken || 0) / result.total_questions).toFixed(0) : 0} detik/soal
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="text-3xl mb-2">
                                {(result.grade || 'F') === 'A' ? '🏆' : (result.grade || 'F') === 'B' ? '🥈' : (result.grade || 'F') === 'C' ? '🥉' : '📚'}
                            </div>
                            <p className="font-semibold text-gray-900 dark:text-white">Grade</p>
                            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                {result.grade || 'F'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Question Review */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-8 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        <Target className="h-5 w-5 text-purple-500" />
                        Review Jawaban
                    </h3>

                    <div className="space-y-4 max-h-96 overflow-y-auto">
                        {(questions_review || []).map((question, index) => (
                            <div
                                key={question.id}
                                className={`
                                    p-4 rounded-lg border-l-4
                                    ${question.is_correct
                                        ? 'border-l-green-500 bg-green-50 dark:bg-green-900/10'
                                        : 'border-l-red-500 bg-red-50 dark:bg-red-900/10'
                                    }
                                `}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`
                                        flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
                                        ${question.is_correct
                                            ? 'bg-green-500 text-white'
                                            : 'bg-red-500 text-white'
                                        }
                                    `}>
                                        {index + 1}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                                            {question.question}
                                        </p>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-600 dark:text-gray-400">Jawaban Anda:</span>
                                                <span className={`font-semibold ${
                                                    question.user_answer ?
                                                        (question.is_correct ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400')
                                                        : 'text-gray-500 dark:text-gray-400'
                                                }`}>
                                                    {question.user_answer ?
                                                        `${question.user_answer}. ${question.options?.[question.user_answer] || 'Unknown'}` :
                                                        'Tidak dijawab'
                                                    }
                                                </span>
                                            </div>

                                            {!question.is_correct && (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-gray-600 dark:text-gray-400">Jawaban Benar:</span>
                                                    <span className="font-semibold text-green-600 dark:text-green-400">
                                                        {question.correct_answer}. {question.options?.[question.correct_answer] || 'Unknown'}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex-shrink-0">
                                        {question.is_correct ? (
                                            <CheckCircle className="h-5 w-5 text-green-500" />
                                        ) : (
                                            <XCircle className="h-5 w-5 text-red-500" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Show message if no questions */}
                        {(!questions_review || questions_review.length === 0) && (
                            <div className="text-center py-8">
                                <p className="text-gray-500 dark:text-gray-400">
                                    Tidak ada data review soal yang tersedia.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recommendations */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 mb-8 border border-purple-200 dark:border-purple-800">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-purple-500" />
                        Rekomendasi Pembelajaran
                    </h3>

                    <div className="space-y-3">
                        {(result.score || 0) >= 80 ? (
                            <div className="flex items-start gap-3">
                                <Award className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold text-green-700 dark:text-green-400">Excellent Performance!</p>
                                    <p className="text-green-600 dark:text-green-300 text-sm">
                                        Anda sudah menguasai materi ini dengan baik. Lanjutkan ke modul berikutnya atau kerjakan praktikum untuk memperdalam pemahaman.
                                    </p>
                                </div>
                            </div>
                        ) : (result.score || 0) >= 60 ? (
                            <div className="flex items-start gap-3">
                                <TrendingUp className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold text-yellow-700 dark:text-yellow-400">Good Progress!</p>
                                    <p className="text-yellow-600 dark:text-yellow-300 text-sm">
                                        Pemahaman Anda cukup baik. Sebaiknya review kembali materi yang masih kurang dipahami sebelum lanjut ke quiz berikutnya.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-start gap-3">
                                <BookOpen className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold text-red-700 dark:text-red-400">Need More Study!</p>
                                    <p className="text-red-600 dark:text-red-300 text-sm">
                                        Sebaiknya pelajari kembali materi PDF dan video pengayaan. Jangan lupa bertanya kepada instruktur jika ada yang belum dipahami.
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="flex items-start gap-3">
                            <Flame className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="font-semibold text-orange-700 dark:text-orange-400">Points Earned</p>
                                <p className="text-orange-600 dark:text-orange-300 text-sm">
                                    Anda mendapatkan <strong>{pointsEarned} fire points</strong> yang akan ditambahkan ke total skor Anda di leaderboard!
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href={`/module/${module.id}`}
                        className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-xl font-semibold transition-colors"
                    >
                        <ArrowRight className="h-5 w-5" />
                        Kembali ke Modul
                    </Link>

                    <Link
                        href="/leaderboard"
                        className="inline-flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-xl font-semibold transition-colors"
                    >
                        <Trophy className="h-5 w-5" />
                        Lihat Leaderboard
                    </Link>

                    {/* Show retry button if user has remaining attempts */}
                    <Link
                        href={`/module/${module.id}/quiz`}
                        className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-xl font-semibold transition-colors"
                    >
                        <RotateCcw className="h-5 w-5" />
                        Coba Lagi
                    </Link>
                </div>

                {/* Fun Statistics */}
                <div className="mt-8 text-center">
                    <div className="inline-flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-full">
                        <Clock className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                            Quiz diselesaikan pada {submission.submitted_at ? new Date(submission.submitted_at).toLocaleString('id-ID') : 'Unknown time'}
                        </span>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
