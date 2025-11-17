import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { PageProps as InertiaPageProps } from '@inertiajs/core';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    Users,
    Plus,
    Edit,
    Trash2,
    GraduationCap,
    Calendar,
    X,
    Save
} from 'lucide-react';
import { useState, FormEventHandler } from 'react';

interface ClassRoom {
    id: number;
    name: string;
    code: string;
    description: string;
    academic_year: number;
    semester: 'ganjil' | 'genap';
    is_active: boolean;
    students_count: number;
    created_at: string;
}

interface PageProps extends InertiaPageProps {
    classes: ClassRoom[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/instructor/dashboard' },
    { title: 'Classes', href: '/instructor/classes' },
];

export default function ClassesIndex() {
    const { classes } = usePage<PageProps>().props;
    const [showModal, setShowModal] = useState(false);
    const [editingClass, setEditingClass] = useState<ClassRoom | null>(null);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Classes Management" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4 overflow-x-auto">

                {/* Header */}
                <div className="flex items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-xl">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <GraduationCap className="h-8 w-8 text-purple-600" />
                            Classes Management
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300 mt-1">
                            Manage student classes and assignments
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            setEditingClass(null);
                            setShowModal(true);
                        }}
                        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors shadow-lg"
                    >
                        <Plus className="h-5 w-5" />
                        Add New Class
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Total Classes</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {classes.length}
                                </p>
                            </div>
                            <GraduationCap className="h-8 w-8 text-purple-500" />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Active Classes</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {classes.filter(c => c.is_active).length}
                                </p>
                            </div>
                            <Users className="h-8 w-8 text-green-500" />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Total Students</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {classes.reduce((sum, c) => sum + c.students_count, 0)}
                                </p>
                            </div>
                            <Users className="h-8 w-8 text-blue-500" />
                        </div>
                    </div>
                </div>

                {/* Classes Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {classes.map((classRoom) => (
                        <div
                            key={classRoom.id}
                            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                                        {classRoom.name}
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {classRoom.code}
                                    </p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                    classRoom.is_active
                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                }`}>
                                    {classRoom.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </div>

                            {classRoom.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                    {classRoom.description}
                                </p>
                            )}

                            <div className="space-y-2 mb-4">
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <Calendar className="h-4 w-4" />
                                    <span>
                                        {classRoom.academic_year} - Semester {classRoom.semester === 'ganjil' ? 'Ganjil' : 'Genap'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <Users className="h-4 w-4" />
                                    <span>{classRoom.students_count} Students</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <button
                                    onClick={() => {
                                        setEditingClass(classRoom);
                                        setShowModal(true);
                                    }}
                                    className="flex-1 flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-lg text-sm transition-colors"
                                >
                                    <Edit className="h-4 w-4" />
                                    Edit
                                </button>
                                <button
                                    onClick={() => {
                                        if (confirm(`Delete ${classRoom.name}?`)) {
                                            router.delete(`/instructor/classes/${classRoom.id}`);
                                        }
                                    }}
                                    className="flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 px-4 py-2 rounded-lg text-sm transition-colors"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Class Modal */}
                {showModal && (
                    <ClassModal
                        classRoom={editingClass}
                        onClose={() => {
                            setShowModal(false);
                            setEditingClass(null);
                        }}
                    />
                )}
            </div>
        </AppLayout>
    );
}

// Class Modal Component
interface ClassModalProps {
    classRoom: ClassRoom | null;
    onClose: () => void;
}

function ClassModal({ classRoom, onClose }: ClassModalProps) {
    const isEditing = !!classRoom;

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: classRoom?.name || '',
        code: classRoom?.code || '',
        description: classRoom?.description || '',
        academic_year: classRoom?.academic_year || new Date().getFullYear(),
        semester: classRoom?.semester || 'ganjil' as 'ganjil' | 'genap',
        is_active: classRoom?.is_active ?? true,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        if (isEditing) {
            put(`/instructor/classes/${classRoom.id}`, {
                onSuccess: () => {
                    reset();
                    onClose();
                },
            });
        } else {
            post('/instructor/classes', {
                onSuccess: () => {
                    reset();
                    onClose();
                },
            });
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {isEditing ? 'Edit Class' : 'Add New Class'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={submit} className="p-6 space-y-6">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Class Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="e.g., Kelas A"
                        />
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                        )}
                    </div>

                    {/* Code */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Class Code <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={data.code}
                            onChange={(e) => setData('code', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="e.g., 2024-A-PROG"
                        />
                        {errors.code && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.code}</p>
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
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="Class description..."
                        />
                    </div>

                    {/* Academic Year & Semester */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Academic Year <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                value={data.academic_year}
                                onChange={(e) => setData('academic_year', parseInt(e.target.value))}
                                min="2020"
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            />
                            {errors.academic_year && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.academic_year}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Semester <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={data.semester}
                                onChange={(e) => setData('semester', e.target.value as 'ganjil' | 'genap')}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            >
                                <option value="ganjil">Ganjil</option>
                                <option value="genap">Genap</option>
                            </select>
                            {errors.semester && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.semester}</p>
                            )}
                        </div>
                    </div>

                    {/* Active Status */}
                    <div>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={data.is_active}
                                onChange={(e) => setData('is_active', e.target.checked)}
                                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                Active (visible to students)
                            </span>
                        </label>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg transition-colors"
                        >
                            <Save className="h-4 w-4" />
                            {processing ? 'Saving...' : (isEditing ? 'Update' : 'Create')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
