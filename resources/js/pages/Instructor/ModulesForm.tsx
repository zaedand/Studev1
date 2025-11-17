import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { PageProps as InertiaPageProps } from '@inertiajs/core';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    BookOpen,
    Users,
    CheckCircle2,
    Edit,
    Trash2,
    ArrowLeft,
    Target,
    FileText,
    Lightbulb,
    ClipboardList,
    PlayCircle,
    TrendingUp,
    Calendar,
    BarChart3,
    AlertCircle,
    Power,
    Award,
    List
} from 'lucide-react';
import { useState } from 'react';

interface Module {
    id: number;
    title: string;
    description: string;
    order_number: number;
    cp_atp: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

interface CPMK {
    id: number;
    content: any;
    point_reward: number;
}

interface LearningObjective {
    id: number;
    content: any;
    point_reward: number;
}

interface Component {
    id: number;
    title?: string;
    name?: string;
    description?: string;
}

interface Statistics {
    total_students: number;
    completed_students: number;
    completion_rate: number;
    total_components: number;
}

interface StudentProgress {
    id: number;
    name: string;
    email: string;
    progress_percentage: number;
}

interface PageProps extends InertiaPageProps {
    module: Module;
    cpmks: CPMK[];
    learningObjectives: LearningObjective[];
    materials: Component[];
    enrichments: Component[];
    quizzes: Component[];
    assignments: Component[];
    statistics: Statistics;
    studentProgress: StudentProgress[];
}

export default function ModuleDetail() {
    const { module, cpmks, learningObjectives, materials, enrichments, quizzes, assignments, statistics, studentProgress } = usePage<PageProps>().props;
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/instructor/dashboard' },
        { title: 'Modules', href: '/instructor/modules' },
        { title: module.title, href: `/instructor/modules/${module.id}` },
    ];

    const handleDelete = () => {
        router.delete(`/instructor/modules/${module.id}`, {
            onSuccess: () => {
                setShowDeleteModal(false);
            },
        });
    };

    const handleToggleActive = () => {
        router.post(`/instructor/modules/${module.id}/toggle-active`);
    };

