export default {
  async fetch(request, env) {
    // CORS ہینڈلنگ تاکہ آپ کی ایپ ورکر سے بات کر سکے
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // اگر براؤزر سے OPTIONS ریکویسٹ آئے تو اسے خالی جواب دیں
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      const { task, payload, lang } = await request.json();
      const apiKey = env.GEMINI_API_KEY; // کلاؤڈ فلیر ویری ایبلز میں اپنی کی (Key) لگائیں

      let modelName = "gemini-3.1-flash"; // ٹیکسٹ اور ویژن کے لیے
      let endpoint = "generateContent";

      // اگر ٹاسک TTS (آواز) کا ہے تو مخصوص ماڈل استعمال کریں
      if (task === "tts") {
        modelName = "gemini-3.1-flash-lite-tts";
        endpoint = "generateAudio"; 
      }

      // جیمنائی کے لیے سسٹم انسٹرکشن (زبان کی پابندی کے لیے)
      const systemInstruction = `You are Likhari AI Assistant. Respond ONLY in ${lang} script. Be professional and helpful.`;

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:${endpoint}?key=${apiKey}`;

      const response = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${systemInstruction}\n\nTask: ${task}\nInput: ${JSON.stringify(payload)}` }] }]
        })
      });

      const data = await response.json();
      
      // جواب واپس ایپ کو بھیجنا
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });

    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: corsHeaders
      });
    }
  }
};

