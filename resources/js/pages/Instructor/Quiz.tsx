import React, { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { router } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import {
    ClipboardList, Plus, Edit3, Trash2, Eye, Search, Users, Clock,
    CheckCircle, X, Save, AlertCircle, BarChart3, Calendar, Target,
    Power, PowerOff, ArrowLeft, Award, BookOpen
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/instructor/dashboard' },
    { title: 'Quiz Management', href: '/instructor/quiz' },
];

interface Quiz {
    id: number;
    title: string;
    description?: string;
    moduleId: number;
    moduleName: string;
    totalQuestions: number;
    timeLimit: number;
    attempts: number;
    averageScore: number;
    status: 'active' | 'draft';
    createdAt: string;
    deadline: string;
}

interface Module {
    id: number;
    title: string;
}

interface Question {
    id?: number;
    question: string;
    type: 'multiple_choice' | 'true_false' | 'essay';
    options: string[];
    correct_answer: string | number;
    points: number;
}

interface QuizResult {
    id: number;
    studentName: string;
    nim: string;
    quizId: number;
    quizTitle: string;
    score: number;
    pointsEarned: number;
    completedAt: string;
}

interface InstructorQuizManagementProps {
    quizzes?: Quiz[];
    modules?: Module[];
}

const InstructorQuizManagement: React.FC<InstructorQuizManagementProps> = ({
    quizzes: initialQuizzes = [],
    modules = []
}) => {
    const [activeTab, setActiveTab] = useState('quizzes');
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('');
    const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [quizzes, setQuizzes] = useState<Quiz[]>(Array.isArray(initialQuizzes) ? initialQuizzes : []);
    const [results, setResults] = useState<QuizResult[]>([]);
    const [filteredResults, setFilteredResults] = useState<QuizResult[]>([]);
    const [analytics, setAnalytics] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [selectedModuleFilter, setSelectedModuleFilter] = useState<number | 'all'>('all');

    const [quizForm, setQuizForm] = useState({
        title: '',
        description: '',
        module_id: '',
        time_limit: 30,
        questions: [] as Question[]
    });

    const [currentQuestion, setCurrentQuestion] = useState<Question>({
        question: '',
        type: 'multiple_choice',
        options: ['', '', '', ''],
        correct_answer: 'A',
        points: 10
    });

    useEffect(() => {
        if (Array.isArray(initialQuizzes)) {
            setQuizzes(initialQuizzes);
        }
    }, [initialQuizzes]);

    useEffect(() => {
        if (activeTab === 'analytics') {
            loadAnalytics();
        }
    }, [activeTab]);

    const loadResults = async (quizId: number) => {
        setLoading(true);
        try {
            const response = await fetch(`/instructor/quiz/results/data?quiz_id=${quizId}`);
            if (response.ok) {
                const data = await response.json();
                setResults(data.results || []);
                setFilteredResults(data.results || []);
            }
        } catch (error) {
            console.error('Error loading results:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadAnalytics = async () => {
        setLoading(true);
        try {
            const response = await fetch('/instructor/quiz/analytics/data');
            if (response.ok) {
                const data = await response.json();
                setAnalytics(data);
            }
        } catch (error) {
            console.error('Error loading analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadQuizDetail = async (quiz: Quiz) => {
        try {
            const response = await fetch(`/instructor/quiz/${quiz.id}`);
            if (response.ok) {
                const data = await response.json();
                setQuizForm({
                    title: data.quiz.title || '',
                    description: data.quiz.description || '',
                    module_id: data.quiz.module_id?.toString() || '',
                    time_limit: data.quiz.time_limit || 30,
                    questions: Array.isArray(data.quiz.questions) ? data.quiz.questions : []
                });
            }
        } catch (error) {
            console.error('Error loading quiz detail:', error);
        }
    };

    const handleCreateQuiz = () => {
        setModalType('create');
        setSelectedQuiz(null);
        setQuizForm({
            title: '',
            description: '',
            module_id: '',
            time_limit: 30,
            questions: []
        });
        setCurrentQuestion({
            question: '',
            type: 'multiple_choice',
            options: ['', '', '', ''],
            correct_answer: 'A',
            points: 10
        });
        setShowModal(true);
    };

    const handleEditQuiz = async (quiz: Quiz) => {
        setSelectedQuiz(quiz);
        setModalType('edit');
        await loadQuizDetail(quiz);
        setShowModal(true);
    };

    const handleViewQuiz = async (quiz: Quiz) => {
        setSelectedQuiz(quiz);
        setModalType('view');
        await loadQuizDetail(quiz);
        setShowModal(true);
    };

    const openQuizResults = (quiz: Quiz) => {
        setSelectedQuiz(quiz);
        loadResults(quiz.id);
    };

    const handleDeleteQuiz = (quiz: Quiz) => {
        if (confirm(`Apakah Anda yakin ingin menghapus quiz "${quiz.title}"?`)) {
            router.delete(`/instructor/quiz/${quiz.id}`, {
                onSuccess: () => {
                    setQuizzes(prevQuizzes => prevQuizzes.filter(q => q.id !== quiz.id));
                }
            });
        }
    };

    const handleToggleStatus = (quiz: Quiz) => {
        router.patch(`/instructor/quiz/${quiz.id}/toggle-status`, {}, {
            onSuccess: () => {
                setQuizzes(prevQuizzes => prevQuizzes.map(q =>
                    q.id === quiz.id
                        ? { ...q, status: q.status === 'active' ? 'draft' : 'active' as 'active' | 'draft' }
                        : q
                ));
            }
        });
    };

    const addQuestion = () => {
        if (!currentQuestion.question.trim()) {
            alert('Pertanyaan tidak boleh kosong!');
            return;
        }

        if (currentQuestion.type === 'multiple_choice') {
            const validOptions = currentQuestion.options.filter(opt => opt.trim());
            if (validOptions.length < 2) {
                alert('Minimal harus ada 2 pilihan jawaban!');
                return;
            }
        }

        setQuizForm(prev => ({
            ...prev,
            questions: [...prev.questions, { ...currentQuestion }]
        }));

        setCurrentQuestion({
            question: '',
            type: 'multiple_choice',
            options: ['', '', '', ''],
            correct_answer: 'A',
            points: 10
        });
    };

    const removeQuestion = (index: number) => {
        setQuizForm(prev => ({
            ...prev,
            questions: prev.questions.filter((_, i) => i !== index)
        }));
    };

    const handleSubmitQuiz = () => {
        if (!quizForm.title.trim()) {
            alert('Judul quiz tidak boleh kosong!');
            return;
        }
        if (!quizForm.module_id) {
            alert('Modul harus dipilih!');
            return;
        }
        if (quizForm.questions.length === 0) {
            alert('Minimal harus ada 1 soal!');
            return;
        }

        const data = {
            ...quizForm,
            module_id: parseInt(quizForm.module_id)
        };

        if (modalType === 'create') {
            router.post('/instructor/quiz', data, {
                onSuccess: () => {
                    setShowModal(false);
                    router.reload({ only: ['quizzes'] });
                }
            });
        } else if (modalType === 'edit' && selectedQuiz) {
            router.put(`/instructor/quiz/${selectedQuiz.id}`, data, {
                onSuccess: () => {
                    setShowModal(false);
                    router.reload({ only: ['quizzes'] });
                }
            });
        }
    };

    // Group quizzes by module
    const quizzesByModule = modules.map(module => {
        const moduleQuizzes = quizzes.filter(q => q.moduleId === module.id);
        return {
            module,
            quizzes: moduleQuizzes,
            totalAttempts: moduleQuizzes.reduce((sum, q) => sum + q.attempts, 0),
        };
    }).filter(m => m.quizzes.length > 0);

    const filteredQuizzes = selectedModuleFilter === 'all'
        ? quizzes
        : quizzes.filter(q => q.moduleId === selectedModuleFilter);

    const QuestionEditor = () => (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Pertanyaan *
                </label>
                <textarea
                    value={currentQuestion.question}
                    onChange={(e) => setCurrentQuestion({...currentQuestion, question: e.target.value})}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                    rows={3}
                    placeholder="Masukkan pertanyaan..."
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tipe Soal
                </label>
                <select
                    value={currentQuestion.type}
                    onChange={(e) => {
                        const type = e.target.value as 'multiple_choice' | 'true_false' | 'essay';
                        setCurrentQuestion({
                            ...currentQuestion,
                            type,
                            options: type === 'true_false' ? ['True', 'False'] :
                                    type === 'multiple_choice' ? ['', '', '', ''] : [],
                            correct_answer: type === 'true_false' ? 'True' : 'A'
                        });
                    }}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                >
                    <option value="multiple_choice">Pilihan Ganda</option>
                    <option value="true_false">Benar/Salah</option>
                    <option value="essay">Essay</option>
                </select>
            </div>

            {currentQuestion.type === 'multiple_choice' && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Pilihan Jawaban
                    </label>
                    <div className="space-y-3">
                        {currentQuestion.options.map((option, index) => (
                            <div key={index} className="flex items-center gap-3">
                                <input
                                    type="radio"
                                    name="correctAnswer"
                                    checked={currentQuestion.correct_answer === String.fromCharCode(65 + index)}
                                    onChange={() => setCurrentQuestion({
                                        ...currentQuestion,
                                        correct_answer: String.fromCharCode(65 + index)
                                    })}
                                    className="text-blue-600"
                                />
                                <span className="text-sm text-gray-500 w-4">
                                    {String.fromCharCode(65 + index)}.
                                </span>
                                <input
                                    type="text"
                                    value={option}
                                    onChange={(e) => {
                                        const newOptions = [...currentQuestion.options];
                                        newOptions[index] = e.target.value;
                                        setCurrentQuestion({...currentQuestion, options: newOptions});
                                    }}
                                    className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                                    placeholder={`Pilihan ${String.fromCharCode(65 + index)}`}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {currentQuestion.type === 'true_false' && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Jawaban Benar
                    </label>
                    <div className="flex gap-4">
                        <label className="flex items-center">
                            <input
                                type="radio"
                                value="True"
                                checked={currentQuestion.correct_answer === 'True'}
                                onChange={(e) => setCurrentQuestion({...currentQuestion, correct_answer: e.target.value})}
                                className="mr-2"
                            />
                            Benar
                        </label>
                        <label className="flex items-center">
                            <input
                                type="radio"
                                value="False"
                                checked={currentQuestion.correct_answer === 'False'}
                                onChange={(e) => setCurrentQuestion({...currentQuestion, correct_answer: e.target.value})}
                                className="mr-2"
                            />
                            Salah
                        </label>
                    </div>
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Poin
                </label>
                <input
                    type="number"
                    value={currentQuestion.points}
                    onChange={(e) => setCurrentQuestion({...currentQuestion, points: parseInt(e.target.value) || 10})}
                    className="w-20 p-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                    min="1"
                    max="100"
                />
            </div>

            <div className="flex justify-end">
                <button
                    onClick={addQuestion}
                    disabled={!currentQuestion.question.trim()}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg"
                >
                    <Plus className="h-4 w-4" />
                    Tambah Soal
                </button>
            </div>
        </div>
    );

    const QuestionList = () => (
        <div className="space-y-4">
            {quizForm.questions.map((question, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                    <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">Soal {index + 1}</h4>
                        <button
                            onClick={() => removeQuestion(index)}
                            className="text-red-500 hover:text-red-700"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {question.question}
                    </p>
                    {question.type === 'multiple_choice' && Array.isArray(question.options) && (
                        <div className="text-xs text-gray-500 space-y-1">
                            {question.options.map((option, optIndex) => (
                                <div key={optIndex} className={`px-2 py-1 rounded ${
                                    String.fromCharCode(65 + optIndex) === question.correct_answer
                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700'
                                        : ''
                                }`}>
                                    {String.fromCharCode(65 + optIndex)}. {option}
                                    {String.fromCharCode(65 + optIndex) === question.correct_answer && ' ✓'}
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="text-xs text-gray-500 mt-1">Poin: {question.points}</div>
                </div>
            ))}
        </div>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Quiz Management
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Kelola quiz dan monitor hasil pengerjaan mahasiswa
                    </p>
                </div>

                <div className="flex border-b border-gray-200 dark:border-gray-700 mb-8">
                    {[
                        { id: 'quizzes', label: 'Daftar Quiz', icon: ClipboardList },
                        { id: 'analytics', label: 'Analisis', icon: BarChart3 }
                    ].map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    setActiveTab(tab.id);
                                    setSelectedQuiz(null);
                                }}
                                className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
                                    activeTab === tab.id
                                        ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                                        : 'text-gray-500 dark:text-gray-400'
                                }`}
                            >
                                <Icon className="h-5 w-5" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {activeTab === 'quizzes' && !selectedQuiz && (
                    <div className="space-y-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Cari quiz..."
                                        className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                                    />
                                </div>
                                <select
                                    value={selectedModuleFilter}
                                    onChange={(e) => setSelectedModuleFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                                >
                                    <option value="all">Semua Modul</option>
                                    {modules.map(module => (
                                        <option key={module.id} value={module.id}>{module.title}</option>
                                    ))}
                                </select>
                            </div>
                            <button
                                onClick={handleCreateQuiz}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                            >
                                <Plus className="h-4 w-4" />
                                Buat Quiz Baru
                            </button>
                        </div>

                        {quizzesByModule.map(({ module, quizzes: moduleQuizzes }) => (
                            <div key={module.id} className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                        {module.title}
                                    </h2>
                                    <span className="text-sm text-gray-500">
                                        {moduleQuizzes.length} quiz
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {moduleQuizzes
                                        .filter(quiz => quiz.title?.toLowerCase().includes(searchTerm.toLowerCase()))
                                        .map((quiz) => (
                                        <div
                                            key={quiz.id}
                                            className="bg-white dark:bg-gray-800 rounded-xl border p-6 hover:shadow-lg transition-all cursor-pointer"
                                            onClick={() => openQuizResults(quiz)}
                                        >
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <h3 className="text-lg font-semibold">{quiz.title}</h3>
                                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                                            quiz.status === 'active'
                                                                ? 'bg-green-100 text-green-700'
                                                                : 'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                            {quiz.status === 'active' ? 'Aktif' : 'Draft'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                                    <button
                                                        onClick={() => handleToggleStatus(quiz)}
                                                        className={`p-2 rounded-lg ${
                                                            quiz.status === 'active'
                                                                ? 'text-red-500 hover:bg-red-50'
                                                                : 'text-green-500 hover:bg-green-50'
                                                        }`}
                                                    >
                                                        {quiz.status === 'active' ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                                                    </button>
                                                    <button
                                                        onClick={() => handleViewQuiz(quiz)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEditQuiz(quiz)}
                                                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                                                    >
                                                        <Edit3 className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteQuiz(quiz)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                                    <BookOpen className="h-5 w-5 mx-auto mb-1 text-blue-600" />
                                                    <p className="text-2xl font-bold text-blue-600">{quiz.totalQuestions}</p>
                                                    <p className="text-xs text-gray-600">Soal</p>
                                                </div>
                                                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                                    <Users className="h-5 w-5 mx-auto mb-1 text-green-600" />
                                                    <p className="text-2xl font-bold text-green-600">{quiz.attempts}</p>
                                                    <p className="text-xs text-gray-600">Dikerjakan</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between text-sm text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-4 w-4" />
                                                    <span>{quiz.timeLimit} menit</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Award className="h-4 w-4" />
                                                    <span>Avg: {quiz.averageScore}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'quizzes' && selectedQuiz && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 mb-6">
                            <button
                                onClick={() => setSelectedQuiz(null)}
                                className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
                            >
                                <ArrowLeft className="h-5 w-5" />
                                Kembali
                            </button>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {selectedQuiz.title}
                                </h2>
                                <p className="text-sm text-gray-500">{selectedQuiz.moduleName}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200">
                                <Users className="h-6 w-6 text-blue-600 mb-2" />
                                <p className="text-2xl font-bold text-blue-600">{results.length}</p>
                                <p className="text-sm text-gray-600">Total Attempts</p>
                            </div>
                            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200">
                                <CheckCircle className="h-6 w-6 text-green-600 mb-2" />
                                <p className="text-2xl font-bold text-green-600">
                                    {results.filter(r => r.score >= 60).length}
                                </p>
                                <p className="text-sm text-gray-600">Lulus</p>
                            </div>
                            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200">
                                <Award className="h-6 w-6 text-purple-600 mb-2" />
                                <p className="text-2xl font-bold text-purple-600">
                                    {results.length > 0
                                        ? Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length)
                                        : 0}
                                </p>
                                <p className="text-sm text-gray-600">Rata-rata</p>
                            </div>
                            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200">
                                <Target className="h-6 w-6 text-orange-600 mb-2" />
                                <p className="text-2xl font-bold text-orange-600">
                                    {results.length > 0
                                        ? Math.round((results.filter(r => r.score >= 60).length / results.length) * 100)
                                        : 0}%
                                </p>
                                <p className="text-sm text-gray-600">Pass Rate</p>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl border">
                            <div className="p-4 border-b">
                                <h3 className="font-semibold">Hasil Quiz Mahasiswa</h3>
                            </div>
                            <div className="divide-y">
                                {loading ? (
                                    <div className="p-8 text-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                    </div>
                                ) : results.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500">
                                        Belum ada mahasiswa yang mengerjakan quiz ini
                                    </div>
                                ) : (
                                    results.map((result) => (
                                        <div key={result.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h4 className="font-semibold text-gray-900 dark:text-white">
                                                            {result.studentName}
                                                        </h4>
                                                        <span className="text-sm text-gray-500">
                                                            {result.nim}
                                                        </span>
                                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                                            result.score >= 80
                                                                ? 'bg-green-100 text-green-700'
                                                                : result.score >= 60
                                                                ? 'bg-yellow-100 text-yellow-700'
                                                                : 'bg-red-100 text-red-700'
                                                        }`}>
                                                            Skor: {result.score}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                                        <span>Poin: +{result.pointsEarned}</span>
                                                        <span>•</span>
                                                        <span>{new Date(result.completedAt).toLocaleString('id-ID')}</span>
                                                    </div>
                                                </div>
                                                <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                                                    <Eye className="h-4 w-4" />
                                                    Lihat Detail
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'analytics' && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Analisis Performa Quiz
                        </h2>

                        {loading ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                        ) : analytics ? (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-medium text-gray-900 dark:text-white">Total Attempt</h3>
                                            <Users className="h-5 w-5 text-blue-500" />
                                        </div>
                                        <p className="text-3xl font-bold text-blue-600">
                                            {analytics.overall_stats?.total_attempts || 0}
                                        </p>
                                        <p className="text-sm text-gray-500 mt-2">Dari semua quiz</p>
                                    </div>

                                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-medium text-gray-900 dark:text-white">Rata-rata Skor</h3>
                                            <Target className="h-5 w-5 text-green-500" />
                                        </div>
                                        <p className="text-3xl font-bold text-green-600">
                                            {analytics.overall_stats?.average_score || 0}
                                        </p>
                                        <p className="text-sm text-gray-500 mt-2">Dari 100</p>
                                    </div>

                                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-medium text-gray-900 dark:text-white">Tingkat Kelulusan</h3>
                                            <CheckCircle className="h-5 w-5 text-orange-500" />
                                        </div>
                                        <p className="text-3xl font-bold text-orange-600">
                                            {analytics.overall_stats?.pass_rate || 0}%
                                        </p>
                                        <p className="text-sm text-gray-500 mt-2">Skor ≥ 60</p>
                                    </div>

                                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-medium text-gray-900 dark:text-white">Waktu Rata-rata</h3>
                                            <Clock className="h-5 w-5 text-purple-500" />
                                        </div>
                                        <p className="text-3xl font-bold text-purple-600">
                                            {analytics.overall_stats?.average_time || 0}
                                        </p>
                                        <p className="text-sm text-gray-500 mt-2">Menit per quiz</p>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-gray-800 rounded-xl border overflow-hidden">
                                    <div className="px-6 py-4 border-b">
                                        <h3 className="font-medium text-gray-900 dark:text-white">Analisis Per Quiz</h3>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-50 dark:bg-gray-700">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Quiz</th>
                                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Modul</th>
                                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Attempts</th>
                                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Rata-rata</th>
                                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Pass Rate</th>
                                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Kesulitan</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {Array.isArray(analytics.quiz_analytics) && analytics.quiz_analytics.length > 0 ? (
                                                    analytics.quiz_analytics.map((quiz: any, index: number) => (
                                                        <tr key={index} className="border-b hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                            <td className="px-6 py-4 font-medium">{quiz.quiz_title}</td>
                                                            <td className="px-6 py-4 text-sm text-gray-600">{quiz.module_title}</td>
                                                            <td className="px-6 py-4 text-sm">{quiz.total_attempts}</td>
                                                            <td className="px-6 py-4 text-sm">{quiz.average_score}</td>
                                                            <td className="px-6 py-4 text-sm">{quiz.pass_rate}%</td>
                                                            <td className="px-6 py-4">
                                                                <span className={`px-2 py-1 text-xs rounded-full ${
                                                                    quiz.difficulty_rating === 'Easy'
                                                                        ? 'bg-green-100 text-green-700'
                                                                        : quiz.difficulty_rating === 'Medium'
                                                                        ? 'bg-yellow-100 text-yellow-700'
                                                                        : 'bg-red-100 text-red-700'
                                                                }`}>
                                                                    {quiz.difficulty_rating}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                                            Belum ada data analisis
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-8">
                                <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500">Belum ada data analisis</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Create/Edit/View Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white dark:bg-gray-800 rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {modalType === 'create' ? 'Buat Quiz Baru' :
                                         modalType === 'edit' ? 'Edit Quiz' : 'Detail Quiz'}
                                    </h3>
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="text-gray-500 hover:text-gray-700"
                                    >
                                        <X className="h-6 w-6" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-6">
                                {modalType === 'view' ? (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Judul Quiz
                                                </label>
                                                <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                                                    {quizForm.title || 'Tidak ada judul'}
                                                </p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Modul
                                                </label>
                                                <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                                                    {modules.find(m => m.id.toString() === quizForm.module_id)?.title || 'Tidak diketahui'}
                                                </p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Waktu Pengerjaan
                                                </label>
                                                <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                                                    {quizForm.time_limit || 30} menit
                                                </p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Total Soal
                                                </label>
                                                <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                                                    {quizForm.questions.length} soal
                                                </p>
                                            </div>
                                        </div>

                                        {quizForm.description && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Deskripsi
                                                </label>
                                                <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                                                    {quizForm.description}
                                                </p>
                                            </div>
                                        )}

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                                                Daftar Soal ({quizForm.questions.length})
                                            </label>
                                            <div className="space-y-4">
                                                {quizForm.questions.map((question, index) => (
                                                    <div key={index} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                                                        <h4 className="font-medium mb-3">
                                                            Soal {index + 1} ({question.points} poin)
                                                        </h4>
                                                        <p className="text-gray-700 dark:text-gray-300 mb-3">
                                                            {question.question}
                                                        </p>
                                                        {question.type === 'multiple_choice' && Array.isArray(question.options) && (
                                                            <div className="space-y-2">
                                                                {question.options.map((option, optIndex) => (
                                                                    <div key={optIndex} className={`p-2 rounded ${
                                                                        String.fromCharCode(65 + optIndex) === question.correct_answer
                                                                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 border border-green-300'
                                                                            : 'bg-white dark:bg-gray-800 border'
                                                                    }`}>
                                                                        <span className="font-medium">
                                                                            {String.fromCharCode(65 + optIndex)}.
                                                                        </span> {option}
                                                                        {String.fromCharCode(65 + optIndex) === question.correct_answer && (
                                                                            <span className="ml-2 text-green-600">✓ Jawaban Benar</span>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                        {question.type === 'true_false' && (
                                                            <div className="space-y-2">
                                                                <div className={`p-2 rounded ${
                                                                    'True' === question.correct_answer
                                                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 border border-green-300'
                                                                        : 'bg-white dark:bg-gray-800 border'
                                                                }`}>
                                                                    <span className="font-medium">A.</span> Benar
                                                                    {'True' === question.correct_answer && (
                                                                        <span className="ml-2 text-green-600">✓ Jawaban Benar</span>
                                                                    )}
                                                                </div>
                                                                <div className={`p-2 rounded ${
                                                                    'False' === question.correct_answer
                                                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 border border-green-300'
                                                                        : 'bg-white dark:bg-gray-800 border'
                                                                }`}>
                                                                    <span className="font-medium">B.</span> Salah
                                                                    {'False' === question.correct_answer && (
                                                                        <span className="ml-2 text-green-600">✓ Jawaban Benar</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Judul Quiz *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={quizForm.title}
                                                    onChange={(e) => setQuizForm({...quizForm, title: e.target.value})}
                                                    className="w-full p-3 border rounded-lg bg-white dark:bg-gray-800"
                                                    placeholder="Masukkan judul quiz..."
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Modul *
                                                </label>
                                                <select
                                                    value={quizForm.module_id}
                                                    onChange={(e) => setQuizForm({...quizForm, module_id: e.target.value})}
                                                    className="w-full p-3 border rounded-lg bg-white dark:bg-gray-800"
                                                >
                                                    <option value="">Pilih Modul...</option>
                                                    {modules.map(module => (
                                                        <option key={module.id} value={module.id}>{module.title}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Waktu Pengerjaan (menit) *
                                                </label>
                                                <input
                                                    type="number"
                                                    value={quizForm.time_limit}
                                                    onChange={(e) => setQuizForm({...quizForm, time_limit: parseInt(e.target.value) || 30})}
                                                    className="w-full p-3 border rounded-lg bg-white dark:bg-gray-800"
                                                    min="5"
                                                    max="180"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Total Soal
                                                </label>
                                                <input
                                                    type="text"
                                                    value={`${quizForm.questions.length} soal`}
                                                    className="w-full p-3 border rounded-lg bg-gray-100 dark:bg-gray-700"
                                                    disabled
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Deskripsi
                                                </label>
                                                <textarea
                                                    value={quizForm.description}
                                                    onChange={(e) => setQuizForm({...quizForm, description: e.target.value})}
                                                    className="w-full p-3 border rounded-lg bg-white dark:bg-gray-800"
                                                    rows={3}
                                                    placeholder="Masukkan deskripsi quiz (opsional)..."
                                                />
                                            </div>
                                        </div>

                                        <div className="border-t pt-6">
                                            <h4 className="text-lg font-medium mb-4">
                                                Soal Quiz ({quizForm.questions.length})
                                            </h4>

                                            {quizForm.questions.length > 0 && (
                                                <div className="mb-6">
                                                    <h5 className="font-medium mb-3">Daftar Soal</h5>
                                                    <QuestionList />
                                                </div>
                                            )}

                                            <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                                                <h5 className="font-medium mb-4">Tambah Soal Baru</h5>
                                                <QuestionEditor />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="p-6 border-t bg-gray-50 dark:bg-gray-700">
                                <div className="flex items-center justify-end gap-4">
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="px-6 py-2 text-gray-600 border rounded-lg hover:bg-gray-100"
                                    >
                                        {modalType === 'view' ? 'Tutup' : 'Batal'}
                                    </button>
                                    {modalType !== 'view' && (
                                        <button
                                            onClick={handleSubmitQuiz}
                                            disabled={!quizForm.title || !quizForm.module_id || quizForm.questions.length === 0}
                                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg"
                                        >
                                            <Save className="h-4 w-4" />
                                            {modalType === 'create' ? 'Buat Quiz' : 'Simpan Perubahan'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
};

export default InstructorQuizManagement;
