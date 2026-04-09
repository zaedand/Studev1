/**
 * resources/js/pages/Instructor/Classes/Index.tsx
 */
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    Users, Plus, Edit, Trash2, GraduationCap, Eye,
    X, Save, Power, PowerOff, ChevronRight, AlertTriangle,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';

interface ClassRoom {
    id: number;
    name: string;
    description: string;
    is_active: boolean;
    students_count: number;
    instructor_name: string;
    created_at: string;
}

interface PageProps {
    classes: ClassRoom[];
    flash?: { success?: string; error?: string };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/instructor/dashboard' },
    { title: 'Manajemen Kelas', href: '/instructor/classes' },
];

// ─── Modal Form Kelas ─────────────────────────────────────────────────────────
function ClassModal({ classRoom, onClose }: { classRoom: ClassRoom | null; onClose: () => void }) {
    const isEditing = !!classRoom;
    const { data, setData, post, put, processing, errors, reset } = useForm({
        name:        classRoom?.name        ?? '',
        description: classRoom?.description ?? '',
        is_active:   classRoom?.is_active   ?? true,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditing) {
            put(`/instructor/classes/${classRoom.id}`, {
                onSuccess: () => { reset(); onClose(); },
            });
        } else {
            post('/instructor/classes', {
                onSuccess: () => { reset(); onClose(); },
            });
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-bold text-gray-900 dark:text-white">
                        {isEditing ? 'Edit Kelas' : 'Buat Kelas Baru'}
                    </h3>
                    <button onClick={onClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                <div className="px-6 py-5 space-y-4">
                    {/* Nama */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                            Nama Kelas <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                            placeholder="Contoh: Kelas Pemrograman A"
                            className={`w-full px-3 py-2.5 text-sm rounded-lg border ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none`}
                        />
                        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                    </div>

                    {/* Deskripsi */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                            Deskripsi <span className="font-normal text-gray-400 normal-case">(opsional)</span>
                        </label>
                        <textarea
                            value={data.description}
                            onChange={e => setData('description', e.target.value)}
                            rows={3}
                            placeholder="Tujuan dan informasi kelas..."
                            className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                        />
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <input
                            type="checkbox"
                            id="modal_is_active"
                            checked={data.is_active}
                            onChange={e => setData('is_active', e.target.checked)}
                            className="w-4 h-4 accent-purple-600"
                        />
                        <label htmlFor="modal_is_active" className="text-sm cursor-pointer">
                            <span className="font-semibold text-gray-800 dark:text-gray-200">Kelas Aktif</span>
                            <span className="block text-xs text-gray-500 dark:text-gray-400">Kelas aktif terlihat oleh mahasiswa</span>
                        </label>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                    <button onClick={onClose} className="flex-1 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        Batal
                    </button>
                    <button
                        onClick={submit}
                        disabled={processing}
                        className="flex-1 flex items-center justify-center gap-2 py-2 text-sm bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white rounded-lg transition-colors font-semibold"
                    >
                        <Save className="h-4 w-4" />
                        {processing ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Buat Kelas'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Modal Konfirmasi Toggle ──────────────────────────────────────────────────
function ConfirmToggleModal({
    classRoom, onConfirm, onCancel,
}: { classRoom: ClassRoom; onConfirm: () => void; onCancel: () => void }) {
    const next = classRoom.is_active ? 'nonaktifkan' : 'aktifkan';
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm shadow-2xl p-6 space-y-4">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${classRoom.is_active ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-emerald-100 dark:bg-emerald-900/30'}`}>
                        <AlertTriangle className={`h-5 w-5 ${classRoom.is_active ? 'text-amber-600' : 'text-emerald-600'}`} />
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white capitalize">
                        {next.charAt(0).toUpperCase() + next.slice(1)} Kelas?
                    </h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                    Kelas <strong>"{classRoom.name}"</strong> akan di{next}.
                    {classRoom.is_active && (
                        <span className="block mt-1 text-amber-700 dark:text-amber-400">
                            Kelas yang dinonaktifkan tidak terlihat oleh mahasiswa.
                        </span>
                    )}
                </p>
                <div className="flex gap-3">
                    <button onClick={onCancel} className="flex-1 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        Batal
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`flex-1 py-2 text-sm font-semibold rounded-lg text-white transition-colors ${classRoom.is_active ? 'bg-amber-600 hover:bg-amber-500' : 'bg-emerald-600 hover:bg-emerald-500'}`}
                    >
                        Ya, {next.charAt(0).toUpperCase() + next.slice(1)}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Modal Konfirmasi Hapus ───────────────────────────────────────────────────
function ConfirmDeleteModal({
    classRoom, onConfirm, onCancel,
}: { classRoom: ClassRoom; onConfirm: () => void; onCancel: () => void }) {
    const blocked = classRoom.students_count > 0;
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm shadow-2xl p-6 space-y-4">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${blocked ? 'bg-gray-100 dark:bg-gray-700' : 'bg-red-100 dark:bg-red-900/30'}`}>
                        <Trash2 className={`h-5 w-5 ${blocked ? 'text-gray-500' : 'text-red-600'}`} />
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white">
                        {blocked ? 'Tidak Dapat Dihapus' : 'Hapus Kelas?'}
                    </h3>
                </div>
                {blocked ? (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-3 text-sm text-red-800 dark:text-red-300">
                        Kelas <strong>"{classRoom.name}"</strong> tidak dapat dihapus karena masih memiliki{' '}
                        <strong>{classRoom.students_count} mahasiswa</strong>.
                        Keluarkan semua mahasiswa terlebih dahulu.
                    </div>
                ) : (
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                        <p>Hapus kelas <strong>"{classRoom.name}"</strong>?</p>
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-3 text-red-700 dark:text-red-400">
                            ⚠ Tindakan ini tidak dapat dibatalkan.
                        </div>
                    </div>
                )}
                <div className="flex gap-3">
                    <button onClick={onCancel} className="flex-1 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        {blocked ? 'Tutup' : 'Batal'}
                    </button>
                    {!blocked && (
                        <button onClick={onConfirm} className="flex-1 py-2 text-sm font-semibold bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors">
                            Ya, Hapus
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Halaman Utama ────────────────────────────────────────────────────────────
export default function ClassesIndex() {
    const { classes, flash } = usePage<any>().props as PageProps;

    const [showClassModal, setShowClassModal]     = useState(false);
    const [editingClass, setEditingClass]         = useState<ClassRoom | null>(null);
    const [toggleConfirm, setToggleConfirm]       = useState<ClassRoom | null>(null);
    const [deleteConfirm, setDeleteConfirm]       = useState<ClassRoom | null>(null);

    // Tampilkan flash message
    useEffect(() => {
        if (flash?.success) toast.success(flash.success, { duration: 4000 });
        if (flash?.error)   toast.error(flash.error,   { duration: 5000 });
    }, [flash]);

    const executeToggle = () => {
        if (!toggleConfirm) return;
        const tid = toast.loading('Mengubah status kelas...');
        router.post(`/instructor/classes/${toggleConfirm.id}/toggle-active`, {}, {
            onSuccess: () => toast.dismiss(tid),
            onError:   () => toast.error('Gagal mengubah status kelas.', { id: tid }),
        });
        setToggleConfirm(null);
    };

    const executeDelete = () => {
        if (!deleteConfirm) return;
        const tid = toast.loading('Menghapus kelas...');
        router.delete(`/instructor/classes/${deleteConfirm.id}`, {
            onSuccess: () => toast.dismiss(tid),
            onError:   () => toast.error('Gagal menghapus kelas.', { id: tid }),
        });
        setDeleteConfirm(null);
    };

    const activeCount  = classes.filter(c => c.is_active).length;
    const totalStudents = classes.reduce((s, c) => s + c.students_count, 0);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Kelas" />
            <Toaster
                position="top-right"
                toastOptions={{
                    style:   { background: '#1f2937', color: '#f9fafb', borderRadius: '10px', border: '1px solid #374151' },
                    success: { style: { background: '#065f46', color: '#ecfdf5', border: '1px solid #10b981' } },
                    error:   { style: { background: '#7f1d1d', color: '#fef2f2', border: '1px solid #ef4444' } },
                    loading: { style: { background: '#1e3a5f', color: '#bfdbfe', border: '1px solid #3b82f6' } },
                }}
            />

            <div className="flex flex-col gap-6 p-4 md:p-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-700 p-5 rounded-xl">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <GraduationCap className="h-7 w-7 text-purple-600" />
                            Manajemen Kelas
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                            Kelola kelas dan daftar mahasiswa
                        </p>
                    </div>
                    <button
                        onClick={() => { setEditingClass(null); setShowClassModal(true); }}
                        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 active:scale-95 text-white text-sm px-4 py-2 rounded-lg transition-all"
                    >
                        <Plus className="h-4 w-4" />
                        <span className="hidden sm:inline">Buat Kelas Baru</span>
                        <span className="sm:hidden">Buat</span>
                    </button>
                </div>

                {/* Statistik */}
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { label: 'Total Kelas',     val: classes.length,  icon: GraduationCap, color: 'text-purple-600' },
                        { label: 'Kelas Aktif',     val: activeCount,     icon: Users,         color: 'text-emerald-600' },
                        { label: 'Total Mahasiswa', val: totalStudents,   icon: Users,         color: 'text-blue-600' },
                    ].map(({ label, val, icon: Icon, color }) => (
                        <div key={label} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                                    <p className={`text-2xl font-bold ${color}`}>{val}</p>
                                </div>
                                <Icon className={`h-7 w-7 ${color} opacity-60`} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Daftar kelas */}
                {classes.length === 0 ? (
                    <div className="text-center py-14 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                        <GraduationCap className="h-14 w-14 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">Belum Ada Kelas</h3>
                        <p className="text-sm text-gray-400 mb-5">Mulai dengan membuat kelas pertama</p>
                        <button
                            onClick={() => { setEditingClass(null); setShowClassModal(true); }}
                            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white text-sm px-5 py-2.5 rounded-lg transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                            Buat Kelas Pertama
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {classes.map(cr => (
                            <div
                                key={cr.id}
                                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-all group"
                            >
                                {/* Judul + badge */}
                                <div className="flex items-start justify-between mb-3">
                                    <div className="min-w-0">
                                        <Link href={`/instructor/classes/${cr.id}`} className="group/link">
                                            <h3 className="font-semibold text-gray-900 dark:text-white group-hover/link:text-purple-600 transition-colors flex items-center gap-1">
                                                {cr.name}
                                                <ChevronRight className="h-4 w-4 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                                            </h3>
                                        </Link>
                                        <p className="text-xs text-gray-400 mt-0.5">Dosen: {cr.instructor_name}</p>
                                    </div>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ml-2 ${
                                        cr.is_active
                                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                    }`}>
                                        {cr.is_active ? '● Aktif' : '○ Nonaktif'}
                                    </span>
                                </div>

                                {cr.description && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">{cr.description}</p>
                                )}

                                <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
                                    <span className="flex items-center gap-1">
                                        <Users className="h-3.5 w-3.5" />
                                        {cr.students_count} mahasiswa
                                    </span>
                                    <span>·</span>
                                    <span>{cr.created_at}</span>
                                </div>

                                {/* Tombol aksi */}
                                <div className="flex items-center gap-1.5 pt-3 border-t border-gray-100 dark:border-gray-700">
                                    <Link
                                        href={`/instructor/classes/${cr.id}`}
                                        className="flex-1 flex items-center justify-center gap-1.5 text-xs bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/30 text-purple-600 dark:text-purple-400 py-2 rounded-lg transition-colors"
                                    >
                                        <Eye className="h-3.5 w-3.5" />
                                        Lihat
                                    </Link>
                                    <button
                                        onClick={() => { setEditingClass(cr); setShowClassModal(true); }}
                                        title="Edit kelas"
                                        className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => setToggleConfirm(cr)}
                                        title={cr.is_active ? 'Nonaktifkan kelas' : 'Aktifkan kelas'}
                                        className={`p-2 rounded-lg transition-colors ${
                                            cr.is_active
                                                ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                                                : 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                                        }`}
                                    >
                                        {cr.is_active ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                                    </button>
                                    <button
                                        onClick={() => setDeleteConfirm(cr)}
                                        disabled={cr.students_count > 0}
                                        title={cr.students_count > 0 ? 'Tidak dapat dihapus — masih ada mahasiswa' : 'Hapus kelas'}
                                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modals */}
            {showClassModal && (
                <ClassModal
                    classRoom={editingClass}
                    onClose={() => { setShowClassModal(false); setEditingClass(null); }}
                />
            )}
            {toggleConfirm && (
                <ConfirmToggleModal
                    classRoom={toggleConfirm}
                    onConfirm={executeToggle}
                    onCancel={() => setToggleConfirm(null)}
                />
            )}
            {deleteConfirm && (
                <ConfirmDeleteModal
                    classRoom={deleteConfirm}
                    onConfirm={executeDelete}
                    onCancel={() => setDeleteConfirm(null)}
                />
            )}
        </AppLayout>
    );
}
