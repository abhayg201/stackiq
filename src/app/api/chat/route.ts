import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { AI_SYSTEM_PROMPT } from "@/lib/chat-config";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { messages, conversationId } = await req.json();

    // Log for debugging (conversationId is for tracking only)
    if (conversationId) {
      console.log(`[chat] conversation=${conversationId}, messages=${messages?.length || 0}`);
    }

    const systemMessage = {
      role: "system" as const,
      content: AI_SYSTEM_PROMPT,
    };

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [systemMessage, ...messages],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const aiMessage = response.choices[0]?.message;

    return NextResponse.json({
      content: aiMessage?.content || "I couldn't generate a response. Please try again.",
    });
  } catch (error: unknown) {
    console.error("Chat API error:", error);

    // NOTE: Error responses use the same { content } shape for simplicity.
    // Clients MUST check response.ok / status code before treating content as a valid assistant message.
    if (error instanceof Error && error.message?.includes("API key")) {
      return NextResponse.json(
        { content: "OpenAI API key not configured. Please add OPENAI_API_KEY to .env.local" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { content: "Something went wrong with the AI service. Please try again." },
      { status: 500 }
    );
  }
}
