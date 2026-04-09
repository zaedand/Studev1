/**
 * resources/js/pages/Instructor/Classes/Detail.tsx
 */
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowLeft, Users, Edit, Trash2, Power, PowerOff,
    UserPlus, UserMinus, Mail, Award, X, Search,
    AlertCircle, AlertTriangle, ArrowRightLeft, CheckCircle,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';

interface ClassRoom {
    id: number;
    name: string;
    description: string;
    is_active: boolean;
    instructor_name: string;
    created_at: string;
    updated_at: string;
}

interface Student {
    id: number;
    name: string;
    email: string;
    points: number;
}

// Tipe mahasiswa dari endpoint availableStudents
interface AvailableStudent {
    id: number;
    name: string;
    email: string;
    points: number;
    in_this_class: boolean;
    current_class_id: number | null;
    current_class_name: string | null;
    no_class: boolean;
}

interface PageProps {
    class: ClassRoom;
    students: Student[];
    flash?: { success?: string; error?: string };
}

// ─── Modal Konfirmasi Hapus Kelas ─────────────────────────────────────────────
function ConfirmDeleteClassModal({
    classRoom, studentCount, onConfirm, onCancel,
}: {
    classRoom: ClassRoom; studentCount: number;
    onConfirm: () => void; onCancel: () => void;
}) {
    const blocked = studentCount > 0;
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
                        Kelas ini tidak dapat dihapus karena masih memiliki{' '}
                        <strong>{studentCount} mahasiswa</strong>. Keluarkan semua mahasiswa terlebih dahulu.
                    </div>
                ) : (
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                        <p>Hapus kelas <strong>"{classRoom.name}"</strong>?</p>
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-3 text-red-700 dark:text-red-400 text-xs">
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

// ─── Modal Konfirmasi Keluarkan Mahasiswa ─────────────────────────────────────
function ConfirmRemoveStudentModal({
    student, onConfirm, onCancel,
}: { student: Student; onConfirm: () => void; onCancel: () => void }) {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm shadow-2xl p-6 space-y-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl">
                        <UserMinus className="h-5 w-5 text-red-600" />
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white">Keluarkan Mahasiswa?</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                    Keluarkan <strong>{student.name}</strong> dari kelas ini?
                    Mahasiswa dapat ditambahkan kembali kapan saja.
                </p>
                <div className="flex gap-3">
                    <button onClick={onCancel} className="flex-1 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        Batal
                    </button>
                    <button onClick={onConfirm} className="flex-1 py-2 text-sm font-semibold bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors">
                        Ya, Keluarkan
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Modal Konfirmasi Toggle Aktif ────────────────────────────────────────────
function ConfirmToggleClassModal({
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
                        <span className="block mt-1 text-amber-700 dark:text-amber-400 text-xs">
                            Kelas yang dinonaktifkan tidak terlihat oleh mahasiswa.
                        </span>
                    )}
                </p>
                <div className="flex gap-3">
                    <button onClick={onCancel} className="flex-1 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded-lg transition-colors">Batal</button>
                    <button onClick={onConfirm} className={`flex-1 py-2 text-sm font-semibold rounded-lg text-white transition-colors ${classRoom.is_active ? 'bg-amber-600 hover:bg-amber-500' : 'bg-emerald-600 hover:bg-emerald-500'}`}>
                        Ya, {next.charAt(0).toUpperCase() + next.slice(1)}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Modal Tambah Mahasiswa ───────────────────────────────────────────────────
function AddStudentModal({
    classId, className, onClose,
}: { classId: number; className: string; onClose: () => void }) {
    const [all, setAll]             = useState<AvailableStudent[]>([]);
    const [loading, setLoading]     = useState(true);
    const [search, setSearch]       = useState('');
    const [selected, setSelected]   = useState<AvailableStudent | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Konfirmasi: 'new' = belum punya kelas, 'transfer' = pindah dari kelas lain
    const [confirmType, setConfirmType] = useState<'new' | 'transfer' | null>(null);

    useEffect(() => {
        fetch(`/instructor/classes/${classId}/available-students`, { credentials: 'include' })
            .then(r => r.json())
            .then(d => { setAll(d.students ?? []); setLoading(false); })
            .catch(() => setLoading(false));
    }, [classId]);

    // Filter: semua mahasiswa kecuali yang sudah di kelas ini
    const filtered = all
        .filter(s => !s.in_this_class)
        .filter(s =>
            s.name.toLowerCase().includes(search.toLowerCase()) ||
            s.email.toLowerCase().includes(search.toLowerCase())
        );

    const handleSelect = (s: AvailableStudent) => {
        setSelected(s);
        // Langsung tampilkan konfirmasi sesuai kondisi
        setConfirmType(s.current_class_name ? 'transfer' : 'new');
    };

    const executeAdd = (transfer: boolean) => {
        if (!selected) return;
        setSubmitting(true);
        router.post(
            `/instructor/classes/${classId}/students`,
            { student_id: selected.id, transfer },
            {
                onSuccess: () => onClose(),
                onError:   () => {
                    setSubmitting(false);
                    setConfirmType(null);
                    toast.error('Gagal menambahkan mahasiswa.');
                },
            }
        );
    };

    // Badge status mahasiswa
    const StatusBadge = ({ s }: { s: AvailableStudent }) => {
        if (s.no_class) return (
            <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-700 px-2 py-0.5 rounded-full">
                Belum punya kelas
            </span>
        );
        if (s.current_class_name) return (
            <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                <ArrowRightLeft className="h-3 w-3" />
                Kelas: {s.current_class_name}
            </span>
        );
        return null;
    };

    // Modal konfirmasi setelah pilih mahasiswa
    if (confirmType && selected) {
        const isTransfer = confirmType === 'transfer';
        return (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm shadow-2xl p-6 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${isTransfer ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-emerald-100 dark:bg-emerald-900/30'}`}>
                            {isTransfer ? <ArrowRightLeft className="h-5 w-5 text-amber-600" /> : <UserPlus className="h-5 w-5 text-emerald-600" />}
                        </div>
                        <h3 className="font-bold text-gray-900 dark:text-white">
                            {isTransfer ? 'Pindahkan Mahasiswa?' : 'Tambahkan Mahasiswa?'}
                        </h3>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                        <p>
                            Tambahkan <strong>{selected.name}</strong> ke kelas <strong>"{className}"</strong>?
                        </p>
                        {isTransfer && (
                            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-3">
                                <p className="text-amber-800 dark:text-amber-300 font-medium text-xs mb-1">⚠ Perpindahan Kelas</p>
                                <p className="text-amber-700 dark:text-amber-400 text-xs">
                                    Mahasiswa ini saat ini terdaftar di kelas <strong>"{selected.current_class_name}"</strong>.
                                    Jika dilanjutkan, mahasiswa akan dipindahkan ke kelas ini dan dikeluarkan dari kelas sebelumnya.
                                </p>
                            </div>
                        )}
                        {!isTransfer && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-3">
                                <p className="text-blue-700 dark:text-blue-400 text-xs flex items-center gap-1.5">
                                    <CheckCircle className="h-3.5 w-3.5 flex-shrink-0" />
                                    Mahasiswa belum terdaftar di kelas mana pun.
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => { setConfirmType(null); setSelected(null); }}
                            className="flex-1 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            onClick={() => executeAdd(isTransfer)}
                            disabled={submitting}
                            className={`flex-1 py-2 text-sm font-semibold rounded-lg text-white transition-colors disabled:opacity-60 ${
                                isTransfer ? 'bg-amber-600 hover:bg-amber-500' : 'bg-emerald-600 hover:bg-emerald-500'
                            }`}
                        >
                            {submitting ? 'Memproses...' : isTransfer ? 'Ya, Pindahkan' : 'Ya, Tambahkan'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">Tambah Mahasiswa</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">ke kelas "{className}"</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                {/* Legenda */}
                <div className="px-5 py-3 bg-gray-50 dark:bg-gray-700/30 border-b border-gray-200 dark:border-gray-700 flex flex-wrap gap-3 flex-shrink-0">
                    <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                        <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                        Belum punya kelas
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                        <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
                        Sudah di kelas lain (dapat dipindah)
                    </div>
                </div>

                {/* Cari */}
                <div className="px-5 py-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Cari nama atau email mahasiswa..."
                            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
                        />
                    </div>
                </div>

                {/* Daftar mahasiswa */}
                <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2">
                    {loading ? (
                        <div className="flex items-center justify-center py-10">
                            <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-purple-600" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-10">
                            <Users className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                            <p className="text-sm text-gray-400">
                                {search ? 'Tidak ada mahasiswa ditemukan.' : 'Semua mahasiswa sudah terdaftar di kelas ini.'}
                            </p>
                        </div>
                    ) : (
                        filtered.map(s => (
                            <button
                                key={s.id}
                                onClick={() => handleSelect(s)}
                                className={`w-full p-3 rounded-xl border-2 text-left transition-all hover:border-purple-400 dark:hover:border-purple-600 ${
                                    s.current_class_name
                                        ? 'border-amber-200 dark:border-amber-700 bg-amber-50/30 dark:bg-amber-900/10'
                                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                }`}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <p className="font-medium text-sm text-gray-900 dark:text-white truncate">{s.name}</p>
                                        <p className="text-xs text-gray-400 truncate">{s.email}</p>
                                        <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                                            <Award className="h-3 w-3 text-amber-500" />
                                            {s.points} poin
                                        </div>
                                    </div>
                                    <div className="flex-shrink-0">
                                        <StatusBadge s={s} />
                                    </div>
                                </div>
                            </button>
                        ))
                    )}
                </div>

                {/* Footer info */}
                <div className="px-5 py-3 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <p className="text-xs text-gray-400 text-center">
                        Klik mahasiswa untuk memilih dan menampilkan konfirmasi
                    </p>
                </div>
            </div>
        </div>
    );
}

// ─── Halaman Utama Detail ─────────────────────────────────────────────────────
export default function ClassDetail() {
    const { class: classRoom, students, flash } = usePage<any>().props as PageProps;

    const [showAddModal, setShowAddModal]             = useState(false);
    const [deleteClassConfirm, setDeleteClassConfirm] = useState(false);
    const [toggleConfirm, setToggleConfirm]           = useState(false);
    const [removeConfirm, setRemoveConfirm]           = useState<Student | null>(null);
    const [search, setSearch]                         = useState('');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/instructor/dashboard' },
        { title: 'Manajemen Kelas', href: '/instructor/classes' },
        { title: classRoom.name, href: '#' },
    ];

    useEffect(() => {
        if (flash?.success) toast.success(flash.success, { duration: 4000 });
        if (flash?.error)   toast.error(flash.error,   { duration: 5000 });
    }, [flash]);

    const executeToggle = () => {
        setToggleConfirm(false);
        const tid = toast.loading('Mengubah status kelas...');
        router.post(`/instructor/classes/${classRoom.id}/toggle-active`, {}, {
            onSuccess: () => toast.dismiss(tid),
            onError:   () => toast.error('Gagal mengubah status.', { id: tid }),
        });
    };

    const executeDeleteClass = () => {
        setDeleteClassConfirm(false);
        const tid = toast.loading('Menghapus kelas...');
        router.delete(`/instructor/classes/${classRoom.id}`, {
            onSuccess: () => toast.dismiss(tid),
            onError:   () => toast.error('Gagal menghapus kelas.', { id: tid }),
        });
    };

    const executeRemoveStudent = () => {
        if (!removeConfirm) return;
        const sid = removeConfirm.id;
        setRemoveConfirm(null);
        const tid = toast.loading('Mengeluarkan mahasiswa...');
        router.delete(`/instructor/classes/${classRoom.id}/students/${sid}`, {
            onSuccess: () => toast.dismiss(tid),
            onError:   () => toast.error('Gagal mengeluarkan mahasiswa.', { id: tid }),
        });
    };

    const filtered = students.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase())
    );

    const avgPoints = students.length > 0
        ? Math.round(students.reduce((a, s) => a + s.points, 0) / students.length)
        : 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Kelas: ${classRoom.name}`} />
            <Toaster
                position="top-right"
                toastOptions={{
                    style:   { background: '#1f2937', color: '#f9fafb', borderRadius: '10px', border: '1px solid #374151' },
                    success: { style: { background: '#065f46', color: '#ecfdf5', border: '1px solid #10b981' } },
                    error:   { style: { background: '#7f1d1d', color: '#fef2f2', border: '1px solid #ef4444' } },
                    loading: { style: { background: '#1e3a5f', color: '#bfdbfe', border: '1px solid #3b82f6' } },
                }}
            />

            <div className="flex flex-col gap-6 p-4 md:p-6 max-w-5xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-700 p-5 rounded-xl">
                    <div className="flex items-start justify-between gap-4 mb-5">
                        <div className="flex items-center gap-3 min-w-0">
                            <Link href="/instructor/classes" className="p-2 hover:bg-white dark:hover:bg-gray-600 rounded-lg transition-colors flex-shrink-0">
                                <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                            </Link>
                            <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h1 className="text-xl font-bold text-gray-900 dark:text-white truncate">{classRoom.name}</h1>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                                        classRoom.is_active
                                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                    }`}>
                                        {classRoom.is_active ? '● Aktif' : '○ Nonaktif'}
                                    </span>
                                </div>
                                {classRoom.description && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{classRoom.description}</p>
                                )}
                                <p className="text-xs text-gray-400 mt-1">
                                    Dosen: {classRoom.instructor_name} · Dibuat: {classRoom.created_at}
                                </p>
                            </div>
                        </div>

                        {/* Aksi header */}
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                            <button
                                onClick={() => setToggleConfirm(true)}
                                title={classRoom.is_active ? 'Nonaktifkan kelas' : 'Aktifkan kelas'}
                                className={`p-2 rounded-lg text-sm transition-colors flex items-center gap-1.5 ${
                                    classRoom.is_active
                                        ? 'bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                                        : 'bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                                }`}
                            >
                                {classRoom.is_active ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                                <span className="hidden sm:inline text-xs font-medium">
                                    {classRoom.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                                </span>
                            </button>
                            <Link
                                href={`/instructor/classes/${classRoom.id}/edit`}
                                className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors flex items-center gap-1.5"
                            >
                                <Edit className="h-4 w-4" />
                                <span className="hidden sm:inline text-xs font-medium">Edit</span>
                            </Link>
                            <button
                                onClick={() => setDeleteClassConfirm(true)}
                                disabled={students.length > 0}
                                title={students.length > 0 ? 'Tidak dapat dihapus — masih ada mahasiswa' : 'Hapus kelas'}
                                className="p-2 bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-1.5"
                            >
                                <Trash2 className="h-4 w-4" />
                                <span className="hidden sm:inline text-xs font-medium">Hapus</span>
                            </button>
                        </div>
                    </div>

                    {/* Mini stats */}
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { label: 'Mahasiswa', val: students.length, icon: Users, color: 'text-purple-600' },
                            { label: 'Rata-rata Poin', val: avgPoints.toLocaleString(), icon: Award, color: 'text-amber-600' },
                            { label: 'Total Poin', val: students.reduce((a, s) => a + s.points, 0).toLocaleString(), icon: Award, color: 'text-blue-600' },
                        ].map(({ label, val, icon: Icon, color }) => (
                            <div key={label} className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                                <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <Icon className={`h-4 w-4 ${color}`} />
                                    <p className={`text-xl font-bold ${color}`}>{val}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tabel mahasiswa */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    {/* Header tabel */}
                    <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between gap-3">
                        <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 text-sm">
                            <Users className="h-4 w-4" />
                            Daftar Mahasiswa
                            <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 px-2 py-0.5 rounded-full">{students.length}</span>
                        </h2>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs px-3 py-2 rounded-lg transition-colors"
                        >
                            <UserPlus className="h-3.5 w-3.5" />
                            Tambah Mahasiswa
                        </button>
                    </div>

                    {/* Cari */}
                    <div className="px-5 py-3 border-b border-gray-200 dark:border-gray-700">
                        <div className="relative max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Cari mahasiswa..."
                                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* Tabel */}
                    {filtered.length === 0 ? (
                        <div className="text-center py-12">
                            <Users className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                            <p className="text-sm text-gray-400">
                                {search ? 'Tidak ada mahasiswa ditemukan.' : 'Belum ada mahasiswa di kelas ini.'}
                            </p>
                            {!search && (
                                <button
                                    onClick={() => setShowAddModal(true)}
                                    className="mt-3 inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white text-xs px-4 py-2 rounded-lg transition-colors"
                                >
                                    <UserPlus className="h-3.5 w-3.5" />
                                    Tambah Mahasiswa Pertama
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        {['Mahasiswa', 'Email', 'Poin', 'Aksi'].map(h => (
                                            <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {filtered.map(s => (
                                        <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                                            <td className="px-5 py-4 font-medium text-gray-900 dark:text-white">{s.name}</td>
                                            <td className="px-5 py-4">
                                                <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-xs">
                                                    <Mail className="h-3.5 w-3.5" />
                                                    {s.email}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="flex items-center gap-1.5 font-semibold text-gray-900 dark:text-white">
                                                    <Award className="h-4 w-4 text-amber-500" />
                                                    {s.points.toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <button
                                                    onClick={() => setRemoveConfirm(s)}
                                                    className="flex items-center gap-1.5 text-red-500 hover:text-red-700 dark:text-red-400 text-xs transition-colors"
                                                >
                                                    <UserMinus className="h-3.5 w-3.5" />
                                                    Keluarkan
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            {showAddModal && (
                <AddStudentModal
                    classId={classRoom.id}
                    className={classRoom.name}
                    onClose={() => setShowAddModal(false)}
                />
            )}
            {toggleConfirm && (
                <ConfirmToggleClassModal
                    classRoom={classRoom}
                    onConfirm={executeToggle}
                    onCancel={() => setToggleConfirm(false)}
                />
            )}
            {deleteClassConfirm && (
                <ConfirmDeleteClassModal
                    classRoom={classRoom}
                    studentCount={students.length}
                    onConfirm={executeDeleteClass}
                    onCancel={() => setDeleteClassConfirm(false)}
                />
            )}
            {removeConfirm && (
                <ConfirmRemoveStudentModal
                    student={removeConfirm}
                    onConfirm={executeRemoveStudent}
                    onCancel={() => setRemoveConfirm(null)}
                />
            )}
        </AppLayout>
    );
}
