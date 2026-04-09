import React, { useRef, useState, useEffect, useCallback } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { ChevronLeft, ChevronRight, X, CheckCircle, Loader2, Maximize2, Volume2, VolumeX } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import { router } from '@inertiajs/react';
import toast from 'react-hot-toast';

// Set worker path
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
).toString();

interface Question {
    id: number;
    question: string;
    options: string[];
    correct_answer: number;
}

interface PDFFlipBookProps {
    pdfUrl: string;
    materialId: number;
    onProgressUpdate?: (progress: number) => void;
    onComplete: () => void;
    readProgress: number;
    isCompleted: boolean;
    preQuestions?: Question[];
}

const InteractivePDFFlipBook: React.FC<PDFFlipBookProps> = ({
    pdfUrl,
    materialId,
    onProgressUpdate,
    onComplete,
    readProgress,
    isCompleted,
    preQuestions = []
}) => {
    const flipBookRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [pages, setPages] = useState<string[]>([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const [visitedPages, setVisitedPages] = useState<Set<number>>(new Set([0]));
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);

    // ✅ FIX: Track actual container width for responsive dimensions
    const [containerWidth, setContainerWidth] = useState(0);

    // Pre-learning state
    const [showPreQuiz, setShowPreQuiz] = useState(!isCompleted && preQuestions.length > 0);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [quizCompleted, setQuizCompleted] = useState(false);
    const [quizAnswers, setQuizAnswers] = useState<number[]>([]);

    // Post-learning state
    const [showPostReflection, setShowPostReflection] = useState(false);
    const [reflection, setReflection] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const allPagesVisited = visitedPages.size === totalPages && totalPages > 0;
    const canComplete = allPagesVisited && !isCompleted;
    const isMobile = windowWidth < 768;
    const usePortraitMode = isMobile;

    // ✅ FIX: Observe container width changes (handles isCompleted layout shift too)
    useEffect(() => {
        if (!containerRef.current) return;

        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setContainerWidth(Math.floor(entry.contentRect.width));
            }
        });

        observer.observe(containerRef.current);

        // Set initial value
        setContainerWidth(Math.floor(containerRef.current.getBoundingClientRect().width));

        return () => observer.disconnect();
    }, [showPreQuiz, isLoading]); // Re-observe when content changes

    // Window resize handler
    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Audio setup
    useEffect(() => {
        audioRef.current = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
        audioRef.current.loop = true;
        audioRef.current.volume = 0.3;
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (audioRef.current) {
            if (!isMuted) {
                audioRef.current.play().catch(err => console.log('Audio play failed:', err));
            } else {
                audioRef.current.pause();
            }
        }
    }, [isMuted]);

    useEffect(() => {
        if (!showPreQuiz) {
            loadPDF();
        }
    }, [pdfUrl, showPreQuiz]);

    useEffect(() => {
        setVisitedPages(prev => {
            const newSet = new Set(prev);
            newSet.add(currentPage);
            return newSet;
        });
    }, [currentPage]);

    useEffect(() => {
        if (totalPages > 0 && onProgressUpdate) {
            const progress = Math.round((visitedPages.size / totalPages) * 100);
            onProgressUpdate(progress);
        }
    }, [visitedPages.size, totalPages]);

    const loadPDF = async () => {
        try {
            setIsLoading(true);
            const loadingTask = pdfjsLib.getDocument(pdfUrl);
            const pdf = await loadingTask.promise;
            setTotalPages(pdf.numPages);

            const pagePromises = [];
            for (let i = 1; i <= pdf.numPages; i++) {
                pagePromises.push(renderPage(pdf, i));
            }

            const renderedPages = await Promise.all(pagePromises);
            setPages(renderedPages);
            setIsLoading(false);
        } catch (error) {
            console.error('Error loading PDF:', error);
            toast.error('Gagal memuat PDF');
            setIsLoading(false);
        }
    };

    const renderPage = async (pdf: any, pageNum: number): Promise<string> => {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        await page.render({ canvasContext: context, viewport: viewport }).promise;
        return canvas.toDataURL();
    };

    const handleFlip = useCallback((e: any) => {
        const pageIndex = e.data;
        setCurrentPage(pageIndex);

        setVisitedPages(prev => {
            const newSet = new Set(prev);
            newSet.add(pageIndex);

            if (!isMobile && !isCompleted) {
                const isEven = pageIndex % 2 === 0;
                if (isEven && pageIndex + 1 < totalPages) {
                    newSet.add(pageIndex + 1);
                } else if (!isEven && pageIndex - 1 >= 0) {
                    newSet.add(pageIndex - 1);
                }
            }

            return newSet;
        });
    }, [totalPages, isMobile, isCompleted]);

    const nextPage = useCallback(() => { flipBookRef.current?.pageFlip()?.flipNext(); }, []);
    const prevPage = useCallback(() => { flipBookRef.current?.pageFlip()?.flipPrev(); }, []);
    const goToPage = useCallback((pageNum: number) => { flipBookRef.current?.pageFlip()?.flip(pageNum); }, []);
    const toggleFullscreen = useCallback(() => { setIsFullscreen(prev => !prev); }, []);
    const toggleMute = useCallback(() => { setIsMuted(prev => !prev); }, []);

    // ✅ FIX: Calculate dimensions based on ACTUAL container width, not window width
    const getFlipBookDimensions = () => {
        const ASPECT_RATIO = 550 / 400; // height / width

        if (isFullscreen) {
            const fsWidth = isMobile
                ? Math.min(window.innerWidth - 32, 340)
                : Math.min(window.innerWidth * 0.45, 500);
            return { width: fsWidth, height: Math.round(fsWidth * ASPECT_RATIO) };
        }

        if (isMobile) {
            // ✅ Use containerWidth if available, fallback to window calculation
            const availableWidth = containerWidth > 0
                ? containerWidth - 16  // subtract small padding
                : windowWidth - 32;    // fallback: window minus margins

            const clampedWidth = Math.min(Math.max(availableWidth, 240), 380);
            return {
                width: clampedWidth,
                height: Math.round(clampedWidth * ASPECT_RATIO)
            };
        }

        // Desktop: use container width or fixed fallback
        const desktopWidth = containerWidth > 0
            ? Math.min(containerWidth * 0.48, 450)
            : 400;
        return {
            width: Math.round(desktopWidth),
            height: Math.round(desktopWidth * ASPECT_RATIO)
        };
    };

    const dimensions = getFlipBookDimensions();

    const handleQuizAnswer = () => {
        if (selectedAnswer === null) {
            toast.error('Pilih jawaban terlebih dahulu');
            return;
        }

        const newAnswers = [...quizAnswers, selectedAnswer];
        setQuizAnswers(newAnswers);

        if (currentQuestionIndex < preQuestions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedAnswer(null);
        } else {
            setQuizCompleted(true);
            setTimeout(() => { setShowPreQuiz(false); }, 1500);
        }
    };

    const handleCompleteReading = () => {
        if (!allPagesVisited) {
            toast.error(`Buka semua halaman terlebih dahulu (${visitedPages.size}/${totalPages})`);
            return;
        }
        setShowPostReflection(true);
    };

    const handleSubmitReflection = async () => {
        if (reflection.trim().length < 50) {
            toast.error('Refleksi minimal 50 karakter');
            return;
        }

        setIsSubmitting(true);
        router.post(
            `/materials/${materialId}/complete`,
            { reflection, quiz_answers: quizAnswers, pages_read: Array.from(visitedPages) },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('🎉 Selamat! Materi berhasil diselesaikan');
                    setShowPostReflection(false);
                    onComplete();
                },
                onError: (errors) => {
                    console.error('Error:', errors);
                    toast.error('Gagal menyelesaikan materi');
                },
                onFinish: () => { setIsSubmitting(false); }
            }
        );
    };

    // Pre-Quiz Screen
    if (showPreQuiz && preQuestions.length > 0) {
        const currentQuestion = preQuestions[currentQuestionIndex];
        return (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 rounded-xl p-4 md:p-8 min-h-[500px] md:min-h-[600px] flex flex-col items-center justify-center">
                {!quizCompleted ? (
                    <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-xl p-4 md:p-8">
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-2">
                            <h3 className="text-base md:text-xl font-bold text-gray-900 dark:text-white">
                                Pertanyaan {currentQuestionIndex + 1} dari {preQuestions.length}
                            </h3>
                            <span className="text-xs md:text-sm text-gray-500">Sebelum Membaca</span>
                        </div>
                        <div className="mb-6">
                            <p className="text-sm md:text-lg text-gray-800 dark:text-gray-200 mb-4 md:mb-6">
                                {currentQuestion.question}
                            </p>
                            <div className="space-y-2 md:space-y-3">
                                {currentQuestion.options.map((option, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedAnswer(idx)}
                                        className={`w-full text-left p-3 md:p-4 rounded-lg border-2 transition-all ${
                                            selectedAnswer === idx
                                                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                                                : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2 md:gap-3">
                                            <div className={`w-4 h-4 md:w-5 md:h-5 rounded-full border-2 flex items-center justify-center ${
                                                selectedAnswer === idx ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                                            }`}>
                                                {selectedAnswer === idx && (
                                                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full" />
                                                )}
                                            </div>
                                            <span className="text-sm md:text-base text-gray-800 dark:text-gray-200">{option}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <button
                            onClick={handleQuizAnswer}
                            disabled={selectedAnswer === null}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2.5 md:py-3 rounded-lg font-medium transition-colors text-sm md:text-base"
                        >
                            {currentQuestionIndex < preQuestions.length - 1 ? 'Lanjut' : 'Mulai Membaca'}
                        </button>
                    </div>
                ) : (
                    <div className="text-center">
                        <CheckCircle className="h-12 w-12 md:h-16 md:w-16 text-green-500 mx-auto mb-4" />
                        <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-2">Siap Membaca!</h3>
                        <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">Memuat materi pembelajaran...</p>
                    </div>
                )}
            </div>
        );
    }

    // Post Reflection Modal
    if (showPostReflection) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full p-4 md:p-8 max-h-[90vh] overflow-y-auto">
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-3 md:mb-4">
                        Refleksi Pembelajaran
                    </h3>
                    <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-4 md:mb-6">
                        Tuliskan apa yang kamu pahami dari modul ini (minimal 50 karakter)
                    </p>
                    <textarea
                        value={reflection}
                        onChange={(e) => setReflection(e.target.value)}
                        placeholder="Tulis refleksi Anda di sini..."
                        className="w-full h-40 md:h-48 p-3 md:p-4 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm md:text-base"
                    />
                    <div className="flex flex-col md:flex-row md:items-center justify-between mt-4 gap-3">
                        <span className="text-xs md:text-sm text-gray-500">{reflection.length} / 50 karakter</span>
                        <div className="flex gap-2 md:gap-3">
                            <button
                                onClick={() => setShowPostReflection(false)}
                                disabled={isSubmitting}
                                className="flex-1 md:flex-none px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 text-sm md:text-base"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleSubmitReflection}
                                disabled={reflection.trim().length < 50 || isSubmitting}
                                className="flex-1 md:flex-none px-4 md:px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg flex items-center justify-center gap-2 text-sm md:text-base"
                            >
                                {isSubmitting ? (
                                    <><Loader2 className="h-4 w-4 animate-spin" /><span className="hidden md:inline">Menyimpan...</span></>
                                ) : (
                                    <><CheckCircle className="h-4 w-4" />Selesai</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64 md:h-96 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">Memuat flipbook...</p>
                </div>
            </div>
        );
    }

    // ✅ FIX: Main FlipBook wrapped in ref container for width measurement
    const FlipBookContent = () => (
        <div className="w-full">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 gap-3">
                <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                    <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                        Halaman {currentPage + 1} / {totalPages}
                    </span>
                    <div className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 md:px-3 py-1 rounded-full">
                        {visitedPages.size}/{totalPages} dibaca
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={toggleMute}
                        className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                        title={isMuted ? "Nyalakan musik" : "Matikan musik"}
                    >
                        {isMuted
                            ? <VolumeX className="h-4 w-4 md:h-5 md:w-5 text-gray-600 dark:text-gray-300" />
                            : <Volume2 className="h-4 w-4 md:h-5 md:w-5 text-blue-600 dark:text-blue-400" />
                        }
                    </button>
                    {!isFullscreen && (
                        <button
                            onClick={toggleFullscreen}
                            className="flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3 py-1.5 md:py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs md:text-sm rounded-lg transition-colors"
                        >
                            <Maximize2 className="h-3 w-3 md:h-4 md:w-4" />
                            <span className="hidden sm:inline">Fullscreen</span>
                        </button>
                    )}
                </div>
            </div>

            {/* ✅ FIX: FlipBook container - uses w-full + overflow-hidden to prevent layout bleed */}
            <div className="w-full overflow-hidden flex justify-center">
                {/* Only render when we have valid dimensions */}
                {dimensions.width > 0 && (
                    <HTMLFlipBook
                        ref={flipBookRef}
                        width={dimensions.width}
                        height={dimensions.height}
                        size="fixed"
                        minWidth={dimensions.width}
                        maxWidth={dimensions.width}
                        minHeight={dimensions.height}
                        maxHeight={dimensions.height}
                        showCover={false}
                        flippingTime={800}
                        usePortrait={usePortraitMode}
                        startPage={currentPage}
                        drawShadow={true}
                        className="flipbook-container"
                        startZIndex={0}
                        autoSize={false}
                        maxShadowOpacity={0.5}
                        showPageCorners={true}
                        disableFlipByClick={false}
                        mobileScrollSupport={true}
                        clickEventForward={true}
                        useMouseEvents={true}
                        swipeDistance={30}
                        onFlip={handleFlip}
                        onChangeOrientation={() => {}}
                        onChangeState={() => {}}
                    >
                        {pages.map((pageImage, index) => (
                            <div key={index} className="demoPage bg-white shadow-2xl relative">
                                <img
                                    src={pageImage}
                                    alt={`Page ${index + 1}`}
                                    className="w-full h-full object-contain"
                                    draggable={false}
                                />
                                <div className="absolute bottom-2 md:bottom-3 right-2 md:right-3 bg-black bg-opacity-60 text-white text-xs px-1.5 md:px-2 py-0.5 md:py-1 rounded">
                                    {index + 1}
                                </div>
                            </div>
                        ))}
                    </HTMLFlipBook>
                )}
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center justify-center gap-2 md:gap-4 mt-3 md:mt-4">
                <button
                    onClick={prevPage}
                    disabled={currentPage === 0}
                    className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white rounded-lg transition-colors text-xs md:text-sm"
                >
                    <ChevronLeft className="h-3 w-3 md:h-4 md:w-4" />
                    <span className="hidden sm:inline">Sebelumnya</span>
                </button>
                <button
                    onClick={nextPage}
                    disabled={currentPage >= totalPages - 1}
                    className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white rounded-lg transition-colors text-xs md:text-sm"
                >
                    <span className="hidden sm:inline">Selanjutnya</span>
                    <ChevronRight className="h-3 w-3 md:h-4 md:w-4" />
                </button>
            </div>

            {/* Page Thumbnails */}
            <div className="mt-3 md:mt-4 flex gap-1.5 md:gap-2 overflow-x-auto pb-2 px-1 md:px-2">
                {pages.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToPage(index)}
                        className={`flex-shrink-0 px-2 md:px-3 py-1 md:py-2 text-xs rounded-lg transition-all ${
                            currentPage === index
                                ? 'bg-blue-600 text-white scale-105 md:scale-110'
                                : visitedPages.has(index)
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300'
                        }`}
                    >
                        {index + 1}
                    </button>
                ))}
            </div>

            {/* Complete / Completed */}
            {!isCompleted ? (
                <div className="mt-4 md:mt-6 flex justify-center">
                    <button
                        onClick={handleCompleteReading}
                        disabled={!canComplete}
                        className={`px-4 md:px-8 py-2 md:py-3 rounded-lg font-medium flex items-center gap-2 transition-all text-sm md:text-base ${
                            canComplete
                                ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg'
                                : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                        }`}
                    >
                        <CheckCircle className="h-4 w-4 md:h-5 md:w-5" />
                        <span className="hidden sm:inline">{canComplete ? 'Selesai Membaca' : `Buka Semua (${visitedPages.size}/${totalPages})`}</span>
                        <span className="sm:hidden">{canComplete ? 'Selesai' : `${visitedPages.size}/${totalPages}`}</span>
                    </button>
                </div>
            ) : (
                <div className="mt-4 md:mt-6 flex justify-center">
                    <div className="bg-green-100 dark:bg-green-900/30 border-2 border-green-500 text-green-700 dark:text-green-400 px-4 md:px-6 py-2 md:py-3 rounded-lg flex items-center gap-2 shadow-md">
                        <CheckCircle className="h-5 w-5 md:h-6 md:w-6" />
                        <span className="font-semibold text-sm md:text-lg">Materi Sudah Diselesaikan ✓</span>
                    </div>
                </div>
            )}
        </div>
    );

    // Fullscreen Mode
    if (isFullscreen) {
        return (
            <div className="fixed inset-0 z-50 bg-black overflow-auto">
                <div className="min-h-screen flex flex-col p-2 md:p-4">
                    <div className="sticky top-0 z-10 flex justify-end mb-3 md:mb-4 bg-black pb-2">
                        <button
                            onClick={toggleFullscreen}
                            className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-white hover:bg-gray-100 text-gray-900 rounded-lg transition-colors text-sm md:text-base"
                        >
                            <X className="h-4 w-4 md:h-5 md:w-5" />
                            <span className="hidden sm:inline">Tutup</span>
                        </button>
                    </div>
                    <div className="flex-1 w-full max-w-7xl mx-auto pb-8">
                        <FlipBookContent />
                    </div>
                </div>
            </div>
        );
    }

    // ✅ FIX: Outer wrapper uses ref for ResizeObserver + w-full to fill parent correctly
    return (
        <div ref={containerRef} className="w-full min-w-0">
            <FlipBookContent />
        </div>
    );
};

export default InteractivePDFFlipBook;
