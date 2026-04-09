import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { PageProps as InertiaPageProps } from '@inertiajs/core';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    BookOpen, Plus, Edit, Eye, Trash2, Power,
    Users, CheckCircle2, GripVertical, BarChart3, AlertCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';

// ─────────────────────────────────────────────
// Tipe Data
// ─────────────────────────────────────────────

interface Module {
    id: number;
    title: string;
    description: string;
    order_number: number;
    cp_atp: string;
    is_active: boolean;
    cpmks_count: number;
    learning_objectives_count: number;
    materials_count: number;
    enrichments_count: number;
    quizzes_count: number;
    assignments_count: number;
    completion_rate: number;
    total_students: number;
    completed_students: number;
}

interface PageProps extends InertiaPageProps {
    modules: Module[];
    flash?: { success?: string; error?: string };
}

// ─────────────────────────────────────────────
// Breadcrumb
// ─────────────────────────────────────────────

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/instructor/dashboard' },
    { title: 'Modul',  href: '/instructor/modules' },
];

// ─────────────────────────────────────────────
// Halaman Utama
// ─────────────────────────────────────────────

export default function ModulesIndex() {
    const { modules, flash } = usePage<PageProps>().props;
    const [deleteConfirm, setDeleteConfirm] = useState<Module | null>(null);

    // Flash message dari server → react-hot-toast
    useEffect(() => {
        if (flash?.success) toast.success(flash.success, { duration: 4000 });
        if (flash?.error)   toast.error(flash.error,   { duration: 5000 });
    }, [flash]);

    const handleDelete = () => {
        if (!deleteConfirm) return;
        const tid = toast.loading('Menghapus modul…');
        router.delete(`/instructor/modules/${deleteConfirm.id}`, {
            onSuccess: () => {
                toast.dismiss(tid);
                toast.success(`Modul "${deleteConfirm.title}" berhasil dihapus.`);
                setDeleteConfirm(null);
            },
            onError: () => {
                toast.error('Gagal menghapus modul. Silakan coba lagi.', { id: tid });
            },
        });
    };

    const handleToggleActive = (mod: Module) => {
        const tid = toast.loading(mod.is_active ? 'Menonaktifkan modul…' : 'Mengaktifkan modul…');
        router.post(`/instructor/modules/${mod.id}/toggle-active`, {}, {
            onSuccess: () => {
                toast.success(
                    mod.is_active
                        ? `Modul "${mod.title}" dinonaktifkan.`
                        : `Modul "${mod.title}" diaktifkan.`,
                    { id: tid }
                );
            },
            onError: () => toast.error('Gagal mengubah status modul.', { id: tid }),
        });
    };

    const totalComponents = modules.reduce((sum, m) =>
        sum + m.cpmks_count + m.learning_objectives_count +
        m.materials_count + m.enrichments_count +
        m.quizzes_count + m.assignments_count, 0
    );

    const avgCompletion = modules.length > 0
        ? Math.round(modules.reduce((sum, m) => sum + m.completion_rate, 0) / modules.length)
        : 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Modul" />

            <Toaster position="top-right" toastOptions={{
                style:   { background: '#1f2937', color: '#f9fafb', borderRadius: '10px', border: '1px solid #374151' },
                success: { style: { background: '#065f46', color: '#ecfdf5', border: '1px solid #10b981' } },
                error:   { style: { background: '#7f1d1d', color: '#fef2f2', border: '1px solid #ef4444' } },
                loading: { style: { background: '#1e3a5f', color: '#bfdbfe', border: '1px solid #3b82f6' } },
            }} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">

                {/* ── Header ── */}
                <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 p-6 dark:from-gray-800 dark:to-gray-700">
                    <div>
                        <h1 className="flex items-center gap-3 text-2xl font-bold text-gray-900 dark:text-white">
                            <BookOpen className="h-8 w-8 text-blue-600" />
                            Manajemen Modul
                        </h1>
                        <p className="mt-1 text-gray-600 dark:text-gray-300">
                            Kelola modul pembelajaran untuk mahasiswa.
                        </p>
                    </div>
                    <Link
                        href="/instructor/modules/create"
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white shadow-lg transition-colors hover:bg-blue-700"
                    >
                        <Plus className="h-5 w-5" />
                        Buat Modul Baru
                    </Link>
                </div>

                {/* ── Kartu Statistik ── */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    {[
                        { label: 'Total Modul',        value: modules.length,                              icon: <BookOpen   className="h-8 w-8 text-blue-500" /> },
                        { label: 'Modul Aktif',        value: modules.filter(m => m.is_active).length,     icon: <CheckCircle2 className="h-8 w-8 text-green-500" /> },
                        { label: 'Rata-rata Selesai',  value: `${avgCompletion}%`,                         icon: <BarChart3  className="h-8 w-8 text-purple-500" /> },
                        { label: 'Total Komponen',     value: totalComponents,                             icon: <Users      className="h-8 w-8 text-orange-500" /> },
                    ].map(({ label, value, icon }) => (
                        <div key={label} className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
                                </div>
                                {icon}
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Tabel Modul ── */}
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    {['Urutan', 'Modul', 'Komponen', 'Mahasiswa', 'Penyelesaian', 'Status', 'Aksi'].map(h => (
                                        <th key={h} className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-300">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {modules.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-12 text-center text-sm text-gray-400">
                                            Belum ada modul. Klik "Buat Modul Baru" untuk memulai.
                                        </td>
                                    </tr>
                                ) : modules.map((mod) => (
                                    <tr key={mod.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700">
                                        {/* Urutan */}
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <GripVertical className="h-4 w-4 cursor-move text-gray-400" />
                                                <span className="font-medium text-gray-900 dark:text-white">#{mod.order_number}</span>
                                            </div>
                                        </td>

                                        {/* Judul & Deskripsi */}
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-gray-900 dark:text-white">{mod.title}</p>
                                            <p className="line-clamp-1 text-sm text-gray-500 dark:text-gray-400">{mod.description}</p>
                                        </td>

                                        {/* Badge Komponen */}
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {mod.cpmks_count > 0 && (
                                                    <span className="rounded px-2 py-1 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                                        CPMK: {mod.cpmks_count}
                                                    </span>
                                                )}
                                                {mod.materials_count > 0 && (
                                                    <span className="rounded px-2 py-1 text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                        Materi: {mod.materials_count}
                                                    </span>
                                                )}
                                                {mod.enrichments_count > 0 && (
                                                    <span className="rounded px-2 py-1 text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                                                        Pengayaan: {mod.enrichments_count}
                                                    </span>
                                                )}
                                                {mod.quizzes_count > 0 && (
                                                    <span className="rounded px-2 py-1 text-xs bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                                                        Kuis: {mod.quizzes_count}
                                                    </span>
                                                )}
                                                {(mod.cpmks_count + mod.materials_count + mod.enrichments_count + mod.quizzes_count) === 0 && (
                                                    <span className="text-xs text-gray-400">—</span>
                                                )}
                                            </div>
                                        </td>

                                        {/* Mahasiswa */}
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <span className="text-sm text-gray-900 dark:text-white">
                                                {mod.completed_students}/{mod.total_students}
                                            </span>
                                        </td>

                                        {/* Progress bar */}
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-24 rounded-full bg-gray-200 dark:bg-gray-600">
                                                    <div
                                                        className={`h-2 rounded-full transition-all ${
                                                            mod.completion_rate >= 75 ? 'bg-green-500' :
                                                            mod.completion_rate >= 50 ? 'bg-yellow-500' :
                                                            mod.completion_rate >= 25 ? 'bg-orange-500' : 'bg-red-500'
                                                        }`}
                                                        style={{ width: `${mod.completion_rate}%` }}
                                                    />
                                                </div>
                                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {mod.completion_rate}%
                                                </span>
                                            </div>
                                        </td>

                                        {/* Toggle Aktif */}
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <button
                                                onClick={() => handleToggleActive(mod)}
                                                className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                                                    mod.is_active
                                                        ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                                                }`}
                                            >
                                                {mod.is_active ? 'Aktif' : 'Nonaktif'}
                                            </button>
                                        </td>

                                        {/* Aksi */}
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <div className="flex items-center gap-1">
                                                <Link href={`/instructor/modules/${mod.id}`}
                                                    className="rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-600"
                                                    title="Lihat Detail">
                                                    <Eye className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                                </Link>
                                                <Link href={`/instructor/modules/${mod.id}/edit`}
                                                    className="rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-600"
                                                    title="Ubah">
                                                    <Edit className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                </Link>
                                                <button
                                                    onClick={() => setDeleteConfirm(mod)}
                                                    className="rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-600"
                                                    title="Hapus">
                                                    <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ════ Modal Konfirmasi Hapus ════ */}
            {deleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-800">
                        <div className="mb-4 flex items-center gap-3">
                            <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/30">
                                <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Hapus Modul</h3>
                        </div>
                        <p className="mb-2 text-gray-600 dark:text-gray-300">
                            Hapus modul <strong className="text-gray-900 dark:text-white">"{deleteConfirm.title}"</strong>?
                        </p>
                        <p className="mb-6 text-sm text-red-600 dark:text-red-400">
                            ⚠ Semua konten terkait (materi, kuis, praktikum, dll.) akan ikut terhapus dan tindakan ini tidak dapat dibatalkan.
                        </p>
                        <div className="flex items-center justify-end gap-3">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="rounded-lg bg-gray-100 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
                                Batal
                            </button>
                            <button
                                onClick={handleDelete}
                                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700">
                                Ya, Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
