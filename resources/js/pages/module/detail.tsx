
import InteractivePDFFlipBook from '@/components/InteractivePDFFlipBook';
import { PageProps as InertiaPageProps } from '@inertiajs/core';
import PraktikumSection from '@/pages/PraktikumSection';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage, router } from '@inertiajs/react';
import {
    BookOpen, FileText, Video, ClipboardList, Flame,
    Clock, CheckCircle, ArrowLeft, Download, Play, Globe,
    Target, BookOpenCheck, Lightbulb, PenTool, AlertCircle,
    Trophy, X, Eye, Loader2,
} from 'lucide-react';
import { useState, useCallback, useMemo, memo } from 'react';
import toast from 'react-hot-toast';

// ─────────────────────────────────────────────
// Tipe Data
// ─────────────────────────────────────────────

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

interface VideoItem {
    id: number;
    title: string;
    platform: string;
    duration: string;
    thumbnail: string;
    watched: boolean;
    url?: string;
}

interface LinkItem {
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

interface CPContent extends ContentSection { content: string[]; }
interface ATPContent extends ContentSection { content: string[]; }

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
    videos: VideoItem[];
    links: LinkItem[];
}

interface QuizContent extends ContentSection {
    totalQuestions: number;
    timeLimit: number;
    attempts: number;
    maxAttempts: number;
    bestScore: number | null;
}

interface PraktikumSubmission {
    id: number;
    file_name: string;
    submitted_at: string;
    status: string;
    points_earned: number;
    score: number | null;
    feedback: string | null;
    is_graded: boolean;
    submission_time_info: { status: string; message: string; color: string; };
}

interface PraktikumContent extends ContentSection {
    deadline: string;
    deadline_formatted: string;
    has_custom_deadline: boolean;
    submitted: boolean;
    submissionFile: string | null;
    submission: PraktikumSubmission | null;
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

// ─────────────────────────────────────────────
// Pembantu
// ─────────────────────────────────────────────

const formatDeadline = (deadline: string): string => {
    const diff = new Date(deadline).getTime() - Date.now();
    const days = Math.ceil(diff / 86_400_000);
    if (days > 0) return `${days} hari lagi`;
    if (days === 0) return 'Hari ini';
    return `Terlambat ${Math.abs(days)} hari`;
};

// ─────────────────────────────────────────────
// Komponen Modal Umum
// ─────────────────────────────────────────────

const Modal = memo(({
    isOpen, onClose, title, children,
}: {
    isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode;
}) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-white dark:bg-gray-800">
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 md:p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white md:text-xl">{title}</h2>
                    <button onClick={onClose} className="rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Tutup">
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>
                <div className="p-4 md:p-6">{children}</div>
            </div>
        </div>
    );
});
Modal.displayName = 'Modal';

// ─────────────────────────────────────────────
// Komponen Header Bagian
// ─────────────────────────────────────────────

const SectionHeader = memo(({
    icon: Icon, title, description, points, completed, color,
}: {
    icon: React.ElementType; title: string; description: string;
    points: number; completed: boolean; color: string;
}) => (
    <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
            <div className={`flex-shrink-0 rounded-lg p-2 ${color}`}>
                <Icon className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white md:text-base">{title}</h3>
                <p className="break-words text-pretty text-xs text-gray-500 dark:text-gray-400 md:text-sm">{description}</p>
            </div>
        </div>
        <div className="flex flex-shrink-0 items-center gap-2">
            {completed && <CheckCircle className="h-5 w-5 text-green-500" />}
            <div className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400">
                <div className="relative inline-flex h-5 w-5 items-center justify-center">
                    <Flame size={20} className="relative z-10 text-orange-500"
                        style={{ animation: 'iconPulse 1s infinite ease-in-out', filter: 'drop-shadow(0 0 4px rgba(255,153,0,0.8))' }} />
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="absolute bottom-0 rounded-full" style={{
                            width: `${4 - i * 0.8}px`, height: `${6 - i * 1.2}px`,
                            background: `radial-gradient(circle at bottom, ${i === 0 ? '#ffff66' : i === 1 ? '#ff9900' : '#ff6b00'} 0%, ${i === 0 ? '#ff9900' : '#ff3300'} 50%, transparent 80%)`,
                            animation: `fireWave ${0.6 + i * 0.2}s infinite ease-in-out ${i * 0.1}s`,
                            filter: `blur(${1.5 + i}px)`, zIndex: 5 - i,
                        }} />
                    ))}
                    <div className="absolute inset-0 rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,153,0,0.4) 0%, transparent 70%)', animation: 'fireGlow 1.5s infinite ease-in-out', filter: 'blur(4px)' }} />
                    <style>{`
                        @keyframes fireWave{0%,100%{transform:translateY(0) scaleY(1) scaleX(1);opacity:1}33%{transform:translateY(-6px) scaleY(1.3) scaleX(0.85);opacity:.9}66%{transform:translateY(-10px) scaleY(1.5) scaleX(0.75);opacity:.6}}
                        @keyframes iconPulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.05);opacity:.95}}
                        @keyframes fireGlow{0%,100%{opacity:.5;transform:scale(1)}50%{opacity:.8;transform:scale(1.15)}}
                        @media(prefers-reduced-motion:reduce){*{animation-duration:.01ms!important;animation-iteration-count:1!important}}
                    `}</style>
                </div>
                <span className="text-sm font-medium">{points}</span>
            </div>
        </div>
    </div>
));
SectionHeader.displayName = 'SectionHeader';

