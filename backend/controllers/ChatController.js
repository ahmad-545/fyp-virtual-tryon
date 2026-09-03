import Groq from "groq-sdk";

let chatSessions = {};
let requestTracker = {};

export const handleBotChat = async (req, res) => {
  try {
    const { message, userId } = req.body;
    const sessionId = userId || "default_user";

    if (!message || message.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Message required.",
      });
    }

    // 1. HARD LIMITATION & LANGUAGE ADAPTABILITY (Updated to "Trylo")
    const systemPrompt = `
      You are an expert fashion stylist for the brand "Trylo".
      
      STRICT LIMITATION:
      - You ONLY answer questions related to fashion, styling, clothing, fabrics, wardrobe advice, and store policies (like exchange or shipping).
      - If the user asks about ANYTHING ELSE (politics, science, general knowledge, movies, etc.), you must strictly reply:
        "I am sorry, but I am a fashion stylist for 'Trylo' and can only assist you with clothing, styling, and fashion-related queries."
      
      LANGUAGE RULE (CRITICAL):
      - Match the language of the user's input. 
      - If the user asks in English, reply in professional English.
      - If the user asks in Roman Urdu / Hinglish, reply in friendly Roman Urdu / Hinglish.
    `;

    // 2. RATE LIMITING
    const now = Date.now();

    requestTracker[sessionId] = (requestTracker[sessionId] || []).filter(
      (ts) => now - ts < 60000
    );

    if (requestTracker[sessionId].length >= 10) {
      return res.status(429).json({
        success: false,
        message: "Rate limit reached.",
      });
    }

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY.trim(),
    });

    // 3. COMPILE MESSAGE
    let apiMessages = [
      {
        role: "system",
        content: systemPrompt,
      },
    ];

    if (!chatSessions[sessionId]) {
      chatSessions[sessionId] = [];
    }

    chatSessions[sessionId]
      .slice(-4)
      .forEach((msg) => apiMessages.push(msg));

    apiMessages.push({
      role: "user",
      content: message,
    });

    const chatCompletion = await groq.chat.completions.create({
      messages: apiMessages,
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      max_tokens: 300,
    });

    const botReply = chatCompletion.choices[0]?.message?.content;

    // 4. SAVE HISTORY
    chatSessions[sessionId].push({
      role: "user",
      content: message,
    });

    chatSessions[sessionId].push({
      role: "assistant",
      content: botReply,
    });

    requestTracker[sessionId].push(now);

    return res.status(200).json({
      success: true,
      reply: botReply,
    });
  } catch (error) {
    console.error("Groq Chat Error:", error);

    return res.status(500).json({
      success: false,
      message: "Error in fashion engine.",
    });
  }
};