import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { PageProps as InertiaPageProps } from '@inertiajs/core';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Save, X } from 'lucide-react';

interface ClassRoom {
    id: number;
    name: string;
    description: string;
    is_active: boolean;
}

interface PageProps extends InertiaPageProps {
    class: ClassRoom;
}

export default function ClassEdit() {
    const { class: classRoom } = usePage<PageProps>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/instructor/dashboard' },
        { title: 'Classes', href: '/instructor/classes' },
        { title: classRoom.name, href: `/instructor/classes/${classRoom.id}` },
        { title: 'Edit', href: '#' },
    ];

    const { data, setData, put, processing, errors } = useForm({
        name: classRoom.name || '',
        description: classRoom.description || '',
        instructor_id: '' as any,
        is_active: classRoom.is_active ?? true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/instructor/classes/${classRoom.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit: ${classRoom.name}`} />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4 overflow-x-auto">

                {/* Header */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-xl">
                    <div className="flex items-center gap-3">
                        <Link
                            href={`/instructor/classes/${classRoom.id}`}
                            className="p-2 hover:bg-white dark:hover:bg-gray-600 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Edit Class
                            </h1>
                            <p className="text-gray-600 dark:text-gray-300">
                                Update class information and settings
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                            Class Information
                        </h2>

                        <div className="space-y-6">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Class Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className={`w-full px-4 py-2 rounded-lg border ${
                                        errors.name
                                            ? 'border-red-500 focus:ring-red-500'
                                            : 'border-gray-300 dark:border-gray-600 focus:ring-purple-500'
                                    } dark:bg-gray-700 dark:text-white focus:ring-2 focus:outline-none`}
                                    placeholder="e.g., Programming Class A"
                                />
                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                                )}
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows={4}
                                    className={`w-full px-4 py-2 rounded-lg border ${
                                        errors.description
                                            ? 'border-red-500 focus:ring-red-500'
                                            : 'border-gray-300 dark:border-gray-600 focus:ring-purple-500'
                                    } dark:bg-gray-700 dark:text-white focus:ring-2 focus:outline-none resize-none`}
                                    placeholder="Describe the class purpose and objectives..."
                                />
                                {errors.description && (
                                    <p className="mt-1 text-sm text-red-500">{errors.description}</p>
                                )}
                            </div>

                            {/* Active Status */}
                            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={data.is_active}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                    className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                />
                                <label htmlFor="is_active" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                                    <div className="font-semibold">Active Class</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        Only active classes are visible to students
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                        <Link
                            href={`/instructor/classes/${classRoom.id}`}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                        >
                            <X className="h-4 w-4" />
                            Cancel
                        </Link>

                        <button
                            onClick={handleSubmit}
                            disabled={processing}
                            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-6 py-2 rounded-lg transition-colors"
                        >
                            <Save className="h-4 w-4" />
                            {processing ? 'Updating...' : 'Update Class'}
                        </button>
                    </div>
                </div>

                {/* Help Section */}
                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-6">
                    <h3 className="font-semibold text-purple-900 dark:text-purple-300 mb-2">
                        💡 Tips for Managing Classes
                    </h3>
                    <ul className="space-y-2 text-sm text-purple-800 dark:text-purple-200">
                        <li>• Use descriptive names that clearly identify the class</li>
                        <li>• Add detailed descriptions to help students understand class objectives</li>
                        <li>• Set classes as inactive when not currently in session</li>
                        <li>• Manage student enrollment from the class detail page</li>
                    </ul>
                </div>
            </div>
        </AppLayout>
    );
}
