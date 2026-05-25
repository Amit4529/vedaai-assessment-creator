import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env';
import { IQuestionType } from '../models/Assignment';

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

interface GenerateParams {
  title: string;
  subject: string;
  className: string;
  questionTypes: IQuestionType[];
  additionalInstructions: string;
}

export async function generateQuestionPaper(params: GenerateParams) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const totalQuestions = params.questionTypes.reduce((sum, qt) => sum + qt.count, 0);
  const totalMarks = params.questionTypes.reduce((sum, qt) => sum + (qt.count * qt.marks), 0);

  const questionTypeDetails = params.questionTypes
    .filter(qt => qt.count > 0)
    .map(qt => `- ${qt.type}: ${qt.count} questions, ${qt.marks} marks each`)
    .join('\n');

  const prompt = `You are an expert exam paper creator. Generate a structured question paper in JSON format.

Assignment: "${params.title}"
Subject: ${params.subject || 'General'}
Class: ${params.className || '8th'}
Total Questions: ${totalQuestions}
Total Marks: ${totalMarks}

Question Types Required:
${questionTypeDetails}

${params.additionalInstructions ? `Additional Instructions: ${params.additionalInstructions}` : ''}

IMPORTANT: You MUST respond with ONLY valid JSON (no markdown, no code blocks, no explanation). The JSON must follow this EXACT structure:

{
  "schoolName": "Delhi Public School, Sector-4, Bokaro",
  "subject": "${params.subject || 'Science'}",
  "className": "${params.className || '8th'}",
  "timeAllowed": "90 minutes",
  "maxMarks": ${totalMarks},
  "sections": [
    {
      "title": "Section A",
      "type": "Short Answer Questions",
      "instructions": "Attempt all questions. Each question carries X marks.",
      "marksPerQuestion": 2,
      "questions": [
        {
          "number": 1,
          "text": "Define electrolyte and give an example.",
          "difficulty": "Easy",
          "marks": 2
        }
      ]
    }
  ],
  "answerKey": [
    {
      "number": 1,
      "answer": "An electrolyte is a substance that produces ions when dissolved in water. Example: Sodium chloride (NaCl)."
    }
  ]
}

Rules:
1. Distribute questions across sections logically based on question types
2. Each section should group similar question types together
3. Assign difficulty levels: roughly 30% Easy, 40% Moderate, 30% Hard
4. Questions must be relevant, educational, and age-appropriate
5. The difficulty field MUST be exactly one of: "Easy", "Moderate", "Hard"
6. Every question must have an entry in the answerKey
7. Question numbers must be sequential across all sections
8. Make questions realistic for a CBSE board exam`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  let text = response.text();

  // Clean up response - remove markdown code blocks if present
  text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

  try {
    const parsed = JSON.parse(text);
    
    // Validate the structure
    if (!parsed.sections || !Array.isArray(parsed.sections)) {
      throw new Error('Response missing sections array');
    }
    if (!parsed.answerKey || !Array.isArray(parsed.answerKey)) {
      throw new Error('Response missing answerKey array');
    }

    // Ensure all required fields exist with defaults
    return {
      schoolName: parsed.schoolName || 'Delhi Public School, Sector-4, Bokaro',
      subject: parsed.subject || params.subject || 'Science',
      className: parsed.className || params.className || '8th',
      timeAllowed: parsed.timeAllowed || '90 minutes',
      maxMarks: parsed.maxMarks || totalMarks,
      sections: parsed.sections.map((section: any) => ({
        title: section.title || 'Section',
        type: section.type || 'Questions',
        instructions: section.instructions || 'Attempt all questions.',
        marksPerQuestion: section.marksPerQuestion || section.questions?.[0]?.marks || 2,
        questions: (section.questions || []).map((q: any) => ({
          number: q.number,
          text: q.text,
          difficulty: ['Easy', 'Moderate', 'Hard'].includes(q.difficulty) ? q.difficulty : 'Moderate',
          marks: q.marks || section.marksPerQuestion || 2,
          options: q.options || undefined,
        })),
      })),
      answerKey: parsed.answerKey.map((a: any) => ({
        number: a.number,
        answer: a.answer,
      })),
    };
  } catch (parseError) {
    console.error('Failed to parse AI response:', text.substring(0, 500));
    throw new Error('Failed to parse AI response as JSON');
  }
}
