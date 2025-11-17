import React, { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { router, useForm } from '@inertiajs/react';
import {
    Upload, Plus, Edit3, Trash2, Eye, Search, Download,
    Calendar, FileText, Star, BarChart3, X, Save, AlertTriangle,
    ArrowLeft, Users, CheckCircle, Clock, Award
} from 'lucide-react';

interface Assignment {
    id: number;
    title: string;
    moduleId: number;
    moduleName: string;
    description: string;
    deadline: string;
    maxScore: number;
    submissions: number;
    totalStudents: number;
    averageScore: number;
    status: string;
    createdAt: string;
}

interface Module {
    id: number;
    title: string;
    order: number;
}

interface Submission {
    id: number;
    assignmentId: number;
    assignmentTitle: string;
    studentId: number;
    studentName: string;
    nim: string;
    fileName: string;
    fileSize: string;
    submittedAt: string;
    status: string;
    score: number | null;
    feedback: string;
    isLate: boolean;
    daysLate: number;
    daysEarly: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/instructor/dashboard' },
    { title: 'Praktikum Management', href: '/instructor/praktikum' },
];

export default function InstructorPraktikumManagement({
    assignments: initialAssignments,
    modules
}: {
    assignments: Assignment[],
    modules: Module[]
}) {
    const [activeTab, setActiveTab] = useState('assignments');
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('');
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [analytics, setAnalytics] = useState<any>(null);

    // New states for card-based navigation
    const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
    const [showPdfPreview, setShowPdfPreview] = useState(false);
    const [pdfUrl, setPdfUrl] = useState('');
    const [selectedModuleFilter, setSelectedModuleFilter] = useState<number | 'all'>('all');

    const assignmentForm = useForm({
        title: '',
        module_id: '',
        description: '',
        instructions: '',
        deadline: '',
        max_score: 100,
        is_active: false,
    });

    const gradeForm = useForm({
        score: '',
        feedback: '',
    });

    // Fetch submissions for selected assignment
    const fetchSubmissions = (assignmentId: number) => {
        fetch(`/instructor/praktikum/submissions?assignment_id=${assignmentId}`)
            .then(res => res.json())
            .then(data => setSubmissions(data));
    };

    // Fetch analytics
    useEffect(() => {
        if (activeTab === 'analytics') {
            fetch('/instructor/praktikum/analytics')
                .then(res => res.json())
                .then(data => setAnalytics(data));
        }
    }, [activeTab]);

    // Group assignments by module
    const assignmentsByModule = modules.map(module => {
        const moduleAssignments = initialAssignments.filter(
            a => a.moduleId === module.id
        );
        return {
            module,
            assignments: moduleAssignments,
            totalSubmissions: moduleAssignments.reduce((sum, a) => sum + a.submissions, 0),
            totalPossible: moduleAssignments.length * (initialAssignments[0]?.totalStudents || 0),
        };
    }).filter(m => m.assignments.length > 0);

    const filteredAssignments = selectedModuleFilter === 'all'
        ? initialAssignments
        : initialAssignments.filter(a => a.moduleId === selectedModuleFilter);

    const handleCreateAssignment = () => {
        assignmentForm.post('/instructor/praktikum', {
            onSuccess: () => {
                setShowModal(false);
                assignmentForm.reset();
            }
        });
    };

    const handleUpdateAssignment = () => {
        assignmentForm.put(`/instructor/praktikum/${selectedItem.id}`, {
            onSuccess: () => {
                setShowModal(false);
                assignmentForm.reset();
            }
        });
    };

    const handleDeleteAssignment = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus praktikum ini?')) {
            router.delete(`/instructor/praktikum/${id}`);
        }
    };

    const handleGradeSubmission = () => {
        gradeForm.post(`/instructor/praktikum/submissions/${selectedSubmission?.id}/grade`, {
            onSuccess: () => {
                setShowModal(false);
                gradeForm.reset();
                // Refresh submissions
                if (selectedAssignment) {
                    fetchSubmissions(selectedAssignment.id);
                }
            }
        });
    };

    const openCreateModal = () => {
        assignmentForm.reset();
        setModalType('create');
        setShowModal(true);
    };

    const openEditModal = (assignment: Assignment) => {
        setSelectedItem(assignment);
        assignmentForm.setData({
            title: assignment.title,
            module_id: assignment.moduleId.toString(),
            description: assignment.description,
            instructions: '',
            deadline: assignment.deadline,
            max_score: assignment.maxScore,
            is_active: assignment.status === 'active',
        });
        setModalType('edit');
        setShowModal(true);
    };

    const openAssignmentDetail = (assignment: Assignment) => {
        setSelectedAssignment(assignment);
        fetchSubmissions(assignment.id);
    };

    const openGradeModal = (submission: Submission) => {
        setSelectedSubmission(submission);
        gradeForm.setData({
            score: submission.score?.toString() || '',
            feedback: submission.feedback || '',
        });
        setModalType('grade');
        setShowModal(true);
    };

    const openPdfPreview = (submission: Submission) => {
        setSelectedSubmission(submission);
        setPdfUrl(`/instructor/praktikum/submissions/${submission.id}/preview`);
        setShowPdfPreview(true);
    };

    const getStatusColor = (status: string) => {
        const colors = {
            active: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
            draft: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
            closed: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
        };
        return colors[status as keyof typeof colors] || 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300';
    };

    const formatDeadline = (deadline: string) => {
        const date = new Date(deadline);
        const now = new Date();
        const diff = date.getTime() - now.getTime();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

        if (days > 0) return `${days} hari lagi`;
        if (days === 0) return 'Hari ini';
        return `Terlambat ${Math.abs(days)} hari`;
    };

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
                        { id: 'analytics', label: 'Analisis', icon: BarChart3 }
                    ].map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    setActiveTab(tab.id);
                                    setSelectedAssignment(null);
                                }}
                                className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
                                    activeTab === tab.id
                                        ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                                }`}
                            >
                                <Icon className="h-5 w-5" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Assignments Tab */}
                {activeTab === 'assignments' && !selectedAssignment && (
                    <div className="space-y-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Cari praktikum..."
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
                                onClick={openCreateModal}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                            >
                                <Plus className="h-4 w-4" />
                                Buat Praktikum Baru
                            </button>
                        </div>

                        {/* Group by Module */}
                        {assignmentsByModule.map(({ module, assignments: moduleAssignments }) => (
                            <div key={module.id} className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                        {module.title}
                                    </h2>
                                    <span className="text-sm text-gray-500">
                                        {moduleAssignments.length} praktikum
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {moduleAssignments
                                        .filter(assignment =>
                                            assignment.title.toLowerCase().includes(searchTerm.toLowerCase())
                                        )
                                        .map((assignment) => (
                                        <div
                                            key={assignment.id}
                                            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-200 cursor-pointer"
                                            onClick={() => openAssignmentDetail(assignment)}
                                        >
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                            {assignment.title}
                                                        </h3>
                                                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(assignment.status)}`}>
                                                            {assignment.status === 'active' ? 'Aktif' : 'Draft'}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 mb-3">
                                                        {assignment.description}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openEditModal(assignment);
                                                        }}
                                                        className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg"
                                                    >
                                                        <Edit3 className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteAssignment(assignment.id);
                                                        }}
                                                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                                    <Users className="h-5 w-5 mx-auto mb-1 text-blue-600" />
                                                    <p className="text-2xl font-bold text-blue-600">{assignment.submissions}</p>
                                                    <p className="text-xs text-gray-600 dark:text-gray-400">Dikumpulkan</p>
                                                </div>
                                                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                                    <Award className="h-5 w-5 mx-auto mb-1 text-green-600" />
                                                    <p className="text-2xl font-bold text-green-600">{assignment.averageScore}</p>
                                                    <p className="text-xs text-gray-600 dark:text-gray-400">Rata-rata</p>
                                                </div>
                                            </div>

                                            <div className="p-3 rounded-lg border bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-4 w-4 text-blue-500" />
                                                        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                                            {formatDeadline(assignment.deadline)}
                                                        </span>
                                                    </div>
                                                    <span className="text-xs text-gray-500">
                                                        {new Date(assignment.deadline).toLocaleDateString('id-ID')}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="mt-4">
                                                <div className="flex justify-between text-xs text-gray-500 mb-1">
                                                    <span>Progress</span>
                                                    <span>{Math.round((assignment.submissions / assignment.totalStudents) * 100)}%</span>
                                                </div>
                                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                    <div
                                                        className="bg-blue-500 h-2 rounded-full transition-all"
                                                        style={{ width: `${(assignment.submissions / assignment.totalStudents) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Assignment Detail - Submissions List */}
                {activeTab === 'assignments' && selectedAssignment && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 mb-6">
                            <button
                                onClick={() => setSelectedAssignment(null)}
                                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                <ArrowLeft className="h-5 w-5" />
                                Kembali
                            </button>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {selectedAssignment.title}
                                </h2>
                                <p className="text-sm text-gray-500">{selectedAssignment.moduleName}</p>
                            </div>
                            <a
                                href={`/instructor/praktikum/assignments/${selectedAssignment.id}/download-all`}
                                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                            >
                                <Download className="h-4 w-4" />
                                Download Semua
                            </a>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                                <Users className="h-6 w-6 text-blue-600 mb-2" />
                                <p className="text-2xl font-bold text-blue-600">{submissions.length}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Total Pengumpulan</p>
                            </div>
                            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                                <CheckCircle className="h-6 w-6 text-green-600 mb-2" />
                                <p className="text-2xl font-bold text-green-600">
                                    {submissions.filter(s => s.score !== null).length}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Sudah Dinilai</p>
                            </div>
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                                <Clock className="h-6 w-6 text-yellow-600 mb-2" />
                                <p className="text-2xl font-bold text-yellow-600">
                                    {submissions.filter(s => s.score === null).length}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Belum Dinilai</p>
                            </div>
                            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                                <Award className="h-6 w-6 text-purple-600 mb-2" />
                                <p className="text-2xl font-bold text-purple-600">
                                    {submissions.filter(s => s.score !== null).length > 0
                                        ? Math.round(submissions.filter(s => s.score !== null).reduce((sum, s) => sum + (s.score || 0), 0) / submissions.filter(s => s.score !== null).length)
                                        : 0}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Rata-rata Nilai</p>
                            </div>
                        </div>

                        {/* Submissions List */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                    Daftar Pengumpulan Mahasiswa
                                </h3>
                            </div>
                            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                {submissions.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500">
                                        Belum ada mahasiswa yang mengumpulkan tugas
                                    </div>
                                ) : (
                                    submissions.map((submission) => (
                                        <div key={submission.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h4 className="font-semibold text-gray-900 dark:text-white">
                                                            {submission.studentName}
                                                        </h4>
                                                        <span className="text-sm text-gray-500">
                                                            {submission.nim}
                                                        </span>
                                                        {submission.score !== null && (
                                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                                submission.score >= 80
                                                                    ? 'bg-green-100 text-green-700'
                                                                    : submission.score >= 60
                                                                    ? 'bg-yellow-100 text-yellow-700'
                                                                    : 'bg-red-100 text-red-700'
                                                            }`}>
                                                                Nilai: {submission.score}
                                                            </span>
                                                        )}
                                                        {submission.isLate && (
                                                            <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">
                                                                Terlambat {submission.daysLate} hari
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                                        <div className="flex items-center gap-1">
                                                            <FileText className="h-4 w-4" />
                                                            <span>{submission.fileName}</span>
                                                        </div>
                                                        <span>•</span>
                                                        <span>{submission.fileSize}</span>
                                                        <span>•</span>
                                                        <span>{new Date(submission.submittedAt).toLocaleString('id-ID')}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => openPdfPreview(submission)}
                                                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                        Lihat
                                                    </button>
                                                    <button
                                                        onClick={() => openGradeModal(submission)}
                                                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                                                    >
                                                        <Star className="h-4 w-4" />
                                                        Beri Nilai
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Analytics Tab */}
                {activeTab === 'analytics' && analytics && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Analisis Praktikum
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                                <Upload className="h-8 w-8 text-blue-600 mb-3" />
                                <h3 className="font-medium text-gray-600 dark:text-gray-400 mb-2">Total Praktikum</h3>
                                <p className="text-3xl font-bold text-blue-600">{analytics.totalAssignments}</p>
                            </div>
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                                <Users className="h-8 w-8 text-green-600 mb-3" />
                                <h3 className="font-medium text-gray-600 dark:text-gray-400 mb-2">Total Pengumpulan</h3>
                                <p className="text-3xl font-bold text-green-600">{analytics.totalSubmissions}</p>
                            </div>
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                                <Award className="h-8 w-8 text-orange-600 mb-3" />
                                <h3 className="font-medium text-gray-600 dark:text-gray-400 mb-2">Rata-rata Nilai</h3>
                                <p className="text-3xl font-bold text-orange-600">{analytics.averageScore}</p>
                            </div>
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                                <AlertTriangle className="h-8 w-8 text-red-600 mb-3" />
                                <h3 className="font-medium text-gray-600 dark:text-gray-400 mb-2">Terlambat</h3>
                                <p className="text-3xl font-bold text-red-600">{analytics.lateSubmissions}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* PDF Preview Modal */}
                {showPdfPreview && selectedSubmission && (
                    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
                        <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-6xl h-[90vh] flex flex-col">
                            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {selectedSubmission.studentName} - {selectedSubmission.assignmentTitle}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        File: {selectedSubmission.fileName}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <a
                                        href={`/instructor/praktikum/submissions/${selectedSubmission.id}/download`}
                                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                                    >
                                        <Download className="h-4 w-4" />
                                        Download
                                    </a>
                                    <button
                                        onClick={() => {
                                            setShowPdfPreview(false);
                                            openGradeModal(selectedSubmission);
                                        }}
                                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                                    >
                                        <Star className="h-4 w-4" />
                                        Beri Nilai
                                    </button>
                                    <button
                                        onClick={() => setShowPdfPreview(false)}
                                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                    >
                                        <X className="h-6 w-6" />
                                    </button>
                                </div>
                            </div>
                            <div className="flex-1 p-4">
                                <iframe
                                    src={pdfUrl}
                                    className="w-full h-full rounded-lg border border-gray-300 dark:border-gray-600"
                                    title="PDF Preview"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Create/Edit Assignment Modal */}
                {showModal && (modalType === 'create' || modalType === 'edit') && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {modalType === 'create' ? 'Buat Praktikum Baru' : 'Edit Praktikum'}
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
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Judul Praktikum
                                            </label>
                                            <input
                                                type="text"
                                                value={assignmentForm.data.title}
                                                onChange={e => assignmentForm.setData('title', e.target.value)}
                                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                                placeholder="Contoh: Praktikum 1 - Program Pertama"
                                            />
                                            {assignmentForm.errors.title && (
                                                <p className="text-red-500 text-sm mt-1">{assignmentForm.errors.title}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Modul
                                            </label>
                                            <select
                                                value={assignmentForm.data.module_id}
                                                onChange={e => assignmentForm.setData('module_id', e.target.value)}
                                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                            >
                                                <option value="">Pilih Modul...</option>
                                                {modules.map(module => (
                                                    <option key={module.id} value={module.id}>{module.title}</option>
                                                ))}
                                            </select>
                                            {assignmentForm.errors.module_id && (
                                                <p className="text-red-500 text-sm mt-1">{assignmentForm.errors.module_id}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Deadline
                                            </label>
                                            <input
                                                type="datetime-local"
                                                value={assignmentForm.data.deadline}
                                                onChange={e => assignmentForm.setData('deadline', e.target.value)}
                                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                            />
                                            {assignmentForm.errors.deadline && (
                                                <p className="text-red-500 text-sm mt-1">{assignmentForm.errors.deadline}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Skor Maksimal
                                            </label>
                                            <input
                                                type="number"
                                                value={assignmentForm.data.max_score}
                                                onChange={e => assignmentForm.setData('max_score', parseInt(e.target.value))}
                                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                                min="1"
                                                max="100"
                                            />
                                            {assignmentForm.errors.max_score && (
                                                <p className="text-red-500 text-sm mt-1">{assignmentForm.errors.max_score}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Deskripsi Tugas
                                        </label>
                                        <textarea
                                            rows={4}
                                            value={assignmentForm.data.description}
                                            onChange={e => assignmentForm.setData('description', e.target.value)}
                                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                            placeholder="Jelaskan detail tugas praktikum..."
                                        />
                                        {assignmentForm.errors.description && (
                                            <p className="text-red-500 text-sm mt-1">{assignmentForm.errors.description}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Petunjuk Pengerjaan (Opsional)
                                        </label>
                                        <textarea
                                            rows={6}
                                            value={assignmentForm.data.instructions}
                                            onChange={e => assignmentForm.setData('instructions', e.target.value)}
                                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                            placeholder="1. Langkah pertama&#10;2. Langkah kedua&#10;3. dst..."
                                        />
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            id="is_active"
                                            checked={assignmentForm.data.is_active}
                                            onChange={e => assignmentForm.setData('is_active', e.target.checked)}
                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <label htmlFor="is_active" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Aktifkan praktikum (mahasiswa dapat melihat dan mengumpulkan)
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-end gap-4">
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (modalType === 'create') handleCreateAssignment();
                                            else handleUpdateAssignment();
                                        }}
                                        disabled={assignmentForm.processing}
                                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        <Save className="h-4 w-4" />
                                        {assignmentForm.processing ? 'Menyimpan...' : 'Simpan'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Grade Modal */}
                {showModal && modalType === 'grade' && selectedSubmission && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        Beri Nilai
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
                                <div className="space-y-6">
                                    {/* Submission Info */}
                                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                        <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                                            Informasi Pengumpulan
                                        </h4>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="text-gray-600 dark:text-gray-400">Mahasiswa:</span>
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {selectedSubmission.studentName}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-gray-600 dark:text-gray-400">NIM:</span>
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {selectedSubmission.nim}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-gray-600 dark:text-gray-400">File:</span>
                                                <p className="font-medium text-gray-900 dark:text-white truncate">
                                                    {selectedSubmission.fileName}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-gray-600 dark:text-gray-400">Ukuran:</span>
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {selectedSubmission.fileSize}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-gray-600 dark:text-gray-400">Dikumpulkan:</span>
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {new Date(selectedSubmission.submittedAt).toLocaleString('id-ID')}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-gray-600 dark:text-gray-400">Status:</span>
                                                <p className={`font-medium ${
                                                    selectedSubmission.isLate ? 'text-red-500' : 'text-green-500'
                                                }`}>
                                                    {selectedSubmission.isLate
                                                        ? `Terlambat ${selectedSubmission.daysLate} hari`
                                                        : `${selectedSubmission.daysEarly} hari lebih awal`
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Grade Input */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Nilai (0-100) <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            value={gradeForm.data.score}
                                            onChange={e => gradeForm.setData('score', e.target.value)}
                                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-2xl font-bold text-center"
                                            placeholder="85"
                                            min="0"
                                            max="100"
                                        />
                                        {gradeForm.errors.score && (
                                            <p className="text-red-500 text-sm mt-1">{gradeForm.errors.score}</p>
                                        )}
                                        <div className="flex justify-between mt-2 text-xs text-gray-500">
                                            <span>Minimum: 0</span>
                                            <span>Maksimum: 100</span>
                                        </div>
                                    </div>

                                    {/* Feedback Input */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Feedback & Komentar <span className="text-gray-500">(Opsional)</span>
                                        </label>
                                        <textarea
                                            rows={6}
                                            value={gradeForm.data.feedback}
                                            onChange={e => gradeForm.setData('feedback', e.target.value)}
                                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                            placeholder="Berikan feedback konstruktif untuk mahasiswa...&#10;&#10;Contoh:&#10;- Implementasi algoritma sudah benar&#10;- Struktur kode rapi dan mudah dibaca&#10;- Dokumentasi perlu ditambahkan&#10;- dll"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Feedback akan membantu mahasiswa memahami kekuatan dan area yang perlu ditingkatkan
                                        </p>
                                    </div>

                                    {/* Info Box */}
                                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                        <div className="flex items-start gap-3">
                                            <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <span className="text-sm font-medium text-blue-800 dark:text-blue-200 block mb-1">
                                                    Informasi Penilaian
                                                </span>
                                                <p className="text-sm text-blue-700 dark:text-blue-300">
                                                    Nilai yang Anda berikan akan langsung tersimpan. Pastikan nilai dan feedback sudah sesuai sebelum menyimpan.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-end gap-4">
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        onClick={() => openPdfPreview(selectedSubmission)}
                                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                                    >
                                        <Eye className="h-4 w-4" />
                                        Lihat File
                                    </button>
                                    <button
                                        onClick={handleGradeSubmission}
                                        disabled={gradeForm.processing || !gradeForm.data.score}
                                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Save className="h-4 w-4" />
                                        {gradeForm.processing ? 'Menyimpan...' : 'Simpan Nilai'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
