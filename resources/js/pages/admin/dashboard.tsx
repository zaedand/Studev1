import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { PageProps as InertiaPageProps } from '@inertiajs/core';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    Users,
    GraduationCap,
    BookOpen,
    ShieldCheck,
    TrendingUp,
    UserPlus,
    LayoutDashboard,
    Trophy,
    FileText,
    ChevronRight,
} from 'lucide-react';

interface Statistik {
    totalPengguna: number;
    totalMahasiswa: number;
    totalDosen: number;
    totalAdmin: number;
    totalModul: number;
    totalKelas: number;
    totalPercobaan: number;
    totalPengumpulan: number;
    rataRataPoin: number;
    penggunaBaru: number;
}

interface RegistrasiItem {
    label: string;
    total: number;
}

interface DistribusiItem {
    peran: string;
    total: number;
}

interface PenggunaTerbaru {
    id: number;
    name: string;
    email: string;
    role: string;
    created_at: string;
}

interface TopMahasiswa {
    id: number;
    name: string;
    email: string;
    points: number;
}

interface PageProps extends InertiaPageProps {
    statistik: Statistik;
    registrasiPerBulan: RegistrasiItem[];
    distribusiPeran: DistribusiItem[];
    penggunaTerbaru: PenggunaTerbaru[];
    topMahasiswa: TopMahasiswa[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard Admin', href: '/admin/dashboard' },
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

export default function DashboardAdmin() {
    const { statistik, registrasiPerBulan, distribusiPeran, penggunaTerbaru, topMahasiswa } =
        usePage<PageProps>().props;

    // Hitung lebar batang grafik
    const maxRegistrasi = Math.max(...registrasiPerBulan.map(r => r.total), 1);
    const maxDistribusi  = Math.max(...distribusiPeran.map(d => d.total), 1);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard Admin" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4">

                {/* Header ──────────────────────────────────────────────────── */}
                <div className="bg-gradient-to-r from-slate-800 to-slate-700 dark:from-slate-900 dark:to-slate-800 p-6 rounded-xl text-white">
                    <div className="flex items-center gap-3 mb-1">
                        <ShieldCheck className="h-8 w-8 text-amber-400" />
                        <h1 className="text-2xl font-bold">Panel Admin</h1>
                    </div>
                    <p className="text-slate-300 text-sm">
                        Pantau statistik platform, kelola pengguna, dan monitor aktivitas sistem.
                    </p>
                </div>

                {/* Kartu Statistik Utama ───────────────────────────────────── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        {
                            label: 'Total Pengguna',
                            nilai: statistik.totalPengguna,
                            ikon: <Users className="h-7 w-7 text-blue-500" />,
                            warna: 'border-l-4 border-blue-500',
                        },
                        {
                            label: 'Mahasiswa',
                            nilai: statistik.totalMahasiswa,
                            ikon: <GraduationCap className="h-7 w-7 text-green-500" />,
                            warna: 'border-l-4 border-green-500',
                        },
                        {
                            label: 'Dosen',
                            nilai: statistik.totalDosen,
                            ikon: <BookOpen className="h-7 w-7 text-purple-500" />,
                            warna: 'border-l-4 border-purple-500',
                        },
                        {
                            label: 'Admin',
                            nilai: statistik.totalAdmin,
                            ikon: <ShieldCheck className="h-7 w-7 text-red-500" />,
                            warna: 'border-l-4 border-red-500',
                        },
                    ].map((kartu) => (
                        <div
                            key={kartu.label}
                            className={`bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 ${kartu.warna}`}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{kartu.label}</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {kartu.nilai.toLocaleString('id-ID')}
                                    </p>
                                </div>
                                {kartu.ikon}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Kartu Statistik Sekunder ────────────────────────────────── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        {
                            label: 'Total Modul',
                            nilai: statistik.totalModul,
                            ikon: <BookOpen className="h-6 w-6 text-indigo-500" />,
                        },
                        {
                            label: 'Total Kelas',
                            nilai: statistik.totalKelas,
                            ikon: <LayoutDashboard className="h-6 w-6 text-teal-500" />,
                        },
                        {
                            label: 'Percobaan Kuis',
                            nilai: statistik.totalPercobaan,
                            ikon: <FileText className="h-6 w-6 text-orange-500" />,
                        },
                        {
                            label: 'Pengumpulan Tugas',
                            nilai: statistik.totalPengumpulan,
                            ikon: <TrendingUp className="h-6 w-6 text-pink-500" />,
                        },
                    ].map((kartu) => (
                        <div
                            key={kartu.label}
                            className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center gap-4"
                        >
                            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                {kartu.ikon}
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{kartu.label}</p>
                                <p className="text-xl font-bold text-gray-900 dark:text-white">
                                    {kartu.nilai.toLocaleString('id-ID')}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Info Tambahan ───────────────────────────────────────────── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 rounded-xl flex items-center gap-4">
                        <UserPlus className="h-8 w-8 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                        <div>
                            <p className="text-sm text-amber-700 dark:text-amber-300">Pengguna Baru (7 hari terakhir)</p>
                            <p className="text-2xl font-bold text-amber-800 dark:text-amber-200">
                                {statistik.penggunaBaru}
                            </p>
                        </div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 rounded-xl flex items-center gap-4">
                        <Trophy className="h-8 w-8 text-green-600 dark:text-green-400 flex-shrink-0" />
                        <div>
                            <p className="text-sm text-green-700 dark:text-green-300">Rata-rata Poin Mahasiswa</p>
                            <p className="text-2xl font-bold text-green-800 dark:text-green-200">
                                {statistik.rataRataPoin.toLocaleString('id-ID')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Grafik & Distribusi ─────────────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Grafik Registrasi */}
                    <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                            Registrasi Pengguna (12 Bulan Terakhir)
                        </h2>
                        {registrasiPerBulan.length > 0 ? (
                            <div className="space-y-2">
                                {registrasiPerBulan.map((item) => (
                                    <div key={item.label} className="flex items-center gap-3">
                                        <span className="text-xs text-gray-500 dark:text-gray-400 w-16 flex-shrink-0">
                                            {item.label}
                                        </span>
                                        <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-5 overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                                                style={{ width: `${(item.total / maxRegistrasi) * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300 w-6 text-right">
                                            {item.total}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400 text-center py-8">Belum ada data registrasi.</p>
                        )}
                    </div>

                    {/* Distribusi Peran */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                            Distribusi Peran
                        </h2>
                        <div className="space-y-4">
                            {distribusiPeran.map((item) => (
                                <div key={item.peran}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-600 dark:text-gray-400">{item.peran}</span>
                                        <span className="font-medium text-gray-900 dark:text-white">{item.total}</span>
                                    </div>
                                    <div className="bg-gray-100 dark:bg-gray-700 rounded-full h-3">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-500"
                                            style={{ width: `${(item.total / maxDistribusi) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Tabel Bawah ─────────────────────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Pengguna Terbaru */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                        <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                                Pengguna Terbaru
                            </h2>
                            <Link
                                href="/admin/pengguna"
                                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                            >
                                Lihat Semua <ChevronRight className="h-4 w-4" />
                            </Link>
                        </div>
                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                            {penggunaTerbaru.map((pengguna) => (
                                <div key={pengguna.id} className="p-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            {pengguna.name}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{pengguna.email}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${warnaPeran[pengguna.role] ?? ''}`}>
                                            {labelPeran[pengguna.role] ?? pengguna.role}
                                        </span>
                                        <span className="text-xs text-gray-400">{pengguna.created_at}</span>
                                    </div>
                                </div>
                            ))}
                            {penggunaTerbaru.length === 0 && (
                                <p className="text-center text-sm text-gray-400 py-8">Belum ada pengguna.</p>
                            )}
                        </div>
                    </div>

                    {/* Top Mahasiswa */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                        <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <Trophy className="h-5 w-5 text-amber-500" />
                                Mahasiswa Teratas (berdasarkan poin)
                            </h2>
                        </div>
                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                            {topMahasiswa.map((mahasiswa, indeks) => (
                                <div key={mahasiswa.id} className="p-4 flex items-center gap-4">
                                    <span className={`text-sm font-bold w-6 text-center ${
                                        indeks === 0 ? 'text-amber-500' :
                                        indeks === 1 ? 'text-gray-400' :
                                        indeks === 2 ? 'text-orange-400' :
                                        'text-gray-500'
                                    }`}>
                                        #{indeks + 1}
                                    </span>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            {mahasiswa.name}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{mahasiswa.email}</p>
                                    </div>
                                    <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                                        {mahasiswa.points.toLocaleString('id-ID')} poin
                                    </span>
                                </div>
                            ))}
                            {topMahasiswa.length === 0 && (
                                <p className="text-center text-sm text-gray-400 py-8">Belum ada data mahasiswa.</p>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </AppLayout>
    );
}
