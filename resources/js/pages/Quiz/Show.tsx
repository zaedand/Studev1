import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Clock,
    HelpCircle,
    Trophy,
    AlertTriangle,
    Play,
    CheckCircle,
    XCircle,
    RotateCcw
} from 'lucide-react';

interface QuizShowProps {
    module: {
        id: number;
        title: string;
        color: string;
    };
    quiz: {
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
        best_score?: number;
        last_attempt_date?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Modul Pembelajaran', href: '/dashboard' },
    { title: 'Quiz', href: '#' },
];

export default function Show({ module, quiz, userAttempts }: QuizShowProps) {
    const canTakeQuiz = userAttempts.attempts_used < userAttempts.max_attempts;
    const totalPoints = quiz.total_questions * quiz.points_per_question;

    const handleStartQuiz = () => {
        router.post(`/module/${module.id}/quiz/start`);
    };

    const getScoreColor = (score: number) => {
        if (score >= 90) return 'text-green-600';
        if (score >= 80) return 'text-blue-600';
        if (score >= 70) return 'text-yellow-600';
        if (score >= 60) return 'text-orange-600';
        return 'text-red-600';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Quiz - ${module.title}`} />

            <div className="max-w-4xl mx-auto p-6">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href={`/module/${module.id}`}
                        className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors mb-4"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Kembali ke Modul</span>
                    </Link>

                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className={`p-3 rounded-lg ${module.color}`}>
                                <HelpCircle className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {quiz.title}
                                </h1>
                                <p className="text-gray-600 dark:text-gray-300">
                                    {quiz.description}
                                </p>
                            </div>
                        </div>

                        {/* Quiz Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <HelpCircle className="h-5 w-5 text-blue-500" />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Soal</span>
                                </div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {quiz.total_questions}
                                </p>
                            </div>

                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-orange-500" />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Waktu</span>
                                </div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {quiz.time_limit} min
                                </p>
                            </div>

                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <RotateCcw className="h-5 w-5 text-green-500" />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Percobaan</span>
                                </div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {userAttempts.attempts_used}/{userAttempts.max_attempts}
                                </p>
                            </div>

                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <Trophy className="h-5 w-5 text-yellow-500" />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Max Points</span>
                                </div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {totalPoints}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Previous Attempt Results */}
                {userAttempts.best_score && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-8 border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Hasil Percobaan Sebelumnya
                        </h3>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <Trophy className="h-5 w-5 text-yellow-500" />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Skor Terbaik:</span>
                                </div>
                                <span className={`text-2xl font-bold ${getScoreColor(userAttempts.best_score)}`}>
                                    {userAttempts.best_score}
                                </span>
                            </div>
                            {userAttempts.last_attempt_date && (
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    Terakhir: {new Date(userAttempts.last_attempt_date).toLocaleDateString('id-ID')}
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Quiz Rules */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-8 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                        Aturan Quiz
                    </h3>
                    <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                        <li className="flex items-start gap-3">
                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>Quiz terdiri dari <strong>{quiz.total_questions} soal pilihan ganda</strong></span>
                        </li>
                        <li className="flex items-start gap-3">
                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>Waktu pengerjaan maksimal <strong>{quiz.time_limit} menit</strong></span>
                        </li>
                        <li className="flex items-start gap-3">
                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>Setiap soal bernilai <strong>{quiz.points_per_question} poin</strong></span>
                        </li>
                        <li className="flex items-start gap-3">
                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>Anda memiliki <strong>{quiz.max_attempts} kali percobaan</strong></span>
                        </li>
                        <li className="flex items-start gap-3">
                            <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                            <span>Quiz <strong>tidak dapat dihentikan</strong> setelah dimulai</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                            <span>Jawaban akan <strong>otomatis tersimpan</strong> ketika waktu habis</span>
                        </li>
                    </ul>
                </div>

                {/* Action Section */}
                <div className="text-center">
                    {canTakeQuiz ? (
                        <div className="space-y-4">
                            <button
                                onClick={handleStartQuiz}
                                className="inline-flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white py-4 px-8 rounded-xl text-lg font-semibold transition-colors shadow-lg hover:shadow-xl"
                            >
                                <Play className="h-6 w-6" />
                                Mulai Quiz
                            </button>

                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Sisa percobaan: <strong>{userAttempts.max_attempts - userAttempts.attempts_used} kali lagi</strong>
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
                                <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-2">
                                    Percobaan Quiz Habis
                                </h3>
                                <p className="text-red-600 dark:text-red-400">
                                    Anda telah menggunakan semua {userAttempts.max_attempts} percobaan quiz untuk modul ini.
                                </p>
                                {userAttempts.best_score && (
                                    <p className="text-red-600 dark:text-red-400 mt-2">
                                        Skor terbaik Anda: <strong>{userAttempts.best_score}</strong>
                                    </p>
                                )}
                            </div>

                            <Link
                                href={`/module/${module.id}`}
                                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Kembali ke Modul
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
