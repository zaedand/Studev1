import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { PageProps as InertiaPageProps } from '@inertiajs/core';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    BookOpen,
    FileText,
    Video,
    ClipboardList,
    Upload,
    Flame,
    Clock,
    CheckCircle,
    ArrowLeft,
    Download,
    Play,
    Globe,
    Target,
    BookOpenCheck,
    Lightbulb,
    PenTool,
    Calendar,
    AlertCircle,
    Trophy,
    X,
    Eye
} from 'lucide-react';
import { useState } from 'react';

// TypeScript interfaces
interface ModuleData {
    id: number;
    title: string;
    description: string;
    color: string;
    progress: number;
    totalLessons: number;
    completedLessons: number;
    estimatedTime: string;
    difficulty: string;
    prerequisites: string[];
}

interface Video {
    id: number;
    title: string;
    platform: string;
    duration: string;
    thumbnail: string;
    watched: boolean;
}

interface Link {
    title: string;
    url: string;
    type: string;
}

interface ContentSection {
    title: string;
    description: string;
    points: number;
    completed: boolean;
}

interface CPContent extends ContentSection {
    content: string[];
}

interface ATPContent extends ContentSection {
    content: string[];
}

interface MateriContent extends ContentSection {
    fileName: string;
    fileSize: string;
    readProgress: number;
    canDownload: boolean;
}

interface PengayaanContent extends ContentSection {
    videos: Video[];
    links: Link[];
}

interface QuizContent extends ContentSection {
    totalQuestions: number;
    timeLimit: number;
    attempts: number;
    maxAttempts: number;
    bestScore: number | null;
}

interface PraktikumContent extends ContentSection {
    deadline: string;
    submitted: boolean;
    submissionFile: string | null;
    tasks: string[];
}

interface ModuleContent {
    cp: CPContent;
    atp: ATPContent;
    materi: MateriContent;
    pengayaan: PengayaanContent;
    quiz: QuizContent;
    praktikum: PraktikumContent;
}

interface PageProps extends InertiaPageProps {
    moduleData: ModuleData;
    moduleContent: ModuleContent;
    breadcrumbs: BreadcrumbItem[];
}

