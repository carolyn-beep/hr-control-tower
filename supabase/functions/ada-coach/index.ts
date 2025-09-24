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
        model: 'gpt-5-mini-2025-08-07',
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: "You are Ada, an AI coach for software developers. You explain signals, risk scores, and coaching loops based on data. Be concise, direct, and actionable. Always return JSON with keys: reply, tips[]."
          },
          {
            role: "user",
            content: `Question: ${question}\n\nContext (optional): ${JSON.stringify(devContext || {})}`
          }
        ],
        max_completion_tokens: 800,
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

    let adaResult;
    try {
      adaResult = JSON.parse(data.choices[0].message.content);
    } catch (parseError) {
      console.error('Failed to parse Ada response as JSON:', data.choices[0].message.content);
      throw new Error('Invalid JSON response from Ada');
    }

    // Validate the Ada response structure
    if (!adaResult.reply || !Array.isArray(adaResult.tips)) {
      console.error('Ada response missing required fields:', adaResult);
      throw new Error('Ada response missing required fields (reply, tips)');
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