// ─────────────────────────────────────────────
// MateriCard (komponen terpisah bukan useMemo)
// ─────────────────────────────────────────────

interface MateriCardProps {
    moduleContent: ModuleContent;
    completedMateri: boolean;
    moduleDataColor: string;
    moduleOrder: number;
    handleDownload: () => void;
    handleMaterialComplete: () => void;
}
interface Question {
    id: number;
    question: string;
    options: string[];
    correct_answer: number;
}
const PRE_QUESTIONS_BY_MODULE: Record<number, Question[]> = {
    1: [
        { id: 1, question: 'Apa kepanjangan dari IDE dalam pemrograman?', options: ['Integrated Development Environment', 'Internal Data Exchange', 'Interface Design Engine', 'Incremental Debug Executor'], correct_answer: 0 },
        { id: 2, question: 'Bahasa C++ dikembangkan pertama kali oleh siapa?', options: ['Dennis Ritchie', 'Bjarne Stroustrup', 'Linus Torvalds', 'James Gosling'], correct_answer: 1 },
    ],
    2: [
        { id: 1, question: 'Operator manakah yang digunakan untuk sisa bagi (modulus)?', options: ['/', '*', '%', '^'], correct_answer: 2 },
        { id: 2, question: 'Apa hasil dari ekspresi: 8 + 2 * 3?', options: ['30', '14', '16', '22'], correct_answer: 1 },
    ],
    3: [
        { id: 1, question: 'Pernyataan apa yang dieksekusi jika kondisi if bernilai false?', options: ['if', 'else', 'switch', 'case'], correct_answer: 1 },
        { id: 2, question: 'Kata kunci apa yang digunakan untuk keluar dari blok switch-case?', options: ['exit', 'return', 'break', 'continue'], correct_answer: 2 },
    ],
    4: [
        { id: 1, question: 'Perulangan manakah yang selalu dieksekusi minimal satu kali?', options: ['for', 'while', 'do-while', 'foreach'], correct_answer: 2 },
        { id: 2, question: 'Berapa kali perulangan for(i=0; i<5; i++) akan berjalan?', options: ['4 kali', '5 kali', '6 kali', '0 kali'], correct_answer: 1 },
    ],
    5: [
        { id: 1, question: 'Indeks pertama array dalam C++ dimulai dari berapa?', options: ['1', '0', '-1', '2'], correct_answer: 1 },
        { id: 2, question: 'Berapa elemen yang tersimpan dalam deklarasi int data[5]?', options: ['4', '5', '6', '10'], correct_answer: 1 },
    ],
    6: [
        { id: 1, question: 'Fungsi yang memanggil dirinya sendiri disebut?', options: ['Fungsi void', 'Fungsi rekursif', 'Fungsi overload', 'Fungsi inline'], correct_answer: 1 },
        { id: 2, question: 'Pada call by value, apakah nilai variabel asli berubah setelah fungsi dipanggil?', options: ['Ya, selalu berubah', 'Tidak, nilai asli tetap', 'Tergantung tipe data', 'Tergantung compiler'], correct_answer: 1 },
    ],
    7: [
        { id: 1, question: 'Operator apa yang digunakan untuk mendapatkan alamat memori sebuah variabel?', options: ['*', '&', '->', '::'], correct_answer: 1 },
        { id: 2, question: 'Pointer menyimpan apa di dalamnya?', options: ['Nilai variabel', 'Alamat memori variabel', 'Tipe data variabel', 'Nama variabel'], correct_answer: 1 },
    ],
    8: [
        { id: 1, question: 'Fungsi apa yang digunakan untuk membuka file dalam C?', options: ['openfile()', 'fopen()', 'fileopen()', 'open()'], correct_answer: 1 },
        { id: 2, question: 'Mode mana yang digunakan untuk membuka file hanya untuk dibaca?', options: ['w', 'a', 'r', 'rw'], correct_answer: 2 },
    ],
};

