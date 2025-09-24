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
    const { person, kpiData, prLinks } = await req.json();

    if (!person || !kpiData) {
      throw new Error('Person and KPI data are required');
    }

    console.log('DevCoachBot request:', { 
      person: person.name, 
      role: person.role,
      kpiDataLength: kpiData.length,
      prLinks: prLinks?.length || 0
    });

    // Format KPIs for the prompt
    const kpiSummary = kpiData.map((kpi: any) => `${kpi.kpi}: ${kpi.value} ${kpi.unit}`).join(', ');
    const prLinksText = prLinks && prLinks.length > 0 ? prLinks.join(', ') : 'No recent PRs available';

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini-2025-08-07',
        messages: [
          {
            role: "system",
            content: `You are DevCoachBot. You coach software engineers using concrete, low-friction steps.

Inputs: role, last 7d KPIs (prs/week, review turnaround, lead time, reopen rate, CI failures), last two PR links.

Output JSON:
{
 "short_dm": "... <=120 chars",
 "plan_bullets": ["3-5 bullets tailored to the KPIs"],
 "review_comment": "checklist text to paste on next PR",
 "measure": "counterfactual metric to hit in 72h (e.g., prs/week ≥ 4; review turnaround ≤ 24h)"
}

Tone: direct, non-judgmental, data-driven. Propose one habit change + one practice change + one artifact today.

Focus on the specific KPI patterns you see. If PRs/week is low, focus on flow and scope. If review turnaround is high, focus on communication and size. If lead time is high, focus on deployment pipeline. If reopen rate is high, focus on testing practices. If CI failures are high, focus on code quality gates.

Always provide concrete, actionable steps that can be implemented immediately.`
          },
          {
            role: "user",
            content: `Role: ${person.role}
Last 7d KPIs: ${kpiSummary}
Recent PRs: ${prLinksText}

Generate coaching plan.`
          }
        ],
        max_completion_tokens: 500,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      throw new Error(error.error?.message || 'Failed to generate coaching plan');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log('DevCoachBot raw response:', content);
    
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(content);
      
      // Validate the expected structure
      if (!parsedResponse.short_dm || !parsedResponse.plan_bullets || !parsedResponse.review_comment || !parsedResponse.measure) {
        throw new Error('Invalid response structure');
      }
      
    } catch (e) {
      console.error('Failed to parse DevCoachBot response:', e);
      // Fallback with proper structure
      parsedResponse = {
        short_dm: "Your delivery metrics need attention. Let's focus on concrete improvements this week.",
        plan_bullets: [
          "Review your PR scope - aim for <300 lines to improve review speed",
          "Set up automated CI checks to catch issues before review",
          "Block 2h daily for focused coding without meetings"
        ],
        review_comment: "Checklist: [ ] Tests added/updated [ ] PR size <300 lines [ ] Self-reviewed before submission",
        measure: "review turnaround ≤ 24h"
      };
    }

    return new Response(JSON.stringify(parsedResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in coach-bot function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      short_dm: "Coaching system temporarily unavailable. Check back in a few minutes.",
      plan_bullets: [
        "Contact your team lead for immediate support",
        "Review recent project deliverables and blockers", 
        "Schedule a brief performance check-in this week"
      ],
      review_comment: "Checklist: [ ] Code review completed [ ] Tests passing [ ] Documentation updated",
      measure: "Complete current sprint commitments"
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});