    // Helper function to render content (array or string)
    const renderContent = (content: any) => {
        if (Array.isArray(content)) {
            return content.join(', ');
        }
        if (typeof content === 'object') {
            return JSON.stringify(content);
        }
        return content;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Module: ${module.title}`} />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4 overflow-x-auto">

                {/* Header */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-xl">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Link
                                href="/instructor/modules"
                                className="p-2 hover:bg-white dark:hover:bg-gray-600 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                            </Link>
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {module.title}
                                    </h1>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                        module.is_active
                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                            : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                    }`}>
                                        {module.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <p className="text-gray-600 dark:text-gray-300">{module.description}</p>
                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="h-4 w-4" />
                                        Created: {module.created_at}
                                    </span>
                                    <span>•</span>
                                    <span>Order: #{module.order_number}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleToggleActive}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    module.is_active
                                        ? 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                                        : 'bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-700 dark:text-green-400'
                                }`}
                            >
                                <Power className="h-4 w-4" />
                                {module.is_active ? 'Deactivate' : 'Activate'}
                            </button>
                            <Link
                                href={`/instructor/modules/${module.id}/edit`}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                            >
                                <Edit className="h-4 w-4" />
                                Edit
                            </Link>
                            <button
                                onClick={() => setShowDeleteModal(true)}
                                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                            >
                                <Trash2 className="h-4 w-4" />
                                Delete
                            </button>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Components</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {statistics.total_components}
                                    </p>
                                </div>
                                <BookOpen className="h-8 w-8 text-blue-500" />
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Students</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {statistics.total_students}
                                    </p>
                                </div>
                                <Users className="h-8 w-8 text-green-500" />
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {statistics.completed_students}
                                    </p>
                                </div>
                                <CheckCircle2 className="h-8 w-8 text-purple-500" />
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {statistics.completion_rate}%
                                    </p>
                                </div>
                                <TrendingUp className="h-8 w-8 text-orange-500" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* CP/ATP Section */}
                {module.cp_atp && (
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                            <Target className="h-5 w-5 text-indigo-600" />
                            Capaian Pembelajaran (CP/ATP)
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{module.cp_atp}</p>
                    </div>
                )}

                {/* CPMKs and Learning Objectives - Full Width Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* CPMKs */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/30">
                                    <Award className="h-5 w-5" />
                                </div>
                                CPMKs (Capaian Pembelajaran Mata Kuliah)
                                <span className="ml-auto text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                    {cpmks.length}
                                </span>
                            </h3>
                        </div>
                        <div className="p-4">
                            {cpmks.length > 0 ? (
                                <ul className="space-y-3">
                                    {cpmks.map((cpmk, index) => (
                                        <li key={cpmk.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                            <div className="flex items-start gap-3">
                                                <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-semibold">
                                                    {index + 1}
                                                </span>
                                                <div className="flex-1">
                                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                                        {renderContent(cpmk.content)}
                                                    </p>
                                                    <div className="mt-2 flex items-center gap-2">
                                                        <Award className="h-3 w-3 text-amber-500" />
                                                        <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                                                            {cpmk.point_reward} points
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-center text-gray-500 dark:text-gray-400 py-8 text-sm">No CPMKs added yet</p>
                            )}
                        </div>
                    </div>

                    {/* Learning Objectives */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-yellow-50 text-yellow-600 dark:bg-yellow-900/30">
                                    <List className="h-5 w-5" />
                                </div>
                                Learning Objectives (Tujuan Pembelajaran)
                                <span className="ml-auto text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                    {learningObjectives.length}
                                </span>
                            </h3>
                        </div>
                        <div className="p-4">
                            {learningObjectives.length > 0 ? (
                                <ul className="space-y-3">
                                    {learningObjectives.map((objective, index) => (
                                        <li key={objective.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                            <div className="flex items-start gap-3">
                                                <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-full text-sm font-semibold">
                                                    {index + 1}
                                                </span>
                                                <div className="flex-1">
                                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                                        {renderContent(objective.content)}
                                                    </p>
                                                    <div className="mt-2 flex items-center gap-2">
                                                        <Award className="h-3 w-3 text-amber-500" />
                                                        <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                                                            {objective.point_reward} points
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-center text-gray-500 dark:text-gray-400 py-8 text-sm">No learning objectives added yet</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Module Components */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Materials */}
                    <ComponentCard
                        title="Materials"
                        icon={<FileText className="h-5 w-5" />}
                        color="green"
                        items={materials}
                        emptyMessage="No materials added yet"
                    />

                    {/* Enrichments */}
                    <ComponentCard
                        title="Enrichments"
                        icon={<Lightbulb className="h-5 w-5" />}
                        color="purple"
                        items={enrichments}
                        emptyMessage="No enrichments added yet"
                    />

                    {/* Quizzes */}
                    <ComponentCard
                        title="Quizzes"
                        icon={<ClipboardList className="h-5 w-5" />}
                        color="orange"
                        items={quizzes}
                        emptyMessage="No quizzes added yet"
                    />

                    {/* Assignments */}
                    <ComponentCard
                        title="Assignments"
                        icon={<PlayCircle className="h-5 w-5" />}
                        color="red"
                        items={assignments}
                        emptyMessage="No assignments added yet"
                    />
                </div>

                {/* Student Progress */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-indigo-600" />
                            Student Progress (Top 10)
                        </h2>
                    </div>
                    <div className="p-6 space-y-3">
                        {studentProgress.length > 0 ? (
                            studentProgress.map((student) => (
                                <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900 dark:text-white">{student.name}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{student.email}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-32 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                            <div
                                                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${student.progress_percentage}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-sm font-semibold text-gray-900 dark:text-white w-12 text-right">
                                            {student.progress_percentage}%
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-500 dark:text-gray-400 py-8">No student data available</p>
                        )}
                    </div>
                </div>

                {/* Delete Confirmation Modal */}
                {showDeleteModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                                    <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Module</h3>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 mb-6">
                                Are you sure you want to delete "<strong>{module.title}</strong>"?
                                This action cannot be undone and will delete all related content.
                            </p>
                            <div className="flex items-center gap-3 justify-end">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                                >
                                    Delete Module
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

interface ComponentCardProps {
    title: string;
    icon: React.ReactNode;
    color: string;
    items: Component[];
    emptyMessage: string;
}

function ComponentCard({ title, icon, color, items, emptyMessage }: ComponentCardProps) {
    const colorClasses = {
        blue: 'text-blue-600 bg-blue-50 dark:bg-blue-900/30',
        yellow: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/30',
        green: 'text-green-600 bg-green-50 dark:bg-green-900/30',
        purple: 'text-purple-600 bg-purple-50 dark:bg-purple-900/30',
        orange: 'text-orange-600 bg-orange-50 dark:bg-orange-900/30',
        red: 'text-red-600 bg-red-50 dark:bg-red-900/30',
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
                        {icon}
                    </div>
                    {title}
                    <span className="ml-auto text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {items.length}
                    </span>
                </h3>
            </div>
            <div className="p-4">
                {items.length > 0 ? (
                    <ul className="space-y-2">
                        {items.map((item, index) => (
                            <li key={item.id} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                                <span className="text-gray-400 dark:text-gray-500 mt-0.5 font-semibold">{index + 1}.</span>
                                <span>{item.title || item.name || item.description}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-8 text-sm">{emptyMessage}</p>
                )}
            </div>
        </div>
    );
}
