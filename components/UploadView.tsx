import React, { useState, useCallback, useEffect } from 'react';
import { Grade, Book } from '../types';
import { ArrowRightIcon, PdfIcon, XCircleIcon } from './icons';
import LoadingSpinner from './LoadingSpinner';
import { saveFile, getFile, deleteFile } from '../services/dbService';

// pdf.js is loaded from a CDN in index.html, we need to declare the global object
declare const pdfjsLib: any;

interface ImageFile {
  inlineData: {
    mimeType: string;
    data: string;
  };
}

interface LessonPrepViewProps {
  grade: Grade;
  book: Book;
  onGenerate: (images: ImageFile[], numQuestions: string) => void;
  onBack: () => void;
  isLoading: boolean;
  error: string | null;
}

const parsePageRanges = (input: string): number[] => {
    const pages = new Set<number>();
    if (!input) return [];

    const westernInput = input
      .replace(/[۰]/g, '0').replace(/[۱]/g, '1').replace(/[۲]/g, '2')
      .replace(/[۳]/g, '3').replace(/[۴]/g, '4').replace(/[۵]/g, '5')
      .replace(/[۶]/g, '6').replace(/[۷]/g, '7').replace(/[۸]/g, '8')
      .replace(/[۹]/g, '9');
  
    const parts = westernInput.split(/[,،\s]/).filter(p => p.trim());
  
    for (const part of parts) {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(Number);
        if (!isNaN(start) && !isNaN(end) && start <= end) {
          for (let i = start; i <= end; i++) {
            pages.add(i);
          }
        }
      } else {
        const pageNum = Number(part);
        if (!isNaN(pageNum)) {
          pages.add(pageNum);
        }
      }
    }
    return Array.from(pages).sort((a, b) => a - b);
};

