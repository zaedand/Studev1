import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import {
    ClipboardList,
    Plus,
    Edit3,
    Trash2,
    Eye,
    Search,
    Filter,
    Users,
    Clock,
    BookOpen,
    CheckCircle,
    X,
    Save,
    AlertCircle,
    BarChart3,
    Calendar,
    Target
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Quiz Management',
        href: '/instructor/quiz',
    },
];

const InstructorQuizManagement = () => {
    const [activeTab, setActiveTab] = useState('quizzes');
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState(''); // 'create', 'edit', 'view'
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Mock data untuk quiz
    const quizzes = [
        {
            id: 1,
            title: 'Quiz Pengenalan Pemrograman',
            moduleId: 1,
            moduleName: 'Pengenalan Pemrograman',
            totalQuestions: 10,
            timeLimit: 30,
            attempts: 25,
            averageScore: 85.2,
            status: 'active',
            createdAt: '2024-01-15',
            deadline: '2024-02-15'
        },
        {
            id: 2,
            title: 'Quiz Looping & Perulangan',
            moduleId: 2,
            moduleName: 'Looping & Perulangan',
            totalQuestions: 12,
            timeLimit: 25,
            attempts: 18,
            averageScore: 78.5,
            status: 'active',
            createdAt: '2024-01-20',
            deadline: '2024-02-20'
        },
        {
            id: 3,
            title: 'Quiz Fungsi & Prosedur',
            moduleId: 3,
            moduleName: 'Fungsi & Prosedur',
            totalQuestions: 8,
            timeLimit: 20,
            attempts: 5,
            averageScore: 72.0,
            status: 'draft',
            createdAt: '2024-01-25',
            deadline: '2024-02-25'
        }
    ];

    // Mock data untuk questions
    const [questions, setQuestions] = useState([
        {
            id: 1,
            quizId: 1,
            question: 'Apa yang dimaksud dengan algoritma?',
            type: 'multiple_choice',
            options: [
                'Urutan langkah-langkah logis untuk menyelesaikan masalah',
                'Bahasa pemrograman',
                'Software untuk coding',
                'Hardware komputer'
            ],
            correctAnswer: 0,
            points: 10
        }
    ]);

    // Mock data untuk student results
    const studentResults = [
        {
            id: 1,
            studentName: 'Ahmad Rizky',
            nim: '2024001',
            quizTitle: 'Quiz Pengenalan Pemrograman',
            score: 90,
            completedAt: '2024-01-16 14:30',
            timeSpent: 25,
            attempts: 1
        },
        {
            id: 2,
            studentName: 'Siti Nurhaliza',
            nim: '2024002',
            quizTitle: 'Quiz Pengenalan Pemrograman',
            score: 85,
            completedAt: '2024-01-16 15:45',
            timeSpent: 28,
            attempts: 2
        }
    ];

    const [currentQuestion, setCurrentQuestion] = useState({
        question: '',
        type: 'multiple_choice',
        options: ['', '', '', ''],
        correctAnswer: 0,
        points: 10
    });

    const filteredQuizzes = quizzes.filter(quiz =>
        quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quiz.moduleName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const QuizCard = ({ quiz }) => (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-200">
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {quiz.title}
                        </h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                            quiz.status === 'active'
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                        }`}>
                            {quiz.status === 'active' ? 'Aktif' : 'Draft'}
                        </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {quiz.moduleName}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => {
                            setSelectedQuiz(quiz);
                            setModalType('view');
                            setShowModal(true);
                        }}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    >
                        <Eye className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => {
                            setSelectedQuiz(quiz);
                            setModalType('edit');
                            setShowModal(true);
                        }}
                        className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                    >
                        <Edit3 className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {quiz.totalQuestions}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Soal</p>
                </div>
                <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                        {quiz.timeLimit}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Menit</p>
                </div>
                <div className="text-center">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {quiz.attempts}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Dikerjakan</p>
                </div>
                <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {quiz.averageScore}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Rata-rata</p>
                </div>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>Dibuat: {new Date(quiz.createdAt).toLocaleDateString('id-ID')}</span>
                <span>Deadline: {new Date(quiz.deadline).toLocaleDateString('id-ID')}</span>
            </div>
        </div>
    );

    const QuestionEditor = () => (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Pertanyaan
                </label>
                <textarea
                    value={currentQuestion.question}
                    onChange={(e) => setCurrentQuestion({...currentQuestion, question: e.target.value})}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
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
                    onChange={(e) => setCurrentQuestion({...currentQuestion, type: e.target.value})}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
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
                                    checked={currentQuestion.correctAnswer === index}
                                    onChange={() => setCurrentQuestion({...currentQuestion, correctAnswer: index})}
                                    className="text-blue-600"
                                />
                                <input
                                    type="text"
                                    value={option}
                                    onChange={(e) => {
                                        const newOptions = [...currentQuestion.options];
                                        newOptions[index] = e.target.value;
                                        setCurrentQuestion({...currentQuestion, options: newOptions});
                                    }}
                                    className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                    placeholder={`Pilihan ${String.fromCharCode(65 + index)}`}
                                />
                            </div>
                        ))}
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
                    onChange={(e) => setCurrentQuestion({...currentQuestion, points: parseInt(e.target.value)})}
                    className="w-20 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    min="1"
                    max="100"
                />
            </div>
        </div>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Quiz Management
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Kelola quiz dan monitor hasil pengerjaan mahasiswa
                    </p>
                </div>

                {/* Navigation Tabs */}
                <div className="flex border-b border-gray-200 dark:border-gray-700 mb-8">
                    {[
                        { id: 'quizzes', label: 'Daftar Quiz', icon: ClipboardList },
                        { id: 'results', label: 'Hasil Quiz', icon: BarChart3 },
                        { id: 'analytics', label: 'Analisis', icon: Target }
                    ].map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
                                    activeTab === tab.id
                                        ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                            >
                                <Icon className="h-5 w-5" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Quizzes Tab */}
                {activeTab === 'quizzes' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Cari quiz..."
                                        className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <button className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors">
                                    <Filter className="h-4 w-4" />
                                    Filter
                                </button>
                            </div>
                            <button
                                onClick={() => {
                                    setModalType('create');
                                    setShowModal(true);
                                }}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                <Plus className="h-4 w-4" />
                                Buat Quiz Baru
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredQuizzes.map((quiz) => (
                                <QuizCard key={quiz.id} quiz={quiz} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Results Tab */}
                {activeTab === 'results' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Hasil Quiz Mahasiswa
                            </h2>
                            <div className="flex items-center gap-4">
                                <select className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                                    <option>Semua Quiz</option>
                                    {quizzes.map(quiz => (
                                        <option key={quiz.id} value={quiz.id}>{quiz.title}</option>
                                    ))}
                                </select>
                                <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
                                    <Calendar className="h-4 w-4" />
                                    Export
                                </button>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Mahasiswa
                                        </th>
                                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Quiz
                                        </th>
                                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Skor
                                        </th>
                                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Waktu
                                        </th>
                                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Selesai
                                        </th>
                                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Percobaan
                                        </th>
                                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {studentResults.map((result) => (
                                        <tr key={result.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        {result.studentName}
                                                    </p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        {result.nim}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                                {result.quizTitle}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                                                    result.score >= 80
                                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                                        : result.score >= 60
                                                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                                                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                                                }`}>
                                                    {result.score}/100
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                                {result.timeSpent} menit
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                                {new Date(result.completedAt).toLocaleDateString('id-ID')}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                                {result.attempts}x
                                            </td>
                                            <td className="px-6 py-4">
                                                <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Analytics Tab */}
                {activeTab === 'analytics' && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Analisis Performa Quiz
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                                <h3 className="font-medium text-gray-900 dark:text-white mb-4">Rata-rata Skor</h3>
                                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">78.5</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Dari semua quiz</p>
                            </div>

                            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                                <h3 className="font-medium text-gray-900 dark:text-white mb-4">Tingkat Kelulusan</h3>
                                <p className="text-3xl font-bold text-green-600 dark:text-green-400">85%</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Skor ≥ 60</p>
                            </div>

                            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                                <h3 className="font-medium text-gray-900 dark:text-white mb-4">Waktu Rata-rata</h3>
                                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">24.5</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Menit per quiz</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {modalType === 'create' ? 'Buat Quiz Baru' :
                                         modalType === 'edit' ? 'Edit Quiz' : 'Detail Quiz'}
                                    </h3>
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                    >
                                        <X className="h-6 w-6" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-6">
                                {modalType === 'create' || modalType === 'edit' ? (
                                    <div className="space-y-6">
                                        {/* Quiz Info */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Judul Quiz
                                                </label>
                                                <input
                                                    type="text"
                                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                                    placeholder="Masukkan judul quiz..."
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Modul
                                                </label>
                                                <select className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                                                    <option>Pilih Modul...</option>
                                                    <option value="1">Pengenalan Pemrograman</option>
                                                    <option value="2">Looping & Perulangan</option>
                                                    <option value="3">Fungsi & Prosedur</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Batas Waktu (menit)
                                                </label>
                                                <input
                                                    type="number"
                                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                                    placeholder="30"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Deadline
                                                </label>
                                                <input
                                                    type="date"
                                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                                />
                                            </div>
                                        </div>

                                        {/* Questions Section */}
                                        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                                                    Soal Quiz
                                                </h4>
                                                <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
                                                    <Plus className="h-4 w-4" />
                                                    Tambah Soal
                                                </button>
                                            </div>

                                            <QuestionEditor />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <p>Detail quiz akan ditampilkan di sini...</p>
                                    </div>
                                )}
                            </div>

                            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-end gap-4">
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                                    >
                                        Batal
                                    </button>
                                    <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors">
                                        <Save className="h-4 w-4" />
                                        {modalType === 'create' ? 'Buat Quiz' : 'Simpan Perubahan'}
                                    </button>
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
