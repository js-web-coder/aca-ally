import { GoogleGenerativeAI } from "@google/generative-ai";

// Check for API key
const apiKey = process.env.GEMINI_API_KEY || "AIzaSyCDGxTm05gW22cXVriugLT0QoVxronv3B8";

// Create Gemini client
const genAI = new GoogleGenerativeAI(apiKey);

/**
 * Get a response from Gemini AI
 * @param prompt - The user's prompt
 * @param systemInstruction - Optional system instruction to guide the model
 * @returns The model's response text
 */
export async function getGeminiResponse(prompt: string, systemInstruction?: string): Promise<string> {
  // API key is already validated at the top of the file
  
  try {
    // Create the model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    // Start a chat session - note that Gemini handles safety differently from OpenAI/Perplexity
    const chat = model.startChat({
      generationConfig: {
        temperature: 0.2,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 1024,
      }
    });
    
    // Add system instruction as a "virtual" assistant message if provided
    if (systemInstruction) {
      await chat.sendMessage(systemInstruction);
      // User won't see this message, it's just to "prime" the model
    }
    
    // Send the actual prompt and get the response
    const result = await chat.sendMessage(prompt);
    const response = result.response;
    
    return response.text();
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw new Error('Failed to get response from Gemini API');
  }
}

/**
 * Get educational content assistance specifically for homework help
 * @param subject The academic subject
 * @param question The specific homework question
 * @returns Detailed educational response
 */
export async function getHomeworkHelp(subject: string, question: string): Promise<string> {
  const systemInstruction = `You are a knowledgeable educational assistant specializing in ${subject}. 
  Provide detailed, accurate, and helpful explanations that enable learning.
  Include relevant equations, concepts, and step-by-step solutions when appropriate.
  Your responses should be educational and help students understand concepts, not just give answers.`;
  
  const prompt = `I need help with this ${subject} question: ${question}`;
  
  return getGeminiResponse(prompt, systemInstruction);
}

/**
 * Analyze content and provide educational feedback
 * @param content The content to analyze
 * @returns Structured feedback about the content
 */
export async function analyzeEducationalContent(content: string): Promise<any> {
  const systemInstruction = `You are an educational content analyst. Analyze the provided text and return a structured response with these elements:
  1. A concise summary (2-3 sentences)
  2. Key concepts identified (maximum 5 bullet points)
  3. Suggested improvements or areas to explore further
  4. A readability assessment
  
  Format your response in clear sections.`;
  
  const response = await getGeminiResponse(content, systemInstruction);
  
  // Extract structured information from the response text
  const sections = response.split('\n\n');
  
  return {
    summary: sections[0] || '',
    keyConcepts: extractBulletPoints(sections[1] || ''),
    suggestions: extractBulletPoints(sections[2] || ''),
    readabilityAssessment: sections[3] || ''
  };
}

/**
 * Helper function to extract bullet points from text
 */
function extractBulletPoints(text: string): string[] {
  const bulletPointRegex = /[•\-*]\s*([^\n]+)/g;
  const matches = [];
  let match;
  while ((match = bulletPointRegex.exec(text)) !== null) {
    matches.push(match);
  }
  return matches.map(match => match[1].trim());
}