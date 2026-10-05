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
 * Config for the description generator. Deliberately provider-agnostic: any
 * OpenAI-compatible /chat/completions endpoint works (Gemini's OpenAI
 * endpoint, OpenRouter, Groq, Together, a self-hosted vLLM, ...).
 *
 * All three variables are optional. If they are missing the feature is simply
 * off and the manual posting form still works end to end.
 *
 *   AI_API_KEY  - bearer token for the endpoint
 *   AI_BASE_URL - base including /v1, e.g. https://host/v1
 *   AI_MODEL    - provider-specific model id
 */
function readConfig() {
  return {
    apiKey: process.env["AI_API_KEY"]?.trim(),
    baseUrl: process.env["AI_BASE_URL"]?.trim().replace(/\/+$/, ""),
    model: process.env["AI_MODEL"]?.trim(),
  };
}

/** True when enough config is present to attempt a generation. */
export function isGenerationConfigured() {
  const { apiKey, baseUrl, model } = readConfig();
  return Boolean(apiKey && baseUrl && model);
}

const SYSTEM_PROMPT =
  "You write internship descriptions for an Indian academia-industry platform. " +
  "Write plainly and specifically, in the second person, about the work the intern " +
  "will actually do. No emoji, no marketing adjectives, no bullet lists, no headings. " +
  "Reply with JSON only.";

/**
 * The one outbound network call in RISE: an LLM drafts an internship
 * description. Provider-agnostic by design - see readConfig() above.
 *
 * Every failure path returns a plain-language message that names the manual
 * fallback, so a missing key, a rate limit, or a malformed model reply can
 * never dead-end the posting form.
 */
export const generateJd = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => Input.parse(data))
  .handler(async ({ data }): Promise<GeneratedJd> => {
    const { apiKey, baseUrl, model } = readConfig();
    if (!apiKey || !baseUrl || !model) {
      throw new Error("The description generator isn't configured yet.");
    }

    let res: Response;
    try {
      res = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            {
              role: "user",
              content: `Draft an internship posting for the role "${data.role}" requiring these skills: ${data.skills.join(", ")}. Return JSON with keys: title (string, a concrete job title), description (string, 3 to 5 sentences), skills (array of 3 to 6 skill strings).`,
            },
          ],
          response_format: { type: "json_object" },
        }),
        signal: AbortSignal.timeout(20_000),
      });
    } catch (cause) {
      // Network failure, DNS, TLS, or the 20s timeout above.
      throw new Error(
        `Couldn't reach the description generator (${
          cause instanceof Error ? cause.message : "network error"
        }) - write the description manually.`,
      );
    }

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        throw new Error(
          "The description generator rejected its API credentials - write the description manually.",
        );
      }
      if (res.status === 402) {
        throw new Error(
          "The description generator is out of credit - write the description manually.",
        );
      }
      if (res.status === 429) {
        throw new Error("The generator is busy right now - try again in a moment.");
      }
      throw new Error(`The generator returned ${res.status} - write the description manually.`);
    }

    const payload = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const raw = payload.choices?.[0]?.message?.content ?? "";
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new Error(
        "The generated description came back malformed - try again, or write it manually.",
      );
    }

    // The model is untrusted input: re-validate its shape before it can reach
    // the form, so a truncated or verbose reply becomes a clean error.
    const shape = z.object({
      title: z.string().min(2),
      description: z.string().min(20),
      skills: z.array(z.string().min(1)).min(1),
    });
    const result = shape.safeParse(parsed);
    if (!result.success) {
      throw new Error(
        "The generated description came back incomplete - try again, or write it manually.",
      );
    }
    return {
      title: result.data.title,
      description: result.data.description,
      skills: result.data.skills.slice(0, 8),
    };
  });
