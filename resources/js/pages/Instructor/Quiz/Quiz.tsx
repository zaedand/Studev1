/**
 * resources/js/pages/Instructor/Quiz/index.tsx
 *
 * Perbaikan:
 * - handleToggle pakai router.patch (Inertia) — bukan fetch biasa.
 *   Server mengembalikan Inertia redirect → Inertia reload data baru.
 * - Konfirmasi modal sebelum aktivasi (akan nonaktifkan quiz lain).
 * - Tombol nonaktifkan diblokir di UI jika tidak ada draf lain.
 * - Flash message dari server (success/error) ditampilkan via toast.
 */

import React, { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/layouts/app-layout';
import { router, usePage } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import toast, { Toaster } from 'react-hot-toast';
import {
    ClipboardList, Plus, Edit3, Trash2, Eye, Search,
    Clock, BarChart3, Target, Users, Award,
    Power, PowerOff, BookOpen, CheckCircle, AlertTriangle, X,
} from 'lucide-react';

import FormModal    from './FormModal';
import ResultsPanel from './ResultsPanel';
import type { Quiz, Module, QuizResult, QuizFormData } from './Types';
import { EMPTY_FORM } from './Types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/instructor/dashboard' },
    { title: 'Manajemen Quiz', href: '/instructor/quiz' },
];

interface Props {
    quizzes?: Quiz[] | { data?: Quiz[] };
    modules?: Module[];
    flash?: { success?: string; error?: string };
}

