import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PersonProfile {
  id: string;
  name: string;
  email: string;
  department: string;
  risk_score: number;
  created_at: string;
}

interface Evidence {
  kpi: string;
  value: number;
  benchmark: number;
  time_window: string;
  source_link: string;
}

interface CoachingHistory {
  id: string;
  objective: string;
  playbook: string;
  status: string;
  created_at: string;
}

interface RequestPayload {
  person_profile: PersonProfile;
  evidence_table: Evidence[];
  coaching_history: CoachingHistory[];
  risk_score: number;
  signal_context: {
    signal_id?: string;
    reason?: string;
  };
  policy_excerpt: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const payload: RequestPayload = await req.json();

    // Build the user prompt with the actual data
    const userPrompt = `PERSON:
${JSON.stringify(payload.person_profile)}

EVIDENCE_TABLE:
${JSON.stringify(payload.evidence_table)}

COACHING_HISTORY:
${JSON.stringify(payload.coaching_history)}

RISK_SCORE: ${payload.risk_score}

SIGNAL_CONTEXT: ${JSON.stringify(payload.signal_context)}

POLICY: ${payload.policy_excerpt}`;

    console.log('Calling OpenAI with prompt length:', userPrompt.length);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        response_format: { type: "json_object" },
        messages: [
          {
            role: 'system',
            content: 'You are ReleaseBot. Output ONLY a JSON object with keys: decision, rationale, communication, checklist. decision ∈ {"release","extend_coaching","retain"}. Base everything on provided evidence; if evidence is thin, prefer extend_coaching and say why. For rationale, provide an array of bullet points. For communication, write a professional email to the person. For checklist, provide an array of action items for HR.'
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('OpenAI response received');

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response format from OpenAI');
    }

    let aiResult;
    try {
      aiResult = JSON.parse(data.choices[0].message.content);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', data.choices[0].message.content);
      throw new Error('Invalid JSON response from AI');
    }

    // Validate the AI response structure
    if (!aiResult.decision || !aiResult.rationale || !aiResult.communication || !aiResult.checklist) {
      throw new Error('AI response missing required fields');
    }

    return new Response(JSON.stringify(aiResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in release-bot function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'AI service error - using fallback logic recommended'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});