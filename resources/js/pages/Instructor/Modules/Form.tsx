import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { PageProps as InertiaPageProps } from '@inertiajs/core';
import { Head, useForm, usePage } from '@inertiajs/react';
import {
    BookOpen,
    ArrowLeft,
    Save,
} from 'lucide-react';
import { FormEventHandler } from 'react';

interface Module {
    id: number;
    title: string;
    description: string;
    order_number: number;
    cp_atp: string;
    is_active: boolean;
}

interface PageProps extends InertiaPageProps {
    module?: Module;
    nextOrderNumber?: number;
}

export default function ModuleForm() {
    const { module, nextOrderNumber } = usePage<PageProps>().props;
    const isEditing = !!module;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/instructor/dashboard' },
        { title: 'Modules', href: '/instructor/modules' },
        { title: isEditing ? 'Edit Module' : 'Create Module', href: '#' },
    ];

    const { data, setData, post, put, processing, errors } = useForm({
        title: module?.title || '',
        description: module?.description || '',
        order_number: module?.order_number || nextOrderNumber || 1,
        cp_atp: module?.cp_atp || '',
        is_active: module?.is_active ?? true,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        if (isEditing) {
            put(`/instructor/modules/${module.id}`);
        } else {
            post('/instructor/modules');
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEditing ? 'Edit Module' : 'Create Module'} />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4 overflow-x-auto">

                {/* Header */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-xl">
                    <div className="flex items-center gap-3">
                        <a
                            href="/instructor/modules"
                            className="p-2 hover:bg-white dark:hover:bg-gray-600 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                        </a>

                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                <BookOpen className="h-8 w-8 text-blue-600" />
                                {isEditing ? 'Edit Module' : 'Create New Module'}
                            </h1>
                            <p className="text-gray-600 dark:text-gray-300 mt-1">
                                {isEditing ? 'Update module information' : 'Add a new learning module'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <form onSubmit={submit} className="space-y-6">

                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Module Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                placeholder="e.g., Pengenalan Pemrograman"
                            />
                            {errors.title && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title}</p>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Description <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                rows={4}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                placeholder="Brief description of the module..."
                            />
                            {errors.description && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>
                            )}
                        </div>

                        {/* Order Number & Active Status */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Order Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    value={data.order_number}
                                    onChange={(e) => setData('order_number', parseInt(e.target.value))}
                                    min="1"
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                />
                                {errors.order_number && (
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.order_number}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Status
                                </label>
                                <div className="flex items-center gap-3 h-[42px]">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={data.is_active}
                                            onChange={(e) => setData('is_active', e.target.checked)}
                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">
                                            Active (visible to students)
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* CP/ATP */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Capaian Pembelajaran (CP/ATP)
                                <span className="text-gray-500 text-xs ml-2">(Optional)</span>
                            </label>
                            <textarea
                                value={data.cp_atp}
                                onChange={(e) => setData('cp_atp', e.target.value)}
                                rows={6}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white font-mono text-sm"
                                placeholder="Enter learning objectives..."
                            />
                            {errors.cp_atp && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.cp_atp}</p>
                            )}
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <a
                                href="/instructor/modules"
                                className="px-6 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                            >
                                Cancel
                            </a>

                            <button
                                type="submit"
                                disabled={processing}
                                className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
                            >
                                <Save className="h-4 w-4" />
                                {processing ? 'Saving...' : (isEditing ? 'Update Module' : 'Create Module')}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
