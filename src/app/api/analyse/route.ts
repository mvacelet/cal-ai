
import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================
interface AnalysisRequest {
  file: File;
}

interface AnalysisResponse {
  result: string;
}

interface ErrorResponse {
  error: string;
}

// ============================================================================
// OPENAI CONFIGURATION
// ============================================================================
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Validates that the OpenAI API key is configured
 */
function validateOpenAIConfig(): void {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured. Please add OPENAI_API_KEY to your environment variables.');
  }
}

/**
 * Converts a file to base64 string
 * @param file - The file to convert
 * @returns Base64 encoded string
 */
async function fileToBase64(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  return buffer.toString('base64');
}

/**
 * Analyzes an image using OpenAI GPT-4 Vision
 * @param base64Image - Base64 encoded image
 * @returns Analysis result from OpenAI
 */
async function analyzeImageWithAI(base64Image: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Analyze this image. If it\'s a photo of food or a macro tracking screenshot, estimate calories/macros and give one tip for improvement. Format the response as: Calories: [value] kcal\nProtein: [value]g\nCarbs: [value]g\nFat: [value]g\n\nTip: [nutrition tip]',
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:image/jpeg;base64,${base64Image}`,
            },
          },
        ],
      },
    ],
    max_tokens: 500,
    temperature: 0.3,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No analysis result received from OpenAI');
  }

  return content;
}

// ============================================================================
// API ROUTE HANDLER
// ============================================================================

/**
 * POST endpoint for analyzing food images
 * Accepts multipart form data with an image file
 * Returns nutrition analysis from OpenAI GPT-4 Vision
 */
export async function POST(req: Request): Promise<NextResponse<AnalysisResponse | ErrorResponse>> {
  try {
    // Validate OpenAI configuration
    validateOpenAIConfig();

    // Parse form data
    const formData = await req.formData();
    const file = formData.get('file') as File;

    // Validate file input
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Uploaded file must be an image' },
        { status: 400 }
      );
    }

    // Convert file to base64
    const base64Image = await fileToBase64(file);

    // Analyze image with AI
    const analysisResult = await analyzeImageWithAI(base64Image);

    // Return successful analysis
    return NextResponse.json({ result: analysisResult });

  } catch (err: unknown) {
    console.error('Analysis API error:', err);
    
    const errorMessage = err instanceof Error 
      ? err.message 
      : 'Failed to analyze image';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}