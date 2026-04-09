import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    Trophy, Medal, Crown, Award,
    User, Target, TrendingUp, BookOpen, Filter, Flame
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard',      href: '/dashboard'    },
    { title: 'Papan Peringkat', href: '/leaderboard' },
];

interface Student {
    id: number;
    rank: number;
    name: string;
    avatar: string;
    points: number;
    completedModules: number;
    totalModules: number;
    level: string;
    isCurrentUser: boolean;
    joinedDate: string;
}

interface GlobalStats {
    totalStudents: number;
    averagePoints: number;
    completionRate: number;
    totalModules: number;
}

interface ClassOption  { id: number; name: string; }
interface ModuleOption { id: number; title: string; }

interface Filters {
    classes: ClassOption[];
    modules: ModuleOption[];
    currentFilter: {
        type: 'all' | 'class' | 'module';
        classId: number | null;
        moduleId: number | null;
    };
}

interface PageProps {
    leaderboard: Student[];
    currentUser: Student;
    globalStats: GlobalStats;
    filters: Filters;
}

// ── Helpers ──────────────────────────────────────────────────
const LEVEL_STYLE: Record<string, string> = {
    Master:       'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    Expert:       'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    Advanced:     'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    Intermediate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    Beginner:     'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
};

// ── Komponen Podium ──────────────────────────────────────────
/**
 * Podium yang benar-benar rata bawah:
 * - Kotak platform memiliki tinggi tetap per posisi
 * - Info pemain berada DI DALAM kolom yang sama, di ATAS platform
 * - Seluruh kolom memakai `flex-col items-center justify-end`
 *   sehingga tinggi bawah selalu sejajar
 */
function PodiumCard({
    student,
    position,
}: {
    student: Student;
    position: 1 | 2 | 3;
}) {
    const config = {
        1: {
            platformH: 'h-24',
            avatarSize: 'w-20 h-20 text-xl ring-4 ring-yellow-300',
            avatarBg:   'bg-gradient-to-br from-yellow-400 to-amber-500',
            platformBg: 'bg-gradient-to-t from-yellow-500 to-yellow-400',
            nameClass:  'font-bold text-base',
            ptsClass:   'text-yellow-600 dark:text-yellow-400 font-bold',
            badge:      <Crown className="w-5 h-5 text-yellow-500" />,
            label:      '1',
        },
        2: {
            platformH: 'h-16',
            avatarSize: 'w-16 h-16 text-lg ring-4 ring-gray-200 dark:ring-gray-600',
            avatarBg:   'bg-gradient-to-br from-gray-400 to-slate-500',
            platformBg: 'bg-gradient-to-t from-gray-400 to-gray-300 dark:from-gray-600 dark:to-gray-500',
            nameClass:  'font-semibold text-sm',
            ptsClass:   'text-gray-600 dark:text-gray-300 font-semibold',
            badge:      <Medal className="w-5 h-5 text-gray-400" />,
            label:      '2',
        },
        3: {
            platformH: 'h-10',
            avatarSize: 'w-16 h-16 text-lg ring-4 ring-orange-200 dark:ring-orange-700',
            avatarBg:   'bg-gradient-to-br from-orange-400 to-amber-600',
            platformBg: 'bg-gradient-to-t from-orange-500 to-orange-400',
            nameClass:  'font-semibold text-sm',
            ptsClass:   'text-orange-600 dark:text-orange-400 font-semibold',
            badge:      <Award className="w-5 h-5 text-orange-500" />,
            label:      '3',
        },
    } as const;

    const c = config[position];

    return (
        /* flex-col items-center justify-end → konten tumbuh ke ATAS, platform tetap di bawah */
        <div className="flex flex-col items-center justify-end gap-0 w-32 sm:w-36">

            {/* ── Info pemain (selalu di atas platform) ── */}
            <div className="flex flex-col items-center gap-1.5 pb-3 w-full">
                {/* Lencana peringkat */}
                <div className="flex items-center gap-1 mb-0.5">{c.badge}</div>

                {/* Avatar */}
                <div className={`${c.avatarSize} ${c.avatarBg} rounded-full flex items-center justify-center text-white font-bold shadow-lg`}>
                    {student.avatar}
                </div>

                {/* Nama */}
                <p className={`${c.nameClass} text-gray-900 dark:text-white text-center leading-tight max-w-full truncate px-1`}>
                    {student.name}
                </p>

                {/* Poin */}
                <p className={`${c.ptsClass} text-sm`}>
                    {student.points.toLocaleString('id-ID')} poin
                </p>

                {/* Modul */}
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    {student.completedModules}/{student.totalModules} modul
                </p>
            </div>

            {/* ── Platform (tinggi tetap per posisi) ── */}
            <div className={`${c.platformH} ${c.platformBg} w-full rounded-t-xl flex items-center justify-center shadow-inner`}>
                <span className="text-white font-black text-2xl opacity-60">{c.label}</span>
            </div>
        </div>
    );
}

