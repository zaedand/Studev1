// hooks/use-toast.ts
import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import toast from 'react-hot-toast';

interface FlashMessages {
    success?: string;
    error?: string;
    warning?: string;
    info?: string;
}

/**
 * Custom hook to automatically show flash messages from Laravel
 * Usage: Just call useToast() in your component
 */
export function useToast() {
    const { flash } = usePage().props as { flash?: FlashMessages };

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success, {
                duration: 3000,
            });
        }

        if (flash?.error) {
            toast.error(flash.error, {
                duration: 4000,
            });
        }

        if (flash?.warning) {
            toast(flash.warning, {
                icon: '⚠️',
                duration: 4000,
                style: {
                    background: '#f59e0b',
                    color: '#fff',
                },
            });
        }

        if (flash?.info) {
            toast(flash.info, {
                icon: 'ℹ️',
                duration: 3000,
                style: {
                    background: '#3b82f6',
                    color: '#fff',
                },
            });
        }
    }, [flash]);
}

/**
 * Custom hook with helper functions for common toast patterns
 */
export function useCustomToast() {
    useToast(); // Auto-handle flash messages

    return {
        // CRUD Operations
        created: (itemName: string = 'Item') => {
            toast.success(`${itemName} berhasil dibuat!`, {
                icon: '✅',
            });
        },

        updated: (itemName: string = 'Item') => {
            toast.success(`${itemName} berhasil diperbarui!`, {
                icon: '✅',
            });
        },

        deleted: (itemName: string = 'Item') => {
            toast.success(`${itemName} berhasil dihapus!`, {
                icon: '🗑️',
            });
        },

        // File Operations
        fileUploaded: (filename: string) => {
            toast.success(`${filename} berhasil diupload!`, {
                icon: '📁',
            });
        },

        fileDownloaded: (filename: string) => {
            toast.success(`${filename} berhasil didownload!`, {
                icon: '⬇️',
            });
        },

        // Grading
        graded: (studentName: string, score: number) => {
            toast.success(`Nilai ${studentName} berhasil disimpan: ${score}/100`, {
                icon: '⭐',
                duration: 4000,
            });
        },

        // Validation
        validationError: (message: string = 'Periksa kembali input Anda') => {
            toast.error(message, {
                icon: '❌',
                duration: 4000,
            });
        },

        // Network
        networkError: () => {
            toast.error('Koneksi terputus. Periksa internet Anda.', {
                icon: '📡',
                duration: 5000,
            });
        },

        // Custom with loading
        withLoading: async <T,>(
            promise: Promise<T>,
            messages: {
                loading: string;
                success: string;
                error: string;
            }
        ): Promise<T> => {
            const toastId = toast.loading(messages.loading);

            try {
                const result = await promise;
                toast.success(messages.success, { id: toastId });
                return result;
            } catch (error) {
                toast.error(messages.error, { id: toastId });
                throw error;
            }
        },

        // Confirmation with Undo
        deletedWithUndo: (
            itemName: string,
            onUndo: () => void,
            onConfirm: () => void
        ) => {
            let undone = false;

            toast.success(
                (t) => (
                    <div className="flex items-center gap-4">
                        <span>{itemName} dihapus</span>
                        <button
                            onClick={() => {
                                undone = true;
                                toast.dismiss(t.id);
                                onUndo();
                                toast.success('Pembatalan berhasil!');
                            }}
                            className="px-3 py-1 bg-white text-green-600 rounded text-sm font-medium hover:bg-gray-100"
                        >
                            Undo
                        </button>
                    </div>
                ),
                {
                    duration: 5000,
                }
            );

            setTimeout(() => {
                if (!undone) {
                    onConfirm();
                }
            }, 5000);
        },

        // Info messages
        info: (message: string) => {
            toast(message, {
                icon: 'ℹ️',
                style: {
                    background: '#3b82f6',
                    color: '#fff',
                },
            });
        },

        warning: (message: string) => {
            toast(message, {
                icon: '⚠️',
                style: {
                    background: '#f59e0b',
                    color: '#fff',
                },
            });
        },
    };
}

/**
 * Hook for form submissions with automatic toast handling
 */
export function useFormToast() {
    useToast();

    return {
        onSuccess: (message: string = 'Data berhasil disimpan!') => {
            toast.success(message);
        },

        onError: (errors: Record<string, string> | string) => {
            if (typeof errors === 'string') {
                toast.error(errors);
            } else {
                const errorMessages = Object.values(errors).flat().join(', ');
                toast.error(`Validation Error: ${errorMessages}`, {
                    duration: 5000,
                    style: {
                        maxWidth: '500px',
                    },
                });
            }
        },

        loading: (message: string = 'Menyimpan data...') => {
            return toast.loading(message);
        },
    };
}
