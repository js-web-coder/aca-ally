import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY 
});

export async function getAIChatResponse(message: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system", 
          content: "You are an educational assistant helping students and teachers. Your responses should be helpful, accurate, and appropriate for an educational context. You can help with homework questions, explain concepts, provide resources, or engage in casual conversation while maintaining a supportive and encouraging tone. Keep responses concise but complete."
        },
        { 
          role: "user", 
          content: message 
        }
      ],
    });

    return response.choices[0].message.content || "I couldn't process your request. Please try again.";
  } catch (error) {
    console.error("OpenAI API error:", error);
    return "Sorry, I'm having trouble connecting to my knowledge base right now. Please try again later.";
  }
}

export async function getHomeworkHelp(subject: string, question: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system", 
          content: `You are a specialized educational assistant for ${subject}. Provide helpful, step-by-step explanations with a focus on teaching the student how to approach similar problems in the future. Include relevant formulas, concepts, and examples when appropriate.`
        },
        { 
          role: "user", 
          content: question 
        }
      ],
    });

    return response.choices[0].message.content || "I couldn't process your request. Please try again.";
  } catch (error) {
    console.error("OpenAI API error:", error);
    return "Sorry, I'm having trouble analyzing this homework problem right now. Please try again later.";
  }
}

export async function summarizeContent(content: string): Promise<{
  summary: string;
  keywords: string[];
  readingLevel: string;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Analyze the following educational content and provide a concise summary, relevant keywords, and approximate reading level (elementary, middle school, high school, undergraduate, graduate). Respond with JSON in this format: { 'summary': 'The concise summary', 'keywords': ['keyword1', 'keyword2'], 'readingLevel': 'level' }"
        },
        {
          role: "user",
          content: content
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);

    return {
      summary: result.summary || "",
      keywords: result.keywords || [],
      readingLevel: result.readingLevel || "unspecified"
    };
  } catch (error) {
    console.error("OpenAI API error:", error);
    return {
      summary: "Failed to generate summary",
      keywords: [],
      readingLevel: "unspecified"
    };
  }
}
