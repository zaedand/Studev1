import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { PageProps as InertiaPageProps } from '@inertiajs/core';
import axios from 'axios';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage, router } from '@inertiajs/react';
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
    Eye,
    Loader2
} from 'lucide-react';
import { useState, useCallback, useMemo, memo } from 'react';

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
    url?: string;
}

interface Link {
    id?: number;
    title: string;
    url: string;
    type: string;
    completed?: boolean;
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
    file_path: string;
    material_id: number;
}

interface PengayaanContent extends ContentSection {
    id?: number;
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
    assignment_id: number;
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

// Utility function - moved outside component
const formatDeadline = (deadline: string): string => {
    const date = new Date(deadline);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days > 0) return `${days} hari lagi`;
    if (days === 0) return 'Hari ini';
    return `Terlambat ${Math.abs(days)} hari`;
};

// Reusable Modal Component - memoized
const Modal = memo(({ isOpen, onClose, title, children }: {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        aria-label="Close modal"
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
});

Modal.displayName = 'Modal';

// Reusable Section Header Component
const SectionHeader = memo(({
    icon: Icon,
    title,
    description,
    points,
    completed,
    color
}: {
    icon: React.ElementType;
    title: string;
    description: string;
    points: number;
    completed: boolean;
    color: string;
}) => (
    <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${color}`}>
                <Icon className="h-5 w-5 text-white" />
            </div>
            <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
            </div>
        </div>
        <div className="flex items-center gap-2">
            {completed && <CheckCircle className="h-5 w-5 text-green-500" />}
            <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                <Flame className="h-4 w-4" />
                <span className="text-sm font-medium">{points}</span>
            </div>
        </div>
    </div>
));

SectionHeader.displayName = 'SectionHeader';

export default function ModuleDetail() {
    const { moduleData, moduleContent, breadcrumbs, auth } = usePage<any>().props;

    // Consolidated state
    const [state, setState] = useState({
        loading: false,
        completedSections: {
            cp: moduleContent.cp.completed,
            atp: moduleContent.atp.completed,
            materi: moduleContent.materi.completed,
        },
        userPoints: auth.user.point_fire,
        showPengayaanModal: false,
        showPraktikumModal: false,
        selectedFile: null as File | null,
        uploadProgress: 0,
        // Tambahkan state untuk tracking completed items
        completedVideos: moduleContent.pengayaan.videos
            .filter((v: Video) => v.watched)
            .map((v: Video) => v.id),
        completedLinks: moduleContent.pengayaan.links
            .filter((l: Link) => l.completed)
            .map((l: Link) => l.id),
    });

    const enrichmentId = moduleData?.enrichment_id ?? moduleData?.id;

    // Memoized handlers
const handleEnrichmentComplete = useCallback(async (itemId: number, itemType: 'video' | 'link', moduleId: number) => {
    if (state.loading) return;

    setState(prev => ({ ...prev, loading: true }));

    router.post(
        `/enrichments/${itemId}/complete`,
        {
            type: itemType,
            module_id: moduleId,
        },
        {
            preserveScroll: true,
            onSuccess: (page) => {
                const response = page.props.flash as any;
                if (response?.success) {
                    setState(prev => ({
                        ...prev,
                        userPoints: response.total_points || prev.userPoints,
                        completedVideos:
                            itemType === 'video'
                                ? [...prev.completedVideos, itemId]
                                : prev.completedVideos,
                        completedLinks:
                            itemType === 'link'
                                ? [...prev.completedLinks, itemId]
                                : prev.completedLinks,
                    }));
                }
                // Reload untuk update progress di header
                router.reload({ only: ['moduleData', 'moduleContent'] });
            },
            onError: (errors) => {
                console.error('Error:', errors);
                alert('Terjadi kesalahan. Silakan coba lagi.');
            },
            onFinish: () => {
                setState(prev => ({ ...prev, loading: false }));
            }
        }
    );
}, [state.loading]);


    const handleUploadAssignment = useCallback(async () => {
        if (!state.selectedFile) {
            alert('Pilih file terlebih dahulu');
            return;
        }

        if (moduleContent.praktikum.submitted) {
            alert('Tugas sudah dikumpulkan sebelumnya');
            return;
        }

        setState(prev => ({ ...prev, loading: true }));

        const formData = new FormData();
        formData.append('file', state.selectedFile);
        formData.append('notes', '');

        router.post(
            `/assignments/${moduleContent.praktikum.assignment_id}/submit`,
            formData as any,
            {
                preserveScroll: true,
                forceFormData: true,
                onSuccess: () => {
                    alert('Tugas berhasil dikumpulkan!');
                    setState(prev => ({
                        ...prev,
                        selectedFile: null,
                        showPraktikumModal: false
                    }));
                    router.reload({ only: ['moduleContent'] });
                },
                onError: (errors) => {
                    console.error('Error:', errors);
                    alert('Gagal mengupload tugas. Silakan coba lagi.');
                },
                onFinish: () => {
                    setState(prev => ({
                        ...prev,
                        loading: false,
                        uploadProgress: 0
                    }));
                }
            }
        );
    }, [state.selectedFile, state.loading, moduleContent.praktikum]);

    const handleComplete = useCallback(async (type: 'cp' | 'learning_objective') => {
    if (state.loading) return;

    const endpoint = type === 'cp'
        ? `/modules/${moduleData.id}/cpmk/complete`
        : `/modules/${moduleData.id}/learning-objective/complete`;

    setState(prev => ({ ...prev, loading: true }));

    router.post(
        endpoint,
        {},
        {
            preserveScroll: true,
            onSuccess: (page) => {
                const response = page.props.flash as any;
                if (response?.success) {
                    setState(prev => ({
                        ...prev,
                        completedSections: {
                            ...prev.completedSections,
                            [type === 'cpmk' ? 'cp' : 'atp']: true
                        },
                        userPoints: response.total_points
                    }));
                }
                router.reload({ only: ['moduleData', 'moduleContent'] });
            },
            onError: (errors) => {
                console.error('Error:', errors);
                alert('Terjadi kesalahan. Silakan coba lagi.');
            },
            onFinish: () => {
                setState(prev => ({ ...prev, loading: false }));
            }
        }
    );
}, [state.loading, moduleData.id]);

    const handleMaterialComplete = useCallback(() => {
        if (state.completedSections.materi) {
            alert('Materi sudah diselesaikan sebelumnya');
            return;
        }

        setState(prev => ({ ...prev, loading: true }));

        router.post(
            `/materials/${moduleContent.materi.material_id}/complete`,
            {},
            {
                preserveScroll: true,
                onSuccess: (page) => {
                    const response = page.props.flash as any;
                    if (response?.success) {
                        setState(prev => ({
                            ...prev,
                            completedSections: { ...prev.completedSections, materi: true },
                            userPoints: response.total_points
                        }));
                        alert(response.message || 'Selamat! Materi selesai!');
                    }
                    router.reload({ only: ['moduleData', 'moduleContent'] });
                },
                onError: (errors) => {
                    console.error('Error:', errors);
                    alert('Terjadi kesalahan. Silakan coba lagi.');
                },
                onFinish: () => {
                    setState(prev => ({ ...prev, loading: false }));
                }
            }
        );
    }, [state.completedSections.materi, state.loading, moduleContent.materi.material_id]);

    const handleDownload = useCallback(() => {
        if (!moduleContent.materi.canDownload) {
            alert('Selesaikan membaca materi terlebih dahulu untuk dapat mengunduh');
            return;
        }
        window.location.href = `/materials/${moduleContent.materi.material_id}/download`;
    }, [moduleContent.materi]);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            alert('Hanya file PDF yang diperbolehkan');
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            alert('Ukuran file maksimal 10MB');
            return;
        }
        setState(prev => ({ ...prev, selectedFile: file }));
    }, []);

    // Memoized components
    const CPCard = useMemo(() => (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <SectionHeader
                icon={Target}
                title={moduleContent.cp.title}
                description={moduleContent.cp.description}
                points={moduleContent.cp.points}
                completed={state.completedSections.cp}
                color={moduleData.color}
            />
            <div className="space-y-3">
                {moduleContent.cp.content.map((item: string, index: number) => (
                    <div key={index} className="flex items-start gap-3">
                        <Target className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
                    </div>
                ))}
                <button
                    onClick={() => handleComplete('cp')}
                    disabled={state.loading || state.completedSections.cp}
                    className={`w-full mt-4 py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                        state.completedSections.cp
                            ? 'bg-green-600 text-white cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                >
                    {state.loading ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Processing...
                        </>
                    ) : state.completedSections.cp ? (
                        <>
                            <CheckCircle className="h-4 w-4" />
                            Selesai
                        </>
                    ) : (
                        'Tandai Selesai'
                    )}
                </button>
            </div>
        </div>
    ), [moduleContent.cp, state.completedSections.cp, state.loading, moduleData.color, handleComplete]);

    const ATPCard = useMemo(() => (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <SectionHeader
                icon={BookOpenCheck}
                title={moduleContent.atp.title}
                description={moduleContent.atp.description}
                points={moduleContent.atp.points}
                completed={state.completedSections.atp}
                color={moduleData.color}
            />
            <div className="space-y-3">
                {moduleContent.atp.content.map((item: string, index: number) => (
                    <div key={index} className="flex items-start gap-3">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-xs font-semibold flex-shrink-0">
                            {index + 1}
                        </div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
                    </div>
                ))}
                <button
                    onClick={() => handleComplete('atp')}
                    disabled={state.loading || state.completedSections.atp}
                    className={`w-full mt-4 py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                        state.completedSections.atp
                            ? 'bg-green-600 text-white cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                >
                    {state.loading ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Processing...
                        </>
                    ) : state.completedSections.atp ? (
                        <>
                            <CheckCircle className="h-4 w-4" />
                            Selesai
                        </>
                    ) : (
                        'Tandai Selesai'
                    )}
                </button>
            </div>
        </div>
    ), [moduleContent.atp, state.completedSections.atp, state.loading, moduleData.color, handleComplete]);

    const MateriCard = useMemo(() => (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <SectionHeader
                icon={FileText}
                title={moduleContent.materi.title}
                description={moduleContent.materi.description}
                points={moduleContent.materi.points}
                completed={state.completedSections.materi}
                color={moduleData.color}
            />

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
                <button
                    onClick={handleDownload}
                    disabled={!moduleContent.materi.canDownload}
                    className={`flex items-center gap-2 py-2 px-4 rounded-lg transition-colors ${
                        moduleContent.materi.canDownload
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
                    }`}
                >
                    <Download className="h-4 w-4" />
                    Download
                </button>
            </div>

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
                    />
                </div>
            </div>

            <div className="border border-gray-200 dark:border-gray-600 rounded-lg h-96 mb-4 bg-gray-50 dark:bg-gray-900">
                <iframe
                    src={`/storage/${moduleContent.materi.file_path}#toolbar=0`}
                    className="w-full h-full rounded-lg"
                    title="PDF Viewer"
                />
            </div>

            <div className="flex gap-3">
                <button
                    onClick={() => window.open(`/storage/${moduleContent.materi.file_path}`, '_blank')}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                    Buka di Tab Baru
                </button>
                <button
                    onClick={handleMaterialComplete}
                    disabled={state.loading || state.completedSections.materi}
                    className={`flex-1 py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                        state.completedSections.materi
                            ? 'bg-green-600 text-white cursor-not-allowed'
                            : 'bg-orange-600 hover:bg-orange-700 text-white'
                    }`}
                >
                    {state.loading ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Processing...
                        </>
                    ) : state.completedSections.materi ? (
                        <>
                            <CheckCircle className="h-4 w-4" />
                            Selesai
                        </>
                    ) : (
                        'Selesai Membaca'
                    )}
                </button>
            </div>
        </div>
    ), [moduleContent.materi, state.completedSections.materi, state.loading, moduleData.color, handleDownload, handleMaterialComplete]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${moduleData.title} - Module Detail`} />

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4 overflow-x-auto">
                {/* Module Header */}
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
                <div className="grid gap-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {CPCard}
                        {ATPCard}
                    </div>

                    {MateriCard}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Pengayaan Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                            <SectionHeader
                                icon={Lightbulb}
                                title={moduleContent.pengayaan.title}
                                description={moduleContent.pengayaan.description}
                                points={moduleContent.pengayaan.points}
                                completed={moduleContent.pengayaan.completed}
                                color={moduleData.color}
                            />

                            <div className="space-y-3 mb-4">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {moduleContent.pengayaan.videos.length} video pembelajaran
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {moduleContent.pengayaan.links.length} sumber tambahan
                                </p>
                            </div>

                            <button
                                onClick={() => setState(prev => ({ ...prev, showPengayaanModal: true }))}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                <Eye className="h-4 w-4" />
                                Lihat Detail
                            </button>
                        </div>

                        {/* Quiz Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                            <SectionHeader
                                icon={ClipboardList}
                                title={moduleContent.quiz.title}
                                description={moduleContent.quiz.description}
                                points={moduleContent.quiz.points}
                                completed={moduleContent.quiz.completed}
                                color={moduleData.color}
                            />

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
                            <SectionHeader
                                icon={Upload}
                                title={moduleContent.praktikum.title}
                                description={moduleContent.praktikum.description}
                                points={moduleContent.praktikum.points}
                                completed={moduleContent.praktikum.completed}
                                color={moduleData.color}
                            />

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
                                onClick={() => setState(prev => ({ ...prev, showPraktikumModal: true }))}
                                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                <Eye className="h-4 w-4" />
                                Lihat Detail
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {state.showPengayaanModal && (
                <Modal
                    isOpen={state.showPengayaanModal}
                    onClose={() => setState(prev => ({ ...prev, showPengayaanModal: false }))}
                    title="Pengayaan & Sumber Tambahan"
                >
                    <div className="space-y-6">
                        {/* Video Section */}
                        {moduleContent.pengayaan.videos.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    Video Pembelajaran
                                </h3>
                                <div className="space-y-4">
                                    {moduleContent.pengayaan.videos.map((video) => (
                                        <div
                                            key={video.id}
                                            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-500 transition-colors"
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className="relative flex-shrink-0">
                                                    <div className="w-32 h-24 bg-gray-300 dark:bg-gray-600 rounded overflow-hidden">
                                                        <img
                                                            src={video.thumbnail}
                                                            alt={video.title}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                e.currentTarget.src = 'https://via.placeholder.com/320x240?text=Video';
                                                            }}
                                                        />
                                                    </div>
                                                    {!video.watched && (
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <div className="bg-black bg-opacity-50 rounded-full p-3">
                                                                <Play className="h-6 w-6 text-white" />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex-1">
                                                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                                                        {video.title}
                                                    </h4>
                                                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
                                                        <Video className="h-4 w-4" />
                                                        <span>{video.platform}</span>
                                                        <span>•</span>
                                                        <Clock className="h-4 w-4" />
                                                        <span>{video.duration}</span>
                                                    </div>

                                                    <div className="flex gap-3">
                                                        <a
                                                            href={video.url || '#'}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                                                        >
                                                            <Play className="h-4 w-4" />
                                                            Tonton Video
                                                        </a>

                                                        {!state.completedVideos.includes(video.id) && (
                                                            <button
                                                                onClick={() => handleEnrichmentComplete(video.id, 'video', moduleContent.pengayaan.id || moduleData.id)}
                                                                disabled={state.loading}
                                                                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                                                            >
                                                                {state.loading ? (
                                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                                ) : (
                                                                    <>
                                                                        <CheckCircle className="h-4 w-4" />
                                                                        Tandai Selesai
                                                                    </>
                                                                )}
                                                            </button>
                                                        )}

                                                        {state.completedVideos.includes(video.id) && (
                                                            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 px-4 py-2">
                                                                <CheckCircle className="h-4 w-4" />
                                                                <span className="text-sm font-medium">Selesai</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Links Section */}
                        {moduleContent.pengayaan.links.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    Sumber Tambahan
                                </h3>
                                <div className="space-y-3">
                                    {moduleContent.pengayaan.links.map((link, index) => (
                                        <div
                                            key={index}
                                            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-500 transition-colors"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3 flex-1">
                                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                                        <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-medium text-gray-900 dark:text-white">
                                                            {link.title}
                                                        </h4>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            {link.type}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex gap-3">
                                                    <a
                                                        href={link.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                                                    >
                                                        <Globe className="h-4 w-4" />
                                                        Buka Link
                                                    </a>

                                                    {!state.completedLinks.includes(link.id!) && link.id && (
                                                        <button
                                                            onClick={() => handleEnrichmentComplete(link.id!, 'link', moduleContent.pengayaan.id || moduleData.id)}
                                                            disabled={state.loading}
                                                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                                                        >
                                                            {state.loading ? (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <>
                                                                    <CheckCircle className="h-4 w-4" />
                                                                    Tandai Selesai
                                                                </>
                                                            )}
                                                        </button>
                                                    )}

                                                    {state.completedLinks.includes(link.id!) && (
                                                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400 px-4 py-2">
                                                            <CheckCircle className="h-4 w-4" />
                                                            <span className="text-sm font-medium">Selesai</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {moduleContent.pengayaan.videos.length === 0 && moduleContent.pengayaan.links.length === 0 && (
                            <div className="text-center py-8">
                                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-500 dark:text-gray-400">
                                    Belum ada materi pengayaan yang tersedia
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <button
                            onClick={() => setState(prev => ({ ...prev, showPengayaanModal: false }))}
                            className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
                        >
                            Tutup
                        </button>
                    </div>
                </Modal>
            )}

            {state.showPraktikumModal && (
                <Modal
                    isOpen={state.showPraktikumModal}
                    onClose={() => setState(prev => ({ ...prev, showPraktikumModal: false }))}
                    title="Detail Praktikum"
                >
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-medium text-gray-900 dark:text-white mb-4">Daftar Tugas:</h4>
                            <div className="space-y-3">
                                {moduleContent.praktikum.tasks.map((task: string, index: number) => (
                                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-sm font-semibold flex-shrink-0">
                                            {index + 1}
                                        </div>
                                        <p className="text-gray-900 dark:text-white flex-1">{task}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {!moduleContent.praktikum.submitted && (
                            <div>
                                <h4 className="font-medium text-gray-900 dark:text-white mb-4">Upload Laporan:</h4>
                                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                                        {state.selectedFile ? state.selectedFile.name : 'Pilih file PDF (max 10MB)'}
                                    </p>
                                    {state.uploadProgress > 0 && state.uploadProgress < 100 && (
                                        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${state.uploadProgress}%` }}
                                            />
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        onChange={handleFileSelect}
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
                        )}

                        {moduleContent.praktikum.submitted && (
                            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                    <span className="text-green-700 dark:text-green-400 font-medium">
                                        Tugas sudah dikumpulkan
                                    </span>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3 pt-4">
                            <button
                                onClick={() => setState(prev => ({ ...prev, showPraktikumModal: false }))}
                                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
                            >
                                Tutup
                            </button>
                            {!moduleContent.praktikum.submitted && (
                                <button
                                    onClick={handleUploadAssignment}
                                    disabled={!state.selectedFile || state.loading}
                                    className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    {state.loading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="h-4 w-4" />
                                            Upload Laporan
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </Modal>
            )}
        </AppLayout>
    );
}
