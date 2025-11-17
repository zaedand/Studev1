import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { PageProps as InertiaPageProps } from '@inertiajs/core';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    BookOpen,
    Users,
    GraduationCap,
    TrendingUp,
    FileText,
    Trophy,
    Activity,
    Plus,
    Edit,
    Eye,
    Target,
    BarChart3,
    ChevronRight
} from 'lucide-react';

interface Module {
    id: number;
    title: string;
    description: string;
    order_number: number;
    completion_rate: number;
    total_students: number;
    completed_students: number;
}

interface ClassRoom {
    id: number;
    name: string;
    code: string;
    students_count: number;
    created_at: string;
}

interface RecentActivity {
    student_name: string;
    module_title: string;
    score: number;
    created_at: string;
}

interface Stats {
    totalModules: number;
    totalStudents: number;
    totalClasses: number;
    averagePoints: number;
}

interface PageProps extends InertiaPageProps {
    stats: Stats;
    modules: Module[];
    classes: ClassRoom[];
    recentActivities: RecentActivity[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Instructor Dashboard',
        href: '/instructor/dashboard',
    },
];

export default function InstructorDashboard() {
    const { stats, modules, classes, recentActivities } = usePage<PageProps>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Instructor Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4 overflow-x-auto">

                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                        <GraduationCap className="h-8 w-8 text-indigo-600" />
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Instructor Dashboard
                        </h1>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">
                        Kelola modul pembelajaran, monitoring progress mahasiswa, dan analisis performa kelas
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Total Modules</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {stats.totalModules}
                                </p>
                            </div>
                            <BookOpen className="h-8 w-8 text-blue-500" />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Total Students</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {stats.totalStudents}
                                </p>
                            </div>
                            <Users className="h-8 w-8 text-green-500" />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Total Classes</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {stats.totalClasses}
                                </p>
                            </div>
                            <GraduationCap className="h-8 w-8 text-purple-500" />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Points</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {stats.averagePoints.toLocaleString()}
                                </p>
                            </div>
                            <TrendingUp className="h-8 w-8 text-orange-500" />
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Quick Actions
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Link
                            href="/instructor/modules"
                            className="flex items-center gap-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-xl hover:shadow-md transition-all duration-200 border border-blue-200 dark:border-blue-800"
                        >
                            <BookOpen className="h-8 w-8 text-blue-600" />
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">Modules</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Kelola modul</p>
                            </div>
                        </Link>

                        <Link
                            href="/instructor/classes"
                            className="flex items-center gap-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-xl hover:shadow-md transition-all duration-200 border border-purple-200 dark:border-purple-800"
                        >
                            <Users className="h-8 w-8 text-purple-600" />
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">Classes</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Kelola kelas</p>
                            </div>
                        </Link>

                        <Link
                            href="/leaderboard"
                            className="flex items-center gap-4 bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 p-4 rounded-xl hover:shadow-md transition-all duration-200 border border-yellow-200 dark:border-yellow-800"
                        >
                            <Trophy className="h-8 w-8 text-yellow-600" />
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">Leaderboard</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Lihat ranking</p>
                            </div>
                        </Link>

                        <Link
                            href="/compiler"
                            className="flex items-center gap-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-xl hover:shadow-md transition-all duration-200 border border-green-200 dark:border-green-800"
                        >
                            <FileText className="h-8 w-8 text-green-600" />
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">Compiler</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Test code</p>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Modules Overview */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Modules Overview
                        </h2>
                        <Link
                            href="/instructor/modules/create"
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                            Add Module
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                        Module
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                        Completion Rate
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                        Students
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {modules.map((module) => (
                                    <tr key={module.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-6 py-4">
                                            <Link
                                                href={`/instructor/modules/${module.id}`}
                                                className="group"
                                            >
                                                <div className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 flex items-center gap-2">
                                                    {module.title}
                                                    <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    {module.description.substring(0, 60)}...
                                                </div>
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-32 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                                    <div
                                                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                                        style={{ width: `${module.completion_rate}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                                    {module.completion_rate}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-900 dark:text-white">
                                                {module.completed_students}/{module.total_students}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={`/instructor/modules/${module.id}`}
                                                    className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors group"
                                                    title="View Details"
                                                >
                                                    <Eye className="h-4 w-4 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                                                </Link>
                                                <Link
                                                    href={`/instructor/modules/${module.id}/edit`}
                                                    className="p-2 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-lg transition-colors group"
                                                    title="Edit Module"
                                                >
                                                    <Edit className="h-4 w-4 text-gray-600 dark:text-gray-400 group-hover:text-amber-600 dark:group-hover:text-amber-400" />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {modules.length === 0 && (
                        <div className="text-center py-12">
                            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-500 dark:text-gray-400 mb-4">No modules created yet</p>
                            <Link
                                href="/instructor/modules/create"
                                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                            >
                                <Plus className="h-4 w-4" />
                                Create Your First Module
                            </Link>
                        </div>
                    )}
                </div>

                {/* Classes & Recent Activities */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Classes */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Classes
                            </h2>
                            <Link
                                href="/instructor/classes"
                                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                            >
                                View All
                                <ChevronRight className="h-4 w-4" />
                            </Link>
                        </div>
                        <div className="p-6 space-y-4">
                            {classes.slice(0, 5).map((classRoom) => (
                                <div
                                    key={classRoom.id}
                                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                                >
                                    <div>
                                        <h3 className="font-medium text-gray-900 dark:text-white">
                                            {classRoom.name}
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {classRoom.code}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {classRoom.students_count}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            students
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {classes.length === 0 && (
                                <p className="text-center text-gray-500 dark:text-gray-400 py-8">No classes yet</p>
                            )}
                        </div>
                    </div>

                    {/* Recent Activities */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <Activity className="h-5 w-5" />
                                Recent Activities
                            </h2>
                        </div>
                        <div className="p-6 space-y-4">
                            {recentActivities.map((activity, index) => (
                                <div
                                    key={index}
                                    className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                                >
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                        <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-900 dark:text-white">
                                            <span className="font-medium">{activity.student_name}</span>
                                            {' '}completed quiz in{' '}
                                            <span className="font-medium">{activity.module_title}</span>
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                Score: {activity.score}
                                            </span>
                                            <span className="text-xs text-gray-400">•</span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                {new Date(activity.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {recentActivities.length === 0 && (
                                <p className="text-center text-gray-500 dark:text-gray-400 py-8">No recent activities</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
