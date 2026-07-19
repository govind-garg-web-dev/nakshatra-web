import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY is not set");
    }
    client = new Anthropic({ apiKey });
  }
  return client;
}

export const CLAUDE_MODEL = "claude-sonnet-4-5"; // TODO(founder): bump as newer Sonnet models ship

/** Non-streaming completion — used for one-shot generations (reports, readings). */
export async function generateText(params: {
  system: string;
  prompt: string;
  maxTokens?: number;
}): Promise<string> {
  const anthropic = getClient();
  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: params.maxTokens ?? 800,
    system: params.system,
    messages: [{ role: "user", content: params.prompt }],
  });

  const block = response.content[0];
  return block && block.type === "text" ? block.text : "";
}

/** Streaming completion — used for the Tara chat UI. */
export async function streamText(params: {
  system: string;
  messages: { role: "user" | "assistant"; content: string }[];
  maxTokens?: number;
}) {
  const anthropic = getClient();
  return anthropic.messages.stream({
    model: CLAUDE_MODEL,
    max_tokens: params.maxTokens ?? 500,
    system: params.system,
    messages: params.messages,
  });
}
