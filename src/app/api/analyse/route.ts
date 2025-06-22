



// import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

//const openai = new OpenAI({
//  apiKey: process.env.OPENAI_API_KEY,
//});

export async function POST(req: Request) {
    try {
      const formData = await req.formData();
      const file = formData.get('file') as File;
  
      if (!file) {
        return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
      }
  
      // --- 🧪 MOCKING RESPONSE FOR NOW ---
      // Pretend to process the file to keep dev flow intact
      const buffer = Buffer.from(await file.arrayBuffer());
      const base64 = buffer.toString('base64');
      console.log('Mocking analysis for image (base64 size):', base64.length);
  
      // Return mock data
      return NextResponse.json({
        result: `Calories: ~720 kcal\nProtein: 32g\nCarbs: 65g\nFat: 28g\nTip: Balance this meal with more veggies to improve fibre and reduce overall fat.`,
      });


/*
🔒 Temporarily disabling real OpenAI call while waiting for quota
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString('base64');

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analyse this image. If it’s a photo of food or a macro tracking screenshot, estimate calories/macros and give one tip for improvement.',
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64}`,
              },
            },
          ],
        },
      ],
    });

    const content = response.choices[0].message.content;
    return NextResponse.json({ result: content }); 
    */ 

  } catch (err: unknown) {
    console.error('Server error:', err);
    return NextResponse.json({ error: 'Failed to analyse image' }, { status: 500 });
  }
}