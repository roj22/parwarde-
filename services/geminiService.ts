import { GoogleGenAI, Type } from "@google/genai";
import { LessonContent, QuizItem } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        topic: {
            type: Type.STRING,
            description: "ناونیشانی وانەکە کە لە لاپەڕەکانەوە وەرگیراوە.",
        },
        explanation: {
            type: Type.OBJECT,
            description: "ڕوونکردنەوەی وانەکە بە سێ ئاستی جیاوازی درێژی.",
            properties: {
                short: { type: Type.STRING, description: "پوختەیەکی کورت و خێرای وانەکە." },
                medium: { type: Type.STRING, description: "شیکردنەوەیەکی مامناوەند کە توازنی هەیە لە نێوان وردەکاری و سادەییدا." },
                long: { type: Type.STRING, description: "شیکردنەوەیەکی درێژ و تێروتەسەل لەگەڵ نموونەی زیاتر." },
            },
            required: ["short", "medium", "long"],
        },
        quiz: {
            type: Type.ARRAY,
            description: "لیستێک لە پرسیاری هەڵبژاردن کە تەنها و تەنها لە کتێبەکەوە وەرگیراون. پێویستە هەموو پرسیار و وەڵامەکان جیاواز بن.",
            items: {
                type: Type.OBJECT,
                properties: {
                    question: {
                        type: Type.STRING,
                        description: "دەقی پرسیارەکە بە کوردی.",
                    },
                    options: {
                        type: Type.ARRAY,
                        description: "چوار هەڵبژاردنی جیاواز بۆ پرسیارەکە.",
                        items: {
                            type: Type.STRING,
                        },
                    },
                    correctAnswer: {
                        type: Type.STRING,
                        description: "وەڵامی ڕاست لەناو هەڵبژاردنەکاندا.",
                    },
                },
                required: ["question", "options", "correctAnswer"],
            },
        },
        flashcards: {
            type: Type.ARRAY,
            description: "لیستێک لە فلاشکارت بۆ خاڵە گرنگەکانی وانەکەی ناو وێنەکان.",
            items: {
                type: Type.OBJECT,
                properties: {
                    term: {
                        type: Type.STRING,
                        description: "دەستەواژە یان پرسیاری سەرەکی لەسەر فلاشکارتەکە.",
                    },
                    definition: {
                        type: Type.STRING,
                        description: "پێناسە یان وەڵامی دەستەواژەکە.",
                    },
                },
                required: ["term", "definition"],
            },
        },
    },
    required: ["topic", "explanation", "quiz", "flashcards"],
};

// Fix: Add a specific schema for quiz regeneration
const quizOnlySchema = {
    type: Type.ARRAY,
    description: "لیستێک لە پرسیاری هەڵبژاردن کە تەنها و تەنها لە کتێبەکەوە وەرگیراون. پێویستە هەموو پرسیار و وەڵامەکان جیاواز بن.",
    items: {
        type: Type.OBJECT,
        properties: {
            question: {
                type: Type.STRING,
                description: "دەقی پرسیارەکە بە کوردی.",
            },
            options: {
                type: Type.ARRAY,
                description: "چوار هەڵبژاردنی جیاواز بۆ پرسیارەکە.",
                items: {
                    type: Type.STRING,
                },
            },
            correctAnswer: {
                type: Type.STRING,
                description: "وەڵامی ڕاست لەناو هەڵبژاردنەکاندا.",
            },
        },
        required: ["question", "options", "correctAnswer"],
    },
};


interface ImagePart {
    inlineData: {
      mimeType: string;
      data: string;
    };
}

// Fix: Complete the function implementation
export const generateLessonContent = async (gradeName: string, bookName: string, images: ImagePart[], numQuestions: string): Promise<LessonContent> => {
  try {
    const textPart = {
        text: `
        تکایە پشت بەست بە وێنە هاوپێچکراوەکانی لاپەڕەکانی کتێب، ئەم چوار شتەم بۆ دروست بکە. هەموو نووسینەکان بە زمانی کوردیی سۆرانی بن:
        پۆل: ${gradeName}
        کتێب: ${bookName}
  
        ١. بابەتی وانە: ناونیشانی سەرەکی وانەکە لەم لاپەڕانەوە دەربهێنە.
  
        ٢. شیکردنەوە (فێركردن): وانەکە بە سێ ئاستی جیاواز ڕوون بکەرەوە: کورت, مامناوەند, و درێژ.
  
        ٣. تاقیکردنەوە: ${numQuestions} پرسیاری هەڵبژاردن دروست بکە لەسەر وانەکە کە چوار وەڵامی هەبێت و یەکێکیان ڕاست بێت. پرسیار و وەڵامەکان نابێت دووبارە بن.
  
        ٤. فلاشکارت: چەند فلاشکارتێک دروست بکە بۆ خاڵە گرنگەکانی وانەکە، کە هەر یەکەیان دەستەواژەیەک و پێناسەیەکی هەبێت.
  
        پێویستە دەرئەنجامەکە بە شێوەی JSON بێت کە لەگەڵ سکیمای پێدراودا بگونجێت.
        `
    };

    const model = 'gemini-2.5-flash';

    const contents = { parts: [textPart, ...images] };

    const response = await ai.models.generateContent({
        model,
        contents,
        config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
        }
    });

    const jsonStr = response.text.trim();
    const cleanedJsonStr = jsonStr.replace(/^```json\s*|```\s*$/g, '');
    const result = JSON.parse(cleanedJsonStr);
    return result as LessonContent;

  } catch (e) {
    console.error("Error generating lesson content:", e);
    if (e instanceof Error) {
        throw new Error(`نەتوانرا وانە دروست بکرێت: ${e.message}`);
    }
    throw new Error('هەڵەیەکی نەزانراو لە کاتی دروستکردنی وانەدا ڕوویدا');
  }
};

// Fix: Add the missing generateNewQuiz function
export const generateNewQuiz = async (gradeName: string, bookName: string, images: ImagePart[], numQuestions: string): Promise<QuizItem[]> => {
    try {
      const textPart = {
          text: `
          تکایە پشت بەست بە وێنە هاوپێچکراوەکانی لاپەڕەکانی کتێب، تەنها تاقیکردنەوەیەکی نوێم بۆ دروست بکە کە لە ${numQuestions} پرسیاری هەڵبژاردن پێک هاتبێت.
          دڵنیابە کە پرسیارەکان جیاواز بن لە هەر پرسیارێکی پێشووتر کە لەسەر هەمان بابەت دروستکراوە.
          هەموو نووسینەکان بە زمانی کوردیی سۆرانی بن.
          پۆل: ${gradeName}
          کتێب: ${bookName}
          `
      };
      
      const model = 'gemini-2.5-flash';
  
      const contents = { parts: [textPart, ...images] };
  
      const response = await ai.models.generateContent({
          model,
          contents,
          config: {
              responseMimeType: "application/json",
              responseSchema: quizOnlySchema
          }
      });
  
      const jsonStr = response.text.trim();
      const cleanedJsonStr = jsonStr.replace(/^```json\s*|```\s*$/g, '');
      const result = JSON.parse(cleanedJsonStr);
      return result as QuizItem[];
  
    } catch (e) {
      console.error("Error generating new quiz:", e);
      if (e instanceof Error) {
          throw new Error(`نەتوانرا پرسیاری نوێ دروست بکرێت: ${e.message}`);
      }
      throw new Error('هەڵەیەکی نەزانراو لە کاتی دروستکردنی پرسیاری نوێدا ڕوویدا');
    }
  };
