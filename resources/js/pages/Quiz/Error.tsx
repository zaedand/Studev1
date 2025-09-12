import { Head, Link } from '@inertiajs/react';
import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';

interface QuizErrorProps {
    message: string;
    module_id: number;
}

export default function Error({ message, module_id }: QuizErrorProps) {
    return (
        <div>
            <Head title="Quiz Error" />

            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
                <div className="max-w-md w-full">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center shadow-lg">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full mb-6">
                            <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
                        </div>

                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            Quiz Error
                        </h1>

                        <p className="text-gray-600 dark:text-gray-300 mb-8">
                            {message}
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <Link
                                href={`/module/${module_id}/quiz`}
                                className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors"
                            >
                                <RefreshCw className="h-4 w-4" />
                                Try Again
                            </Link>

                            <Link
                                href={`/module/${module_id}`}
                                className="inline-flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to Module
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
