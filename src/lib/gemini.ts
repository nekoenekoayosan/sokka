import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const flashModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash-preview-04-17",
});

export const proModel = genAI.getGenerativeModel({
  model: "gemini-2.5-pro-preview-03-25",
});
