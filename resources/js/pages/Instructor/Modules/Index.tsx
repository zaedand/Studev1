import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { PageProps as InertiaPageProps } from '@inertiajs/core';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    BookOpen,
    Plus,
    Edit,
    Eye,
    Trash2,
    Power,
    Users,
    CheckCircle2,
    GripVertical,
    BarChart3
} from 'lucide-react';
import { useState } from 'react';

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
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/instructor/dashboard' },
    { title: 'Modules', href: '/instructor/modules' },
];

export default function ModulesIndex() {
    const { modules } = usePage<PageProps>().props;
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedModule, setSelectedModule] = useState<Module | null>(null);

    const handleDelete = () => {
        if (selectedModule) {
            router.delete(`/instructor/modules/${selectedModule.id}`, {
                onSuccess: () => {
                    setShowDeleteModal(false);
                    setSelectedModule(null);
                },
            });
        }
    };

    const handleToggleActive = (module: Module) => {
        router.post(`/instructor/modules/${module.id}/toggle-active`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Modules Management" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4 overflow-x-auto">

                {/* Header */}
                <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-xl">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <BookOpen className="h-8 w-8 text-blue-600" />
                            Modules Management
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300 mt-1">
                            Kelola modul pembelajaran untuk mahasiswa
                        </p>
                    </div>
                    <Link
                        href="/instructor/modules/create"
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors shadow-lg"
                    >
                        <Plus className="h-5 w-5" />
                        Add New Module
                    </Link>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Total Modules</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {modules.length}
                                </p>
                            </div>
                            <BookOpen className="h-8 w-8 text-blue-500" />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Active Modules</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {modules.filter(m => m.is_active).length}
                                </p>
                            </div>
                            <CheckCircle2 className="h-8 w-8 text-green-500" />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Completion</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {modules.length > 0
                                        ? Math.round(modules.reduce((sum, m) => sum + m.completion_rate, 0) / modules.length)
                                        : 0}%
                                </p>
                            </div>
                            <BarChart3 className="h-8 w-8 text-purple-500" />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Total Components</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {modules.reduce((sum, m) =>
                                        sum + m.cpmks_count + m.learning_objectives_count +
                                        m.materials_count + m.enrichments_count +
                                        m.quizzes_count + m.assignments_count, 0
                                    )}
                                </p>
                            </div>
                            <Users className="h-8 w-8 text-orange-500" />
                        </div>
                    </div>
                </div>

                {/* Modules List */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                        Order
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                        Module
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                        Components
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                        Students
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                        Completion
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {modules.map((module) => (
                                    <tr key={module.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
                                                <span className="font-medium text-gray-900 dark:text-white">
                                                    #{module.order_number}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-white">
                                                    {module.title}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                                                    {module.description}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-wrap gap-1">
                                                {module.cpmks_count > 0 && (
                                                    <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-1 rounded">
                                                        CPMK: {module.cpmks_count}
                                                    </span>
                                                )}
                                                {module.materials_count > 0 && (
                                                    <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded">
                                                        Mat: {module.materials_count}
                                                    </span>
                                                )}
                                                {module.enrichments_count > 0 && (
                                                    <span className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 px-2 py-1 rounded">
                                                        Enr: {module.enrichments_count}
                                                    </span>
                                                )}
                                                {module.quizzes_count > 0 && (
                                                    <span className="text-xs bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 px-2 py-1 rounded">
                                                        Quiz: {module.quizzes_count}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 dark:text-white">
                                                {module.completed_students}/{module.total_students}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <div className="w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                                    <div
                                                        className={`h-2 rounded-full transition-all ${
                                                            module.completion_rate >= 75 ? 'bg-green-500' :
                                                            module.completion_rate >= 50 ? 'bg-yellow-500' :
                                                            module.completion_rate >= 25 ? 'bg-orange-500' : 'bg-red-500'
                                                        }`}
                                                        style={{ width: `${module.completion_rate}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {module.completion_rate}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => handleToggleActive(module)}
                                                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                                                    module.is_active
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200'
                                                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200'
                                                }`}
                                            >
                                                {module.is_active ? 'Active' : 'Inactive'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={`/instructor/modules/${module.id}`}
                                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                                </Link>
                                                <Link
                                                    href={`/instructor/modules/${module.id}/edit`}
                                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                </Link>
                                                <button
                                                    onClick={() => {
                                                        setSelectedModule(module);
                                                        setShowDeleteModal(true);
                                                    }}
                                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
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

                {/* Delete Confirmation Modal */}
                {showDeleteModal && selectedModule && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Delete Module
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-6">
                                Are you sure you want to delete "<strong>{selectedModule.title}</strong>"?
                                This will delete all related content and cannot be undone.
                            </p>
                            <div className="flex items-center gap-3 justify-end">
                                <button
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setSelectedModule(null);
                                    }}
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
