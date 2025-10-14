import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      );
    }

    console.log('🔍 Identifying bug from image:', imageUrl);

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `You are an expert entomologist. Analyze this insect/bug image and provide detailed information.

Return ONLY a valid JSON object (no markdown, no code blocks) with this exact structure:
{
  "commonName": "Common name of the insect",
  "scientificName": "Genus species",
  "family": "Family name",
  "order": "Order name",
  "confidence": 0.95,
  "distribution": "Geographic range",
  "habitat": "Where it lives",
  "diet": "What it eats",
  "size": "Average size (e.g., 5-10mm)",
  "isDangerous": false,
  "dangerLevel": 0,
  "conservationStatus": "Status if known",
  "interestingFacts": [
    "Fact 1",
    "Fact 2",
    "Fact 3"
  ],
  "characteristics": {
    "venom": 0,
    "biteForce": 0,
    "disease": 0,
    "aggression": 0,
    "speed": 0
  },
  "lifespan": "Average lifespan",
  "rarity": "common/uncommon/rare/very rare"
}

Rate characteristics on a scale of 0-10. If you cannot identify the insect with confidence, set confidence below 0.5 and make your best guess.`,
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl,
                detail: 'high',
              },
            },
          ],
        },
      ],
      max_tokens: 1500,
      temperature: 0.3,
    });

    const content = response.choices[0].message.content;
    console.log('✅ OpenAI raw response:', content);

    if (!content) {
      throw new Error('No response from OpenAI');
    }

    // Parse the JSON response
    let bugData;
    try {
      // Remove markdown code blocks if present
      const cleanContent = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      bugData = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('❌ Failed to parse OpenAI response:', content);
      throw new Error('Failed to parse identification result');
    }

    console.log('🐛 Identified bug:', bugData.commonName, '-', bugData.scientificName);

    return NextResponse.json({
      success: true,
      bug: bugData,
    });
  } catch (error) {
    console.error('❌ Error identifying bug:', error);
    return NextResponse.json(
      {
        error: 'Failed to identify bug',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
