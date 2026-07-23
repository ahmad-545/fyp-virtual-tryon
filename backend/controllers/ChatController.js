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

    // 1. HARD LIMITATION: Topic Restriction (System Prompt Update)
    const systemPrompt = `
      You are "Me. Assistant", an expert fashion stylist for the brand "Me.".
      
      STRICT LIMITATION:
      - You ONLY answer questions related to fashion, styling, clothing, fabrics, and wardrobe advice.
      - If the user asks about ANYTHING ELSE (politics, science, general knowledge, movies, etc.), you must strictly reply:
        "I am sorry, but I am an expert fashion stylist for 'Me.' and can only assist you with clothing, styling, and fashion-related queries."
      - Do not provide answers for off-topic questions.
      
      LANGUAGE: Fluent Roman Urdu/Hinglish or professional English as per user input.
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
      model: "llama-3.1-8b-instant",
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