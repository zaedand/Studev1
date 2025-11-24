// components/ui/advanced-modals.tsx
import React from 'react';
import { AlertTriangle, Trash2, X, Info, CheckCircle, Archive, Lock } from 'lucide-react';

// 1. MODAL WITH ADDITIONAL INFO
interface DeleteWithInfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    itemName: string;
    affectedItems?: string[];
    isDeleting?: boolean;
}

export const DeleteWithInfoModal: React.FC<DeleteWithInfoModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    itemName,
    affectedItems = [],
    isDeleting = false
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full">
                <div className="p-6 border-b bg-red-50 dark:bg-red-900/20">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/30">
                            <AlertTriangle className="h-6 w-6 text-red-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-red-900 dark:text-red-100">
                            Hapus {itemName}?
                        </h3>
                    </div>
                </div>

                <div className="p-6 space-y-4">
                    <p className="text-gray-700 dark:text-gray-300">
                        Item ini akan dihapus secara permanen.
                    </p>

                    {affectedItems.length > 0 && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                            <div className="flex items-start gap-2">
                                <Info className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100 mb-2">
                                        Item terkait yang akan terpengaruh:
                                    </p>
                                    <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
                                        {affectedItems.map((item, idx) => (
                                            <li key={idx}>• {item}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            💡 <strong>Tips:</strong> Pertimbangkan untuk mengarsipkan daripada menghapus jika Anda mungkin membutuhkan data ini di masa depan.
                        </p>
                    </div>
                </div>

                <div className="p-6 bg-gray-50 dark:bg-gray-700/50 flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={isDeleting}
                        className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                        {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// 2. MODAL WITH INPUT CONFIRMATION
interface DeleteWithConfirmTextModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    itemName: string;
    confirmText?: string;
    isDeleting?: boolean;
}

export const DeleteWithConfirmTextModal: React.FC<DeleteWithConfirmTextModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    itemName,
    confirmText = 'HAPUS',
    isDeleting = false
}) => {
    const [inputValue, setInputValue] = React.useState('');
    const isConfirmed = inputValue === confirmText;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full">
                <div className="p-6 border-b bg-red-50 dark:bg-red-900/20">
                    <h3 className="text-lg font-semibold text-red-900 dark:text-red-100">
                        Konfirmasi Penghapusan
                    </h3>
                </div>

                <div className="p-6 space-y-4">
                    <p className="text-gray-700 dark:text-gray-300">
                        Anda akan menghapus <strong>&quot;{itemName}&quot;</strong> secara permanen.
                    </p>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Ketik <span className="font-mono font-bold text-red-600">{confirmText}</span> untuk konfirmasi:
                        </label>
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            placeholder={confirmText}
                        />
                    </div>
                </div>

                <div className="p-6 bg-gray-50 dark:bg-gray-700/50 flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={isDeleting}
                        className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={!isConfirmed || isDeleting}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isDeleting ? 'Menghapus...' : 'Hapus Permanen'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// 3. MODAL WITH ALTERNATIVES (Archive instead of Delete)
interface DeleteOrArchiveModalProps {
    isOpen: boolean;
    onClose: () => void;
    onDelete: () => void;
    onArchive: () => void;
    itemName: string;
    isProcessing?: boolean;
}

export const DeleteOrArchiveModal: React.FC<DeleteOrArchiveModalProps> = ({
    isOpen,
    onClose,
    onDelete,
    onArchive,
    itemName,
    isProcessing = false
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full">
                <div className="p-6 border-b">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Apa yang ingin Anda lakukan dengan &quot;{itemName}&quot;?
                    </h3>
                </div>

                <div className="p-6 space-y-3">
                    {/* Archive Option */}
                    <button
                        onClick={onArchive}
                        disabled={isProcessing}
                        className="w-full p-4 border-2 border-blue-200 hover:border-blue-400 dark:border-blue-800 dark:hover:border-blue-600 rounded-lg transition-colors text-left group"
                    >
                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                                <Archive className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                                    Arsipkan (Disarankan)
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Item akan disembunyikan tapi masih bisa dikembalikan kapan saja
                                </p>
                            </div>
                        </div>
                    </button>

                    {/* Delete Option */}
                    <button
                        onClick={onDelete}
                        disabled={isProcessing}
                        className="w-full p-4 border-2 border-red-200 hover:border-red-400 dark:border-red-800 dark:hover:border-red-600 rounded-lg transition-colors text-left group"
                    >
                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 group-hover:bg-red-200 dark:group-hover:bg-red-900/50 transition-colors">
                                <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                                    Hapus Permanen
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Item akan dihapus dan tidak dapat dikembalikan
                                </p>
                            </div>
                        </div>
                    </button>
                </div>

                <div className="p-6 bg-gray-50 dark:bg-gray-700/50">
                    <button
                        onClick={onClose}
                        disabled={isProcessing}
                        className="w-full px-4 py-2 border rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        Batal
                    </button>
                </div>
            </div>
        </div>
    );
};

// 4. SUCCESS CONFIRMATION MODAL
interface SuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    message?: string;
    actionLabel?: string;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
    isOpen,
    onClose,
    title = 'Berhasil!',
    message = 'Operasi berhasil dilakukan',
    actionLabel = 'Tutup'
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-sm w-full">
                <div className="p-6 text-center">
                    <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                        <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        {title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        {message}
                    </p>
                    <button
                        onClick={onClose}
                        className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        {actionLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};
