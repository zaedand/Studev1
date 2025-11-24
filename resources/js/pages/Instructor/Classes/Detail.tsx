import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { PageProps as InertiaPageProps } from '@inertiajs/core';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Users,
    Edit,
    Trash2,
    Power,
    UserPlus,
    UserMinus,
    Mail,
    Award,
    X,
    Search,
    AlertCircle
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface ClassRoom {
    id: number;
    name: string;
    description: string;
    is_active: boolean;
    instructor_name: string;
    created_at: string;
    updated_at: string;
}

interface Student {
    id: number;
    name: string;
    email: string;
    points: number;
}

interface PageProps extends InertiaPageProps {
    class: ClassRoom;
    students: Student[];
}

export default function ClassDetail() {
    const { class: classRoom, students } = usePage<PageProps>().props;
    const [showAddStudentModal, setShowAddStudentModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/instructor/dashboard' },
        { title: 'Classes', href: '/instructor/classes' },
        { title: classRoom.name, href: `/instructor/classes/${classRoom.id}` },
    ];

    const handleToggleActive = () => {
        router.post(`/instructor/classes/${classRoom.id}/toggle-active`);
    };

    const handleDelete = () => {
        if (students.length > 0) {
            alert(`Cannot delete this class because it has ${students.length} student(s). Please remove all students first.`);
            return;
        }
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        router.delete(`/instructor/classes/${classRoom.id}`, {
            onSuccess: () => {
                setShowDeleteModal(false);
            },
        });
    };

    const handleRemoveStudent = (studentId: number, studentName: string) => {
        if (confirm(`Remove ${studentName} from this class?`)) {
            router.delete(`/instructor/classes/${classRoom.id}/students/${studentId}`);
        }
    };

    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Class: ${classRoom.name}`} />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4 overflow-x-auto">

                {/* Header */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-xl">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Link
                                href="/instructor/classes"
                                className="p-2 hover:bg-white dark:hover:bg-gray-600 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                            </Link>
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {classRoom.name}
                                    </h1>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                        classRoom.is_active
                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                            : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                    }`}>
                                        {classRoom.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                {classRoom.description && (
                                    <p className="text-gray-600 dark:text-gray-300">{classRoom.description}</p>
                                )}
                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                                    <span>Instructor: {classRoom.instructor_name}</span>
                                    <span>•</span>
                                    <span>Created: {classRoom.created_at}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleToggleActive}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    classRoom.is_active
                                        ? 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                                        : 'bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-700 dark:text-green-400'
                                }`}
                            >
                                <Power className="h-4 w-4" />
                                {classRoom.is_active ? 'Deactivate' : 'Activate'}
                            </button>
                            <Link
                                href={`/instructor/classes/${classRoom.id}/edit`}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                            >
                                <Edit className="h-4 w-4" />
                                Edit
                            </Link>
                            <button
                                onClick={handleDelete}
                                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                            >
                                <Trash2 className="h-4 w-4" />
                                Delete
                            </button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Students</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {students.length}
                                    </p>
                                </div>
                                <Users className="h-8 w-8 text-purple-500" />
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Average Points</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {students.length > 0
                                            ? Math.round(students.reduce((sum, s) => sum + s.points, 0) / students.length)
                                            : 0
                                        }
                                    </p>
                                </div>
                                <Award className="h-8 w-8 text-amber-500" />
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Points</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {students.reduce((sum, s) => sum + s.points, 0).toLocaleString()}
                                    </p>
                                </div>
                                <Award className="h-8 w-8 text-blue-500" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Students List */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Students
                        </h2>
                        <button
                            onClick={() => setShowAddStudentModal(true)}
                            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                        >
                            <UserPlus className="h-4 w-4" />
                            Add Student
                        </button>
                    </div>

                    {/* Search */}
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search students by name or email..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                    </div>

                    {/* Students Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                        Student
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                        Points
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredStudents.map((student) => (
                                    <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900 dark:text-white">
                                                {student.name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                <Mail className="h-4 w-4" />
                                                {student.email}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Award className="h-4 w-4 text-amber-500" />
                                                <span className="font-semibold text-gray-900 dark:text-white">
                                                    {student.points.toLocaleString()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleRemoveStudent(student.id, student.name)}
                                                className="flex items-center gap-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm transition-colors"
                                            >
                                                <UserMinus className="h-4 w-4" />
                                                Remove
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredStudents.length === 0 && (
                        <div className="text-center py-12">
                            <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-500 dark:text-gray-400 mb-4">
                                {searchQuery ? 'No students found matching your search' : 'No students in this class yet'}
                            </p>
                            {!searchQuery && (
                                <button
                                    onClick={() => setShowAddStudentModal(true)}
                                    className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                                >
                                    <UserPlus className="h-4 w-4" />
                                    Add First Student
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Add Student Modal */}
                {showAddStudentModal && (
                    <AddStudentModal
                        classId={classRoom.id}
                        onClose={() => setShowAddStudentModal(false)}
                    />
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                                    <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Class</h3>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 mb-6">
                                Are you sure you want to delete "<strong>{classRoom.name}</strong>"?
                                This action cannot be undone.
                            </p>
                            <div className="flex items-center gap-3 justify-end">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                                >
                                    Delete Class
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

// Add Student Modal Component
interface AddStudentModalProps {
    classId: number;
    onClose: () => void;
}

function AddStudentModal({ classId, onClose }: AddStudentModalProps) {
    const [availableStudents, setAvailableStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const { data, setData, post, processing, errors } = useForm({
        student_id: '',
    });

    useEffect(() => {
        // Fetch available students
        fetch(`/instructor/classes/${classId}/available-students`)
            .then(res => res.json())
            .then(data => {
                setAvailableStudents(data.students);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching students:', err);
                setLoading(false);
            });
    }, [classId]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/instructor/classes/${classId}/students`, {
            onSuccess: () => {
                onClose();
            },
        });
    };

    const filteredStudents = availableStudents.filter(student =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Add Student to Class
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-gray-500 dark:text-gray-400">Loading students...</div>
                    </div>
                ) : availableStudents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <Users className="h-12 w-12 text-gray-400 mb-3" />
                        <p className="text-gray-500 dark:text-gray-400">
                            No students available to add
                        </p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                            All students are already in this class
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Search */}
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search students..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                        </div>

                        {/* Students List */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-2">
                            {filteredStudents.map((student) => (
                                <button
                                    key={student.id}
                                    onClick={() => setData('student_id', student.id.toString())}
                                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                                        data.student_id === student.id.toString()
                                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700'
                                    }`}
                                >
                                    <div className="font-medium text-gray-900 dark:text-white">
                                        {student.name}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        {student.email}
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <Award className="h-4 w-4 text-amber-500" />
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            {student.points} points
                                        </span>
                                    </div>
                                </button>
                            ))}

                            {filteredStudents.length === 0 && (
                                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    No students found matching your search
                                </div>
                            )}
                        </div>

                        {errors.student_id && (
                            <div className="px-6 py-2 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800">
                                <p className="text-sm text-red-600 dark:text-red-400">{errors.student_id}</p>
                            </div>
                        )}

                        {/* Footer */}
                        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex items-center gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={processing || !data.student_id}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg transition-colors"
                            >
                                <UserPlus className="h-4 w-4" />
                                {processing ? 'Adding...' : 'Add Student'}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
