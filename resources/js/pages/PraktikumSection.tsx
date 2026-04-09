/**
 * resources/js/Pages/Student/PraktikumSection.tsx
 *
 * Komponen mandiri untuk bagian Praktikum pada halaman detail modul mahasiswa.
 * Dipisahkan dari detail.tsx agar lebih mudah dipelihara dan dikembangkan.
 *
 * Cara penggunaan di detail.tsx:
 * ──────────────────────────────
 * import PraktikumSection from '@/Pages/Student/PraktikumSection';
 *
 * <PraktikumSection
 *     praktikum={moduleContent.praktikum}
 *     moduleColor={moduleData.color}
 *     templateDownloadUrl={route('assignments.template.download')}
 *     sharedState={{
 *         loading:             state.loading,
 *         selectedFile:        state.selectedFile,
 *         uploadProgress:      state.uploadProgress,
 *         showPraktikumModal:  state.showPraktikumModal,
 *         isResubmitting:      state.isResubmitting,
 *         userPoints:          state.userPoints,
 *     }}
 *     onStateChange={updateStateOptimistically}
 * />
 */

import React, { useCallback, memo } from 'react';
import { router }       from '@inertiajs/react';
import {
    Upload, Calendar, CheckCircle, Clock, AlertCircle,
    X, Loader2, Flame, Trophy, PenTool, Download,
    FileText, Eye, BookOpen, ListTodo,
} from 'lucide-react';
import toast from 'react-hot-toast';

// ─────────────────────────────────────────────
// Tipe Data
// ─────────────────────────────────────────────

export interface PraktikumSubmission {
    id: number;
    file_name: string;
    submitted_at: string;
    status: string;
    points_earned: number;
    score: number | null;
    feedback: string | null;
    is_graded: boolean;
    submission_time_info: {
        status: string;
        message: string;
        color: 'green' | 'red' | 'blue';
    };
}

export interface PraktikumData {
    title: string;
    description: string;
    points: number;
    completed: boolean;
    deadline: string;
    deadline_formatted: string;
    has_custom_deadline: boolean;
    submitted: boolean;
    submissionFile: string | null;
    submission: PraktikumSubmission | null;
    /** Daftar tugas yang harus dikerjakan mahasiswa */
    tasks: string[];
    assignment_id: number;
    /** Poin hadiah untuk referensi di kartu */
    point_reward_early?:  number;
    point_reward_ontime?: number;
    point_reward_late?:   number;
}

export interface PraktikumSharedState {
    loading:            boolean;
    selectedFile:       File | null;
    uploadProgress:     number;
    showPraktikumModal: boolean;
    isResubmitting:     boolean;
    userPoints:         number;
}

export interface PraktikumSectionProps {
    praktikum:           PraktikumData;
    moduleColor:         string;
    /** URL unduhan template; null/undefined jika belum tersedia */
    templateDownloadUrl?: string | null;
    sharedState:         PraktikumSharedState;
    onStateChange:       (updates: Partial<PraktikumSharedState>) => void;
}

// ─────────────────────────────────────────────
// Fungsi Pembantu
// ─────────────────────────────────────────────

function deadlineLabel(deadline: string): string {
    const diff = new Date(deadline).getTime() - Date.now();
    const days = Math.ceil(diff / 86_400_000);
    if (days > 0) return `${days} hari lagi`;
    if (days === 0) return 'Hari ini';
    return `Terlambat ${Math.abs(days)} hari`;
}

const isPast = (deadline: string) => deadlineLabel(deadline).startsWith('Terlambat');

const timeInfoStyle: Record<string, string> = {
    green: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    red:   'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    blue:  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
};

function scoreColor(s: number) {
    if (s >= 80) return 'text-green-600 dark:text-green-400';
    if (s >= 60) return 'text-blue-600 dark:text-blue-400';
    return 'text-orange-600 dark:text-orange-400';
}

function toGrade(s: number) {
    if (s >= 80) return 'A';
    if (s >= 70) return 'B';
    if (s >= 60) return 'C';
    if (s >= 50) return 'D';
    return 'E';
}

// ─────────────────────────────────────────────
// Sub-komponen: Pratinjau Daftar Tugas (ringkas)
// ─────────────────────────────────────────────

