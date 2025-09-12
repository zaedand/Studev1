import AppLogoIcon from '@/components/app-logo-icon';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Welcome - StudEV">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700" rel="stylesheet" />
            </Head>

            <div className="min-h-screen bg-[radial-gradient(circle_at_center,_#6b21a8_-20%,_#000000_90%)] flex items-center justify-center p-6">

                {/* Background effects */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
                </div>

                <div className="relative z-10 text-center max-w-md w-full">
                    {/* StudEV Logo */}
                    <div className="mb-8 flex justify-center">
                        <div className="relative">
                            {/* Glow effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full blur-2xl opacity-30 scale-110"></div>

                            {/* Logo */}
                            <div className="relative w-32 h-32 mx-auto">
                                <AppLogoIcon
                                    className="w-full h-full object-contain drop-shadow-2xl"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Title */}
                    <h1 className="text-5xl font-bold text-white mb-2 tracking-wider">
                        StuDev
                    </h1>

                    {/* Subtitle */}
                    <div className="mb-3">
                        <p className="text-xl text-gray-300 font-medium">Create your own</p>
                        <p className="text-xl text-gray-300 font-medium">study plan</p>
                    </div>

                    {/* Description */}
                    <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                        Study according to the study plan, make study more motivated
                    </p>

                    {/* Action Buttons */}
                    <div className="space-y-4">
                        {auth.user ? (
                            <Link
                                href={route('dashboard')}
                                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg inline-block"
                            >
                                Go to Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={route('login')}
                                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg inline-block"
                                >
                                    Login
                                </Link>

                                <Link
                                    href={route('register')}
                                    className="w-full bg-transparent border-2 border-gray-400 hover:border-white text-gray-300 hover:text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 inline-block"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Footer text */}
                    <div className="mt-12 text-gray-500 text-xs">
                        <p>Start your learning journey today</p>
                    </div>
                </div>
            </div>
        </>
    );
}
