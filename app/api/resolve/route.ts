import { NextRequest, NextResponse } from 'next/server';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

export async function POST(request: NextRequest) {
  try {
    const { title, description, category, endDate } = await request.json();

    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }

    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const endDateStr = new Date(endDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const prompt = `You are an AI oracle for a prediction market. Your job is to determine the outcome of prediction market questions based on publicly available information.

Market Question: ${title}

Description/Resolution Criteria: ${description}

Category: ${category}

Resolution Date: ${endDateStr}

Based on publicly available information and the resolution criteria provided, determine if this market should resolve to YES or NO.

IMPORTANT:
- Only respond with a JSON object
- The outcome must be either "yes" or "no"
- Provide clear reasoning for your decision
- If the event hasn't happened yet or information is unclear, make your best judgment based on available data

Respond in this exact JSON format:
{
  "outcome": "yes" or "no",
  "reasoning": "Your detailed reasoning here"
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-5-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an AI oracle that resolves prediction market outcomes. Always respond with valid JSON only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_completion_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenAI API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to get AI response', details: errorData },
        { status: 500 }
      );
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
      return NextResponse.json(
        { error: 'No response from AI' },
        { status: 500 }
      );
    }

    // Parse the AI response
    let parsedResponse;
    try {
      // Try to extract JSON from the response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        parsedResponse = JSON.parse(aiResponse);
      }
    } catch {
      console.error('Failed to parse AI response:', aiResponse);
      return NextResponse.json(
        { error: 'Failed to parse AI response', raw: aiResponse },
        { status: 500 }
      );
    }

    // Validate the response
    if (!parsedResponse.outcome || !['yes', 'no'].includes(parsedResponse.outcome.toLowerCase())) {
      return NextResponse.json(
        { error: 'Invalid outcome from AI', raw: parsedResponse },
        { status: 500 }
      );
    }

    return NextResponse.json({
      outcome: parsedResponse.outcome.toLowerCase(),
      reasoning: parsedResponse.reasoning || 'No reasoning provided',
      model: 'gpt-5-mini',
      provider: 'OpenAI',
    });
  } catch (error: unknown) {
    console.error('Resolve API error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
