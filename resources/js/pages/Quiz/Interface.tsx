import { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import {
    Clock,
    ChevronLeft,
    ChevronRight,
    Flag,
    AlertTriangle,
    CheckCircle,
    Circle
} from 'lucide-react';

interface Question {
    id: number;
    question: string;
    options: {
        A: string;
        B: string;
        C: string;
        D: string;
    };
    correct_answer: string;
}

interface QuizInterfaceProps {
    module: {
        id: number;
        title: string;
        color: string;
    };
    questions: Question[];
    quizConfig: {
        time_limit: number; // minutes
        total_questions: number;
        session_id: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Quiz', href: '#' },
];

export default function Interface({ module, questions, quizConfig }: QuizInterfaceProps) {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [timeLeft, setTimeLeft] = useState(quizConfig.time_limit * 60); // Convert to seconds
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

    // Timer effect
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    handleSubmit(true); // Auto submit when time is up
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Prevent browser back/refresh
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            e.returnValue = '';
        };

        const handlePopState = () => {
            if (!isSubmitting) {
                alert('Quiz sedang berlangsung! Gunakan tombol submit untuk menyelesaikan quiz.');
                history.pushState(null, '', location.href);
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('popstate', handlePopState);

        // Push initial state to prevent back
        history.pushState(null, '', location.href);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('popstate', handlePopState);
        };
    }, [isSubmitting]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleAnswerChange = (questionId: number, answer: string) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: answer
        }));
    };

    const handleSubmit = (isAutoSubmit = false) => {
        if (isSubmitting) return;

        if (!isAutoSubmit) {
            setShowConfirmSubmit(true);
            return;
        }

        setIsSubmitting(true);

        const timeTaken = (quizConfig.time_limit * 60) - timeLeft;

        router.post(`/module/${module.id}/quiz/submit`,
            {
                session_id: quizConfig.session_id,
                answers,
                time_taken: timeTaken,
            },
            {
                preserveState: false, // biar ganti halaman penuh
                onSuccess: () => {
                router.visit(`/module/${module.id}/quiz/result`);
                },
                onError: (errors) => {
                console.error("Submit error:", errors);
                setIsSubmitting(false);
                },
            }
            );

    };

    const confirmSubmit = () => {
        setShowConfirmSubmit(false);
        handleSubmit(true);
    };

    const getAnsweredCount = () => {
        return Object.keys(answers).length;
    };

    const isQuestionAnswered = (questionId: number) => {
        return answers.hasOwnProperty(questionId);
    };

    const getTimeLeftColor = () => {
        if (timeLeft > 300) return 'text-green-600'; // > 5 minutes
        if (timeLeft > 60) return 'text-yellow-600';  // > 1 minute
        return 'text-red-600'; // < 1 minute
    };

    const currentQ = questions[currentQuestion];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Quiz Active - ${module.title}`} />

            <div className="max-w-6xl mx-auto p-4">
                {/* Header with Timer */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-6 border border-gray-200 dark:border-gray-700 sticky top-4 z-10 shadow-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-lg ${module.color}`}>
                                <Flag className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Quiz {module.title}
                                </h1>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Soal {currentQuestion + 1} dari {questions.length}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            {/* Progress */}
                            <div className="text-center">
                                <p className="text-sm text-gray-600 dark:text-gray-400">Dijawab</p>
                                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {getAnsweredCount()}/{questions.length}
                                </p>
                            </div>

                            {/* Timer */}
                            <div className="flex items-center gap-2">
                                <Clock className={`h-5 w-5 ${getTimeLeftColor()}`} />
                                <span className={`text-xl font-bold ${getTimeLeftColor()}`}>
                                    {formatTime(timeLeft)}
                                </span>
                            </div>

                            {/* Submit Button */}
                            <button
                                onClick={() => handleSubmit()}
                                disabled={isSubmitting}
                                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg font-semibold transition-colors"
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
                            </button>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Question Navigation Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 sticky top-32">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                                Navigasi Soal
                            </h3>
                            <div className="grid grid-cols-5 lg:grid-cols-3 gap-2">
                                {questions.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentQuestion(index)}
                                        className={`
                                            w-10 h-10 rounded-lg font-semibold text-sm transition-all duration-200
                                            ${currentQuestion === index
                                                ? 'bg-blue-600 text-white shadow-lg'
                                                : isQuestionAnswered(questions[index].id)
                                                    ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-700'
                                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                            }
                                        `}
                                    >
                                        {index + 1}
                                    </button>
                                ))}
                            </div>

                            {/* Legend */}
                            <div className="mt-4 space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-blue-600 rounded"></div>
                                    <span className="text-gray-600 dark:text-gray-400">Soal aktif</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700 rounded"></div>
                                    <span className="text-gray-600 dark:text-gray-400">Sudah dijawab</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-gray-100 dark:bg-gray-700 rounded"></div>
                                    <span className="text-gray-600 dark:text-gray-400">Belum dijawab</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Question Area */}
                    <div className="lg:col-span-3">
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                            {/* Question Header */}
                            <div className="flex items-start justify-between mb-6">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Soal {currentQuestion + 1}
                                </h2>
                                {isQuestionAnswered(currentQ.id) && (
                                    <CheckCircle className="h-6 w-6 text-green-500" />
                                )}
                            </div>

                            {/* Question */}
                            <div className="mb-8">
                                <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed">
                                    {currentQ.question}
                                </p>
                            </div>

                            {/* Options */}
                            <div className="space-y-3 mb-8">
                                {Object.entries(currentQ.options).map(([option, text]) => (
                                    <label
                                        key={option}
                                        className={`
                                            flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all duration-200
                                            ${answers[currentQ.id] === option
                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                            }
                                        `}
                                    >
                                        <input
                                            type="radio"
                                            name={`question_${currentQ.id}`}
                                            value={option}
                                            checked={answers[currentQ.id] === option}
                                            onChange={() => handleAnswerChange(currentQ.id, option)}
                                            className="sr-only"
                                        />
                                        <div className={`
                                            w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5
                                            ${answers[currentQ.id] === option
                                                ? 'border-blue-500 bg-blue-500'
                                                : 'border-gray-300 dark:border-gray-600'
                                            }
                                        `}>
                                            {answers[currentQ.id] === option && (
                                                <div className="w-2 h-2 bg-white rounded-full"></div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <span className="font-semibold text-gray-700 dark:text-gray-300">
                                                {option}.
                                            </span>
                                            <span className="ml-2 text-gray-800 dark:text-gray-200">
                                                {text}
                                            </span>
                                        </div>
                                    </label>
                                ))}
                            </div>

                            {/* Navigation Buttons */}
                            <div className="flex items-center justify-between">
                                <button
                                    onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                                    disabled={currentQuestion === 0}
                                    className="flex items-center gap-2 py-2 px-4 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    Sebelumnya
                                </button>

                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    {currentQuestion + 1} dari {questions.length}
                                </span>

                                <button
                                    onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
                                    disabled={currentQuestion === questions.length - 1}
                                    className="flex items-center gap-2 py-2 px-4 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Selanjutnya
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Confirmation Modal */}
                {showConfirmSubmit && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
                            <div className="flex items-center gap-3 mb-4">
                                <AlertTriangle className="h-6 w-6 text-yellow-500" />
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Konfirmasi Submit Quiz
                                </h3>
                            </div>

                            <div className="mb-6 space-y-2">
                                <p className="text-gray-700 dark:text-gray-300">
                                    Anda yakin ingin menyelesaikan quiz?
                                </p>
                                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                    <p>• Soal dijawab: {getAnsweredCount()} dari {questions.length}</p>
                                    <p>• Sisa waktu: {formatTime(timeLeft)}</p>
                                    <p className="text-red-600 dark:text-red-400">
                                        • Quiz tidak dapat diubah setelah submit
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowConfirmSubmit(false)}
                                    className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={confirmSubmit}
                                    className="flex-1 py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                                >
                                    Ya, Submit
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Time Warning */}
                {timeLeft <= 300 && timeLeft > 0 && (
                    <div className="fixed bottom-4 right-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg p-4 shadow-lg z-40">
                        <div className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-red-600" />
                            <span className="text-red-700 dark:text-red-400 font-semibold">
                                Waktu tersisa: {formatTime(timeLeft)}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
