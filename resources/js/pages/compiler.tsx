import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import {
    Play,
    Square,
    Save,
    FolderOpen,
    Download,
    Settings,
    Code,
    Terminal,
    FileText,
    Lightbulb,
    RefreshCw,
    Copy,
    Check,
    AlertCircle,
    CheckCircle,
    Clock,
    Cpu
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

// Template kode untuk berbagai bahasa
const codeTemplates = {
    c: `#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}`,
    cpp: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`,
    java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
    python: `print("Hello, World!")`,
    javascript: `console.log("Hello, World!");`
};

// Contoh soal programming
const programmingExamples = [
    {
        id: 1,
        title: 'Hello World',
        difficulty: 'Beginner',
        description: 'Print "Hello, World!" ke layar',
        template: codeTemplates.c
    },
    {
        id: 2,
        title: 'Sum of Two Numbers',
        difficulty: 'Beginner',
        description: 'Buat program untuk menjumlahkan dua bilangan',
        template: `#include <stdio.h>

int main() {
    int a, b, sum;
    printf("Enter two numbers: ");
    scanf("%d %d", &a, &b);
    sum = a + b;
    printf("Sum = %d\\n", sum);
    return 0;
}`
    },
    {
        id: 3,
        title: 'Factorial Calculator',
        difficulty: 'Intermediate',
        description: 'Hitung faktorial dari sebuah bilangan',
        template: `#include <stdio.h>

int factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

int main() {
    int num;
    printf("Enter a number: ");
    scanf("%d", &num);
    printf("Factorial of %d is %d\\n", num, factorial(num));
    return 0;
}`
    }
];

export default function Compiler() {
    const [selectedLanguage, setSelectedLanguage] = useState('c');
    const [code, setCode] = useState(codeTemplates.c);
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [executionTime, setExecutionTime] = useState(0);
    const [memoryUsage, setMemoryUsage] = useState(0);
    const [copied, setCopied] = useState(false);
    const [selectedExample, setSelectedExample] = useState(programmingExamples[0]);

    const languages = [
        { value: 'c', label: 'C', icon: '🔧' },
        { value: 'cpp', label: 'C++', icon: '⚡' },
        { value: 'java', label: 'Java', icon: '☕' },
        { value: 'python', label: 'Python', icon: '🐍' },
        { value: 'javascript', label: 'JavaScript', icon: '🟨' }
    ];

    const handleLanguageChange = (lang: string) => {
        setSelectedLanguage(lang);
        setCode(codeTemplates[lang as keyof typeof codeTemplates] || '');
        setOutput('');
    };

    const handleRun = async () => {
        setIsRunning(true);
        setOutput('Compiling and executing...\n');

        // Simulasi proses kompilasi dan eksekusi
        setTimeout(() => {
            const mockOutput = selectedLanguage === 'c' || selectedLanguage === 'cpp'
                ? 'Hello, World!\n'
                : selectedLanguage === 'java'
                ? 'Hello, World!\n'
                : selectedLanguage === 'python'
                ? 'Hello, World!\n'
                : 'Hello, World!\n';

            setOutput(mockOutput);
            setExecutionTime(Math.random() * 1000 + 100); // Random execution time
            setMemoryUsage(Math.random() * 50 + 10); // Random memory usage
            setIsRunning(false);
        }, 2000);
    };

    const handleCopyCode = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const loadExample = (example: typeof programmingExamples[0]) => {
        setSelectedExample(example);
        setCode(example.template);
        setOutput('');
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'Beginner':
                return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
            case 'Intermediate':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
            case 'Advanced':
                return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Online Compiler" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-hidden">

                {/* Header */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-xl">
                    <div className="flex items-center gap-3 mb-4">
                        <Code className="h-8 w-8 text-blue-600" />
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Online Compiler
                        </h1>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">
                        Write, compile, and run your code directly in the browser
                    </p>
                </div>

                <div className="flex flex-1 gap-4 min-h-0">
                    {/* Left Sidebar - Examples & Settings */}
                    <div className="w-80 flex flex-col gap-4">
                        {/* Language Selection */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                <Settings className="h-5 w-5" />
                                Language
                            </h3>
                            <div className="space-y-2">
                                {languages.map((lang) => (
                                    <button
                                        key={lang.value}
                                        onClick={() => handleLanguageChange(lang.value)}
                                        className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
                                            selectedLanguage === lang.value
                                                ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800'
                                                : 'hover:bg-gray-50 dark:hover:bg-gray-700 border-2 border-transparent'
                                        }`}
                                    >
                                        <span className="text-xl">{lang.icon}</span>
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {lang.label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Code Examples */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex-1 overflow-hidden">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                <Lightbulb className="h-5 w-5" />
                                Examples
                            </h3>
                            <div className="space-y-3 overflow-y-auto max-h-80">
                                {programmingExamples.map((example) => (
                                    <div
                                        key={example.id}
                                        onClick={() => loadExample(example)}
                                        className={`p-3 rounded-lg cursor-pointer transition-all border ${
                                            selectedExample.id === example.id
                                                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                                                : 'hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-600'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                                                {example.title}
                                            </h4>
                                            <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(example.difficulty)}`}>
                                                {example.difficulty}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                            {example.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Main Editor Area */}
                    <div className="flex-1 flex flex-col gap-4 min-h-0">
                        {/* Toolbar */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={handleRun}
                                        disabled={isRunning}
                                        className="flex items-center gap-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
                                    >
                                        {isRunning ? (
                                            <RefreshCw className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Play className="h-4 w-4" />
                                        )}
                                        {isRunning ? 'Running...' : 'Run Code'}
                                    </button>

                                    <button
                                        onClick={() => {
                                            setOutput('');
                                            setExecutionTime(0);
                                            setMemoryUsage(0);
                                        }}
                                        className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                                    >
                                        <Square className="h-4 w-4" />
                                        Clear
                                    </button>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleCopyCode}
                                        className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-lg transition-colors"
                                    >
                                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                        {copied ? 'Copied!' : 'Copy'}
                                    </button>

                                    <button className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg transition-colors">
                                        <Save className="h-4 w-4" />
                                        Save
                                    </button>

                                    <button className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-3 py-2 rounded-lg transition-colors">
                                        <Download className="h-4 w-4" />
                                        Download
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Code Editor */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 flex-1 flex flex-col min-h-0">
                            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-gray-500" />
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        main.{selectedLanguage === 'cpp' ? 'cpp' : selectedLanguage === 'java' ? 'java' : selectedLanguage === 'python' ? 'py' : selectedLanguage === 'javascript' ? 'js' : 'c'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                    <span>Lines: {code.split('\n').length}</span>
                                    <span>Characters: {code.length}</span>
                                </div>
                            </div>

                            <div className="flex-1 p-4">
                                <textarea
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    className="w-full h-full resize-none bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg p-4 font-mono text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Write your code here..."
                                    spellCheck={false}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right Panel - Input/Output */}
                    <div className="w-96 flex flex-col gap-4">
                        {/* Input Section */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                <Terminal className="h-5 w-5" />
                                Input
                            </h3>
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                className="w-full h-24 resize-none bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg p-3 font-mono text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter input for your program..."
                            />
                        </div>

                        {/* Execution Stats */}
                        {(executionTime > 0 || memoryUsage > 0) && (
                            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                    Execution Stats
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-blue-500" />
                                            <span className="text-sm text-gray-600 dark:text-gray-300">Time:</span>
                                        </div>
                                        <span className="text-sm font-mono text-gray-900 dark:text-white">
                                            {executionTime.toFixed(2)}ms
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Cpu className="h-4 w-4 text-green-500" />
                                            <span className="text-sm text-gray-600 dark:text-gray-300">Memory:</span>
                                        </div>
                                        <span className="text-sm font-mono text-gray-900 dark:text-white">
                                            {memoryUsage.toFixed(2)}MB
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Output Section */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex-1 flex flex-col min-h-0">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Terminal className="h-5 w-5" />
                                    Output
                                </h3>
                                {output && !isRunning && (
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                        <span className="text-sm text-green-600 dark:text-green-400">Success</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 bg-gray-900 dark:bg-black rounded-lg p-4 overflow-y-auto">
                                {output ? (
                                    <pre className="text-green-400 font-mono text-sm whitespace-pre-wrap">
                                        {output}
                                    </pre>
                                ) : (
                                    <div className="text-gray-500 text-sm italic">
                                        Output will appear here...
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quick Tips */}
                        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-gray-800 dark:to-gray-700 p-4 rounded-xl">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                <Lightbulb className="h-4 w-4 text-yellow-600" />
                                Quick Tips
                            </h4>
                            <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                                <li>• Use Ctrl+Enter to run code quickly</li>
                                <li>• Check syntax before running</li>
                                <li>• Use printf/cout for debugging</li>
                                <li>• Test with different inputs</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
