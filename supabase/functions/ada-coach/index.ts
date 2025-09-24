import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { question, devContext } = await req.json();

    if (!question) {
      throw new Error('Question is required');
    }

    console.log('Ada Coach request:', { 
      questionLength: question.length,
      hasContext: !!devContext
    });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: "system",
            content: "You are Ada, an AI coach for software developers. You explain signals, risk scores, and coaching loops based on data. Be concise, direct, and actionable. Prefer JSON with keys: reply, tips[]."
          },
          {
            role: "user",
            content: `Question: ${question}\n\nContext (optional): ${JSON.stringify(devContext || {})}`
          }
        ],
        max_tokens: 800,
        temperature: 0.2
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Ada Coach response received');

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response format from OpenAI');
    }

    let adaResult: { reply: string; tips: string[] };
    try {
      adaResult = JSON.parse(data.choices[0].message.content);
      // Ensure structure
      if (typeof adaResult.reply !== 'string') {
        adaResult.reply = String(adaResult.reply ?? '');
      }
      if (!Array.isArray(adaResult.tips)) {
        adaResult.tips = [];
      }
    } catch (_parseError) {
      // Fallback: treat content as plain text
      const content = data.choices[0].message.content ?? '';
      console.error('Failed to parse Ada response as JSON, using fallback text');
      adaResult = { reply: content, tips: [] };
    }

    return new Response(JSON.stringify(adaResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in Ada coach function:', error);
    return new Response(JSON.stringify({ 
      reply: "I'm temporarily unavailable. Please try the DevCoach option or contact your team lead for immediate support.",
      tips: [
        "Check the console for technical details",
        "Try DevCoachBot for immediate coaching assistance", 
        "Contact your manager if this persists"
      ],
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});