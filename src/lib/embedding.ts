import { embed } from "ai";
import { openai } from "@ai-sdk/openai";

const embeddingModel = openai.embedding("text-embedding-3-small");

export async function createEmbedding(input: string): Promise<number[]> {
  const { embedding } = await embed({
    model: embeddingModel,
    value: input,
  });
  return Array.from(embedding);
}