function TasksPreview({ tasks }: { tasks: string[] }) {
    if (!tasks || tasks.length === 0) return null;
    const tampil = tasks.slice(0, 3);
    const sisanya = tasks.length - tampil.length;
    return (
        <div className="mb-3 rounded-lg border border-blue-100 bg-blue-50 p-3 dark:border-blue-900/30 dark:bg-blue-900/10">
            <div className="mb-2 flex items-center gap-1.5">
                <ListTodo className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                    {tasks.length} tugas yang harus dikerjakan
                </p>
            </div>
            <ul className="space-y-1">
                {tampil.map((t, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                        <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-blue-200 text-[10px] font-bold text-blue-700 dark:bg-blue-800 dark:text-blue-300">
                            {i + 1}
                        </span>
                        <span className="line-clamp-2">{t}</span>
                    </li>
                ))}
            </ul>
            {sisanya > 0 && (
                <p className="mt-1 text-xs text-blue-500 dark:text-blue-400">
                    +{sisanya} tugas lainnya — lihat detail
                </p>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────
// Sub-komponen: Kartu Ringkasan
// ─────────────────────────────────────────────

interface CardProps {
    praktikum:   PraktikumData;
    moduleColor: string;
    onOpen:      () => void;
}

export const PraktikumCard = memo(({ praktikum, moduleColor, onOpen }: CardProps) => {
    const past  = isPast(praktikum.deadline);
    const label = deadlineLabel(praktikum.deadline);

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            {/* Header */}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className={`flex-shrink-0 rounded-lg p-2 ${moduleColor}`}>
                        <Upload className="h-5 w-5 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white md:text-base">
                            {praktikum.title}
                        </h3>
                        <p className="break-words text-pretty text-xs text-gray-500 dark:text-gray-400 md:text-sm whitespace-pre-line">
                            {praktikum.description}
                        </p>
                    </div>
                </div>
                <div className="flex flex-shrink-0 items-center gap-2">
                    {praktikum.completed && <CheckCircle className="h-5 w-5 text-green-500" />}
                    <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
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
                        <span className="text-sm font-medium">{praktikum.points}</span>
                    </div>
                </div>
            </div>

            {/* Batas Waktu */}
            <div className={`mb-3 rounded-lg border p-3 ${
                past
                    ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                    : 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20'
            }`}>
                <div className="flex items-center gap-2">
                    <Calendar className={`h-4 w-4 flex-shrink-0 ${past ? 'text-red-500' : 'text-blue-500'}`} />
                    <span className={`text-sm font-medium ${past ? 'text-red-700 dark:text-red-400' : 'text-blue-700 dark:text-blue-400'}`}>
                        {label}
                    </span>
                    <span className={`text-xs ${past ? 'text-red-500' : 'text-blue-500'}`}>
                        · {praktikum.deadline_formatted}
                    </span>
                </div>
                {praktikum.has_custom_deadline && (
                    <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">ⓘ Batas waktu khusus untuk kelas Anda</p>
                )}
            </div>

            {/* Pratinjau Daftar Tugas */}
            {!praktikum.submitted && (
                <TasksPreview tasks={praktikum.tasks} />
            )}

            {/* Status Pengumpulan */}
            {praktikum.submitted && praktikum.submission ? (
                <p className="mb-3 flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                    <CheckCircle className="h-4 w-4 flex-shrink-0" />
                    <span>
                        Sudah dikumpulkan ·{' '}
                        {praktikum.submission.is_graded
                            ? `Nilai: ${praktikum.submission.score}/100`
                            : 'Menunggu penilaian'}
                    </span>
                </p>
            ) : (
                !praktikum.tasks?.length && (
                    <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
                        Belum ada tugas yang ditambahkan.
                    </p>
                )
            )}

            <button
                onClick={onOpen}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm text-white transition-colors hover:bg-orange-700"
            >
                <Eye className="h-4 w-4" />
                Lihat Detail &amp; Kumpulkan
            </button>
        </div>
    );
});
PraktikumCard.displayName = 'PraktikumCard';

// ─────────────────────────────────────────────
// Sub-komponen: Modal Lengkap
// ─────────────────────────────────────────────

interface ModalProps {
    praktikum:           PraktikumData;
    templateDownloadUrl?: string | null;
    sharedState:         PraktikumSharedState;
    onStateChange:       (u: Partial<PraktikumSharedState>) => void;
}

export const PraktikumModal = memo(({ praktikum, templateDownloadUrl, sharedState, onStateChange }: ModalProps) => {
    const past = isPast(praktikum.deadline);
    const { loading, selectedFile, uploadProgress, isResubmitting } = sharedState;

    const close = useCallback(() => onStateChange({ showPraktikumModal: false, selectedFile: null }), [onStateChange]);

    // ── Pilih File ──
    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.type !== 'application/pdf') { toast.error('Hanya file PDF yang diperbolehkan.'); return; }
        if (file.size > 10 * 1024 * 1024)   { toast.error('Ukuran file tidak boleh melebihi 10 MB.'); return; }
        onStateChange({ selectedFile: file });
        toast.success(`📁 File "${file.name}" dipilih.`);
    }, [onStateChange]);

    // ── Hapus Pengumpulan ──
    const handleDelete = useCallback(() => {
        if (!confirm('Apakah Anda yakin ingin menghapus file ini? Poin yang sudah diperoleh akan dikurangi.')) return;
        const id = toast.loading('Menghapus file…');
        onStateChange({ loading: true });
        router.delete(`/assignments/${praktikum.assignment_id}/submission`, {
            preserveScroll: true,
            onSuccess: (page) => {
                const flash = page.props.flash as any;
                toast.dismiss(id);
                if (flash?.success) {
                    toast.success('🗑️ File berhasil dihapus!');
                    onStateChange({ userPoints: flash.total_points });
                }
                router.reload({ only: ['moduleContent', 'auth'] });
            },
            onError: () => { toast.dismiss(id); toast.error('Gagal menghapus file. Silakan coba lagi.'); },
            onFinish: () => onStateChange({ loading: false }),
        });
    }, [praktikum.assignment_id, onStateChange]);

    // ── Ganti File (Kirim Ulang) ──
    const handleResubmit = useCallback(() => {
        if (!selectedFile) { toast.error('Pilih file terlebih dahulu.'); return; }
        if (!confirm('Poin akan dihitung ulang berdasarkan waktu pengumpulan baru. Lanjutkan?')) return;
        const id = toast.loading('Mengganti file…');
        onStateChange({ loading: true, isResubmitting: true });
        const form = new FormData();
        form.append('file', selectedFile);
        form.append('notes', '');
        router.post(`/assignments/${praktikum.assignment_id}/resubmit`, form as any, {
            preserveScroll: true, forceFormData: true,
            onSuccess: (page) => {
                const flash = page.props.flash as any;
                toast.dismiss(id);
                if (flash?.success) {
                    toast.success('✅ File berhasil diganti!');
                    onStateChange({ selectedFile: null, showPraktikumModal: false, userPoints: flash.total_points });
                }
                router.reload({ only: ['moduleContent', 'auth'] });
            },
            onError: () => { toast.dismiss(id); toast.error('Gagal mengganti file.'); },
            onFinish: () => onStateChange({ loading: false, uploadProgress: 0, isResubmitting: false }),
        });
    }, [selectedFile, praktikum.assignment_id, onStateChange]);

    // ── Unggah Pertama ──
    const handleUpload = useCallback(() => {
        if (!selectedFile)       { toast.error('Pilih file terlebih dahulu.'); return; }
        if (praktikum.submitted) { toast.error('Tugas sudah dikumpulkan sebelumnya.'); return; }
        const id = toast.loading('Mengunggah laporan…');
        onStateChange({ loading: true });
        const form = new FormData();
        form.append('file', selectedFile);
        form.append('notes', '');
        router.post(`/assignments/${praktikum.assignment_id}/submit`, form as any, {
            preserveScroll: true, forceFormData: true,
            onSuccess: (page) => {
                const flash = page.props.flash as any;
                toast.dismiss(id);
                if (flash?.success) {
                    toast.success(flash.message ?? `🎉 Laporan berhasil dikumpulkan! +${praktikum.points} poin`);
                    onStateChange({
                        selectedFile: null, showPraktikumModal: false,
                        userPoints: flash.total_points ?? sharedState.userPoints + praktikum.points,
                    });
                }
                router.reload({ only: ['moduleContent', 'auth'] });
            },
            onError: () => { toast.dismiss(id); toast.error('Gagal mengunggah laporan.'); },
            onFinish: () => onStateChange({ loading: false, uploadProgress: 0 }),
        });
    }, [selectedFile, praktikum, sharedState.userPoints, onStateChange]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-white dark:bg-gray-800">

                {/* Header Modal */}
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 md:p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white md:text-xl">
                        Detail Praktikum
                    </h2>
                    <button onClick={close} className="rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Tutup">
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                <div className="space-y-6 p-4 md:p-6">

                    {/* ── Info Batas Waktu ── */}
                    <div className={`rounded-lg border p-4 ${
                        past
                            ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                            : 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20'
                    }`}>
                        <div className="mb-1 flex items-center gap-2">
                            <Calendar className={`h-5 w-5 ${past ? 'text-red-500' : 'text-blue-500'}`} />
                            <span className={`font-semibold ${past ? 'text-red-700 dark:text-red-400' : 'text-blue-700 dark:text-blue-400'}`}>
                                Batas Waktu: {praktikum.deadline_formatted}
                            </span>
                        </div>
                        <p className={`text-sm ${past ? 'text-red-600 dark:text-red-500' : 'text-blue-600 dark:text-blue-500'}`}>
                            {deadlineLabel(praktikum.deadline)}
                        </p>
                        {praktikum.has_custom_deadline && (
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">ⓘ Batas waktu khusus untuk kelas Anda</p>
                        )}
                    </div>

                    {/* ── Unduh Template ── */}
                    <div className="flex flex-col gap-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-900/20 sm:flex-row sm:items-center">
                        <div className="flex flex-1 items-start gap-3">
                            <FileText className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
                            <div>
                                <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
                                    Template Laporan Praktikum
                                </p>
                                <p className="mt-0.5 text-xs text-emerald-700 dark:text-emerald-300">
                                    Unduh dan gunakan template ini sebagai dasar penulisan laporan praktikum Anda.
                                    Pastikan format laporan sesuai sebelum diunggah.
                                </p>
                            </div>
                        </div>
                        {templateDownloadUrl ? (
                            <a
                                href={templateDownloadUrl}
                                className="inline-flex flex-shrink-0 items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
                            >
                                <Download className="h-4 w-4" />
                                Unduh Template
                            </a>
                        ) : (
                            <span className="inline-flex flex-shrink-0 cursor-not-allowed items-center gap-2 rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-400 dark:bg-gray-700 dark:text-gray-500">
                                <Download className="h-4 w-4" />
                                Belum Tersedia
                            </span>
                        )}
                    </div>

                    {/* ── Deskripsi Tugas ── */}
                    {praktikum.description && (
                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700/50">
                            <div className="mb-2 flex items-center gap-2">
                                <BookOpen className="h-4 w-4 text-gray-500" />
                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Deskripsi Tugas:</h4>
                            </div>
                            <p className="whitespace-pre-line text-sm text-gray-700 dark:text-gray-300">
                                {praktikum.description}
                            </p>
                        </div>
                    )}

                    {/* ── Daftar Tugas dari Database ── */}
                    {praktikum.tasks && praktikum.tasks.length > 0 && (
                        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                            <div className="mb-3 flex items-center gap-2">
                                <ListTodo className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                <h4 className="font-semibold text-blue-800 dark:text-blue-200">
                                    Daftar Tugas yang Harus Dikerjakan
                                </h4>
                                <span className="ml-auto rounded-full bg-blue-200 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-800 dark:text-blue-300">
                                    {praktikum.tasks.length} tugas
                                </span>
                            </div>
                            <ol className="space-y-3">
                                {praktikum.tasks.map((task, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-blue-200 text-sm font-bold text-blue-700 dark:bg-blue-800 dark:text-blue-300">
                                            {i + 1}
                                        </span>
                                        <p className="flex-1 pt-0.5 text-sm text-blue-900 dark:text-blue-100">{task}</p>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    )}

                    {/* ════ Sudah Dikumpulkan ════ */}
                    {praktikum.submitted && praktikum.submission ? (
                        <div className="space-y-4">
                            {/* Konfirmasi Pengumpulan */}
                            <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
                                <div className="mb-2 flex items-start justify-between">
                                    <div className="flex items-center gap-3 flex-1">
                                        <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-500" />
                                        <div>
                                            <p className="font-medium text-green-700 dark:text-green-400">Laporan sudah dikumpulkan</p>
                                            <p className="mt-0.5 text-sm text-green-600 dark:text-green-500">
                                                File: {praktikum.submission.file_name}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-shrink-0 items-center gap-1.5 text-orange-600 dark:text-orange-400">
                                        <Flame className="h-4 w-4" />
                                        <span className="text-sm font-medium">+{praktikum.submission.points_earned}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Clock className="h-4 w-4 text-gray-400" />
                                    <span className="text-gray-600 dark:text-gray-400">
                                        Dikumpulkan: {praktikum.submission.submitted_at}
                                    </span>
                                    <span className={`ml-1 rounded-full px-2 py-0.5 text-xs font-medium ${timeInfoStyle[praktikum.submission.submission_time_info.color]}`}>
                                        {praktikum.submission.submission_time_info.message}
                                    </span>
                                </div>
                            </div>

                            {/* Hasil Penilaian */}
                            {praktikum.submission.is_graded ? (
                                <div className="rounded-lg border border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50 p-4 dark:border-purple-800 dark:from-purple-900/20 dark:to-blue-900/20">
                                    <div className="mb-4 flex items-start gap-3">
                                        <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/50">
                                            <Trophy className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900 dark:text-white">Hasil Penilaian</h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Laporan Anda telah dinilai oleh dosen.</p>
                                        </div>
                                    </div>
                                    <div className="mb-4 grid grid-cols-2 gap-4">
                                        <div className="rounded-lg border border-purple-200 bg-white p-4 text-center dark:border-purple-700 dark:bg-gray-800">
                                            <p className="mb-1 text-xs text-gray-500">Nilai</p>
                                            <p className={`text-3xl font-bold ${scoreColor(praktikum.submission.score ?? 0)}`}>
                                                {praktikum.submission.score ?? 0}
                                            </p>
                                            <p className="mt-1 text-xs text-gray-500">/ 100</p>
                                        </div>
                                        <div className="rounded-lg border border-purple-200 bg-white p-4 text-center dark:border-purple-700 dark:bg-gray-800">
                                            <p className="mb-1 text-xs text-gray-500">Predikat</p>
                                            <p className={`text-3xl font-bold ${scoreColor(praktikum.submission.score ?? 0)}`}>
                                                {toGrade(praktikum.submission.score ?? 0)}
                                            </p>
                                        </div>
                                    </div>
                                    {praktikum.submission.feedback && (
                                        <div className="rounded-lg border border-purple-200 bg-white p-4 dark:border-purple-700 dark:bg-gray-800">
                                            <div className="mb-2 flex items-start gap-2">
                                                <PenTool className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-600 dark:text-purple-400" />
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">Umpan Balik Dosen:</p>
                                            </div>
                                            <p className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
                                                {praktikum.submission.feedback}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
                                    <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                                    <p className="text-sm text-yellow-700 dark:text-yellow-400">
                                        Laporan Anda sedang dalam proses penilaian oleh dosen.
                                    </p>
                                </div>
                            )}

                            {/* Ganti File (jika belum dinilai) */}
                            {!praktikum.submission.is_graded && (
                                <div>
                                    <h4 className="mb-3 font-medium text-gray-900 dark:text-white">Ganti File (Opsional):</h4>
                                    <div className="rounded-lg border-2 border-dashed border-gray-300 p-5 text-center dark:border-gray-600">
                                        <Upload className="mx-auto mb-2 h-10 w-10 text-gray-400" />
                                        <p className="mb-1 text-sm text-gray-600 dark:text-gray-400">
                                            {selectedFile ? selectedFile.name : 'Pilih file baru (PDF, maks. 10 MB)'}
                                        </p>
                                        <p className="mb-3 text-xs text-orange-600 dark:text-orange-400">
                                            ⚠️ Poin akan dihitung ulang berdasarkan waktu pengumpulan baru.
                                        </p>
                                        {uploadProgress > 0 && uploadProgress < 100 && (
                                            <div className="mb-3 h-2 w-full rounded-full bg-gray-200">
                                                <div className="h-2 rounded-full bg-blue-600 transition-all" style={{ width: `${uploadProgress}%` }} />
                                            </div>
                                        )}
                                        <input type="file" accept=".pdf" onChange={handleFileSelect} className="hidden" id="file-reupload" />
                                        <label htmlFor="file-reupload" className="inline-block cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700">
                                            Pilih File Baru
                                        </label>
                                    </div>
                                </div>
                            )}

                            {/* Informasi file sudah dinilai */}
                            {praktikum.submission.is_graded && (
                                <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                                    <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                                    <div>
                                        <p className="mb-0.5 text-sm font-medium text-blue-700 dark:text-blue-400">Laporan sudah dinilai</p>
                                        <p className="text-sm text-blue-600 dark:text-blue-500">
                                            Anda tidak dapat menghapus atau mengganti file yang sudah dinilai oleh dosen.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Tombol Aksi */}
                            <div className="flex gap-3 pt-2">
                                <button onClick={close}
                                    className="flex-1 rounded-lg bg-gray-600 px-4 py-2 text-sm text-white transition-colors hover:bg-gray-700">
                                    Tutup
                                </button>
                                {!praktikum.submission.is_graded && (
                                    <>
                                        <button onClick={handleDelete} disabled={loading}
                                            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm text-white transition-colors hover:bg-red-700 disabled:bg-gray-400">
                                            {loading && !isResubmitting
                                                ? <><Loader2 className="h-4 w-4 animate-spin" />Menghapus…</>
                                                : <><X className="h-4 w-4" />Hapus File</>}
                                        </button>
                                        {selectedFile && (
                                            <button onClick={handleResubmit} disabled={loading}
                                                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm text-white transition-colors hover:bg-orange-700 disabled:bg-gray-400">
                                                {loading && isResubmitting
                                                    ? <><Loader2 className="h-4 w-4 animate-spin" />Mengganti…</>
                                                    : <><Upload className="h-4 w-4" />Ganti File</>}
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    ) : (
                        /* ════ Belum Dikumpulkan ════ */
                        <div>
                            <h4 className="mb-3 font-medium text-gray-900 dark:text-white">Unggah Laporan:</h4>
                            <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center dark:border-gray-600">
                                <Upload className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                                <p className="mb-1 text-gray-600 dark:text-gray-400">
                                    {selectedFile ? selectedFile.name : 'Pilih file laporan (PDF, maks. 10 MB)'}
                                </p>
                                <p className="mb-3 text-xs text-gray-500">
                                    Pastikan laporan menggunakan template yang disediakan sebelum diunggah.
                                </p>
                                {uploadProgress > 0 && uploadProgress < 100 && (
                                    <div className="mb-4 h-2 w-full rounded-full bg-gray-200">
                                        <div className="h-2 rounded-full bg-blue-600 transition-all" style={{ width: `${uploadProgress}%` }} />
                                    </div>
                                )}
                                <input type="file" accept=".pdf" onChange={handleFileSelect} className="hidden" id="file-upload" />
                                <label htmlFor="file-upload" className="inline-block cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700">
                                    Pilih File
                                </label>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button onClick={close}
                                    className="flex-1 rounded-lg bg-gray-600 px-4 py-2 text-sm text-white transition-colors hover:bg-gray-700">
                                    Batal
                                </button>
                                <button onClick={handleUpload} disabled={!selectedFile || loading}
                                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm text-white transition-colors hover:bg-orange-700 disabled:bg-gray-400">
                                    {loading
                                        ? <><Loader2 className="h-4 w-4 animate-spin" />Mengunggah…</>
                                        : <><Upload className="h-4 w-4" />Unggah Laporan</>}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});
PraktikumModal.displayName = 'PraktikumModal';

// ─────────────────────────────────────────────
// Komponen Utama (Gabungan Kartu + Modal)
// ─────────────────────────────────────────────

/**
 * PraktikumSection
 *
 * Letakkan komponen ini di dalam grid konten modul pada detail.tsx,
 * menggantikan seluruh blok inline "Praktikum Card" dan "Praktikum Modal".
 *
 * ```tsx
 * import PraktikumSection from '@/Pages/Student/PraktikumSection';
 *
 * <PraktikumSection
 *     praktikum={moduleContent.praktikum}
 *     moduleColor={moduleData.color}
 *     templateDownloadUrl={route('assignments.template.download')}
 *     sharedState={{
 *         loading:            state.loading,
 *         selectedFile:       state.selectedFile,
 *         uploadProgress:     state.uploadProgress,
 *         showPraktikumModal: state.showPraktikumModal,
 *         isResubmitting:     state.isResubmitting,
 *         userPoints:         state.userPoints,
 *     }}
 *     onStateChange={updateStateOptimistically}
 * />
 * ```
 */
export default function PraktikumSection({
    praktikum,
    moduleColor,
    templateDownloadUrl,
    sharedState,
    onStateChange,
}: PraktikumSectionProps) {
    return (
        <>
            <PraktikumCard
                praktikum={praktikum}
                moduleColor={moduleColor}
                onOpen={() => onStateChange({ showPraktikumModal: true })}
            />

            {sharedState.showPraktikumModal && (
                <PraktikumModal
                    praktikum={praktikum}
                    templateDownloadUrl={templateDownloadUrl}
                    sharedState={sharedState}
                    onStateChange={onStateChange}
                />
            )}
        </>
    );
}
