import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { PageProps as InertiaPageProps } from '@inertiajs/core';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
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
    List,
    Plus,
    X,
    Upload,
    Save,
    Link as LinkIcon,
    Video
} from 'lucide-react';
import { useState, FormEventHandler } from 'react';

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
    content: string[] | string;
    point_reward: number;
}

interface LearningObjective {
    id: number;
    content: string[] | string;
    point_reward: number;
}

interface Material {
    id: number;
    title: string;
    description: string;
    file_name: string;
    file_path: string;
    point_reward: number;
}

interface Enrichment {
    id: number;
    title: string;
    description: string;
    type: 'video' | 'link';
    url: string;
    order_number: number;
    point_reward: number;
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
    materials: Material[];
    enrichments: Enrichment[];
    quizzes: any[];
    assignments: any[];
    statistics: Statistics;
    studentProgress: StudentProgress[];
}

export default function ModuleDetail() {
    const { module, cpmks, learningObjectives, materials, enrichments, quizzes, assignments, statistics, studentProgress } = usePage<PageProps>().props;

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showCpmkModal, setShowCpmkModal] = useState(false);
    const [showLearningObjModal, setShowLearningObjModal] = useState(false);
    const [showMaterialModal, setShowMaterialModal] = useState(false);
    const [showEnrichmentModal, setShowEnrichmentModal] = useState(false);

    const [editingCpmk, setEditingCpmk] = useState<CPMK | null>(null);
    const [editingLearningObj, setEditingLearningObj] = useState<LearningObjective | null>(null);
    const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
    const [editingEnrichment, setEditingEnrichment] = useState<Enrichment | null>(null);

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

    // Helper function to render content
    const renderContent = (content: any) => {
        if (Array.isArray(content)) {
            return content;
        }
        if (typeof content === 'string') {
            try {
                const parsed = JSON.parse(content);
                return Array.isArray(parsed) ? parsed : [content];
            } catch {
                return [content];
            }
        }
        return [];
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Module: ${module.title}`} />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4 overflow-x-auto">

                {/* Header */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-xl">
                    <div className="flex flex-col lg:flex-row items-start justify-between gap-4 mb-4">
                        <div className="flex items-start gap-3 flex-1">
                            <Link
                                href="/instructor/modules"
                                className="p-2 hover:bg-white dark:hover:bg-gray-600 rounded-lg transition-colors flex-shrink-0"
                            >
                                <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                            </Link>
                            <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-3 mb-2">
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
                                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="h-4 w-4" />
                                        Created: {module.created_at}
                                    </span>
                                    <span>•</span>
                                    <span>Order: #{module.order_number}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
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

                {/* CPMKs Section */}
                <ComponentSection
                    title="CPMKs (Capaian Pembelajaran Mata Kuliah)"
                    icon={<Award className="h-5 w-5" />}
                    color="blue"
                    items={cpmks}
                    onAdd={() => {
                        setEditingCpmk(null);
                        setShowCpmkModal(true);
                    }}
                    onEdit={(item) => {
                        setEditingCpmk(item as CPMK);
                        setShowCpmkModal(true);
                    }}
                    onDelete={(item) => {
                        if (confirm('Are you sure you want to delete this CPMK?')) {
                            router.delete(`/instructor/modules/${module.id}/cpmk/${item.id}`);
                        }
                    }}
                    renderItem={(item: CPMK) => (
                        <div>
                            <ul className="list-disc list-inside space-y-1">
                                {renderContent(item.content).map((line: string, idx: number) => (
                                    <li key={idx} className="text-sm text-gray-700 dark:text-gray-300">
                                        {line}
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-2 flex items-center gap-2">
                                <Award className="h-3 w-3 text-amber-500" />
                                <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                                    {item.point_reward} points
                                </span>
                            </div>
                        </div>
                    )}
                />

                {/* Learning Objectives Section */}
                <ComponentSection
                    title="Learning Objectives (Tujuan Pembelajaran)"
                    icon={<List className="h-5 w-5" />}
                    color="yellow"
                    items={learningObjectives}
                    onAdd={() => {
                        setEditingLearningObj(null);
                        setShowLearningObjModal(true);
                    }}
                    onEdit={(item) => {
                        setEditingLearningObj(item as LearningObjective);
                        setShowLearningObjModal(true);
                    }}
                    onDelete={(item) => {
                        if (confirm('Are you sure you want to delete this Learning Objective?')) {
                            router.delete(`/instructor/modules/${module.id}/learning-objective/${item.id}`);
                        }
                    }}
                    renderItem={(item: LearningObjective) => (
                        <div>
                            <ul className="list-decimal list-inside space-y-1">
                                {renderContent(item.content).map((line: string, idx: number) => (
                                    <li key={idx} className="text-sm text-gray-700 dark:text-gray-300">
                                        {line}
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-2 flex items-center gap-2">
                                <Award className="h-3 w-3 text-amber-500" />
                                <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                                    {item.point_reward} points
                                </span>
                            </div>
                        </div>
                    )}
                />

                {/* Materials Section */}
                <ComponentSection
                    title="Materials (PDF)"
                    icon={<FileText className="h-5 w-5" />}
                    color="green"
                    items={materials}
                    onAdd={() => {
                        setEditingMaterial(null);
                        setShowMaterialModal(true);
                    }}
                    onEdit={(item) => {
                        setEditingMaterial(item as Material);
                        setShowMaterialModal(true);
                    }}
                    onDelete={(item) => {
                        if (confirm('Are you sure you want to delete this material?')) {
                            router.delete(`/instructor/modules/${module.id}/material/${item.id}`);
                        }
                    }}
                    renderItem={(item: Material) => (
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white">{item.title}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                            <div className="mt-2 flex items-center gap-3">
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    📄 {item.file_name}
                                </span>
                                <span className="text-xs text-amber-600 dark:text-amber-400">
                                    {item.point_reward} pts
                                </span>
                            </div>
                        </div>
                    )}
                />

                {/* Enrichments Section */}
                <ComponentSection
                    title="Enrichments (Videos & Links)"
                    icon={<Lightbulb className="h-5 w-5" />}
                    color="purple"
                    items={enrichments}
                    onAdd={() => {
                        setEditingEnrichment(null);
                        setShowEnrichmentModal(true);
                    }}
                    onEdit={(item) => {
                        setEditingEnrichment(item as Enrichment);
                        setShowEnrichmentModal(true);
                    }}
                    onDelete={(item) => {
                        if (confirm('Are you sure you want to delete this enrichment?')) {
                            router.delete(`/instructor/modules/${module.id}/enrichment/${item.id}`);
                        }
                    }}
                    renderItem={(item: Enrichment) => (
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                {item.type === 'video' ? (
                                    <Video className="h-4 w-4 text-purple-600" />
                                ) : (
                                    <LinkIcon className="h-4 w-4 text-blue-600" />
                                )}
                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                    {item.type}
                                </span>
                            </div>
                            <p className="font-medium text-gray-900 dark:text-white">{item.title}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                            <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:underline mt-1 inline-block break-all"
                            >
                                {item.url}
                            </a>
                            <div className="mt-2 flex items-center gap-3">
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    Order: #{item.order_number}
                                </span>
                                <span className="text-xs text-amber-600 dark:text-amber-400">
                                    {item.point_reward} pts
                                </span>
                            </div>
                        </div>
                    )}
                />

                {/* Quizzes & Assignments Info */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <InfoCard
                        title="Quizzes"
                        icon={<ClipboardList className="h-5 w-5" />}
                        color="orange"
                        count={quizzes.length}
                        linkText="Manage Quizzes"
                        linkHref="/instructor/quiz-manage"
                    />
                    <InfoCard
                        title="Assignments"
                        icon={<PlayCircle className="h-5 w-5" />}
                        color="red"
                        count={assignments.length}
                        linkText="Manage Assignments"
                        linkHref="/instructor/praktikum-manage"
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
                                <div key={student.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 dark:text-white truncate">{student.name}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{student.email}</p>
                                    </div>
                                    <div className="flex items-center gap-3 w-full sm:w-auto">
                                        <div className="flex-1 sm:w-32 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                            <div
                                                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${student.progress_percentage}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-sm font-semibold text-gray-900 dark:text-white w-12 text-right flex-shrink-0">
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

                {/* Modals */}
                {showCpmkModal && (
                    <CpmkModal
                        module={module}
                        cpmk={editingCpmk}
                        onClose={() => {
                            setShowCpmkModal(false);
                            setEditingCpmk(null);
                        }}
                    />
                )}

                {showLearningObjModal && (
                    <LearningObjectiveModal
                        module={module}
                        objective={editingLearningObj}
                        onClose={() => {
                            setShowLearningObjModal(false);
                            setEditingLearningObj(null);
                        }}
                    />
                )}

                {showMaterialModal && (
                    <MaterialModal
                        module={module}
                        material={editingMaterial}
                        onClose={() => {
                            setShowMaterialModal(false);
                            setEditingMaterial(null);
                        }}
                    />
                )}

                {showEnrichmentModal && (
                    <EnrichmentModal
                        module={module}
                        enrichment={editingEnrichment}
                        onClose={() => {
                            setShowEnrichmentModal(false);
                            setEditingEnrichment(null);
                        }}
                    />
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteModal && (
                    <DeleteModal
                        title="Delete Module"
                        message={`Are you sure you want to delete "${module.title}"? This action cannot be undone and will delete all related content.`}
                        onConfirm={handleDelete}
                        onCancel={() => setShowDeleteModal(false)}
                    />
                )}
            </div>
        </AppLayout>
    );
}

// Component Section (Reusable)
interface ComponentSectionProps {
    title: string;
    icon: React.ReactNode;
    color: string;
    items: any[];
    onAdd: () => void;
    onEdit: (item: any) => void;
    onDelete: (item: any) => void;
    renderItem: (item: any) => React.ReactNode;
}

function ComponentSection({ title, icon, color, items, onAdd, onEdit, onDelete, renderItem }: ComponentSectionProps) {
    const colorClasses = {
        blue: 'text-blue-600 bg-blue-50 dark:bg-blue-900/30',
        yellow: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/30',
        green: 'text-green-600 bg-green-50 dark:bg-green-900/30',
        purple: 'text-purple-600 bg-purple-50 dark:bg-purple-900/30',
        orange: 'text-orange-600 bg-orange-50 dark:bg-orange-900/30',
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 flex-wrap">
                    <div className={`p-2 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
                        {icon}
                    </div>
                    <span>{title}</span>
                    <span className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {items.length}
                    </span>
                </h3>
                <button
                    onClick={onAdd}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors w-full sm:w-auto justify-center"
                >
                    <Plus className="h-4 w-4" />
                    Add
                </button>
            </div>
            <div className="p-4">
                {items.length > 0 ? (
                    <div className="space-y-3">
                        {items.map((item, index) => (
                            <div key={item.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="flex items-center justify-center w-6 h-6 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full text-xs font-semibold flex-shrink-0">
                                                {index + 1}
                                            </span>
                                        </div>
                                        {renderItem(item)}
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <button
                                            onClick={() => onEdit(item)}
                                            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                                            title="Edit"
                                        >
                                            <Edit className="h-4 w-4 text-blue-600" />
                                        </button>
                                        <button
                                            onClick={() => onDelete(item)}
                                            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="h-4 w-4 text-red-600" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-8 text-sm">
                        No items added yet. Click "Add" to create one.
                    </p>
                )}
            </div>
        </div>
    );
}

// Info Card
function InfoCard({ title, icon, color, count, linkText, linkHref }: any) {
    const colorClasses = {
        orange: 'text-orange-600 bg-orange-50 dark:bg-orange-900/30',
        red: 'text-red-600 bg-red-50 dark:bg-red-900/30',
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
                        {icon}
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{count}</p>
                    </div>
                </div>
            </div>
            <Link
                href={linkHref}
                className="block w-full text-center bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm transition-colors"
            >
                {linkText}
            </Link>
        </div>
    );
}

// Delete Modal
function DeleteModal({ title, message, onConfirm, onCancel }: any) {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                        <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>
                <div className="flex items-center gap-3 justify-end">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}

// ==================== CPMK Modal ====================
interface CpmkModalProps {
    module: Module;
    cpmk: CPMK | null;
    onClose: () => void;
}

function CpmkModal({ module, cpmk, onClose }: CpmkModalProps) {
    const isEditing = !!cpmk;
    const [contentItems, setContentItems] = useState<string[]>(
        cpmk ? (Array.isArray(cpmk.content) ? cpmk.content : [cpmk.content]) : ['']
    );

    const { data, setData, post, put, processing, errors, reset } = useForm({
        content: contentItems,
        point_reward: cpmk?.point_reward || 10,
    });

    const handleAddItem = () => {
        const newItems = [...contentItems, ''];
        setContentItems(newItems);
        setData('content', newItems);
    };

    const handleRemoveItem = (index: number) => {
        const newItems = contentItems.filter((_, i) => i !== index);
        setContentItems(newItems);
        setData('content', newItems);
    };

    const handleItemChange = (index: number, value: string) => {
        const newItems = [...contentItems];
        newItems[index] = value;
        setContentItems(newItems);
        setData('content', newItems);
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        const url = isEditing
            ? `/instructor/modules/${module.id}/cpmk/${cpmk.id}`
            : `/instructor/modules/${module.id}/cpmk`;

        const method = isEditing ? put : post;

        method(url, {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {isEditing ? 'Edit CPMK' : 'Add CPMK'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={submit} className="p-6 space-y-6">
                    {/* Content Items */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            CPMK Content <span className="text-red-500">*</span>
                        </label>
                        <div className="space-y-3">
                            {contentItems.map((item, index) => (
                                <div key={index} className="flex gap-2">
                                    <div className="flex-1">
                                        <textarea
                                            value={item}
                                            onChange={(e) => handleItemChange(index, e.target.value)}
                                            rows={2}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                            placeholder={`CPMK item ${index + 1}...`}
                                        />
                                    </div>
                                    {contentItems.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveItem(index)}
                                            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="h-5 w-5 text-red-600" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        <button
                            type="button"
                            onClick={handleAddItem}
                            className="mt-3 flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                        >
                            <Plus className="h-4 w-4" />
                            Add another item
                        </button>
                        {errors.content && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.content}</p>
                        )}
                    </div>

                    {/* Point Reward */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Point Reward <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            value={data.point_reward}
                            onChange={(e) => setData('point_reward', parseInt(e.target.value))}
                            min="0"
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
                        {errors.point_reward && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.point_reward}</p>
                        )}
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
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
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

// ==================== Learning Objective Modal ====================
interface LearningObjectiveModalProps {
    module: Module;
    objective: LearningObjective | null;
    onClose: () => void;
}

function LearningObjectiveModal({ module, objective, onClose }: LearningObjectiveModalProps) {
    const isEditing = !!objective;
    const [contentItems, setContentItems] = useState<string[]>(
        objective ? (Array.isArray(objective.content) ? objective.content : [objective.content]) : ['']
    );

    const { data, setData, post, put, processing, errors, reset } = useForm({
        content: contentItems,
        point_reward: objective?.point_reward || 10,
    });

    const handleAddItem = () => {
        const newItems = [...contentItems, ''];
        setContentItems(newItems);
        setData('content', newItems);
    };

    const handleRemoveItem = (index: number) => {
        const newItems = contentItems.filter((_, i) => i !== index);
        setContentItems(newItems);
        setData('content', newItems);
    };

    const handleItemChange = (index: number, value: string) => {
        const newItems = [...contentItems];
        newItems[index] = value;
        setContentItems(newItems);
        setData('content', newItems);
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        const url = isEditing
            ? `/instructor/modules/${module.id}/learning-objective/${objective.id}`
            : `/instructor/modules/${module.id}/learning-objective`;

        const method = isEditing ? put : post;

        method(url, {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {isEditing ? 'Edit Learning Objective' : 'Add Learning Objective'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={submit} className="p-6 space-y-6">
                    {/* Content Items */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Learning Objectives <span className="text-red-500">*</span>
                        </label>
                        <div className="space-y-3">
                            {contentItems.map((item, index) => (
                                <div key={index} className="flex gap-2">
                                    <div className="flex items-center justify-center w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full text-sm font-semibold text-gray-700 dark:text-gray-300 flex-shrink-0 mt-2">
                                        {index + 1}
                                    </div>
                                    <div className="flex-1">
                                        <textarea
                                            value={item}
                                            onChange={(e) => handleItemChange(index, e.target.value)}
                                            rows={2}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                            placeholder={`Objective ${index + 1}...`}
                                        />
                                    </div>
                                    {contentItems.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveItem(index)}
                                            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="h-5 w-5 text-red-600" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        <button
                            type="button"
                            onClick={handleAddItem}
                            className="mt-3 flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                        >
                            <Plus className="h-4 w-4" />
                            Add another objective
                        </button>
                        {errors.content && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.content}</p>
                        )}
                    </div>

                    {/* Point Reward */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Point Reward <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            value={data.point_reward}
                            onChange={(e) => setData('point_reward', parseInt(e.target.value))}
                            min="0"
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
                        {errors.point_reward && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.point_reward}</p>
                        )}
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
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
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

// ==================== Material Modal ====================
interface MaterialModalProps {
    module: Module;
    material: Material | null;
    onClose: () => void;
}

function MaterialModal({ module, material, onClose }: MaterialModalProps) {
    const isEditing = !!material;
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        title: material?.title || '',
        description: material?.description || '',
        file: null as File | null,
        point_reward: material?.point_reward || 50,
        _method: isEditing ? 'PUT' : 'POST',
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.type !== 'application/pdf') {
                alert('Only PDF files are allowed');
                return;
            }
            if (file.size > 20 * 1024 * 1024) {
                alert('File size must be less than 20MB');
                return;
            }
            setSelectedFile(file);
            setData('file', file);
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        const url = isEditing
            ? `/instructor/modules/${module.id}/material/${material.id}`
            : `/instructor/modules/${module.id}/material`;

        post(url, {
            forceFormData: true,
            onSuccess: () => {
                reset();
                setSelectedFile(null);
                onClose();
            },
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {isEditing ? 'Edit Material' : 'Add Material'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={submit} className="p-6 space-y-6">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="Material title..."
                        />
                        {errors.title && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title}</p>
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
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="Material description..."
                        />
                        {errors.description && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>
                        )}
                    </div>

                    {/* File Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            PDF File {!isEditing && <span className="text-red-500">*</span>}
                            {isEditing && <span className="text-gray-500 text-xs ml-2">(Leave empty to keep current file)</span>}
                        </label>
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
                            <div className="flex flex-col items-center">
                                <Upload className="h-12 w-12 text-gray-400 mb-3" />
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 text-center">
                                    {selectedFile ? selectedFile.name : (isEditing && material ? material.file_name : 'Choose PDF file (max 20MB)')}
                                </p>
                                <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="file-upload"
                                />
                                <label
                                    htmlFor="file-upload"
                                    className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                                >
                                    Choose File
                                </label>
                            </div>
                        </div>
                        {errors.file && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.file}</p>
                        )}
                    </div>

                    {/* Point Reward */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Point Reward <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            value={data.point_reward}
                            onChange={(e) => setData('point_reward', parseInt(e.target.value))}
                            min="0"
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
                        {errors.point_reward && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.point_reward}</p>
                        )}
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
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
                        >
                            <Save className="h-4 w-4" />
                            {processing ? 'Uploading...' : (isEditing ? 'Update' : 'Upload')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ==================== Enrichment Modal ====================
interface EnrichmentModalProps {
    module: Module;
    enrichment: Enrichment | null;
    onClose: () => void;
}

function EnrichmentModal({ module, enrichment, onClose }: EnrichmentModalProps) {
    const isEditing = !!enrichment;

    const { data, setData, post, put, processing, errors, reset } = useForm({
        title: enrichment?.title || '',
        description: enrichment?.description || '',
        type: enrichment?.type || 'video' as 'video' | 'link',
        url: enrichment?.url || '',
        order_number: enrichment?.order_number || 1,
        point_reward: enrichment?.point_reward || 10,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        const url = isEditing
            ? `/instructor/modules/${module.id}/enrichment/${enrichment.id}`
            : `/instructor/modules/${module.id}/enrichment`;

        const method = isEditing ? put : post;

        method(url, {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {isEditing ? 'Edit Enrichment' : 'Add Enrichment'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={submit} className="p-6 space-y-6">
                    {/* Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Type <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    value="video"
                                    checked={data.type === 'video'}
                                    onChange={(e) => setData('type', e.target.value as 'video' | 'link')}
                                    className="w-4 h-4 text-blue-600"
                                />
                                <Video className="h-5 w-5 text-purple-600" />
                                <span className="text-sm text-gray-700 dark:text-gray-300">Video</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    value="link"
                                    checked={data.type === 'link'}
                                    onChange={(e) => setData('type', e.target.value as 'video' | 'link')}
                                    className="w-4 h-4 text-blue-600"
                                />
                                <LinkIcon className="h-5 w-5 text-blue-600" />
                                <span className="text-sm text-gray-700 dark:text-gray-300">Link</span>
                            </label>
                        </div>
                        {errors.type && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.type}</p>
                        )}
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="Enrichment title..."
                        />
                        {errors.title && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title}</p>
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
                            rows={2}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="Brief description..."
                        />
                        {errors.description && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>
                        )}
                    </div>

                    {/* URL */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            URL <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="url"
                            value={data.url}
                            onChange={(e) => setData('url', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="https://..."
                        />
                        {errors.url && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.url}</p>
                        )}
                    </div>

                    {/* Order Number & Point Reward */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                Point Reward <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                value={data.point_reward}
                                onChange={(e) => setData('point_reward', parseInt(e.target.value))}
                                min="0"
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            />
                            {errors.point_reward && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.point_reward}</p>
                            )}
                        </div>
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
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
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
