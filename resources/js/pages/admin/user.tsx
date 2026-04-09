import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { PageProps as InertiaPageProps } from '@inertiajs/core';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Users,
    Search,
    ChevronLeft,
    ChevronRight,
    ShieldCheck,
    GraduationCap,
    BookOpen,
    Trash2,
    Eye,
    RefreshCw,
} from 'lucide-react';
import { useState } from 'react';

interface Pengguna {
    id: number;
    nama: string;
    surel: string;
    peran: string;
    poin: number;
    dibuat_pada: string;
}

interface PaginasiLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginasiData {
    data: Pengguna[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: PaginasiLink[];
}

interface Ringkasan {
    semua: number;
    mahasiswa: number;
    dosen: number;
    admin: number;
}

interface Filter {
    peran: string;
    cari: string;
}

interface PageProps extends InertiaPageProps {
    pengguna: PaginasiData;
    ringkasan: Ringkasan;
    filter: Filter;
    flash?: { sukses?: string; error?: string };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard Admin', href: '/admin/dashboard' },
    { title: 'Pengguna', href: '/admin/pengguna' },
];

const labelPeran: Record<string, string> = {
    student: 'Mahasiswa',
    instructor: 'Dosen',
    admin: 'Admin',
};

const warnaPeran: Record<string, string> = {
    student: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    instructor: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    admin: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const ikonPeran: Record<string, JSX.Element> = {
    student: <GraduationCap className="h-4 w-4" />,
    instructor: <BookOpen className="h-4 w-4" />,
    admin: <ShieldCheck className="h-4 w-4" />,
};

const tabFilter = [
    { kunci: 'semua',     label: 'Semua' },
    { kunci: 'mahasiswa', label: 'Mahasiswa' },
    { kunci: 'dosen',     label: 'Dosen' },
    { kunci: 'admin',     label: 'Admin' },
];

export default function HalamanPengguna() {
    const { pengguna, ringkasan, filter, flash } = usePage<PageProps>().props;
    const [inputCari, setInputCari] = useState(filter.cari);
    const [sedangUbahPeran, setSedangUbahPeran] = useState<number | null>(null);
    const [konfirmasiHapus, setKonfirmasiHapus] = useState<Pengguna | null>(null);

    const navigasiFilter = (params: Partial<Filter>) => {
        router.get('/admin/pengguna', { ...filter, ...params }, { preserveState: true });
    };

    const handleCari = (e: React.FormEvent) => {
        e.preventDefault();
        navigasiFilter({ cari: inputCari });
    };

    const handleUbahPeran = (pengguna: Pengguna, peranBaru: string) => {
        if (peranBaru === pengguna.peran) return;
        setSedangUbahPeran(pengguna.id);
        router.patch(
            `/admin/pengguna/${pengguna.id}/ubah-peran`,
            { peran: peranBaru },
            { onFinish: () => setSedangUbahPeran(null) }
        );
    };

    const handleHapus = () => {
        if (!konfirmasiHapus) return;
        router.delete(`/admin/pengguna/${konfirmasiHapus.id}`, {
            onFinish: () => setKonfirmasiHapus(null),
        });
    };

    const peranKeValue: Record<string, string> = {
        'Mahasiswa': 'student',
        'Dosen': 'instructor',
        'Admin': 'admin',
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Pengguna" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4">

                {/* Notifikasi Flash ───────────────────────────────────────── */}
                {flash?.sukses && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 px-4 py-3 rounded-xl text-sm">
                        {flash.sukses}
                    </div>
                )}
                {flash?.error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-xl text-sm">
                        {flash.error}
                    </div>
                )}

                {/* Header ──────────────────────────────────────────────────── */}
                <div className="bg-gradient-to-r from-slate-800 to-slate-700 dark:from-slate-900 dark:to-slate-800 p-6 rounded-xl text-white">
                    <div className="flex items-center gap-3 mb-1">
                        <Users className="h-8 w-8 text-amber-400" />
                        <h1 className="text-2xl font-bold">Manajemen Pengguna</h1>
                    </div>
                    <p className="text-slate-300 text-sm">
                        Kelola akun mahasiswa, dosen, dan admin. Ubah peran pengguna sesuai kebutuhan.
                    </p>
                </div>

                {/* Kartu Ringkasan ─────────────────────────────────────────── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {tabFilter.map((tab) => (
                        <button
                            key={tab.kunci}
                            onClick={() => navigasiFilter({ peran: tab.kunci })}
                            className={`p-4 rounded-xl border text-left transition-all ${
                                filter.peran === tab.kunci
                                    ? 'bg-slate-800 dark:bg-slate-700 border-slate-600 text-white'
                                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-slate-400'
                            }`}
                        >
                            <p className={`text-xs mb-1 ${filter.peran === tab.kunci ? 'text-slate-300' : 'text-gray-500 dark:text-gray-400'}`}>
                                {tab.label}
                            </p>
                            <p className={`text-2xl font-bold ${filter.peran === tab.kunci ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                                {ringkasan[tab.kunci as keyof Ringkasan]}
                            </p>
                        </button>
                    ))}
                </div>

                {/* Bilah Pencarian ─────────────────────────────────────────── */}
                <form onSubmit={handleCari} className="flex gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            value={inputCari}
                            onChange={(e) => setInputCari(e.target.value)}
                            placeholder="Cari nama atau surel pengguna..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-500"
                        />
                    </div>
                    <button
                        type="submit"
                        className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-xl text-sm transition-colors"
                    >
                        Cari
                    </button>
                    {(filter.cari || filter.peran !== 'semua') && (
                        <button
                            type="button"
                            onClick={() => { setInputCari(''); navigasiFilter({ cari: '', peran: 'semua' }); }}
                            className="px-3 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-xl text-sm transition-colors flex items-center gap-1"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Atur Ulang
                        </button>
                    )}
                </form>

                {/* Tabel Pengguna ──────────────────────────────────────────── */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Pengguna
                                    </th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Peran
                                    </th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Poin
                                    </th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Terdaftar
                                    </th>
                                    <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Tindakan
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {pengguna.data.map((p) => (
                                    <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                        {/* Kolom Pengguna */}
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">{p.nama}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{p.surel}</p>
                                            </div>
                                        </td>

                                        {/* Kolom Peran */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${warnaPeran[p.peran] ?? ''}`}>
                                                    {ikonPeran[p.peran]}
                                                    {labelPeran[p.peran] ?? p.peran}
                                                </span>
                                                {/* Dropdown ubah peran */}
                                                <select
                                                    value={p.peran}
                                                    disabled={sedangUbahPeran === p.id}
                                                    onChange={(e) => handleUbahPeran(p, e.target.value)}
                                                    className="text-xs border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:opacity-50 cursor-pointer"
                                                    title="Ubah peran"
                                                >
                                                    <option value="student">Mahasiswa</option>
                                                    <option value="instructor">Dosen</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                                {sedangUbahPeran === p.id && (
                                                    <RefreshCw className="h-3 w-3 animate-spin text-gray-400" />
                                                )}
                                            </div>
                                        </td>

                                        {/* Kolom Poin */}
                                        <td className="px-6 py-4">
                                            <span className="font-medium text-indigo-600 dark:text-indigo-400">
                                                {p.poin.toLocaleString('id-ID')}
                                            </span>
                                        </td>

                                        {/* Kolom Terdaftar */}
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-xs">
                                            {p.dibuat_pada}
                                        </td>

                                        {/* Kolom Tindakan */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <Link
                                                    href={`/admin/pengguna/${p.id}`}
                                                    className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors group"
                                                    title="Lihat detail"
                                                >
                                                    <Eye className="h-4 w-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                                                </Link>
                                                <button
                                                    onClick={() => setKonfirmasiHapus(p)}
                                                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors group"
                                                    title="Hapus pengguna"
                                                >
                                                    <Trash2 className="h-4 w-4 text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {pengguna.data.length === 0 && (
                            <div className="text-center py-12">
                                <Users className="h-10 w-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                                <p className="text-gray-500 dark:text-gray-400">
                                    Tidak ada pengguna yang ditemukan.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Paginasi ─────────────────────────────────────────────── */}
                    {pengguna.last_page > 1 && (
                        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Menampilkan {((pengguna.current_page - 1) * pengguna.per_page) + 1}–
                                {Math.min(pengguna.current_page * pengguna.per_page, pengguna.total)} dari{' '}
                                {pengguna.total} pengguna
                            </p>
                            <div className="flex items-center gap-1">
                                {pengguna.links.map((tautan, i) => {
                                    if (tautan.label === '&laquo; Previous') {
                                        return (
                                            <button
                                                key={i}
                                                disabled={!tautan.url}
                                                onClick={() => tautan.url && router.get(tautan.url)}
                                                className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                            </button>
                                        );
                                    }
                                    if (tautan.label === 'Next &raquo;') {
                                        return (
                                            <button
                                                key={i}
                                                disabled={!tautan.url}
                                                onClick={() => tautan.url && router.get(tautan.url)}
                                                className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                            >
                                                <ChevronRight className="h-4 w-4" />
                                            </button>
                                        );
                                    }
                                    return (
                                        <button
                                            key={i}
                                            onClick={() => tautan.url && router.get(tautan.url)}
                                            className={`w-8 h-8 rounded-lg text-sm transition-colors ${
                                                tautan.active
                                                    ? 'bg-slate-800 text-white'
                                                    : 'border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                                            }`}
                                        >
                                            {tautan.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Konfirmasi Hapus ──────────────────────────────────────── */}
            {konfirmasiHapus && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-2xl max-w-sm w-full mx-4">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl">
                                <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
                            </div>
                            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                                Hapus Pengguna
                            </h3>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                            Apakah Anda yakin ingin menghapus pengguna{' '}
                            <span className="font-semibold text-gray-900 dark:text-white">
                                {konfirmasiHapus.nama}
                            </span>
                            ? Tindakan ini tidak dapat dibatalkan.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setKonfirmasiHapus(null)}
                                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl text-sm transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleHapus}
                                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm transition-colors"
                            >
                                Ya, Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
