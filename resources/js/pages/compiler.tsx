import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import {
    Code,
    Terminal,
    Download,
    Lightbulb,
    AlertCircle,
    CheckCircle,
    FileText,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Compiler',
        href: '/compiler',
    },
];

export default function Compiler() {
    const offlineCompilers = [
        {
            name: 'MinGW-w64',
            description: 'Minimalist GNU untuk Windows - Compiler GCC untuk Windows',
            platform: 'Windows',
            link: 'https://www.mingw-w64.org/downloads/',
            icon: '🪟'
        },
        {
            name: 'Code::Blocks',
            description: 'IDE C/C++ gratis dengan compiler MinGW terintegrasi',
            platform: 'Windows, Linux, macOS',
            link: 'https://www.codeblocks.org/downloads/',
            icon: '📦'
        },
        {
            name: 'Dev-C++',
            description: 'IDE C/C++ ringan dengan compiler MinGW',
            platform: 'Windows',
            link: 'https://sourceforge.net/projects/orwelldevcpp/',
            icon: '💻'
        },
        {
            name: 'Visual Studio Community',
            description: 'IDE profesional dari Microsoft dengan MSVC compiler',
            platform: 'Windows',
            link: 'https://visualstudio.microsoft.com/vs/community/',
            icon: '🎨'
        },
        {
            name: 'GCC (GNU Compiler Collection)',
            description: 'Compiler standar untuk Linux/Unix',
            platform: 'Linux, macOS',
            link: 'https://gcc.gnu.org/',
            icon: '🐧'
        },
        {
            name: 'Xcode',
            description: 'IDE resmi Apple dengan Clang compiler',
            platform: 'macOS',
            link: 'https://developer.apple.com/xcode/',
            icon: '🍎'
        }
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="C++ Compiler" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4 overflow-auto">

                {/* Header */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-xl">
                    <div className="flex items-center gap-3 mb-4">
                        <Code className="h-8 w-8 text-blue-600" />
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            C++ Online Compiler
                        </h1>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                        Compile dan jalankan kode C++ langsung di browser Anda
                    </p>

                    {/* Pengertian Compiler */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mt-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-blue-500" />
                            Apa itu Compiler?
                        </h3>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                            <strong>Compiler</strong> adalah program yang menerjemahkan kode sumber (source code) yang ditulis dalam bahasa pemrograman tingkat tinggi seperti C++
                            menjadi bahasa mesin (machine code) yang dapat dieksekusi oleh komputer. Proses ini meliputi beberapa tahapan:
                            preprocessing, compilation, assembly, dan linking. Compiler memastikan kode yang ditulis bebas dari error sintaks
                            dan mengoptimalkan performa program sebelum dijalankan.
                        </p>
                    </div>
                </div>

                {/* OneCompiler Iframe */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Terminal className="h-6 w-6 text-green-500" />
                            Editor C++ Online
                        </h2>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Powered by OneCompiler</span>
                    </div>

                    <div className="rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-600">
                        <iframe
                            src="https://onecompiler.com/embed/cpp?theme=dark&hideLanguageSelection=true&hideNew=true&hideNewFileOption=true"
                            width="100%"
                            height="600px"
                            className="border-0"
                            frameBorder="0"
                            allow="clipboard-write"
                        />
                    </div>

                    <div className="mt-3 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Lightbulb className="h-4 w-4 text-yellow-500" />
                        <span>Tips: Tulis kode C++ Anda di editor di atas, lalu klik tombol "Run" untuk menjalankannya</span>
                    </div>
                </div>

                {/* Download Offline Compilers */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                            <Download className="h-6 w-6 text-purple-500" />
                            Download Compiler Offline
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300">
                            Direkomendasikan untuk pengerjaan proyek dengan install compiler C++ di komputer/Laptopmu
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {offlineCompilers.map((compiler, index) => (
                            <div
                                key={index}
                                className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all hover:scale-105"
                            >
                                <div className="flex items-start gap-3 mb-3">
                                    <span className="text-3xl">{compiler.icon}</span>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1">
                                            {compiler.name}
                                        </h3>
                                        <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                                            {compiler.platform}
                                        </span>
                                    </div>
                                </div>

                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                                    {compiler.description}
                                </p>

                                <a
                                    href={compiler.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium w-full"
                                >
                                    <Download className="h-4 w-4" />
                                    Download
                                </a>
                            </div>
                        ))}
                    </div>

                    {/* Installation Tips */}
                    <div className="mt-6 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-gray-700 dark:to-gray-600 p-5 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                            <Lightbulb className="h-5 w-5 text-yellow-600" />
                            Petunjuk Instalasi
                        </h3>
                        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-200">
                            <li className="flex items-start gap-2">
                                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                <span><strong>Windows Users:</strong> Disarankan menggunakan <strong>Code::Blocks</strong> atau <strong>Dev-C++</strong> karena mudah diinstall dan sudah include compiler MinGW</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                <span><strong>Linux Users:</strong> GCC biasanya sudah terinstall. Cek dengan command: <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">g++ --version</code></span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                <span><strong>macOS Users:</strong> Install Xcode Command Line Tools dengan: <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">xcode-select --install</code></span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                <span>Setelah instalasi, restart komputer dan verifikasi dengan menjalankan program "Hello World" sederhana</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                <span>Untuk mahasiswa , <strong>Code::Blocks</strong> sangat direkomendasikan karena memiliki interface yang user-friendly</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Quick Reference */}
                <div className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-xl">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <FileText className="h-5 w-5 text-green-600" />
                        Referensi Cepat C++
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Struktur Program Dasar:</h4>
                            <pre className="bg-gray-900 dark:bg-black text-green-400 p-3 rounded text-xs overflow-x-auto">
{`#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`}
                            </pre>
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Input/Output:</h4>
                            <pre className="bg-gray-900 dark:bg-black text-green-400 p-3 rounded text-xs overflow-x-auto">
{`// Output
cout << "Text" << endl;

// Input
int number;
cin >> number;`}
                            </pre>
                        </div>
                    </div>
                </div>

            </div>
        </AppLayout>
    );
}
