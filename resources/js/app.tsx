import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';
import { Toaster } from "react-hot-toast";

const appName = import.meta.env.VITE_APP_NAME || 'StuDev';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <>
                <App {...props} />
                <Toaster
                    position="top-right"
                    reverseOrder={false}
                    gutter={8}
                    toastOptions={{
                        // Define default options
                        duration: 3000,
                        style: {
                            borderRadius: '10px',
                            padding: '16px',
                            fontWeight: '500',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
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
            </>
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
