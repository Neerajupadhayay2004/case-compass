import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, question } = await req.json();

    if (!url || !question) {
      return new Response(
        JSON.stringify({ error: "URL and question are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const BYTEZ_API_KEY = Deno.env.get("BYTEZ_API_KEY");
    
    if (!BYTEZ_API_KEY) {
      console.error("BYTEZ_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Document QA service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Processing document QA request:", { url, question });

    // Call Bytez API for document question answering
    const response = await fetch("https://api.bytez.com/model/v1/naver-clova-ix/donut-base-finetuned-docvqa/run", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${BYTEZ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
        question,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Bytez API error:", response.status, errorText);
      
      // Fallback to Lovable AI for document analysis
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      if (LOVABLE_API_KEY) {
        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              {
                role: "system",
                content: `You are a document analysis expert. Analyze the provided document URL and answer questions about it. 
                Provide specific answers with page references where possible.
                Format: Answer the question, then provide "Reference: Page X, Section Y" if applicable.`
              },
              {
                role: "user",
                content: `Document URL: ${url}\n\nQuestion: ${question}\n\nPlease analyze this document and answer the question with page/section references.`
              }
            ],
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          const answer = aiData.choices?.[0]?.message?.content || "Unable to analyze document";
          
          // Extract page reference from answer
          const pageMatch = answer.match(/[Pp]age\s*(\d+)/);
          const sectionMatch = answer.match(/[Ss]ection\s*([A-Za-z0-9.]+)/);
          
          return new Response(
            JSON.stringify({
              answer,
              page_number: pageMatch ? parseInt(pageMatch[1]) : null,
              section: sectionMatch ? sectionMatch[1] : null,
              source: "ai_analysis",
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
      
      return new Response(
        JSON.stringify({ error: "Failed to process document" }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    console.log("Bytez response:", data);

    return new Response(
      JSON.stringify({
        answer: data.output || data.answer || "No answer found",
        page_number: data.page_number || null,
        section: data.section || null,
        confidence: data.confidence || null,
        source: "bytez_docvqa",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Document QA error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
