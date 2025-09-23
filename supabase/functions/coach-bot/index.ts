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
    const { person, kpiData } = await req.json();

    if (!person || !kpiData) {
      throw new Error('Person and KPI data are required');
    }

    console.log('CoachBot request:', { person: person.name, kpiDataLength: kpiData.length });

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
            content: "You are CoachBot. Your goal is to help an engineer improve delivery metrics with concrete, low-friction steps. Respond with a brief coaching message (2-3 sentences) and then provide 3 specific actionable steps they can take this week. Format your response as JSON with 'message' and 'steps' (array of strings) fields."
          },
          {
            role: "user",
            content: `Person: ${person.name} (${person.role})\nKPI snapshot: ${JSON.stringify(kpiData)}`
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      throw new Error(error.error?.message || 'Failed to generate coaching plan');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log('CoachBot raw response:', content);
    
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(content);
    } catch (e) {
      // Fallback if AI doesn't return JSON
      parsedResponse = {
        message: content,
        steps: [
          "Review recent performance metrics",
          "Focus on improving key delivery indicators", 
          "Schedule regular check-ins with team"
        ]
      };
    }

    return new Response(JSON.stringify(parsedResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in coach-bot function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      message: "I encountered an issue generating your coaching plan. Please try again.",
      steps: ["Contact your manager for support", "Review recent project deliverables", "Schedule a performance review"]
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});