// ─── Modal konfirmasi toggle ─────────────────────────────────────────────────
interface ConfirmToggleProps {
    quiz: Quiz;
    activeQuizTitle: string | null;   // judul quiz yang akan dinonaktifkan otomatis
    mode: 'activate' | 'deactivate';
    hasDraft: boolean;                // apakah ada draf pengganti (untuk deactivate)
    onConfirm: () => void;
    onCancel: () => void;
}
function ConfirmToggleModal({ quiz, activeQuizTitle, mode, hasDraft, onConfirm, onCancel }: ConfirmToggleProps) {
    const isActivate = mode === 'activate';

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm shadow-2xl p-6 space-y-4">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl flex-shrink-0 ${isActivate ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-amber-100 dark:bg-amber-900/30'}`}>
                        <AlertTriangle className={`h-5 w-5 ${isActivate ? 'text-emerald-600' : 'text-amber-600'}`} />
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-base">
                        {isActivate ? 'Aktifkan Quiz?' : 'Nonaktifkan Quiz?'}
                    </h3>
                </div>

                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    {isActivate ? (
                        <>
                            <p>
                                Quiz <strong className="text-gray-900 dark:text-white">"{quiz.title}"</strong> akan diaktifkan
                                dan dapat dikerjakan mahasiswa.
                            </p>
                            {activeQuizTitle && (
                                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-3">
                                    <p className="text-amber-800 dark:text-amber-300">
                                        ⚠ Quiz <strong>"{activeQuizTitle}"</strong> yang sedang aktif akan otomatis
                                        dijadikan <strong>draf</strong>.
                                    </p>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <p>
                                Quiz <strong className="text-gray-900 dark:text-white">"{quiz.title}"</strong> akan dijadikan draf.
                            </p>
                            {hasDraft ? (
                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-3">
                                    <p className="text-blue-800 dark:text-blue-300">
                                        ℹ Quiz draf tertua di modul ini akan otomatis diaktifkan sebagai pengganti.
                                    </p>
                                </div>
                            ) : (
                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-3">
                                    <p className="text-red-800 dark:text-red-300">
                                        ✗ Tidak ada quiz draf lain di modul ini. Tidak dapat dinonaktifkan.
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className="flex gap-3 pt-2">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={!isActivate && !hasDraft}
                        className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                            isActivate
                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                : hasDraft
                                    ? 'bg-amber-600 hover:bg-amber-500 text-white'
                                    : 'bg-gray-300 text-gray-500'
                        }`}
                    >
                        {isActivate ? 'Ya, Aktifkan' : 'Ya, Nonaktifkan'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Modal konfirmasi hapus ──────────────────────────────────────────────────
interface ConfirmDeleteProps {
    quiz: Quiz;
    blockedReason: string | null;
    onConfirm: () => void;
    onCancel: () => void;
}
function ConfirmDeleteModal({ quiz, blockedReason, onConfirm, onCancel }: ConfirmDeleteProps) {
    const blocked = blockedReason !== null;
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm shadow-2xl p-6 space-y-4">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl flex-shrink-0 ${blocked ? 'bg-gray-100 dark:bg-gray-700' : 'bg-red-100 dark:bg-red-900/30'}`}>
                        <Trash2 className={`h-5 w-5 ${blocked ? 'text-gray-500' : 'text-red-600'}`} />
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-base">
                        {blocked ? 'Tidak Dapat Dihapus' : 'Hapus Quiz?'}
                    </h3>
                </div>

                {blocked ? (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-3">
                        <p className="text-sm text-red-800 dark:text-red-300">{blockedReason}</p>
                    </div>
                ) : (
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                        <p>
                            Hapus quiz <strong className="text-gray-900 dark:text-white">"{quiz.title}"</strong>?
                        </p>
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-3 space-y-1">
                            <p className="text-red-800 dark:text-red-300 font-medium">⚠ Perhatian:</p>
                            <ul className="text-red-700 dark:text-red-400 text-xs space-y-0.5 list-disc list-inside">
                                <li>Semua soal dalam quiz ini akan ikut terhapus.</li>
                                <li>Tindakan ini tidak dapat dibatalkan.</li>
                                {quiz.status === 'active' && (
                                    <li>Quiz draf lain di modul ini akan otomatis diaktifkan.</li>
                                )}
                            </ul>
                        </div>
                    </div>
                )}

                <div className="flex gap-3 pt-1">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        {blocked ? 'Tutup' : 'Batal'}
                    </button>
                    {!blocked && (
                        <button
                            onClick={onConfirm}
                            className="flex-1 py-2 text-sm font-semibold bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
                        >
                            Ya, Hapus
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Halaman utama ───────────────────────────────────────────────────────────
export default function InstructorQuizPage({ quizzes: rawQuizzes = [], modules: rawModules = [] }: Props) {
    const { props } = usePage<any>();

    const normalize = (d: any): Quiz[] => {
        if (Array.isArray(d)) return d;
        if (d && Array.isArray(d.data)) return d.data;
        return [];
    };

    const [quizzes, setQuizzes]               = useState<Quiz[]>(() => normalize(rawQuizzes));
    const modules: Module[]                   = Array.isArray(rawModules) ? rawModules : [];

    useEffect(() => { setQuizzes(normalize(rawQuizzes)); }, [rawQuizzes]);

    // Tampilkan flash message dari server via toast
    useEffect(() => {
        const flash = props.flash as { success?: string; error?: string } | undefined;
        if (flash?.success) toast.success(flash.success, { duration: 5000 });
        if (flash?.error)   toast.error(flash.error,   { duration: 6000 });
    }, [props.flash]);

    // ── State UI ──────────────────────────────────────────────────────────────
    const [activeTab, setActiveTab]           = useState<'quizzes' | 'analytics'>('quizzes');
    const [searchTerm, setSearchTerm]         = useState('');
    const [selectedQuiz, setSelectedQuiz]     = useState<Quiz | null>(null);
    const [modalMode, setModalMode]           = useState<'create' | 'edit' | 'view' | null>(null);
    const [modalQuiz, setModalQuiz]           = useState<Quiz | null>(null);
    const [modalForm, setModalForm]           = useState<QuizFormData>(EMPTY_FORM);
    const [results, setResults]               = useState<QuizResult[]>([]);
    const [resultsLoading, setResultsLoading] = useState(false);
    const [analytics, setAnalytics]           = useState<any>(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(false);

    // State konfirmasi toggle
    const [toggleConfirm, setToggleConfirm]   = useState<{
        quiz: Quiz;
        mode: 'activate' | 'deactivate';
        activeQuizTitle: string | null;
        hasDraft: boolean;
    } | null>(null);

    // State konfirmasi hapus
    const [deleteConfirm, setDeleteConfirm]   = useState<{
        quiz: Quiz;
        /** Alasan kenapa tidak bisa dihapus (null = bisa dihapus) */
        blockedReason: string | null;
    } | null>(null);

    // ── Fetch helpers ─────────────────────────────────────────────────────────
    const loadResults = useCallback(async (quizId: number) => {
        setResultsLoading(true);
        setResults([]);
        try {
            const res  = await fetch(`/instructor/quiz/results/data?quiz_id=${quizId}`, { credentials: 'include' });
            const data = await res.json();
            setResults(data.results ?? []);
        } catch {
            toast.error('Gagal memuat hasil quiz.');
        } finally {
            setResultsLoading(false);
        }
    }, []);

    const loadAnalytics = useCallback(async () => {
        if (analytics) return;
        setAnalyticsLoading(true);
        try {
            const res  = await fetch('/instructor/quiz/analytics/data', { credentials: 'include' });
            const data = await res.json();
            setAnalytics(data);
        } catch {
            toast.error('Gagal memuat data analitik.');
        } finally {
            setAnalyticsLoading(false);
        }
    }, [analytics]);

    const loadQuizDetail = useCallback(async (quiz: Quiz): Promise<QuizFormData> => {
        try {
            const res  = await fetch(`/instructor/quiz/${quiz.id}`, { credentials: 'include' });
            const data = await res.json();
            const q    = data.quiz ?? {};
            return {
                title:       q.title       ?? '',
                description: q.description ?? '',
                module_id:   q.module_id?.toString() ?? '',
                time_limit:  q.time_limit  ?? 30,
                questions:   Array.isArray(q.questions) ? q.questions : [],
            };
        } catch {
            toast.error('Gagal memuat detail quiz.');
            return { ...EMPTY_FORM };
        }
    }, []);

    useEffect(() => {
        if (activeTab === 'analytics') loadAnalytics();
    }, [activeTab, loadAnalytics]);

    // ── Aksi quiz ─────────────────────────────────────────────────────────────
    const openCreate = () => {
        setModalForm({ ...EMPTY_FORM });
        setModalQuiz(null);
        setModalMode('create');
    };

    const openEdit = async (quiz: Quiz) => {
        setModalQuiz(quiz);
        setModalMode('edit');
        setModalForm({ ...EMPTY_FORM });
        const form = await loadQuizDetail(quiz);
        setModalForm(form);
    };

    const openView = async (quiz: Quiz) => {
        setModalQuiz(quiz);
        setModalMode('view');
        setModalForm({ ...EMPTY_FORM });
        const form = await loadQuizDetail(quiz);
        setModalForm(form);
    };

    const openResults = (quiz: Quiz) => {
        setSelectedQuiz(quiz);
        loadResults(quiz.id);
    };

    /**
     * Klik tombol hapus:
     * 1. Blokir jika quiz sedang aktif DAN tidak ada draf pengganti.
     * 2. Blokir jika quiz sudah pernah dikerjakan (hasAttempts).
     * 3. Jika aktif tapi ada draf lain → izinkan, tampilkan peringatan.
     * 4. Jika aman → tampilkan modal konfirmasi sebelum eksekusi.
     */
    const handleDeleteClick = (quiz: Quiz) => {
        const moduleQuizzes = quizzes.filter(q => q.moduleId === quiz.moduleId);
        const otherDrafts   = moduleQuizzes.filter(q => q.status === 'draft' && q.id !== quiz.id);

        let blockedReason: string | null = null;

        if (quiz.hasAttempts) {
            blockedReason = 'Quiz tidak dapat dihapus karena sudah ada mahasiswa yang mengerjakan.';
        } else if (quiz.status === 'active' && otherDrafts.length === 0) {
            blockedReason = 'Quiz tidak dapat dihapus karena merupakan satu-satunya quiz aktif di modul ini. Aktifkan quiz lain terlebih dahulu.';
        }

        setDeleteConfirm({ quiz, blockedReason });
    };

    const executeDelete = () => {
        if (!deleteConfirm) return;
        const { quiz } = deleteConfirm;
        setDeleteConfirm(null);

        const tid = toast.loading('Menghapus quiz...');
        router.delete(`/instructor/quiz/${quiz.id}`, {
            onSuccess: () => toast.success(`Quiz "${quiz.title}" berhasil dihapus.`, { id: tid }),
            onError:   () => toast.error('Gagal menghapus quiz.', { id: tid }),
        });
    };

    /**
     * Klik tombol toggle:
     * 1. Tentukan mode (activate/deactivate).
     * 2. Untuk AKTIVASI: cari quiz aktif lain di modul → tampilkan konfirmasi.
     * 3. Untuk NONAKTIVASI: cek apakah ada draf lain → jika tidak, blokir di UI.
     * 4. Tampilkan modal konfirmasi → setelah konfirm, kirim via router.patch.
     *
     * FIX: router.patch → server harus mengembalikan Inertia response
     * (redirect()->route()), bukan response()->json().
     */
    const handleToggleClick = (quiz: Quiz) => {
        const moduleQuizzes = quizzes.filter(q => q.moduleId === quiz.moduleId);

        if (quiz.status === 'draft') {
            // AKTIVASI — cari quiz aktif di modul ini
            const currentActive = moduleQuizzes.find(q => q.status === 'active' && q.id !== quiz.id);
            setToggleConfirm({
                quiz,
                mode: 'activate',
                activeQuizTitle: currentActive?.title ?? null,
                hasDraft: true,
            });
        } else {
            // NONAKTIVASI — cek apakah ada draf lain
            const otherDrafts = moduleQuizzes.filter(q => q.status === 'draft' && q.id !== quiz.id);
            setToggleConfirm({
                quiz,
                mode: 'deactivate',
                activeQuizTitle: null,
                hasDraft: otherDrafts.length > 0,
            });
        }
    };

    const executeToggle = () => {
        if (!toggleConfirm) return;
        const { quiz } = toggleConfirm;
        setToggleConfirm(null);

        const tid = toast.loading(
            quiz.status === 'draft' ? 'Mengaktifkan quiz...' : 'Menonaktifkan quiz...'
        );

        // router.patch — server harus mengembalikan Inertia redirect
        router.patch(`/instructor/quiz/${quiz.id}/toggle-status`, {}, {
            onSuccess: () => toast.dismiss(tid),
            onError:   () => toast.error('Gagal mengubah status quiz.', { id: tid }),
        });
    };

    const handleModalSuccess = () => {
        setModalMode(null);
        router.reload({ only: ['quizzes'] });
    };

    // ── Filter & group ────────────────────────────────────────────────────────
    const filtered = quizzes.filter(q =>
        q.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.moduleName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const byModule = modules
        .map(m => ({ module: m, list: filtered.filter(q => q.moduleId === m.id) }))
        .filter(g => g.list.length > 0);

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Toaster
                position="top-right"
                toastOptions={{
                    style:   { background: '#1f2937', color: '#f9fafb', borderRadius: '10px', border: '1px solid #374151' },
                    success: { style: { background: '#065f46', color: '#ecfdf5', border: '1px solid #10b981' } },
                    error:   { style: { background: '#7f1d1d', color: '#fef2f2', border: '1px solid #ef4444' } },
                    loading: { style: { background: '#1e3a5f', color: '#bfdbfe', border: '1px solid #3b82f6' } },
                }}
            />

            <div className="flex flex-col gap-5 p-4 md:p-6 max-w-7xl mx-auto">

                {/* Judul */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manajemen Quiz</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        Kelola soal quiz dan pantau hasil pengerjaan mahasiswa.
                    </p>
                </div>

                {/* Tab */}
                <div className="flex border-b border-gray-200 dark:border-gray-700 gap-1">
                    {[
                        { id: 'quizzes',   label: 'Daftar Quiz', icon: ClipboardList },
                        { id: 'analytics', label: 'Analisis',    icon: BarChart3 },
                    ].map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => { setActiveTab(id as any); setSelectedQuiz(null); }}
                            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 ${
                                activeTab === id
                                    ? 'text-blue-600 dark:text-blue-400 border-blue-600'
                                    : 'text-gray-500 border-transparent hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                        >
                            <Icon className="h-4 w-4" />
                            <span className="hidden sm:inline">{label}</span>
                        </button>
                    ))}
                </div>

                {/* ── Tab: Daftar Quiz ── */}
                {activeTab === 'quizzes' && !selectedQuiz && (
                    <div className="space-y-5">
                        {/* Cari & buat */}
                        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    placeholder="Cari quiz atau modul..."
                                    className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <button
                                onClick={openCreate}
                                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-sm px-4 py-2 rounded-lg transition-all"
                            >
                                <Plus className="h-4 w-4" />
                                Buat Quiz Baru
                            </button>
                        </div>

                        {byModule.length === 0 && (
                            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-12 text-center">
                                <ClipboardList className="h-14 w-14 text-gray-300 mx-auto mb-3" />
                                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                    {searchTerm ? 'Quiz tidak ditemukan' : 'Belum ada quiz'}
                                </h3>
                                <p className="text-sm text-gray-400 mb-5">
                                    {searchTerm ? 'Coba kata kunci yang berbeda.' : 'Mulai dengan membuat quiz pertama.'}
                                </p>
                                {!searchTerm && (
                                    <button onClick={openCreate} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm px-5 py-2.5 rounded-lg transition-colors">
                                        <Plus className="h-4 w-4" />
                                        Buat Quiz Pertama
                                    </button>
                                )}
                            </div>
                        )}

                        {byModule.map(({ module, list }) => {
                            const activeCount = list.filter(q => q.status === 'active').length;
                            const draftCount  = list.filter(q => q.status === 'draft').length;

                            return (
                                <div key={module.id} className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-base font-semibold text-gray-900 dark:text-white">{module.title}</h2>
                                        <div className="flex items-center gap-2 text-xs">
                                            <span className="text-gray-400">{list.length} quiz</span>
                                            {activeCount === 0 && (
                                                <span className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-700 px-2 py-0.5 rounded-full font-medium">
                                                    ⚠ Tidak ada yang aktif
                                                </span>
                                            )}
                                            {activeCount > 1 && (
                                                <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-700 px-2 py-0.5 rounded-full font-medium">
                                                    ⚠ {activeCount} aktif sekaligus
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                        {list.map(quiz => {
                                            const isActive    = quiz.status === 'active';
                                            const otherDrafts = list.filter(q => q.status === 'draft' && q.id !== quiz.id);
                                            // Nonaktifkan diblokir jika tidak ada draf lain
                                            const canDeactivate = otherDrafts.length > 0 || !isActive;
                                            // Hapus diblokir jika sudah dikerjakan ATAU aktif tanpa draf pengganti
                                            const canDelete = !quiz.hasAttempts && !(isActive && otherDrafts.length === 0);

                                            return (
                                                <div
                                                    key={quiz.id}
                                                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-md transition-all cursor-pointer group"
                                                    onClick={() => openResults(quiz)}
                                                >
                                                    {/* Header kartu */}
                                                    <div className="flex items-start justify-between gap-2 mb-3">
                                                        <div className="min-w-0">
                                                            <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate group-hover:text-blue-600 transition-colors">
                                                                {quiz.title}
                                                            </h3>
                                                            <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                                                                isActive
                                                                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                                                                    : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                                                            }`}>
                                                                {isActive ? '● Aktif' : '○ Draf'}
                                                            </span>
                                                        </div>

                                                        {/* Tombol aksi */}
                                                        <div
                                                            className="flex items-center gap-0.5 flex-shrink-0"
                                                            onClick={e => e.stopPropagation()}
                                                        >
                                                            {/* Toggle aktif/nonaktif */}
                                                            <button
                                                                onClick={() => handleToggleClick(quiz)}
                                                                disabled={isActive && !canDeactivate}
                                                                title={
                                                                    isActive
                                                                        ? canDeactivate
                                                                            ? 'Jadikan Draf (quiz draf lain akan diaktifkan otomatis)'
                                                                            : 'Tidak dapat dinonaktifkan — tidak ada draf lain di modul ini'
                                                                        : 'Aktifkan quiz ini'
                                                                }
                                                                className={`p-1.5 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                                                                    isActive
                                                                        ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                                                                        : 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                                                                }`}
                                                            >
                                                                {isActive
                                                                    ? <PowerOff className="h-3.5 w-3.5" />
                                                                    : <Power className="h-3.5 w-3.5" />
                                                                }
                                                            </button>
                                                            <button
                                                                onClick={() => openView(quiz)}
                                                                title="Lihat detail"
                                                                className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                            >
                                                                <Eye className="h-3.5 w-3.5" />
                                                            </button>
                                                            <button
                                                                onClick={() => openEdit(quiz)}
                                                                title="Edit quiz"
                                                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                                                            >
                                                                <Edit3 className="h-3.5 w-3.5" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteClick(quiz)}
                                                                disabled={!canDelete}
                                                                title={
                                                                    quiz.hasAttempts
                                                                        ? 'Tidak dapat dihapus — sudah ada mahasiswa yang mengerjakan'
                                                                        : isActive && otherDrafts.length === 0
                                                                            ? 'Tidak dapat dihapus — merupakan satu-satunya quiz aktif di modul ini'
                                                                            : 'Hapus quiz'
                                                                }
                                                                className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Mini statistik */}
                                                    <div className="grid grid-cols-2 gap-2 mb-3">
                                                        <div className="text-center py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                                            <BookOpen className="h-4 w-4 text-blue-500 mx-auto mb-0.5" />
                                                            <p className="text-lg font-bold text-blue-600">{quiz.totalQuestions}</p>
                                                            <p className="text-xs text-gray-500">Soal</p>
                                                        </div>
                                                        <div className="text-center py-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                                                            <Users className="h-4 w-4 text-emerald-500 mx-auto mb-0.5" />
                                                            <p className="text-lg font-bold text-emerald-600">{quiz.attempts}</p>
                                                            <p className="text-xs text-gray-500">Dikerjakan</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between text-xs text-gray-400">
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="h-3.5 w-3.5" />
                                                            {quiz.timeLimit} menit
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Award className="h-3.5 w-3.5" />
                                                            Rata-rata: {quiz.averageScore}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Panel hasil */}
                {activeTab === 'quizzes' && selectedQuiz && (
                    <ResultsPanel
                        quiz={selectedQuiz}
                        results={results}
                        loading={resultsLoading}
                        onBack={() => setSelectedQuiz(null)}
                    />
                )}

                {/* ── Tab: Analisis ── */}
                {activeTab === 'analytics' && (
                    <div className="space-y-5">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Analisis Performa Quiz</h2>

                        {analyticsLoading ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                            </div>
                        ) : analytics ? (
                            <>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                    {[
                                        { icon: Users,       color: 'text-blue-600',    bg: 'bg-blue-50 dark:bg-blue-900/20',    label: 'Total Pengerjaan',     val: analytics.overall_stats?.total_attempts ?? 0 },
                                        { icon: Target,      color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', label: 'Rata-rata Skor',   val: analytics.overall_stats?.average_score ?? 0 },
                                        { icon: CheckCircle, color: 'text-orange-600',  bg: 'bg-orange-50 dark:bg-orange-900/20',  label: 'Tingkat Lulus (%)', val: `${analytics.overall_stats?.pass_rate ?? 0}%` },
                                        { icon: Clock,       color: 'text-purple-600',  bg: 'bg-purple-50 dark:bg-purple-900/20',  label: 'Waktu Rata-rata (mnt)', val: analytics.overall_stats?.average_time ?? 0 },
                                    ].map(({ icon: Icon, color, bg, label, val }) => (
                                        <div key={label} className={`${bg} border border-gray-200 dark:border-gray-700 rounded-xl p-4`}>
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</p>
                                                <Icon className={`h-4 w-4 ${color}`} />
                                            </div>
                                            <p className={`text-2xl font-bold ${color}`}>{val}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                                    <div className="px-5 py-3 border-b border-gray-200 dark:border-gray-700">
                                        <h3 className="font-semibold text-sm text-gray-900 dark:text-white">Analisis per Quiz</h3>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-50 dark:bg-gray-700">
                                                <tr>
                                                    {['Quiz', 'Modul', 'Pengerjaan', 'Rata-rata', 'Lulus (%)', 'Kesulitan'].map(h => (
                                                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                                {Array.isArray(analytics.quiz_analytics) && analytics.quiz_analytics.length > 0
                                                    ? analytics.quiz_analytics.map((q: any, i: number) => (
                                                        <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                                                            <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{q.quiz_title}</td>
                                                            <td className="px-4 py-3 text-gray-500">{q.module_title}</td>
                                                            <td className="px-4 py-3">{q.total_attempts}</td>
                                                            <td className="px-4 py-3">{q.average_score}</td>
                                                            <td className="px-4 py-3">{q.pass_rate}%</td>
                                                            <td className="px-4 py-3">
                                                                <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                                                                    q.difficulty_rating === 'Easy'   ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' :
                                                                    q.difficulty_rating === 'Medium' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' :
                                                                                                       'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                                                                }`}>
                                                                    {q.difficulty_rating === 'Easy' ? 'Mudah' : q.difficulty_rating === 'Medium' ? 'Sedang' : 'Sulit'}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))
                                                    : (
                                                        <tr>
                                                            <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400">
                                                                Belum ada data analisis.
                                                            </td>
                                                        </tr>
                                                    )
                                                }
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-12">
                                <BarChart3 className="h-14 w-14 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-400 text-sm">Belum ada data analisis.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modal buat/edit/lihat */}
            {modalMode && (
                <FormModal
                    mode={modalMode}
                    quiz={modalQuiz}
                    modules={modules}
                    initialForm={modalForm}
                    onClose={() => setModalMode(null)}
                    onSuccess={handleModalSuccess}
                />
            )}

            {/* Modal konfirmasi toggle */}
            {toggleConfirm && (
                <ConfirmToggleModal
                    quiz={toggleConfirm.quiz}
                    activeQuizTitle={toggleConfirm.activeQuizTitle}
                    mode={toggleConfirm.mode}
                    hasDraft={toggleConfirm.hasDraft}
                    onConfirm={executeToggle}
                    onCancel={() => setToggleConfirm(null)}
                />
            )}

            {/* Modal konfirmasi hapus */}
            {deleteConfirm && (
                <ConfirmDeleteModal
                    quiz={deleteConfirm.quiz}
                    blockedReason={deleteConfirm.blockedReason}
                    onConfirm={executeDelete}
                    onCancel={() => setDeleteConfirm(null)}
                />
            )}
        </AppLayout>
    );
}