// ── Halaman Utama ────────────────────────────────────────────
export default function Leaderboard() {
    const { leaderboard, currentUser, globalStats, filters } = usePage<PageProps>().props;

    const [filterType,     setFilterType]     = useState<'all' | 'class' | 'module'>(filters.currentFilter.type);
    const [selectedClass,  setSelectedClass]  = useState<number | null>(filters.currentFilter.classId);
    const [selectedModule, setSelectedModule] = useState<number | null>(filters.currentFilter.moduleId);

    const handleFilterChange = () => {
        const params: Record<string, any> = { filter_type: filterType };
        if (filterType === 'class'  && selectedClass)  params.class_id  = selectedClass;
        if (filterType === 'module' && selectedModule) params.module_id = selectedModule;
        router.get('/leaderboard', params, { preserveState: true, preserveScroll: true });
    };

    const getFilterLabel = () => {
        if (filterType === 'class' && selectedClass) {
            const name = filters.classes.find(c => c.id === selectedClass)?.name;
            return `Kelas ${name}`;
        }
        if (filterType === 'module' && selectedModule) {
            const title = filters.modules.find(m => m.id === selectedModule)?.title;
            return `Modul: ${title}`;
        }
        return 'Semua Mahasiswa';
    };

    const getRankCell = (rank: number) => {
        if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />;
        if (rank === 2) return <Medal className="h-5 w-5 text-gray-400"   />;
        if (rank === 3) return <Award className="h-5 w-5 text-orange-500" />;
        return <span className="text-sm font-bold text-gray-500 dark:text-gray-400">#{rank}</span>;
    };

    // Susun podium: urutan tampil kiri-ke-kanan = 2, 1, 3
    const top3 = leaderboard.slice(0, 3);
    const podiumOrder: (1|2|3)[] = [2, 1, 3];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Papan Peringkat" />

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4 overflow-x-hidden">

                {/* ── Tajuk ────────────────────────────────────── */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-2xl border border-amber-100 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl">
                            <Trophy className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Papan Peringkat
                        </h1>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 ml-14">
                        Kompetisi yang sehat untuk meningkatkan motivasi belajar pemrograman.
                    </p>
                </div>

                {/* ── Filter ───────────────────────────────────── */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-4">
                        <Filter className="h-4 w-4 text-gray-500" />
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                            Filter
                        </h3>
                    </div>

                    <div className="flex flex-wrap gap-3 items-end">
                        {/* Jenis filter */}
                        <div className="flex-1 min-w-[160px]">
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                                Tampilkan
                            </label>
                            <select
                                value={filterType}
                                onChange={e => setFilterType(e.target.value as any)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">Semua Mahasiswa</option>
                                <option value="class">Per Kelas</option>
                                <option value="module">Per Modul</option>
                            </select>
                        </div>

                        {filterType === 'class' && (
                            <div className="flex-1 min-w-[160px]">
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                                    Pilih Kelas
                                </label>
                                <select
                                    value={selectedClass || ''}
                                    onChange={e => setSelectedClass(Number(e.target.value))}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Pilih kelas…</option>
                                    {filters.classes.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {filterType === 'module' && (
                            <div className="flex-1 min-w-[160px]">
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                                    Pilih Modul
                                </label>
                                <select
                                    value={selectedModule || ''}
                                    onChange={e => setSelectedModule(Number(e.target.value))}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Pilih modul…</option>
                                    {filters.modules.map(m => (
                                        <option key={m.id} value={m.id}>{m.title}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <button
                            onClick={handleFilterChange}
                            disabled={
                                (filterType === 'class'  && !selectedClass) ||
                                (filterType === 'module' && !selectedModule)
                            }
                            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Terapkan
                        </button>
                    </div>

                    <div className="mt-3 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg text-xs text-blue-700 dark:text-blue-300">
                        📊 Menampilkan: <strong>{getFilterLabel()}</strong>
                    </div>
                </div>

                {/* ── Statistik Global ─────────────────────────── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                        { label: 'Total Mahasiswa',    value: globalStats.totalStudents.toLocaleString('id-ID'), icon: User,       color: 'text-blue-500',   bg: 'bg-blue-50 dark:bg-blue-900/20'   },
                        { label: 'Rata-rata Poin',     value: globalStats.averagePoints.toLocaleString('id-ID'), icon: TrendingUp, color: 'text-green-500',  bg: 'bg-green-50 dark:bg-green-900/20' },
                        { label: filterType === 'module' ? 'Modul' : 'Total Modul', value: String(globalStats.totalModules), icon: BookOpen, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
                        { label: 'Tingkat Penyelesaian', value: `${globalStats.completionRate}%`, icon: Target, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
                    ].map(({ label, value, icon: Icon, color, bg }) => (
                        <div key={label} className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700">
                            <div className={`w-9 h-9 ${bg} rounded-lg flex items-center justify-center mb-3`}>
                                <Icon className={`h-5 w-5 ${color}`} />
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{label}</p>
                            <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
                        </div>
                    ))}
                </div>

                {/* ── Podium 3 Besar ───────────────────────────── */}
                {top3.length >= 3 && (
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
                        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                            <Crown className="h-5 w-5 text-yellow-500" />
                            3 Besar
                        </h2>

                        {/*
                          Kunci podium rata bawah:
                          - Container: items-end flex gap-3 justify-center
                          - Setiap PodiumCard: flex-col items-center justify-end
                          - Platform ada di BAWAH setiap kartu dengan tinggi tetap
                          - Info pemain tumbuh ke atas secara natural
                        */}
                        <div className="flex items-end justify-center gap-2 sm:gap-6">
                            {podiumOrder.map(pos => {
                                const student = top3[pos - 1];
                                if (!student) return null;
                                return <PodiumCard key={pos} student={student} position={pos} />;
                            })}
                        </div>
                    </div>
                )}

                {/* ── Tabel Peringkat Lengkap ───────────────────── */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-base font-bold text-gray-900 dark:text-white">
                            Peringkat Lengkap
                        </h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700/60">
                                <tr>
                                    {['Peringkat', 'Mahasiswa', 'Poin', 'Modul Selesai', 'Kemajuan', 'Level'].map(h => (
                                        <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {leaderboard.map(student => {
                                    const progressPct = student.totalModules > 0
                                        ? Math.round((student.completedModules / student.totalModules) * 100)
                                        : 0;

                                    return (
                                        <tr
                                            key={student.id}
                                            className={`transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/40 ${
                                                student.isCurrentUser
                                                    ? 'bg-blue-50 dark:bg-blue-900/20'
                                                    : ''
                                            }`}
                                        >
                                            {/* Peringkat */}
                                            <td className="px-5 py-4 whitespace-nowrap">
                                                <div className="flex items-center w-8">
                                                    {getRankCell(student.rank)}
                                                </div>
                                            </td>

                                            {/* Mahasiswa */}
                                            <td className="px-5 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${
                                                        student.isCurrentUser
                                                            ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
                                                            : 'bg-gradient-to-br from-gray-400 to-slate-500'
                                                    }`}>
                                                        {student.avatar}
                                                    </div>
                                                    <div>
                                                        <div className={`text-sm font-medium ${
                                                            student.isCurrentUser
                                                                ? 'text-blue-600 dark:text-blue-400'
                                                                : 'text-gray-900 dark:text-white'
                                                        }`}>
                                                            {student.name}
                                                            {student.isCurrentUser && (
                                                                <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded-full">
                                                                    Anda
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="text-xs text-gray-400 dark:text-gray-500">
                                                            Bergabung {student.joinedDate}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Poin */}
                                            <td className="px-5 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-1 text-sm font-bold text-gray-900 dark:text-white">
                                                    <Flame className="w-3.5 h-3.5 text-orange-500" />
                                                    {student.points.toLocaleString('id-ID')}
                                                </div>
                                            </td>

                                            {/* Modul Selesai */}
                                            <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                                {student.completedModules} / {student.totalModules}
                                            </td>

                                            {/* Kemajuan */}
                                            <td className="px-5 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                                        <div
                                                            className="bg-gradient-to-r from-blue-500 to-indigo-500 h-1.5 rounded-full transition-all duration-500"
                                                            style={{ width: `${progressPct}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400 w-8">
                                                        {progressPct}%
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Level */}
                                            <td className="px-5 py-4 whitespace-nowrap">
                                                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${LEVEL_STYLE[student.level] ?? LEVEL_STYLE.Beginner}`}>
                                                    {student.level}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ── Performa Anda ─────────────────────────────── */}
                {currentUser && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-2xl border border-blue-100 dark:border-gray-700">
                        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                            <User className="w-4 h-4 text-blue-500" />
                            Performa Anda
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: 'Peringkat',     value: `#${currentUser.rank}`,                              color: 'text-blue-600 dark:text-blue-400'  },
                                { label: 'Total Poin',    value: currentUser.points.toLocaleString('id-ID'),           color: 'text-gray-900 dark:text-white'     },
                                { label: 'Modul',         value: `${currentUser.completedModules}/${currentUser.totalModules}`, color: 'text-gray-900 dark:text-white' },
                                { label: 'Level',         value: currentUser.level,                                   color: 'text-gray-900 dark:text-white'     },
                            ].map(({ label, value, color }) => (
                                <div key={label} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-white/60 dark:border-gray-700">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</p>
                                    <p className={`text-2xl font-bold ${color}`}>{value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </AppLayout>
    );
}