export default function ModuleDetail() {
    const { moduleData, moduleContent, breadcrumbs } = usePage<PageProps>().props;
    const [showPengayaanModal, setShowPengayaanModal] = useState(false);
    const [showPraktikumModal, setShowPraktikumModal] = useState(false);

    // Fungsi untuk format deadline
    const formatDeadline = (deadline: string): string => {
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

    // Modal Component
    const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) => {
        if (!isOpen) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <X className="h-5 w-5 text-gray-500" />
                        </button>
                    </div>
                    <div className="p-6">
                        {children}
                    </div>
                </div>
            </div>
        );
    };

    // CP Card Component
    const CPCard = () => (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 h-fit">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${moduleData.color}`}>
                        <Target className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                            {moduleContent.cp.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {moduleContent.cp.description}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {moduleContent.cp.completed && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                        <Flame className="h-4 w-4" />
                        <span className="text-sm font-medium">{moduleContent.cp.points}</span>
                    </div>
                </div>
            </div>
            <div className="space-y-3">
                {moduleContent.cp.content.map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                        <Target className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                            {item}
                        </span>
                    </div>
                ))}
                <button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors">
                    Selesai Lihat
                </button>
            </div>
        </div>
    );

    // ATP Card Component
    const ATPCard = () => (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 h-fit">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${moduleData.color}`}>
                        <BookOpenCheck className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                            {moduleContent.atp.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {moduleContent.atp.description}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {moduleContent.atp.completed && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                        <Flame className="h-4 w-4" />
                        <span className="text-sm font-medium">{moduleContent.atp.points}</span>
                    </div>
                </div>
            </div>
            <div className="space-y-3">
                {moduleContent.atp.content.map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-xs font-semibold flex-shrink-0">
                            {index + 1}
                        </div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                            {item}
                        </span>
                    </div>
                ))}
                <button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors">
                    Selesai Lihat
                </button>
            </div>
        </div>
    );

    // Materi Card Component (with scrollable content)
    const MateriCard = () => (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${moduleData.color}`}>
                        <FileText className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                            {moduleContent.materi.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {moduleContent.materi.description}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {moduleContent.materi.completed && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                        <Flame className="h-4 w-4" />
                        <span className="text-sm font-medium">{moduleContent.materi.points}</span>
                    </div>
                </div>
            </div>

            {/* File Info */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg mb-4">
                <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-red-500" />
                    <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                            {moduleContent.materi.fileName}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {moduleContent.materi.fileSize}
                        </p>
                    </div>
                </div>
                {moduleContent.materi.canDownload ? (
                    <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors">
                        <Download className="h-4 w-4" />
                        Download
                    </button>
                ) : (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        Baca sampai akhir untuk download
                    </span>
                )}
            </div>

            {/* Progress membaca */}
            <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Progress Membaca</span>
                    <span className="text-gray-600 dark:text-gray-400">
                        {moduleContent.materi.readProgress}%
                    </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${moduleContent.materi.readProgress}%` }}
                    ></div>
                </div>
            </div>

            {/* PDF Viewer (Scrollable) */}
            <div className="border border-gray-200 dark:border-gray-600 rounded-lg h-96 mb-4 bg-gray-50 dark:bg-gray-900 overflow-auto">
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                    {/* This would be replaced with actual PDF viewer */}
                    <div className="flex flex-col items-center justify-center h-full">
                        <FileText className="h-16 w-16 mb-4 text-gray-400" />
                        <p className="text-lg font-medium mb-2">PDF Preview</p>
                        <p className="text-sm">Konten PDF akan ditampilkan di sini</p>
                        <p className="text-sm mt-2">Scroll untuk membaca lebih lanjut</p>
                    </div>
                    {/* In real implementation, this would be an iframe or PDF.js viewer */}
                </div>
            </div>

            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors">
                Buka PDF di Tab Baru
            </button>
        </div>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${moduleData.title} - Module Detail`} />

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4 overflow-x-auto">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-xl">
                    <div className="flex items-start gap-4">
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5" />
                            <span>Kembali ke Dashboard</span>
                        </Link>
                    </div>

                    <div className="flex items-start justify-between mt-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <div className={`p-3 rounded-lg ${moduleData.color}`}>
                                    <BookOpen className="h-6 w-6 text-white" />
                                </div>
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Modul {moduleData.id}
                                </span>
                            </div>

                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                {moduleData.title}
                            </h1>

                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                {moduleData.description}
                            </p>

                            {/* Prerequisites */}
                            {moduleData.prerequisites.length > 0 && (
                                <div className="mb-4">
                                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Prerequisites:
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {moduleData.prerequisites.map((prereq, index) => (
                                            <span
                                                key={index}
                                                className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full"
                                            >
                                                {prereq}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Module Stats */}
                            <div className="flex flex-wrap gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-gray-500" />
                                    <span className="text-gray-600 dark:text-gray-400">
                                        {moduleData.estimatedTime}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Trophy className="h-4 w-4 text-gray-500" />
                                    <span className="text-gray-600 dark:text-gray-400">
                                        {moduleData.difficulty}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <BookOpenCheck className="h-4 w-4 text-gray-500" />
                                    <span className="text-gray-600 dark:text-gray-400">
                                        {moduleData.completedLessons}/{moduleData.totalLessons} lessons
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Progress Circle */}
                        <div className="flex flex-col items-center">
                            <div className="relative w-20 h-20">
                                <svg className="w-20 h-20 transform -rotate-90">
                                    <circle
                                        cx="40"
                                        cy="40"
                                        r="36"
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        fill="transparent"
                                        className="text-gray-200 dark:text-gray-700"
                                    />
                                    <circle
                                        cx="40"
                                        cy="40"
                                        r="36"
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        fill="transparent"
                                        strokeDasharray={`${2 * Math.PI * 36}`}
                                        strokeDashoffset={`${2 * Math.PI * 36 * (1 - moduleData.progress / 100)}`}
                                        className="text-green-500 transition-all duration-300"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                                        {moduleData.progress}%
                                    </span>
                                </div>
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                Progress
                            </span>
                        </div>
                    </div>
                </div>

                {/* New Layout */}
                <div className="grid gap-6">
                    {/* Row 1: CP and ATP (2 columns) */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <CPCard />
                        <ATPCard />
                    </div>

                    {/* Row 2: Materi (Full width) */}
                    <MateriCard />

                    {/* Row 3: Pengayaan, Quiz, and Praktikum (3 columns) */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Pengayaan Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${moduleData.color}`}>
                                        <Lightbulb className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">
                                            {moduleContent.pengayaan.title}
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {moduleContent.pengayaan.description}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {moduleContent.pengayaan.completed && (
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                    )}
                                    <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                                        <Flame className="h-4 w-4" />
                                        <span className="text-sm font-medium">{moduleContent.pengayaan.points}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 mb-4">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {moduleContent.pengayaan.videos.length} video pembelajaran
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {moduleContent.pengayaan.links.length} sumber tambahan
                                </p>
                            </div>

                            <button
                                onClick={() => setShowPengayaanModal(true)}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                <Eye className="h-4 w-4" />
                                Lihat Detail
                            </button>
                        </div>

                        {/* Quiz Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${moduleData.color}`}>
                                        <ClipboardList className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">
                                            {moduleContent.quiz.title}
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {moduleContent.quiz.description}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {moduleContent.quiz.completed && (
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                    )}
                                    <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                                        <Flame className="h-4 w-4" />
                                        <span className="text-sm font-medium">{moduleContent.quiz.points}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {moduleContent.quiz.totalQuestions}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Soal</p>
                                </div>
                                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {moduleContent.quiz.timeLimit}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Menit</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-sm mb-4">
                                <span className="text-gray-600 dark:text-gray-400">
                                    Percobaan: {moduleContent.quiz.attempts}/{moduleContent.quiz.maxAttempts}
                                </span>
                                {moduleContent.quiz.bestScore && (
                                    <span className="text-green-600 dark:text-green-400 font-medium">
                                        Skor: {moduleContent.quiz.bestScore}/100
                                    </span>
                                )}
                            </div>

                            <Link
                                href={route('quiz.show', { id: moduleData.id })}
                                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                <PenTool className="h-4 w-4" />
                                Mulai Quiz
                            </Link>
                        </div>

                        {/* Praktikum Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${moduleData.color}`}>
                                        <Upload className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">
                                            {moduleContent.praktikum.title}
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {moduleContent.praktikum.description}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {moduleContent.praktikum.completed && (
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                    )}
                                    <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                                        <Flame className="h-4 w-4" />
                                        <span className="text-sm font-medium">{moduleContent.praktikum.points}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Deadline Info */}
                            <div className={`p-3 rounded-lg border mb-4 ${
                                formatDeadline(moduleContent.praktikum.deadline).includes('Terlambat')
                                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                                    : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                            }`}>
                                <div className="flex items-center gap-2">
                                    <Calendar className={`h-4 w-4 ${
                                        formatDeadline(moduleContent.praktikum.deadline).includes('Terlambat')
                                            ? 'text-red-500'
                                            : 'text-blue-500'
                                    }`} />
                                    <span className={`text-sm font-medium ${
                                        formatDeadline(moduleContent.praktikum.deadline).includes('Terlambat')
                                            ? 'text-red-700 dark:text-red-400'
                                            : 'text-blue-700 dark:text-blue-400'
                                    }`}>
                                        {formatDeadline(moduleContent.praktikum.deadline)}
                                    </span>
                                </div>
                            </div>

                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                {moduleContent.praktikum.tasks.length} tugas praktikum
                            </p>

                            <button
                                onClick={() => setShowPraktikumModal(true)}
                                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                <Eye className="h-4 w-4" />
                                Lihat Detail
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pengayaan Modal */}
            <Modal
                isOpen={showPengayaanModal}
                onClose={() => setShowPengayaanModal(false)}
                title="Pengayaan Materi"
            >
                <div className="space-y-6">
                    {/* Video Section */}
                    <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-4">Video Pembelajaran</h4>
                        <div className="grid gap-4">
                            {moduleContent.pengayaan.videos.map((video) => (
                                <div key={video.id} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                                    <div className="relative">
                                        <div className="w-24 h-16 bg-gray-300 dark:bg-gray-600 rounded overflow-hidden">
                                            <img
                                                src={video.thumbnail}
                                                alt={video.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        {!video.watched && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <Play className="h-6 w-6 text-white drop-shadow-lg" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h5 className="font-medium text-gray-900 dark:text-white mb-1">
                                            {video.title}
                                        </h5>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {video.platform} • {video.duration}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {video.watched ? (
                                            <CheckCircle className="h-5 w-5 text-green-500" />
                                        ) : (
                                            <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors">
                                                Tonton
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Links Section */}
                    <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-4">Sumber Tambahan</h4>
                        <div className="grid gap-3">
                            {moduleContent.pengayaan.links.map((link, index) => (
                                <a
                                    key={index}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                                >
                                    <Globe className="h-5 w-5 text-blue-500 flex-shrink-0" />
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {link.title}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {link.type}
                                        </p>
                                    </div>
                                    <div className="text-blue-600 dark:text-blue-400">
                                        →
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={() => setShowPengayaanModal(false)}
                            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
                        >
                            Tutup
                        </button>
                        <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors">
                            Mulai Pengayaan
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Praktikum Modal */}
            <Modal
                isOpen={showPraktikumModal}
                onClose={() => setShowPraktikumModal(false)}
                title="Detail Praktikum"
            >
                <div className="space-y-6">
                    {/* Deadline Info */}
                    <div className={`p-4 rounded-lg border ${
                        formatDeadline(moduleContent.praktikum.deadline).includes('Terlambat')
                            ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                            : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                    }`}>
                        <div className="flex items-center gap-2 mb-2">
                            <Calendar className={`h-5 w-5 ${
                                formatDeadline(moduleContent.praktikum.deadline).includes('Terlambat')
                                    ? 'text-red-500'
                                    : 'text-blue-500'
                            }`} />
                            <span className={`font-medium ${
                                formatDeadline(moduleContent.praktikum.deadline).includes('Terlambat')
                                    ? 'text-red-700 dark:text-red-400'
                                    : 'text-blue-700 dark:text-blue-400'
                            }`}>
                                Deadline: {formatDeadline(moduleContent.praktikum.deadline)}
                            </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Pastikan untuk menyelesaikan praktikum sebelum deadline
                        </p>
                    </div>

                    {/* Tasks */}
                    <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-4">Daftar Tugas Praktikum:</h4>
                        <div className="space-y-3">
                            {moduleContent.praktikum.tasks.map((task, index) => (
                                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-sm font-semibold flex-shrink-0">
                                        {index + 1}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-gray-900 dark:text-white">
                                            {task}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Submission Status */}
                    <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-4">Status Pengumpulan:</h4>
                        {moduleContent.praktikum.submitted ? (
                            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                    <span className="text-green-700 dark:text-green-400 font-medium">
                                        Tugas sudah dikumpulkan
                                    </span>
                                </div>
                                <p className="text-sm text-green-600 dark:text-green-400">
                                    File: {moduleContent.praktikum.submissionFile}
                                </p>
                                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                                    Menunggu penilaian dari instruktur
                                </p>
                            </div>
                        ) : (
                            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertCircle className="h-5 w-5 text-orange-500" />
                                    <span className="text-orange-700 dark:text-orange-400 font-medium">
                                        Belum dikumpulkan
                                    </span>
                                </div>
                                <p className="text-sm text-orange-600 dark:text-orange-400">
                                    Silahkan upload file laporan dalam format PDF
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Upload Section */}
                    <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-4">Upload Laporan:</h4>
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-600 dark:text-gray-400 mb-2">
                                Drag & drop file PDF atau klik untuk browse
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
                                Maximum file size: 10MB
                            </p>
                            <input
                                type="file"
                                accept=".pdf"
                                className="hidden"
                                id="file-upload"
                            />
                            <label
                                htmlFor="file-upload"
                                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors cursor-pointer inline-block"
                            >
                                Pilih File
                            </label>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={() => setShowPraktikumModal(false)}
                            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
                        >
                            Tutup
                        </button>
                        {!moduleContent.praktikum.submitted && (
                            <button className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg transition-colors">
                                Upload Laporan
                            </button>
                        )}
                    </div>
                </div>
            </Modal>
        </AppLayout>
    );
}
