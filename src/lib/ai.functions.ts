import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const MODEL = "google/gemini-3-flash-preview";

function getModel() {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  return createLovableAiGatewayProvider(key)(MODEL);
}

async function run(system: string, prompt: string) {
  const { text } = await generateText({
    model: getModel(),
    system,
    prompt,
  });
  return text;
}

const AiInput = z.object({
  action: z.enum([
    "email_generate",
    "email_subject",
    "email_rewrite",
    "email_grammar",
    "email_shorten",
    "email_expand",
    "email_translate",
    "meeting_summarize",
    "meeting_followup",
    "research",
    "task_plan",
    "task_prioritize",
    "run_prompt",
  ]),
  payload: z.record(z.any()).default({}),
});

export const aiRun = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => AiInput.parse(data))
  .handler(async ({ data }) => {
    const p = data.payload as Record<string, string>;
    switch (data.action) {
      case "email_generate":
        return {
          text: await run(
            "You are an expert business writing assistant. Write polished, ready-to-send emails. Output ONLY the email body (no preamble, no 'Subject:' line).",
            `Write a ${p.tone || "professional"} email to a ${p.audience || "client"}.\n\nContext / what to say:\n${p.brief || ""}\n\nKeep it concise and clear.`,
          ),
        };
      case "email_subject":
        return {
          text: await run(
            "You generate compelling, concise email subject lines.",
            `Generate 5 subject lines (numbered list) for this email:\n\n${p.body || ""}`,
          ),
        };
      case "email_rewrite":
        return {
          text: await run(
            "You improve email writing while keeping the original intent.",
            `Rewrite this email to be more ${p.tone || "professional"} and clearer. Output only the rewritten email:\n\n${p.body || ""}`,
          ),
        };
      case "email_grammar":
        return {
          text: await run(
            "You are a grammar and style correction tool. Fix grammar, spelling, and clarity. Preserve meaning and tone.",
            `Correct this text. Output ONLY the corrected version:\n\n${p.body || ""}`,
          ),
        };
      case "email_shorten":
        return { text: await run("You shorten text while preserving meaning.", `Shorten this email by ~50%. Output only the shortened email:\n\n${p.body || ""}`) };
      case "email_expand":
        return { text: await run("You expand text with helpful detail without fluff.", `Expand this email with helpful detail. Output only the expanded email:\n\n${p.body || ""}`) };
      case "email_translate":
        return { text: await run("You translate text accurately.", `Translate this email to ${p.language || "Spanish"}. Output only the translation:\n\n${p.body || ""}`) };
      case "meeting_summarize":
        return {
          text: await run(
            "You are an executive meeting analyst. Produce structured markdown summaries.",
            `Summarize these meeting notes. Use this exact markdown structure:\n\n## Summary\n(2-3 sentences)\n\n## Key Points\n- ...\n\n## Decisions Made\n- ...\n\n## Action Items\n- [Owner] Task — Deadline\n\n## Deadlines\n- ...\n\n## Risks & Concerns\n- ...\n\n## Sentiment\n(positive/neutral/negative + one line why)\n\n## Priority Recommendations\n- ...\n\nNotes:\n${p.notes || ""}`,
          ),
        };
      case "meeting_followup":
        return {
          text: await run(
            "You draft concise follow-up emails after meetings.",
            `Draft a follow-up email recapping these meeting notes. Output only the email body:\n\n${p.notes || ""}`,
          ),
        };
      case "research":
        return {
          text: await run(
            "You are a research analyst. Produce rigorous, well-structured markdown briefs. Acknowledge uncertainty when relevant.",
            `Research topic: ${p.topic || ""}\n\nDepth: ${p.depth || "Executive brief"}\n\nProduce a markdown response with:\n## Executive Summary\n## Key Insights (bulleted)\n## Background & Context\n## Actionable Recommendations\n## Suggested Sources / Citations\n## Simplified Explanation`,
          ),
        };
      case "task_plan":
        return {
          text: await run(
            "You are a productivity coach. Generate clear, time-blocked plans in markdown.",
            `Create a ${p.range || "daily"} plan for these goals/tasks:\n\n${p.goals || ""}\n\nUse the Urgent/Important matrix, suggest time blocks, deadlines, and prioritization rationale.`,
          ),
        };
      case "task_prioritize":
        return {
          text: await run(
            "You prioritize tasks using the Eisenhower matrix and effort/impact scoring.",
            `Prioritize and reorder these tasks. For each, give a priority score (1-10), category (Do/Decide/Delegate/Delete), and estimated time:\n\n${p.tasks || ""}`,
          ),
        };
      case "run_prompt":
        return { text: await run("You are a helpful AI workplace assistant.", p.prompt || "") };
    }
  });
