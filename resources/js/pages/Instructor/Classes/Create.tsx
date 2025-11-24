import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, X } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/instructor/dashboard' },
    { title: 'Classes', href: '/instructor/classes' },
    { title: 'Create', href: '#' },
];

export default function ClassCreate() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        description: '',
        instructor_id: '' as any,
        is_active: true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/instructor/classes', {
            onSuccess: () => reset(),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create New Class" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4 overflow-x-auto">

                {/* Header */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-xl">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/instructor/classes"
                            className="p-2 hover:bg-white dark:hover:bg-gray-600 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Create New Class
                            </h1>
                            <p className="text-gray-600 dark:text-gray-300">
                                Set up a new class to organize your students
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
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    Choose a descriptive name that identifies this class
                                </p>
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
                                    placeholder="Describe the class purpose, objectives, and any important information for students..."
                                />
                                {errors.description && (
                                    <p className="mt-1 text-sm text-red-500">{errors.description}</p>
                                )}
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    Optional: Provide details about this class
                                </p>
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
                            href="/instructor/classes"
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
                            {processing ? 'Creating...' : 'Create Class'}
                        </button>
                    </div>
                </div>

                {/* Help Section */}
                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-6">
                    <h3 className="font-semibold text-purple-900 dark:text-purple-300 mb-2">
                        💡 Getting Started
                    </h3>
                    <ul className="space-y-2 text-sm text-purple-800 dark:text-purple-200">
                        <li>• Create a class to organize and manage your students</li>
                        <li>• After creating, you can add students from the class detail page</li>
                        <li>• Use descriptive names to easily identify different classes</li>
                        <li>• Set as inactive if you're setting up the class for future use</li>
                        <li>• You can edit class information anytime from the class page</li>
                    </ul>
                </div>

                {/* Next Steps Info */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                        📋 Next Steps After Creating
                    </h3>
                    <ol className="space-y-2 text-sm text-blue-800 dark:text-blue-200 list-decimal list-inside">
                        <li>Add students to your class</li>
                        <li>Assign modules and learning materials</li>
                        <li>Monitor student progress and completion rates</li>
                        <li>Track class performance and engagement</li>
                    </ol>
                </div>
            </div>
        </AppLayout>
    );
}
