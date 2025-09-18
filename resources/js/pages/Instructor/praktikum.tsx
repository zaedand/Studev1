import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import {
    Upload,
    Plus,
    Edit3,
    Trash2,
    Eye,
    Search,
    Filter,
    Download,
    CheckCircle,
    Clock,
    AlertTriangle,
    Calendar,
    FileText,
    User,
    BarChart3,
    Target,
    X,
    Save,
    MessageSquare,
    Star
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Praktikum Management',
        href: '/instructor/praktikum',
    },
];

const InstructorPraktikumManagement = () => {
    const [activeTab, setActiveTab] = useState('assignments');
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState(''); // 'create', 'edit', 'view', 'grade'
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Mock data untuk assignments
    const assignments = [
        {
            id: 1,
            title: 'Implementasi Algoritma Sorting',
            moduleId: 2,
            moduleName: 'Looping & Perulangan',
            description: 'Buat program untuk mengimplementasikan bubble sort, selection sort, dan insertion sort',
            deadline: '2024-02-20T23:59',
            maxScore: 100,
            submissions: 18,
            totalStudents: 25,
            averageScore: 85.2,
            status: 'active',
            createdAt: '2024-01-15'
        },
        {
            id: 2,
            title: 'Program Kalkulator Sederhana',
            moduleId: 3,
            moduleName: 'Fungsi & Prosedur',
            description: 'Membuat kalkulator dengan operasi dasar menggunakan function',
            deadline: '2024-02-25T23:59',
            maxScore: 100,
            submissions: 5,
            totalStudents: 25,
            averageScore: 75.0,
            status: 'active',
            createdAt: '2024-01-20'
        },
        {
            id: 3,
            title: 'Manipulasi String',
            moduleId: 4,
            moduleName: 'Array & String',
            description: 'Program untuk operasi string seperti reverse, palindrome check, dll',
            deadline: '2024-03-01T23:59',
            maxScore: 100,
            submissions: 0,
            totalStudents: 25,
            averageScore: 0,
            status: 'draft',
            createdAt: '2024-01-25'
        }
    ];

    // Mock data untuk submissions
    const submissions = [
        {
            id: 1,
            assignmentId: 1,
            assignmentTitle: 'Implementasi Algoritma Sorting',
            studentId: 1,
            studentName: 'Ahmad Rizky',
            nim: '2024001',
            fileName: 'sorting_ahmad.pdf',
            fileSize: '2.3 MB',
            submittedAt: '2024-02-18T14:30:00',
            status: 'graded',
            score: 95,
            feedback: 'Implementasi sangat baik, kode bersih dan dokumentasi lengkap',
            isLate: false,
            daysEarly: 2
        },
        {
            id: 2,
            assignmentId: 1,
            assignmentTitle: 'Implementasi Algoritma Sorting',
            studentId: 2,
            studentName: 'Siti Nurhaliza',
            nim: '2024002',
            fileName: 'sorting_siti.pdf',
            fileSize: '1.8 MB',
            submittedAt: '2024-02-19T16:45:00',
            status: 'submitted',
            score: null,
            feedback: '',
            isLate: false,
            daysEarly: 1
        },
        {
            id: 3,
            assignmentId: 1,
            assignmentTitle: 'Implementasi Algoritma Sorting',
            studentId: 3,
            studentName: 'Budi Santoso',
            nim: '2024003',
            fileName: 'sorting_budi.pdf',
            fileSize: '1.5 MB',
            submittedAt: '2024-02-21T10:15:00',
            status: 'submitted',
            score: null,
            feedback: '',
            isLate: true,
            daysLate: 1
        }
    ];

    const [gradeForm, setGradeForm] = useState({
        score: '',
        feedback: '',
        status: 'graded'
    });

    const filteredAssignments = assignments.filter(assignment =>
        assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.moduleName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
            case 'draft':
                return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
            case 'closed':
                return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
            default:
                return 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300';
        }
    };

    const getSubmissionStatusColor = (status) => {
        switch (status) {
            case 'graded':
                return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
            case 'submitted':
                return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
            case 'late':
                return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
            default:
                return 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300';
        }
    };

    const formatDeadline = (deadline) => {
        const date = new Date(deadline);
        const now = new Date();
        const diff = date.getTime() - now.getTime();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

        if (days > 0) {
            return `${days} hari lagi`;
        } else if (days === 0) {
            return 'Hari ini';
        } else {
            return `Terlambat ${Math.abs(days)} hari`;
        }
    };

    const AssignmentCard = ({ assignment }) => (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-200">
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {assignment.title}
                        </h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(assignment.status)}`}>
                            {assignment.status === 'active' ? 'Aktif' : assignment.status === 'draft' ? 'Draft' : 'Ditutup'}
                        </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {assignment.moduleName}
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">
                        {assignment.description}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => {
                            setSelectedAssignment(assignment);
                            setModalType('view');
                            setShowModal(true);
                        }}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    >
                        <Eye className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => {
                            setSelectedAssignment(assignment);
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

            {/* Assignment Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                    <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        {assignment.submissions}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Dikumpulkan</p>
                </div>
                <div className="text-center">
                    <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                        {assignment.totalStudents - assignment.submissions}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Belum</p>
                </div>
                <div className="text-center">
                    <p className="text-xl font-bold text-green-600 dark:text-green-400">
                        {assignment.averageScore || 0}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Rata-rata</p>
                </div>
                <div className="text-center">
                    <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                        {assignment.maxScore}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Max Skor</p>
                </div>
            </div>

            {/* Deadline Info */}
            <div className={`p-3 rounded-lg border ${
                formatDeadline(assignment.deadline).includes('Terlambat') || formatDeadline(assignment.deadline) === 'Hari ini'
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                    : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
            }`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Calendar className={`h-4 w-4 ${
                            formatDeadline(assignment.deadline).includes('Terlambat') || formatDeadline(assignment.deadline) === 'Hari ini'
                                ? 'text-red-500'
                                : 'text-blue-500'
                        }`} />
                        <span className={`text-sm font-medium ${
                            formatDeadline(assignment.deadline).includes('Terlambat') || formatDeadline(assignment.deadline) === 'Hari ini'
                                ? 'text-red-700 dark:text-red-400'
                                : 'text-blue-700 dark:text-blue-400'
                        }`}>
                            Deadline: {formatDeadline(assignment.deadline)}
                        </span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(assignment.deadline).toLocaleDateString('id-ID')}
                    </span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <span>Progress Pengumpulan</span>
                    <span>{Math.round((assignment.submissions / assignment.totalStudents) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(assignment.submissions / assignment.totalStudents) * 100}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );

    const SubmissionRow = ({ submission }) => (
        <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
            <td className="px-6 py-4">
                <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                        {submission.studentName}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {submission.nim}
                    </p>
                </div>
            </td>
            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                {submission.assignmentTitle}
            </td>
            <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-500" />
                    <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {submission.fileName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {submission.fileSize}
                        </p>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4">
                <span className={`px-2 py-1 text-xs rounded-full ${getSubmissionStatusColor(submission.status)}`}>
                    {submission.status === 'graded' ? 'Dinilai' : submission.status === 'submitted' ? 'Dikumpulkan' : 'Terlambat'}
                </span>
            </td>
            <td className="px-6 py-4">
                <div className="text-sm">
                    <p className="text-gray-900 dark:text-white">
                        {new Date(submission.submittedAt).toLocaleDateString('id-ID')}
                    </p>
                    <p className={`text-xs ${
                        submission.isLate
                            ? 'text-red-500'
                            : 'text-green-500'
                    }`}>
                        {submission.isLate
                            ? `Terlambat ${submission.daysLate} hari`
                            : `${submission.daysEarly} hari lebih awal`
                        }
                    </p>
                </div>
            </td>
            <td className="px-6 py-4 text-center">
                {submission.score ? (
                    <span className={`px-2 py-1 text-sm font-medium rounded-full ${
                        submission.score >= 80
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                            : submission.score >= 60
                            ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                    }`}>
                        {submission.score}/100
                    </span>
                ) : (
                    <span className="text-gray-400 dark:text-gray-500">Belum dinilai</span>
                )}
            </td>
            <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                    <button className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded" title="Download">
                        <Download className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => {
                            setSelectedAssignment(submission);
                            setGradeForm({
                                score: submission.score || '',
                                feedback: submission.feedback || '',
                                status: submission.status
                            });
                            setModalType('grade');
                            setShowModal(true);
                        }}
                        className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                        title="Beri Nilai"
                    >
                        <Star className="h-4 w-4" />
                    </button>
                    <button className="p-1 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-900/20 rounded" title="Lihat Detail">
                        <Eye className="h-4 w-4" />
                    </button>
                </div>
            </td>
        </tr>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Praktikum Management
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Kelola tugas praktikum dan monitor pengumpulan mahasiswa
                    </p>
                </div>

                {/* Navigation Tabs */}
                <div className="flex border-b border-gray-200 dark:border-gray-700 mb-8">
                    {[
                        { id: 'assignments', label: 'Daftar Praktikum', icon: Upload },
                        { id: 'submissions', label: 'Pengumpulan', icon: FileText },
                        { id: 'grading', label: 'Penilaian', icon: Star },
                        { id: 'analytics', label: 'Analisis', icon: BarChart3 }
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

                {/* Assignments Tab */}
                {activeTab === 'assignments' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Cari praktikum..."
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
                                Buat Praktikum Baru
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredAssignments.map((assignment) => (
                                <AssignmentCard key={assignment.id} assignment={assignment} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Submissions Tab */}
                {activeTab === 'submissions' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Pengumpulan Praktikum
                            </h2>
                            <div className="flex items-center gap-4">
                                <select className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                                    <option>Semua Praktikum</option>
                                    {assignments.map(assignment => (
                                        <option key={assignment.id} value={assignment.id}>{assignment.title}</option>
                                    ))}
                                </select>
                                <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
                                    <Download className="h-4 w-4" />
                                    Download All
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
                                            Praktikum
                                        </th>
                                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                                            File
                                        </th>
                                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Dikumpulkan
                                        </th>
                                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Nilai
                                        </th>
                                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {submissions.map((submission) => (
                                        <SubmissionRow key={submission.id} submission={submission} />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Grading Tab */}
                {activeTab === 'grading' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Penilaian Praktikum
                            </h2>
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    {submissions.filter(s => !s.score).length} tugas belum dinilai
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {submissions.filter(s => !s.score).map((submission) => (
                                <div key={submission.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                                                {submission.studentName} - {submission.assignmentTitle}
                                            </h3>
                                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                                <span>NIM: {submission.nim}</span>
                                                <span>File: {submission.fileName}</span>
                                                <span>Dikumpulkan: {new Date(submission.submittedAt).toLocaleDateString('id-ID')}</span>
                                                {submission.isLate && (
                                                    <span className="text-red-500">Terlambat {submission.daysLate} hari</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                                                <Download className="h-4 w-4" />
                                                Download
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedAssignment(submission);
                                                    setGradeForm({
                                                        score: '',
                                                        feedback: '',
                                                        status: 'graded'
                                                    });
                                                    setModalType('grade');
                                                    setShowModal(true);
                                                }}
                                                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                                            >
                                                <Star className="h-4 w-4" />
                                                Beri Nilai
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Analytics Tab */}
                {activeTab === 'analytics' && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Analisis Praktikum
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                                <h3 className="font-medium text-gray-900 dark:text-white mb-4">Total Praktikum</h3>
                                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{assignments.length}</p>
                            </div>

                            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                                <h3 className="font-medium text-gray-900 dark:text-white mb-4">Total Pengumpulan</h3>
                                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{submissions.length}</p>
                            </div>

                            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                                <h3 className="font-medium text-gray-900 dark:text-white mb-4">Rata-rata Nilai</h3>
                                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                                    {submissions.filter(s => s.score).length > 0
                                        ? Math.round(submissions.filter(s => s.score).reduce((sum, s) => sum + s.score, 0) / submissions.filter(s => s.score).length)
                                        : 0}
                                </p>
                            </div>

                            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                                <h3 className="font-medium text-gray-900 dark:text-white mb-4">Terlambat</h3>
                                <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                                    {submissions.filter(s => s.isLate).length}
                                </p>
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
                                        {modalType === 'create' ? 'Buat Praktikum Baru' :
                                         modalType === 'edit' ? 'Edit Praktikum' :
                                         modalType === 'grade' ? 'Beri Nilai' : 'Detail Praktikum'}
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
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Judul Praktikum
                                                </label>
                                                <input
                                                    type="text"
                                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                                    placeholder="Masukkan judul praktikum..."
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
                                                    Deadline
                                                </label>
                                                <input
                                                    type="datetime-local"
                                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Skor Maksimal
                                                </label>
                                                <input
                                                    type="number"
                                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                                    placeholder="100"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Deskripsi Tugas
                                            </label>
                                            <textarea
                                                rows={4}
                                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                                placeholder="Jelaskan detail tugas praktikum..."
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Petunjuk Pengerjaan
                                            </label>
                                            <textarea
                                                rows={6}
                                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                                placeholder="1. Langkah pertama&#10;2. Langkah kedua&#10;3. dst..."
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Kriteria Penilaian
                                            </label>
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="text"
                                                        className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                                        placeholder="Kriteria (contoh: Kebenaran algoritma)"
                                                    />
                                                    <input
                                                        type="number"
                                                        className="w-20 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                                        placeholder="Bobot"
                                                        min="1"
                                                        max="100"
                                                    />
                                                    <span className="text-sm text-gray-500 dark:text-gray-400">%</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="text"
                                                        className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                                        placeholder="Kriteria (contoh: Kualitas kode)"
                                                    />
                                                    <input
                                                        type="number"
                                                        className="w-20 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                                        placeholder="Bobot"
                                                        min="1"
                                                        max="100"
                                                    />
                                                    <span className="text-sm text-gray-500 dark:text-gray-400">%</span>
                                                </div>
                                                <button className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                                                    <Plus className="h-4 w-4" />
                                                    Tambah Kriteria
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : modalType === 'grade' ? (
                                    <div className="space-y-6">
                                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                                                Informasi Pengumpulan
                                            </h4>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span className="text-gray-600 dark:text-gray-400">Mahasiswa:</span>
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        {selectedAssignment?.studentName} ({selectedAssignment?.nim})
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-600 dark:text-gray-400">File:</span>
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        {selectedAssignment?.fileName}
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-600 dark:text-gray-400">Dikumpulkan:</span>
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        {selectedAssignment?.submittedAt && new Date(selectedAssignment.submittedAt).toLocaleString('id-ID')}
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-600 dark:text-gray-400">Status:</span>
                                                    <p className={`font-medium ${
                                                        selectedAssignment?.isLate ? 'text-red-500' : 'text-green-500'
                                                    }`}>
                                                        {selectedAssignment?.isLate
                                                            ? `Terlambat ${selectedAssignment.daysLate} hari`
                                                            : `${selectedAssignment?.daysEarly} hari lebih awal`
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Nilai (0-100)
                                                </label>
                                                <input
                                                    type="number"
                                                    value={gradeForm.score}
                                                    onChange={(e) => setGradeForm({...gradeForm, score: e.target.value})}
                                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                                    placeholder="85"
                                                    min="0"
                                                    max="100"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Status
                                                </label>
                                                <select
                                                    value={gradeForm.status}
                                                    onChange={(e) => setGradeForm({...gradeForm, status: e.target.value})}
                                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                                >
                                                    <option value="graded">Dinilai</option>
                                                    <option value="needs_revision">Perlu Revisi</option>
                                                    <option value="excellent">Sangat Baik</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Feedback & Komentar
                                            </label>
                                            <textarea
                                                rows={6}
                                                value={gradeForm.feedback}
                                                onChange={(e) => setGradeForm({...gradeForm, feedback: e.target.value})}
                                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                                placeholder="Berikan feedback konstruktif untuk mahasiswa..."
                                            />
                                        </div>

                                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                                            <div className="flex items-center gap-2">
                                                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                                                <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                                                    Perhatian
                                                </span>
                                            </div>
                                            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                                                Nilai dan feedback akan dikirim ke mahasiswa melalui email dan dashboard mereka.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <p>Detail praktikum akan ditampilkan di sini...</p>
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
                                    {modalType === 'grade' ? (
                                        <div className="flex items-center gap-3">
                                            <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                                                <Download className="h-4 w-4" />
                                                Download File
                                            </button>
                                            <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors">
                                                <Save className="h-4 w-4" />
                                                Simpan Nilai
                                            </button>
                                        </div>
                                    ) : (
                                        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors">
                                            <Save className="h-4 w-4" />
                                            {modalType === 'create' ? 'Buat Praktikum' : 'Simpan Perubahan'}
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

export default InstructorPraktikumManagement;
