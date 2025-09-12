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
    Trophy
} from 'lucide-react';

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

    interface ContentCardProps {
        content: CPContent | ATPContent | MateriContent | PengayaanContent | QuizContent | PraktikumContent;
        type: 'cp' | 'atp' | 'materi' | 'pengayaan' | 'quiz' | 'praktikum';
        icon: React.ComponentType<{ className?: string }>;
    }

    const ContentCard: React.FC<ContentCardProps> = ({ content, type, icon: Icon }) => (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-200 group">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${moduleData.color}`}>
                        <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                            {content.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {content.description}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {content.completed && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                        <Flame className="h-4 w-4" />
                        <span className="text-sm font-medium">{content.points}</span>
                    </div>
                </div>
            </div>

            {/* Content berdasarkan type */}
            {type === 'cp' && (
                <div className="space-y-3">
                    {(content as CPContent).content.map((item, index) => (
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
            )}

            {type === 'atp' && (
                <div className="space-y-3">
                    {(content as ATPContent).content.map((item, index) => (
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
            )}

            {type === 'materi' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center gap-3">
                            <FileText className="h-8 w-8 text-red-500" />
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white">
                                    {(content as MateriContent).fileName}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {(content as MateriContent).fileSize}
                                </p>
                            </div>
                        </div>
                        {(content as MateriContent).canDownload ? (
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
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Progress Membaca</span>
                            <span className="text-gray-600 dark:text-gray-400">
                                {(content as MateriContent).readProgress}%
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                            <div
                                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${(content as MateriContent).readProgress}%` }}
                            ></div>
                        </div>
                    </div>

                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors">
                        Buka PDF
                    </button>
                </div>
            )}

            {type === 'pengayaan' && (
                <div className="space-y-4">
                    {/* Video Section */}
                    <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-3">Video Pembelajaran</h4>
                        <div className="space-y-3">
                            {(content as PengayaanContent).videos.map((video) => (
                                <div key={video.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <div className="relative">
                                        <div className="w-16 h-12 bg-gray-300 dark:bg-gray-600 rounded overflow-hidden">
                                            <img
                                                src={video.thumbnail}
                                                alt={video.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        {!video.watched && (
                                            <Play className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-4 w-4 text-white" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-sm text-gray-900 dark:text-white">
                                            {video.title}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {video.platform} • {video.duration}
                                        </p>
                                    </div>
                                    {video.watched && (
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Links Section */}
                    <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-3">Sumber Tambahan</h4>
                        <div className="space-y-2">
                            {(content as PengayaanContent).links.map((link, index) => (
                                <a
                                    key={index}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    <Globe className="h-4 w-4 text-blue-500" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            {link.title}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {link.type}
                                        </p>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>

                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors">
                        Mulai Pengayaan
                    </button>
                </div>
            )}

            {type === 'quiz' && (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {(content as QuizContent).totalQuestions}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Soal</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {(content as QuizContent).timeLimit}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Menit</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                            Percobaan: {(content as QuizContent).attempts}/{(content as QuizContent).maxAttempts}
                        </span>
                        {(content as QuizContent).bestScore && (
                            <span className="text-green-600 dark:text-green-400 font-medium">
                                Skor Terbaik: {(content as QuizContent).bestScore}/100
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
            )}

            {type === 'praktikum' && (
                <div className="space-y-4">
                    {/* Deadline Info */}
                    <div className={`p-3 rounded-lg border ${
                        formatDeadline((content as PraktikumContent).deadline).includes('Terlambat')
                            ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                            : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                    }`}>
                        <div className="flex items-center gap-2">
                            <Calendar className={`h-4 w-4 ${
                                formatDeadline((content as PraktikumContent).deadline).includes('Terlambat')
                                    ? 'text-red-500'
                                    : 'text-blue-500'
                            }`} />
                            <span className={`text-sm font-medium ${
                                formatDeadline((content as PraktikumContent).deadline).includes('Terlambat')
                                    ? 'text-red-700 dark:text-red-400'
                                    : 'text-blue-700 dark:text-blue-400'
                            }`}>
                                Deadline: {formatDeadline((content as PraktikumContent).deadline)}
                            </span>
                        </div>
                    </div>

                    {/* Tasks */}
                    <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-3">Tugas:</h4>
                        <div className="space-y-2">
                            {(content as PraktikumContent).tasks.map((task, index) => (
                                <div key={index} className="flex items-start gap-3">
                                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-xs font-semibold flex-shrink-0 mt-0.5">
                                        {index + 1}
                                    </div>
                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                        {task}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Upload Section */}
                    {(content as PraktikumContent).submitted ? (
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-green-500" />
                                <span className="text-green-700 dark:text-green-400 font-medium">
                                    Tugas sudah dikumpulkan
                                </span>
                            </div>
                            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                                File: {(content as PraktikumContent).submissionFile}
                            </p>
                        </div>
                    ) : (
                        <button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                            <Upload className="h-4 w-4" />
                            Upload Laporan (.pdf)
                        </button>
                    )}
                </div>
            )}
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

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    <ContentCard
                        content={moduleContent.cp}
                        type="cp"
                        icon={Target}
                    />
                    <ContentCard
                        content={moduleContent.atp}
                        type="atp"
                        icon={BookOpenCheck}
                    />
                    <ContentCard
                        content={moduleContent.materi}
                        type="materi"
                        icon={FileText}
                    />
                    <ContentCard
                        content={moduleContent.pengayaan}
                        type="pengayaan"
                        icon={Lightbulb}
                    />
                    <ContentCard
                        content={moduleContent.quiz}
                        type="quiz"
                        icon={ClipboardList}
                    />
                    <ContentCard
                        content={moduleContent.praktikum}
                        type="praktikum"
                        icon={Upload}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
