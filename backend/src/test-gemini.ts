import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const apiKey = process.env.GEMINI_API_KEY;
console.log('Testing with API Key:', apiKey);

const models = [
  'gemini-flash-latest',
  'gemini-2.0-flash-lite',
  'gemini-2.5-flash',
  'gemini-3.5-flash'
];

async function testModel(modelName: string) {
  console.log(`\n--- Testing model: ${modelName} ---`);
  const genAI = new GoogleGenerativeAI(apiKey);
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent('Say hello in exactly 3 words.');
    console.log(`SUCCESS [${modelName}]:`, result.response.text().trim());
    return true;
  } catch (error: any) {
    console.error(`FAILED [${modelName}]:`, error.message || error);
    return false;
  }
}

async function run() {
  for (const m of models) {
    await testModel(m);
  }
}

run();
