// components/ui/toaster.tsx
import { Toaster } from 'react-hot-toast';

export function CustomToaster() {
    return (
        <Toaster
            position="top-right"
            reverseOrder={false}
            gutter={8}
            containerClassName=""
            containerStyle={{}}
            toastOptions={{
                // Define default options
                className: '',
                duration: 3000,
                style: {
                    background: '#363636',
                    color: '#fff',
                    borderRadius: '10px',
                    padding: '16px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                },

                // Default options for specific types
                success: {
                    duration: 3000,
                    style: {
                        background: '#10b981',
                        color: '#fff',
                    },
                    iconTheme: {
                        primary: '#fff',
                        secondary: '#10b981',
                    },
                },
                error: {
                    duration: 4000,
                    style: {
                        background: '#ef4444',
                        color: '#fff',
                    },
                    iconTheme: {
                        primary: '#fff',
                        secondary: '#ef4444',
                    },
                },
                loading: {
                    style: {
                        background: '#3b82f6',
                        color: '#fff',
                    },
                    iconTheme: {
                        primary: '#fff',
                        secondary: '#3b82f6',
                    },
                },
            }}
        />
    );
}

// Alternative dark mode aware toaster
export function DarkModeToaster() {
    return (
        <Toaster
            position="top-right"
            reverseOrder={false}
            gutter={8}
            toastOptions={{
                className: 'dark:bg-gray-800 dark:text-white',
                duration: 3000,
                style: {
                    borderRadius: '10px',
                    padding: '16px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                },
                success: {
                    duration: 3000,
                    className: 'bg-green-500 dark:bg-green-600',
                    style: {
                        background: '#10b981',
                        color: '#fff',
                    },
                },
                error: {
                    duration: 4000,
                    className: 'bg-red-500 dark:bg-red-600',
                    style: {
                        background: '#ef4444',
                        color: '#fff',
                    },
                },
                loading: {
                    className: 'bg-blue-500 dark:bg-blue-600',
                    style: {
                        background: '#3b82f6',
                        color: '#fff',
                    },
                },
            }}
        />
    );
}