const MateriCard = memo(({
    moduleContent, completedMateri, moduleDataColor, moduleOrder,
    handleDownload, handleMaterialComplete,
}: MateriCardProps) => {
    const preQuestions = PRE_QUESTIONS_BY_MODULE[moduleOrder] ?? [];
    return (
    <div className="min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 md:p-6">
        <SectionHeader
            icon={FileText}
            title={moduleContent.materi.title}
            description={moduleContent.materi.description}
            points={moduleContent.materi.points}
            completed={completedMateri}
            color={moduleDataColor}
        />
        <div className="mb-4 flex flex-col items-start justify-between gap-3 rounded-lg bg-gray-50 p-4 dark:bg-gray-700 sm:flex-row sm:items-center">
            <div className="flex min-w-0 flex-1 items-center gap-3">
                <FileText className="h-8 w-8 flex-shrink-0 text-red-500" />
                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900 dark:text-white md:text-base">{moduleContent.materi.fileName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 md:text-sm">{moduleContent.materi.fileSize}</p>
                </div>
            </div>
            <button
                onClick={handleDownload}
                disabled={!moduleContent.materi.canDownload}
                className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm transition-colors ${
                    moduleContent.materi.canDownload
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'cursor-not-allowed bg-gray-300 text-gray-500 dark:bg-gray-600'
                }`}
            >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Unduh</span>
            </button>
        </div>
        <div className="mb-4 space-y-2">
            <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Progres Membaca</span>
                <span className="text-gray-600 dark:text-gray-400">{moduleContent.materi.readProgress}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-600">
                <div className="h-2 rounded-full bg-green-500 transition-all duration-300" style={{ width: `${moduleContent.materi.readProgress}%` }} />
            </div>
        </div>
        <div className="mb-4 min-w-0 w-full overflow-hidden">
            <InteractivePDFFlipBook
                pdfUrl={`/storage/${moduleContent.materi.file_path}`}
                materialId={moduleContent.materi.material_id}
                onProgressUpdate={(progress) => { console.log('Reading progress:', progress); }}
                onComplete={handleMaterialComplete}
                readProgress={moduleContent.materi.readProgress}
                isCompleted={completedMateri}
                preQuestions={preQuestions}
            />
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
            <button
                onClick={() => window.open(`/storage/${moduleContent.materi.file_path}`, '_blank')}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700 md:text-base"
            >
                Buka di Tab Baru
            </button>
        </div>
    </div>
)});
MateriCard.displayName = 'MateriCard';

// ─────────────────────────────────────────────
// Komponen Utama
// ─────────────────────────────────────────────

export default function ModuleDetail() {
    const { moduleData, moduleContent, breadcrumbs, auth } = usePage<any>().props;

    // ── State ──
    // showPraktikumModal, selectedFile, uploadProgress, isResubmitting
    // TETAP di sini karena PraktikumSection membacanya via sharedState.
    const [state, setState] = useState({
        loading: false,
        completedSections: {
            cp:     moduleContent.cp.completed,
            atp:    moduleContent.atp.completed,
            materi: moduleContent.materi.completed,
        },
        userPoints:          auth.user.point_fire,
        showPengayaanModal:  false,
        // ↓ Dipakai oleh PraktikumSection via sharedState
        showPraktikumModal:  false,
        selectedFile:        null as File | null,
        uploadProgress:      0,
        isResubmitting:      false,
        // ↑
        completedVideos: moduleContent.pengayaan.videos
            .filter((v: VideoItem) => v.watched)
            .map((v: VideoItem) => v.id),
        completedLinks: moduleContent.pengayaan.links
            .filter((l: LinkItem) => l.completed)
            .map((l: LinkItem) => l.id),
        moduleProgress:    moduleData.progress,
        completedLessons:  moduleData.completedLessons,
    });

    const updateState = useCallback((updates: Partial<typeof state>) => {
        setState(prev => ({ ...prev, ...updates }));
    }, []);

    // ── Handler CP & ATP ──
    const handleComplete = useCallback(async (type: 'cp' | 'learning_objective') => {
        if (state.loading) return;
        const key    = type === 'cp' ? 'cp' : 'atp';
        const pts    = moduleContent[key].points;
        updateState({
            completedSections: { ...state.completedSections, [key]: true },
            userPoints: state.userPoints + pts,
            completedLessons: state.completedLessons + 1,
        });
        toast.success(`🎉 Selamat! +${pts} poin`, { duration: 3000 });
        setState(prev => ({ ...prev, loading: true }));
        const endpoint = type === 'cp'
            ? `/modules/${moduleData.id}/cpmk/complete`
            : `/modules/${moduleData.id}/learning-objective/complete`;
        router.post(endpoint, {}, {
            preserveScroll: true,
            onSuccess: (page) => {
                const flash = page.props.flash as any;
                if (flash?.success) updateState({ userPoints: flash.total_points });
                router.reload({ only: ['moduleData', 'moduleContent', 'auth'] });
            },
            onError: () => {
                updateState({
                    completedSections: { ...state.completedSections, [key]: false },
                    userPoints: state.userPoints,
                    completedLessons: state.completedLessons,
                });
                toast.error('Terjadi kesalahan. Silakan coba lagi.');
            },
            onFinish: () => setState(prev => ({ ...prev, loading: false })),
        });
    }, [state.loading, state.completedSections, state.userPoints, state.completedLessons, moduleData.id, moduleContent, updateState]);

    // ── Handler Materi ──
    const handleMaterialComplete = useCallback(() => {
        if (state.completedSections.materi) { toast.error('Materi sudah diselesaikan sebelumnya'); return; }
        const pts = moduleContent.materi.points;
        updateState({
            completedSections: { ...state.completedSections, materi: true },
            userPoints: state.userPoints + pts,
            completedLessons: state.completedLessons + 1,
        });
        toast.success(`🎉 Materi selesai! +${pts} poin`, { duration: 3000 });
        setState(prev => ({ ...prev, loading: true }));
        router.post(`/materials/${moduleContent.materi.material_id}/complete`, {}, {
            preserveScroll: true,
            onSuccess: (page) => {
                const flash = page.props.flash as any;
                if (flash?.success) updateState({ userPoints: flash.total_points });
                router.reload({ only: ['moduleData', 'moduleContent', 'auth'] });
            },
            onError: () => {
                updateState({
                    completedSections: { ...state.completedSections, materi: false },
                    userPoints: state.userPoints,
                    completedLessons: state.completedLessons,
                });
                toast.error('Terjadi kesalahan. Silakan coba lagi.');
            },
            onFinish: () => setState(prev => ({ ...prev, loading: false })),
        });
    }, [state.completedSections.materi, state.userPoints, state.completedLessons, moduleContent.materi, updateState]);

    const handleDownload = useCallback(() => {
        if (!moduleContent.materi.canDownload) { toast.error('Selesaikan membaca materi terlebih dahulu'); return; }
        toast.success('Mengunduh file…');
        window.location.href = `/materials/${moduleContent.materi.material_id}/download`;
    }, [moduleContent.materi]);

    // ── Handler Pengayaan ──
    const handleEnrichmentComplete = useCallback(async (itemId: number, itemType: 'video' | 'link', moduleId: number) => {
        if (state.loading) return;
        const pts = 5;
        updateState({
            completedVideos: itemType === 'video' ? [...state.completedVideos, itemId] : state.completedVideos,
            completedLinks:  itemType === 'link'  ? [...state.completedLinks,  itemId] : state.completedLinks,
            userPoints: state.userPoints + pts,
        });
        toast.success(`✅ ${itemType === 'video' ? 'Video' : 'Tautan'} selesai! +${pts} poin`);
        setState(prev => ({ ...prev, loading: true }));
        router.post(`/enrichments/${itemId}/complete`, { type: itemType, module_id: moduleId }, {
            preserveScroll: true,
            onSuccess: (page) => {
                const flash = page.props.flash as any;
                if (flash?.success) updateState({ userPoints: flash.total_points || state.userPoints });
                router.reload({ only: ['moduleData', 'moduleContent', 'auth'] });
            },
            onError: () => {
                updateState({
                    completedVideos: itemType === 'video' ? state.completedVideos.filter((id: number) => id !== itemId) : state.completedVideos,
                    completedLinks:  itemType === 'link'  ? state.completedLinks.filter((id: number) => id !== itemId)  : state.completedLinks,
                    userPoints: state.userPoints,
                });
                toast.error('Terjadi kesalahan. Silakan coba lagi.');
            },
            onFinish: () => setState(prev => ({ ...prev, loading: false })),
        });
    }, [state.loading, state.completedVideos, state.completedLinks, state.userPoints, updateState]);

    // ── Kartu CP & ATP (useMemo karena tidak berkaitan dengan flipbook) ──
    const CPCard = useMemo(() => (
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 md:p-6">
            <SectionHeader icon={Target} title={moduleContent.cp.title} description={moduleContent.cp.description}
                points={moduleContent.cp.points} completed={state.completedSections.cp} color={moduleData.color} />
            <div className="space-y-3">
                {moduleContent.cp.content.map((item: string, i: number) => (
                    <div key={i} className="flex items-start gap-3">
                        <Target className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
                    </div>
                ))}
                <button onClick={() => handleComplete('cp')} disabled={state.loading || state.completedSections.cp}
                    className={`mt-4 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm transition-colors md:text-base ${
                        state.completedSections.cp ? 'cursor-not-allowed bg-green-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}>
                    {state.loading ? <><Loader2 className="h-4 w-4 animate-spin" />Memproses…</> : state.completedSections.cp ? <><CheckCircle className="h-4 w-4" />Selesai</> : 'Tandai Selesai'}
                </button>
            </div>
        </div>
    ), [moduleContent.cp, state.completedSections.cp, state.loading, moduleData.color, handleComplete]);

    const ATPCard = useMemo(() => (
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 md:p-6">
            <SectionHeader icon={BookOpenCheck} title={moduleContent.atp.title} description={moduleContent.atp.description}
                points={moduleContent.atp.points} completed={state.completedSections.atp} color={moduleData.color} />
            <div className="space-y-3">
                {moduleContent.atp.content.map((item: string, i: number) => (
                    <div key={i} className="flex items-start gap-3">
                        <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-600 dark:bg-blue-900 dark:text-blue-400">{i + 1}</div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
                    </div>
                ))}
                <button onClick={() => handleComplete('learning_objective')} disabled={state.loading || state.completedSections.atp}
                    className={`mt-4 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm transition-colors md:text-base ${
                        state.completedSections.atp ? 'cursor-not-allowed bg-green-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}>
                    {state.loading ? <><Loader2 className="h-4 w-4 animate-spin" />Memproses…</> : state.completedSections.atp ? <><CheckCircle className="h-4 w-4" />Selesai</> : 'Tandai Selesai'}
                </button>
            </div>
        </div>
    ), [moduleContent.atp, state.completedSections.atp, state.loading, moduleData.color, handleComplete]);

    // ─────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${moduleData.title} — Detail Modul`} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-hidden rounded-xl p-4">

                {/* Header Modul */}
                <div className="rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 p-6 dark:from-gray-800 dark:to-gray-700">
                    <div className="flex items-start gap-4">
                        <Link href="/dashboard" className="flex items-center gap-2 text-blue-600 transition-colors hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                            <ArrowLeft className="h-5 w-5" />
                            <span>Kembali ke Dashboard</span>
                        </Link>
                    </div>
                    <div className="mt-4 flex items-start justify-between">
                        <div className="flex-1">
                            <div className="mb-2 flex items-center gap-3">
                                <div className={`rounded-lg p-3 ${moduleData.color}`}>
                                    <BookOpen className="h-6 w-6 text-white" />
                                </div>
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Modul {moduleData.id}</span>
                            </div>
                            <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">{moduleData.title}</h1>
                            <p className="mb-4 text-gray-600 dark:text-gray-300">{moduleData.description}</p>
                            <div className="flex flex-wrap gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-gray-500" />
                                    <span className="text-gray-600 dark:text-gray-400">{moduleData.estimatedTime}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Trophy className="h-4 w-4 text-gray-500" />
                                    <span className="text-gray-600 dark:text-gray-400">{moduleData.difficulty}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <BookOpenCheck className="h-4 w-4 text-gray-500" />
                                    <span className="text-gray-600 dark:text-gray-400">{moduleData.completedLessons}/{moduleData.totalLessons} pelajaran</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="relative h-20 w-20">
                                <svg className="h-20 w-20 -rotate-90">
                                    <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-200 dark:text-gray-700" />
                                    <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="8" fill="transparent"
                                        strokeDasharray={`${2 * Math.PI * 36}`}
                                        strokeDashoffset={`${2 * Math.PI * 36 * (1 - moduleData.progress / 100)}`}
                                        className="text-green-500 transition-all duration-300"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-sm font-bold text-gray-900 dark:text-white">{moduleData.progress}%</span>
                                </div>
                            </div>
                            <span className="mt-2 text-xs text-gray-500 dark:text-gray-400">Progres</span>
                        </div>
                    </div>
                </div>

                {/* Grid Konten */}
                <div className="grid min-w-0 gap-6 overflow-hidden">
                    {/* CP & ATP */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {CPCard}
                        {ATPCard}
                    </div>

                    {/* Materi */}
                    <MateriCard
                        moduleContent={moduleContent}
                        completedMateri={state.completedSections.materi}
                        moduleDataColor={moduleData.color}
                        moduleOrder={moduleData.id}
                        handleDownload={handleDownload}
                        handleMaterialComplete={handleMaterialComplete}
                    />

                    {/* Pengayaan + Quiz + Praktikum */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

                        {/* Pengayaan Card */}
                        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                            <SectionHeader icon={Lightbulb} title={moduleContent.pengayaan.title}
                                description={moduleContent.pengayaan.description}
                                points={moduleContent.pengayaan.points} completed={moduleContent.pengayaan.completed}
                                color={moduleData.color} />
                            <div className="mb-4 space-y-3">
                                <p className="text-sm text-gray-600 dark:text-gray-400">{moduleContent.pengayaan.videos.length} video pembelajaran</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{moduleContent.pengayaan.links.length} sumber tambahan</p>
                            </div>
                            <button onClick={() => setState(prev => ({ ...prev, showPengayaanModal: true }))}
                                className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700">
                                <Eye className="h-4 w-4" />Lihat Detail
                            </button>
                        </div>

                        {/* Quiz Card */}
                        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                            <SectionHeader icon={ClipboardList} title={moduleContent.quiz.title}
                                description={moduleContent.quiz.description}
                                points={moduleContent.quiz.points} completed={moduleContent.quiz.completed}
                                color={moduleData.color} />
                            <div className="mb-4 grid grid-cols-2 gap-4">
                                <div className="rounded-lg bg-gray-50 p-3 text-center dark:bg-gray-700">
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{moduleContent.quiz.totalQuestions}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Soal</p>
                                </div>
                                <div className="rounded-lg bg-gray-50 p-3 text-center dark:bg-gray-700">
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{moduleContent.quiz.timeLimit}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Menit</p>
                                </div>
                            </div>
                            <div className="mb-4 flex items-center justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Percobaan: {moduleContent.quiz.attempts}/{moduleContent.quiz.maxAttempts}</span>
                                {moduleContent.quiz.bestScore && (
                                    <span className="font-medium text-green-600 dark:text-green-400">Skor: {moduleContent.quiz.bestScore}/100</span>
                                )}
                            </div>
                            <Link href={route('quiz.show', { id: moduleData.id })}
                                className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700">
                                <PenTool className="h-4 w-4" />Mulai Kuis
                            </Link>
                        </div>

                        {/* ══════════════════════════════════════════════════
                            PRAKTIKUM — Menggunakan PraktikumSection
                            (menggantikan seluruh inline praktikum card + modal)
                            ══════════════════════════════════════════════════ */}
                        <PraktikumSection
                            praktikum={moduleContent.praktikum}
                            moduleColor={moduleData.color}
                            templateDownloadUrl={route('assignments.template.download')}
                            sharedState={{
                                loading:            state.loading,
                                selectedFile:       state.selectedFile,
                                uploadProgress:     state.uploadProgress,
                                showPraktikumModal: state.showPraktikumModal,
                                isResubmitting:     state.isResubmitting,
                                userPoints:         state.userPoints,
                            }}
                            onStateChange={updateState}
                        />
                    </div>
                </div>
            </div>

            {/* Modal Pengayaan */}
            {state.showPengayaanModal && (
                <Modal isOpen title="Pengayaan & Sumber Tambahan"
                    onClose={() => setState(prev => ({ ...prev, showPengayaanModal: false }))}>
                    <div className="space-y-6">
                        {moduleContent.pengayaan.videos.length > 0 && (
                            <div>
                                <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Video Pembelajaran</h3>
                                <div className="space-y-4">
                                    {moduleContent.pengayaan.videos.map((video: any) => (
                                        <div key={video.id} className="rounded-lg border border-gray-200 p-4 transition-colors hover:border-blue-500 dark:border-gray-700">
                                            <div className="flex items-start gap-4">
                                                <div className="relative flex-shrink-0">
                                                    <div className="h-24 w-32 overflow-hidden rounded bg-gray-300 dark:bg-gray-600">
                                                        <img src={video.thumbnail} alt={video.title} className="h-full w-full object-cover"
                                                            onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/320x240?text=Video'; }} />
                                                    </div>
                                                    {!video.watched && (
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <div className="rounded-full bg-black/50 p-3"><Play className="h-6 w-6 text-white" /></div>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="mb-2 font-medium text-gray-900 dark:text-white">{video.title}</h4>
                                                    <div className="mb-3 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                                        <Video className="h-4 w-4" /><span>{video.platform}</span>
                                                        <span>•</span>
                                                        <Clock className="h-4 w-4" /><span>{video.duration}</span>
                                                    </div>
                                                    <div className="flex gap-3">
                                                        <a href={video.url || '#'} target="_blank" rel="noopener noreferrer"
                                                            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700">
                                                            <Play className="h-4 w-4" />Tonton
                                                        </a>
                                                        {!state.completedVideos.includes(video.id) && (
                                                            <button onClick={() => handleEnrichmentComplete(video.id, 'video', moduleContent.pengayaan.id || moduleData.id)} disabled={state.loading}
                                                                className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm text-white transition-colors hover:bg-green-700 disabled:bg-gray-400">
                                                                {state.loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><CheckCircle className="h-4 w-4" />Tandai Selesai</>}
                                                            </button>
                                                        )}
                                                        {state.completedVideos.includes(video.id) && (
                                                            <div className="flex items-center gap-2 px-4 py-2 text-green-600 dark:text-green-400">
                                                                <CheckCircle className="h-4 w-4" /><span className="text-sm font-medium">Selesai</span>
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
                        {moduleContent.pengayaan.links.length > 0 && (
                            <div>
                                <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Sumber Tambahan</h3>
                                <div className="space-y-3">
                                    {moduleContent.pengayaan.links.map((link: any, index: number) => (
                                        <div key={index} className="rounded-lg border border-gray-200 p-4 transition-colors hover:border-blue-500 dark:border-gray-700">
                                            <div className="flex items-center justify-between">
                                                <div className="flex flex-1 items-center gap-3">
                                                    <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
                                                        <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-medium text-gray-900 dark:text-white">{link.title}</h4>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">{link.type}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-3">
                                                    <a href={link.url} target="_blank" rel="noopener noreferrer"
                                                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700">
                                                        <Globe className="h-4 w-4" />Buka Tautan
                                                    </a>
                                                    {!state.completedLinks.includes(link.id) && link.id && (
                                                        <button onClick={() => handleEnrichmentComplete(link.id!, 'link', moduleContent.pengayaan.id || moduleData.id)} disabled={state.loading}
                                                            className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm text-white transition-colors hover:bg-green-700 disabled:bg-gray-400">
                                                            {state.loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><CheckCircle className="h-4 w-4" />Tandai Selesai</>}
                                                        </button>
                                                    )}
                                                    {state.completedLinks.includes(link.id) && (
                                                        <div className="flex items-center gap-2 px-4 py-2 text-green-600 dark:text-green-400">
                                                            <CheckCircle className="h-4 w-4" /><span className="text-sm font-medium">Selesai</span>
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
                            <div className="py-8 text-center">
                                <AlertCircle className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                                <p className="text-gray-500 dark:text-gray-400">Belum ada materi pengayaan yang tersedia.</p>
                            </div>
                        )}
                    </div>
                    <div className="mt-6 border-t border-gray-200 pt-6 dark:border-gray-700">
                        <button onClick={() => setState(prev => ({ ...prev, showPengayaanModal: false }))}
                            className="w-full rounded-lg bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700">
                            Tutup
                        </button>
                    </div>
                </Modal>
            )}
        </AppLayout>
    );
}
