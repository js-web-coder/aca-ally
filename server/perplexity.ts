import { Response } from 'express';

interface PerplexityMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface PerplexityRequestOptions {
  model: string;
  messages: PerplexityMessage[];
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  search_domain_filter?: string[];
  return_images?: boolean;
  return_related_questions?: boolean;
  search_recency_filter?: string;
  top_k?: number;
  stream?: boolean;
  presence_penalty?: number;
  frequency_penalty?: number;
}

interface PerplexityCitation {
  url: string;
}

interface PerplexityChoice {
  index: number;
  finish_reason: string;
  message: {
    role: string;
    content: string;
  };
  delta: {
    role: string;
    content: string;
  };
}

interface PerplexityResponse {
  id: string;
  model: string;
  object: string;
  created: number;
  citations: PerplexityCitation[];
  choices: PerplexityChoice[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

const apiKey = process.env.PERPLEXITY_API_KEY;

if (!apiKey) {
  console.error('PERPLEXITY_API_KEY must be set in environment variables');
}

/**
 * Get a response from Perplexity API
 * @param userPrompt - The user's prompt
 * @param systemInstruction - Optional system instruction to guide the model
 * @returns The model's response text
 */
export async function getPerplexityResponse(userPrompt: string, systemInstruction?: string): Promise<string> {
  if (!apiKey) {
    throw new Error('Perplexity API key not configured');
  }
  
  const messages: PerplexityMessage[] = [];
  
  // Add system message if provided
  if (systemInstruction) {
    messages.push({
      role: 'system',
      content: systemInstruction
    });
  }
  
  // Add user message
  messages.push({
    role: 'user',
    content: userPrompt
  });

  const requestOptions: PerplexityRequestOptions = {
    model: 'llama-3.1-sonar-small-128k-online', // Use small model by default
    messages,
    temperature: 0.2,
    top_p: 0.9,
    search_recency_filter: 'month',
    frequency_penalty: 1,
    stream: false
  };
  
  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestOptions)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Perplexity API error:', errorText);
      throw new Error(`Perplexity API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json() as PerplexityResponse;
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling Perplexity API:', error);
    throw new Error('Failed to get response from Perplexity API');
  }
}

/**
 * Get educational content assistance specifically for homework help
 * @param subject The academic subject
 * @param question The specific homework question
 * @returns Detailed educational response with citations when available
 */
export async function getHomeworkHelp(subject: string, question: string): Promise<string> {
  const systemInstruction = `You are a knowledgeable educational assistant specializing in ${subject}. 
  Provide detailed, accurate, and helpful explanations that enable learning.
  Include relevant equations, concepts, and step-by-step solutions when appropriate.
  Your responses should be educational and help students understand concepts, not just give answers.`;
  
  const prompt = `I need help with this ${subject} question: ${question}`;
  
  return getPerplexityResponse(prompt, systemInstruction);
}

/**
 * Stream a Perplexity response to the client
 * @param userPrompt The user's prompt
 * @param systemInstruction Optional system instruction to guide the model
 * @param res Express Response object to stream to
 */
export async function streamPerplexityResponse(
  userPrompt: string, 
  res: Response, 
  systemInstruction?: string
): Promise<void> {
  if (!apiKey) {
    res.status(500).json({ error: 'Perplexity API key not configured' });
    return;
  }
  
  const messages: PerplexityMessage[] = [];
  
  // Add system message if provided
  if (systemInstruction) {
    messages.push({
      role: 'system',
      content: systemInstruction
    });
  }
  
  // Add user message
  messages.push({
    role: 'user',
    content: userPrompt
  });

  const requestOptions: PerplexityRequestOptions = {
    model: 'llama-3.1-sonar-small-128k-online',
    messages,
    temperature: 0.2,
    top_p: 0.9,
    search_recency_filter: 'month',
    frequency_penalty: 1,
    stream: true // Enable streaming
  };
  
  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestOptions)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Perplexity API streaming error:', errorText);
      res.status(response.status).json({ 
        error: `Perplexity API error: ${response.status} ${response.statusText}` 
      });
      return;
    }
    
    // Set up server-sent events
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    // Get response as a readable stream
    const reader = response.body?.getReader();
    if (!reader) {
      res.status(500).json({ error: 'Failed to get response stream' });
      return;
    }
    
    // Read and process the stream
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      // Process each chunk of data
      const chunk = new TextDecoder().decode(value);
      
      // Send each chunk to the client
      res.write(`data: ${chunk}\n\n`);
    }
    
    // End the response
    res.end();
  } catch (error) {
    console.error('Error streaming from Perplexity API:', error);
    res.status(500).json({ error: 'Failed to stream response from Perplexity API' });
  }
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
  
  const response = await getPerplexityResponse(content, systemInstruction);
  
  // Extract structured information from the response text
  // This is a simple implementation; ideally would parse the response more robustly
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