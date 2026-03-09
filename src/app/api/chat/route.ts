import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { AI_SYSTEM_PROMPT } from "@/lib/chat-config";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { messages, userProfile } = await req.json();

    // Build context from user's tile selections
    const profileContext = userProfile
      ? `
USER PROFILE (collected via smart tiles):
- Goals: ${Array.isArray(userProfile.goals) ? userProfile.goals.join(", ") : userProfile.goals || "Not specified"}
- Diet: ${userProfile.diet || "Not specified"}
- Age Range: ${userProfile.age_range || "Not specified"}
- Biological Sex: ${userProfile.sex || "Not specified"}
- Exercise Frequency: ${userProfile.exercise || "Not specified"}
- Stress Level: ${userProfile.stress_level || "Not specified"}
- Sleep Quality: ${userProfile.sleep_quality || "Not specified"}
- Budget: ${userProfile.budget || "Not specified"}
`
      : "";

    const systemMessage = {
      role: "system" as const,
      content: AI_SYSTEM_PROMPT + "\n\n" + profileContext,
    };

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [systemMessage, ...messages],
      temperature: 0.7,
      max_tokens: 800,
    });

    const aiMessage = response.choices[0]?.message;

    return NextResponse.json({
      message: aiMessage?.content || "I couldn't generate a response. Please try again.",
      role: "assistant",
    });
  } catch (error: unknown) {
    console.error("Chat API error:", error);

    // Check if it's an API key issue
    if (error instanceof Error && error.message?.includes("API key")) {
      return NextResponse.json(
        {
          message:
            "OpenAI API key not configured. Please add your OPENAI_API_KEY to .env.local",
          role: "assistant",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message:
          "Something went wrong. Please try again.",
        role: "assistant",
      },
      { status: 500 }
    );
  }
}