const LessonPrepView: React.FC<LessonPrepViewProps> = ({ grade, book, onGenerate, onBack, isLoading, error }) => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pageInput, setPageInput] = useState('');
  const [numQuestions, setNumQuestions] = useState('10');
  const [processingError, setProcessingError] = useState<string|null>(null);
  const [isDbLoading, setIsDbLoading] = useState(true);
  const [isProcessingPdf, setIsProcessingPdf] = useState(false);


  useEffect(() => {
    const loadStoredFile = async () => {
      setIsDbLoading(true);
      try {
        const storedFile = await getFile(book.id);
        if (storedFile) {
            setPdfFile(storedFile);
        }
      } catch (e) {
        console.error("Failed to load file from DB", e);
        setProcessingError("هەڵەیەک لە خوێندنەوەی فایلی پاشەکەوتکراودا ڕوویدا.");
      } finally {
        setIsDbLoading(false);
      }
    };
    loadStoredFile();
  }, [book.id]);


  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setPdfFile(file);
      setProcessingError(null);
      try {
        await saveFile(book.id, file);
      } catch (err) {
        console.error("Failed to save file to DB", err);
        setProcessingError("نەتوانرا فایلەکە هەڵبگیرێت بۆ بەکارهێنانەوەی داهاتوو.");
      }
    }
  };

  const removeFile = async () => {
    setPdfFile(null);
    try {
        await deleteFile(book.id);
    } catch (err) {
        console.error("Failed to delete file from DB", err);
        // This error is not critical for the user flow, so we can just log it.
    }
  };

  const handleGenerateClick = useCallback(async () => {
    if (!pdfFile || !pageInput) {
        setProcessingError("تکایە هەموو خانەکان پڕبکەرەوە.");
        return;
    }
    setProcessingError(null);
    setIsProcessingPdf(true);
    
    // Use setTimeout to allow the UI to re-render with the loading state before blocking the main thread
    setTimeout(async () => {
        try {
            const pageNumbers = parsePageRanges(pageInput);
            if (pageNumbers.length === 0) {
                setProcessingError("تکایە ژمارەی لاپەڕەکان بە شێوەیەکی دروست بنووسە (بۆ نموونە: ٢٥-٣٠).");
                setIsProcessingPdf(false);
                return;
            }

            const arrayBuffer = await pdfFile.arrayBuffer();
            pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
            const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;

            if (pageNumbers.some(pn => pn > pdf.numPages || pn < 1)) {
                setProcessingError(`ژمارەی لاپەڕەکان دەبێت لە نێوان ١ و ${pdf.numPages} بن.`);
                setIsProcessingPdf(false);
                return;
            }

            const imageParts: ImageFile[] = [];
            for (const pageNum of pageNumbers) {
                const page = await pdf.getPage(pageNum);
                const viewport = page.getViewport({ scale: 1.5 });
                const canvas = document.createElement('canvas');
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                const context = canvas.getContext('2d');
                
                if(context){
                    await page.render({ canvasContext: context, viewport }).promise;
                    
                    const base64Data = canvas.toDataURL('image/jpeg').split(',')[1];
                    imageParts.push({
                        inlineData: { data: base64Data, mimeType: 'image/jpeg' }
                    });
                }
            }
            onGenerate(imageParts, numQuestions);
        } catch (e) {
            console.error(e);
            setProcessingError("هەڵەیەک لە کاتی پرۆسێسکردنی فایلی PDF ڕوویدا.");
        } finally {
            setIsProcessingPdf(false);
        }
    }, 0);

  }, [pdfFile, pageInput, onGenerate, numQuestions]);
  
    const renderFileUpload = () => {
    if (isDbLoading) {
      return (
        <div className="flex flex-col items-center justify-center w-full py-10 border-2 border-dashed border-slate-300 rounded-lg bg-slate-50">
          <LoadingSpinner />
          <p className="mt-4 text-slate-500">...کەمێک چاوەڕوانبە</p>
        </div>
      );
    }

    if (!pdfFile) {
        return (
            <div>
              <label
                  htmlFor="file-upload"
                  className="relative flex flex-col items-center justify-center w-full py-10 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                  <PdfIcon className="w-12 h-12 text-slate-400 mb-3" />
                  <span className="font-semibold text-cyan-600">کرتە بکە بۆ بارکردنی PDF</span>
                  <input id="file-upload" name="file-upload" type="file" accept="application/pdf" className="sr-only" onChange={handleFileChange} />
              </label>
               <p className="text-xs text-slate-500 mt-2 text-center">تێبینی: فایلەکە لەسەر ئامێرەکەت هەڵدەگیرێت بۆ بەکارهێنانەوەی داهاتوو.</p>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-between p-3 bg-slate-100 border border-slate-200 rounded-lg">
            <div className="flex items-center gap-3">
                <PdfIcon className="w-8 h-8 text-cyan-600" />
                <span className="font-medium text-slate-800">{pdfFile.name}</span>
            </div>
            <button onClick={removeFile} className="text-red-500 hover:text-red-700">
                <XCircleIcon className="w-6 h-6" />
            </button>
        </div>
    );
  };

  const isButtonDisabled = !pdfFile || !pageInput || isLoading || isProcessingPdf;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
            <h1 className="text-3xl font-bold text-slate-800">ئامادەکردنی وانە</h1>
            <p className="text-slate-500">{book.name} - {grade.name}</p>
        </div>
        <button
            onClick={onBack}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
        >
            <ArrowRightIcon className="h-5 w-5" />
            <span>گەڕانەوە</span>
        </button>
      </div>
      
      <div className="bg-white p-8 rounded-xl shadow-md space-y-6">
        <div>
            <label className="font-semibold mb-2 block text-slate-700">١. کتێبەکە بە فایلی PDF باربکە</label>
            {renderFileUpload()}
        </div>
        
        <div>
            <label htmlFor="page-numbers" className="font-semibold mb-2 block text-slate-700">٢. ژمارەی لاپەڕەکان دیاری بکە</label>
            <input 
                id="page-numbers"
                type="text"
                value={pageInput}
                onChange={(e) => setPageInput(e.target.value)}
                placeholder="بۆ نموونە: 25-30 یان 41, 43"
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                dir="ltr"
            />
        </div>

        <div>
            <label htmlFor="num-questions" className="font-semibold mb-2 block text-slate-700">٣. ژمارەی پرسیارەکانی تاقیکردنەوە</label>
            <select
                id="num-questions"
                value={numQuestions}
                onChange={(e) => setNumQuestions(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition bg-white"
            >
                <option value="5">٥ پرسیار</option>
                <option value="10">١٠ پرسیار</option>
                <option value="15">١٥ پرسیار</option>
                <option value="20">٢٠ پرسیار</option>
            </select>
        </div>

        {(error || processingError) && (
            <div className="text-center p-3 bg-red-100 text-red-700 rounded-lg">{error || processingError}</div>
        )}

        <div className="pt-4 text-center">
            <button
                onClick={handleGenerateClick}
                disabled={isButtonDisabled}
                className="w-full sm:w-auto px-10 py-4 bg-cyan-600 text-white font-bold text-lg rounded-lg hover:bg-cyan-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
                {isLoading ? (
                    <>
                        <LoadingSpinner />
                        <span>...تکایە چاوەڕوان بە</span>
                    </>
                ) : isProcessingPdf ? (
                    <>
                        <LoadingSpinner />
                        <span>...پرۆسێسی PDF دەکرێت</span>
                    </>
                ) : (
                    <span>دروستکردنی وانە</span>
                )}
            </button>
        </div>
      </div>
    </div>
  );
};

export default LessonPrepView;
