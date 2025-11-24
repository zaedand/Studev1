// components/ui/delete-confirmation-modal.tsx
import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
    itemName?: string;
    isDeleting?: boolean;
    type?: 'danger' | 'warning';
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Konfirmasi Hapus',
    message = 'Apakah Anda yakin ingin menghapus',
    itemName,
    isDeleting = false,
    type = 'danger'
}) => {
    if (!isOpen) return null;

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn"
            onClick={handleBackdropClick}
        >
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full shadow-2xl animate-slideUp">
                {/* Header */}
                <div className={`p-6 border-b ${
                    type === 'danger'
                        ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                        : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                }`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${
                                type === 'danger'
                                    ? 'bg-red-100 dark:bg-red-900/30'
                                    : 'bg-yellow-100 dark:bg-yellow-900/30'
                            }`}>
                                <AlertTriangle className={`h-6 w-6 ${
                                    type === 'danger'
                                        ? 'text-red-600 dark:text-red-400'
                                        : 'text-yellow-600 dark:text-yellow-400'
                                }`} />
                            </div>
                            <h3 className={`text-lg font-semibold ${
                                type === 'danger'
                                    ? 'text-red-900 dark:text-red-100'
                                    : 'text-yellow-900 dark:text-yellow-100'
                            }`}>
                                {title}
                            </h3>
                        </div>
                        <button
                            onClick={onClose}
                            disabled={isDeleting}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors disabled:opacity-50"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="p-6">
                    <p className="text-gray-700 dark:text-gray-300 mb-2">
                        {message}
                        {itemName && (
                            <span className="font-semibold text-gray-900 dark:text-white">
                                {' '}&quot;{itemName}&quot;
                            </span>
                        )}
                        ?
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                        ⚠️ Tindakan ini tidak dapat dibatalkan. Data yang terhapus tidak dapat dikembalikan.
                    </p>
                </div>

                {/* Footer */}
                <div className="p-6 bg-gray-50 dark:bg-gray-700/50 flex items-center justify-end gap-3 rounded-b-xl">
                    <button
                        onClick={onClose}
                        disabled={isDeleting}
                        className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Batal
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                            type === 'danger'
                                ? 'bg-red-600 hover:bg-red-700'
                                : 'bg-yellow-600 hover:bg-yellow-700'
                        }`}
                    >
                        {isDeleting ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                <span>Menghapus...</span>
                            </>
                        ) : (
                            <>
                                <Trash2 className="h-4 w-4" />
                                <span>Ya, Hapus</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

        </div>
    );
};

// Hook untuk menggunakan modal dengan lebih mudah
export const useDeleteConfirmation = () => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [itemToDelete, setItemToDelete] = React.useState<{
        id: number | string;
        name: string;
    } | null>(null);

    const openDeleteModal = (id: number | string, name: string) => {
        setItemToDelete({ id, name });
        setIsOpen(true);
    };

    const closeDeleteModal = () => {
        if (!isDeleting) {
            setIsOpen(false);
            setItemToDelete(null);
        }
    };

    const confirmDelete = async (onDelete: (id: number | string) => Promise<void>) => {
        if (!itemToDelete) return;

        setIsDeleting(true);
        try {
            await onDelete(itemToDelete.id);
            closeDeleteModal();
        } catch (error) {
            console.error('Delete error:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    return {
        isOpen,
        isDeleting,
        itemToDelete,
        openDeleteModal,
        closeDeleteModal,
        confirmDelete,
    };
};
