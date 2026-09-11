import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({
  role: z.string().min(2).max(120),
  skills: z.array(z.string().min(1)).min(1).max(12),
});

export type GeneratedJd = {
  title: string;
  description: string;
  skills: string[];
};

/**
 * The one real network call in RISE: Gemini drafts an internship description.
 * Failures return a plain-language message so the manual form never dead-ends.
 */
export const generateJd = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => Input.parse(data))
  .handler(async ({ data }): Promise<GeneratedJd> => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("The description generator isn't configured yet.");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": apiKey,
        "X-Lovable-AIG-SDK": "fetch",
      },
      body: JSON.stringify({
        model: "google/gemini-3.1-flash-lite",
        messages: [
          {
            role: "system",
            content:
              "You write internship descriptions for an Indian academia-industry platform. Write plainly and specifically, in the second person, about the work the intern will actually do. No emoji, no marketing adjectives, no bullet lists, no headings. Reply with JSON only.",
          },
          {
            role: "user",
            content: `Draft an internship posting for the role "${data.role}" requiring these skills: ${data.skills.join(", ")}. Return JSON with keys: title (string, a concrete job title), description (string, 3 to 5 sentences), skills (array of 3 to 6 skill strings).`,
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      if (res.status === 429) throw new Error("The generator is busy right now — try again in a moment.");
      if (res.status === 402)
        throw new Error("AI credits are exhausted for this workspace — write the description manually.");
      if (res.status === 403)
        throw new Error("AI generation is turned off for this workspace — write the description manually.");
      throw new Error("Couldn't generate a description — try again, or write it manually.");
    }

    const payload = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const raw = payload.choices?.[0]?.message?.content ?? "";
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new Error("The generated description came back malformed — try again, or write it manually.");
    }

    const shape = z.object({
      title: z.string().min(2),
      description: z.string().min(20),
      skills: z.array(z.string().min(1)).min(1),
    });
    const result = shape.safeParse(parsed);
    if (!result.success) {
      throw new Error("The generated description came back incomplete — try again, or write it manually.");
    }
    return {
      title: result.data.title,
      description: result.data.description,
      skills: result.data.skills.slice(0, 8),
    };
  });
