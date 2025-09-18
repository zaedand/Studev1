import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import {
    Users,
    BookOpen,
    Trophy,
    ClipboardList,
    Upload,
    Plus,
    Edit3,
    Trash2,
    Eye,
    UserPlus,
    Filter,
    Search,
    CheckCircle,
    Clock,
    AlertTriangle,
    BarChart3,
    TrendingUp,
    Calendar
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Leaderboard',
        href: '/leaderboard',
    },
];

const InstructorDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedClass, setSelectedClass] = useState(null);

    // Mock data
    const classes = [
        {
            id: 1,
            name: 'Kelas A',
            totalStudents: 25,
            activeStudents: 23,
            completionRate: 78,
            averageScore: 85
        },
        {
            id: 2,
            name: 'Kelas B',
            totalStudents: 28,
            activeStudents: 26,
            completionRate: 82,
            averageScore: 88
        },
        {
            id: 3,
            name: 'Kelas C',
            totalStudents: 22,
            activeStudents: 20,
            completionRate: 65,
            averageScore: 75
        }
    ];

    const students = [
        {
            id: 1,
            nim: '2024001',
            name: 'Ahmad Rizky',
            email: 'ahmad@example.com',
            totalPoints: 2450,
            rank: 1,
            completedModules: 7,
            lastActivity: '2 jam yang lalu',
            status: 'active'
        },
        {
            id: 2,
            nim: '2024002',
            name: 'Siti Nurhaliza',
            email: 'siti@example.com',
            totalPoints: 2350,
            rank: 2,
            completedModules: 6,
            lastActivity: '1 hari yang lalu',
            status: 'active'
        },
        {
            id: 3,
            nim: '2024003',
            name: 'Budi Santoso',
            email: 'budi@example.com',
            totalPoints: 1850,
            rank: 8,
            completedModules: 4,
            lastActivity: '3 hari yang lalu',
            status: 'inactive'
        }
    ];

    const overallStats = {
        totalClasses: classes.length,
        totalStudents: classes.reduce((sum, cls) => sum + cls.totalStudents, 0),
        activeStudents: classes.reduce((sum, cls) => sum + cls.activeStudents, 0),
        averageCompletion: Math.round(classes.reduce((sum, cls) => sum + cls.completionRate, 0) / classes.length)
    };

    const ClassCard = ({ classData }) => (
        <div
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-200 cursor-pointer"
            onClick={() => setSelectedClass(classData)}
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {classData.name}
                </h3>
                <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                        <Edit3 className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Mahasiswa</span>
                    <span className="font-medium text-gray-900 dark:text-white">{classData.totalStudents}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Aktif</span>
                    <span className="font-medium text-green-600 dark:text-green-400">{classData.activeStudents}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Rata-rata Completion</span>
                    <span className="font-medium text-blue-600 dark:text-blue-400">{classData.completionRate}%</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Rata-rata Nilai</span>
                    <span className="font-medium text-purple-600 dark:text-purple-400">{classData.averageScore}</span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <span>Progress Kelas</span>
                    <span>{classData.completionRate}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${classData.completionRate}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );

    const StudentRow = ({ student }) => (
        <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
            <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                        student.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                    }`}></div>
                    <div>
                        <p className="font-medium text-gray-900 dark:text-white">{student.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{student.nim}</p>
                    </div>
                </div>
            </td>
            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                {student.email}
            </td>
            <td className="px-4 py-3">
                <div className="flex items-center gap-1">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    <span className="font-medium text-gray-900 dark:text-white">{student.totalPoints}</span>
                </div>
            </td>
            <td className="px-4 py-3">
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                    #{student.rank}
                </span>
            </td>
            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                {student.completedModules}/8
            </td>
            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                {student.lastActivity}
            </td>
            <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                    <button className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded">
                        <Eye className="h-4 w-4" />
                    </button>
                    <button className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded">
                        <Edit3 className="h-4 w-4" />
                    </button>
                    <button className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded">
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </td>
        </tr>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
        <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Instructor Dashboard
                    </h1>
                </div>

                {/* Navigation Tabs */}
                <div className="flex border-b border-gray-200 dark:border-gray-700 mb-8">
                    {[
                        { id: 'overview', label: 'Overview', icon: BarChart3 },
                        { id: 'classes', label: 'Manajemen Kelas', icon: Users },
                        { id: 'students', label: 'Daftar Mahasiswa', icon: UserPlus }
                    ].map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
                                    activeTab === tab.id
                                        ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                            >
                                <Icon className="h-5 w-5" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="space-y-8">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Kelas</p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {overallStats.totalClasses}
                                        </p>
                                    </div>
                                    <Users className="h-8 w-8 text-blue-500" />
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Mahasiswa</p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {overallStats.totalStudents}
                                        </p>
                                    </div>
                                    <Users className="h-8 w-8 text-green-500" />
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Mahasiswa Aktif</p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {overallStats.activeStudents}
                                        </p>
                                    </div>
                                    <CheckCircle className="h-8 w-8 text-orange-500" />
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Rata-rata Progress</p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {overallStats.averageCompletion}%
                                        </p>
                                    </div>
                                    <TrendingUp className="h-8 w-8 text-purple-500" />
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Aktivitas Terkini
                            </h3>
                            <div className="space-y-4">
                                {[
                                    { type: 'quiz', student: 'Ahmad Rizky', action: 'menyelesaikan Quiz Modul 3', time: '2 jam yang lalu' },
                                    { type: 'upload', student: 'Siti Nurhaliza', action: 'mengumpulkan Praktikum Modul 2', time: '4 jam yang lalu' },
                                    { type: 'complete', student: 'Budi Santoso', action: 'menyelesaikan Modul 1', time: '1 hari yang lalu' }
                                ].map((activity, index) => (
                                    <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <div className={`p-2 rounded-full ${
                                            activity.type === 'quiz' ? 'bg-blue-100 dark:bg-blue-900/30' :
                                            activity.type === 'upload' ? 'bg-green-100 dark:bg-green-900/30' :
                                            'bg-purple-100 dark:bg-purple-900/30'
                                        }`}>
                                            {activity.type === 'quiz' && <ClipboardList className="h-4 w-4 text-blue-600" />}
                                            {activity.type === 'upload' && <Upload className="h-4 w-4 text-green-600" />}
                                            {activity.type === 'complete' && <CheckCircle className="h-4 w-4 text-purple-600" />}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-900 dark:text-white">
                                                <span className="font-medium">{activity.student}</span> {activity.action}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Classes Tab */}
                {activeTab === 'classes' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Manajemen Kelas
                            </h2>
                            <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                                <Plus className="h-4 w-4" />
                                Tambah Kelas
                            </button>
                        </div>

                        {!selectedClass ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {classes.map((classData) => (
                                    <ClassCard key={classData.id} classData={classData} />
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Class Header */}
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => setSelectedClass(null)}
                                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                    >
                                        ← Kembali ke Daftar Kelas
                                    </button>
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                        Detail {selectedClass.name}
                                    </h2>
                                </div>

                                {/* Student Management */}
                                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                Daftar Mahasiswa
                                            </h3>
                                            <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
                                                <UserPlus className="h-4 w-4" />
                                                Tambah Mahasiswa
                                            </button>
                                        </div>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-50 dark:bg-gray-700">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                                                        Nama & NIM
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                                                        Email
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                                                        Points
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                                                        Rank
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                                                        Progress
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                                                        Terakhir Aktif
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                                                        Aksi
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {students.map((student) => (
                                                    <StudentRow key={student.id} student={student} />
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Students Tab */}
                {activeTab === 'students' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Semua Mahasiswa
                            </h2>
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <input
                                        type="text"
                                        placeholder="Cari mahasiswa..."
                                        className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <button className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors">
                                    <Filter className="h-4 w-4" />
                                    Filter
                                </button>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Nama & NIM
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Email
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Points
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Rank
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Progress
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Terakhir Aktif
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map((student) => (
                                        <StudentRow key={student.id} student={student} />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    </AppLayout>
    );
};

export default InstructorDashboard;
