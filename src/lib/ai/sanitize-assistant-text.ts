/**
 * Strip markdown-ish noise so chat + TTS read naturally.
 * Keeps normal punctuation (., ? ! —) but removes stray emphasis markers.
 */
export function sanitizeAssistantReply(raw: string): string {
  let s = raw.replace(/\r\n/g, "\n");

  // Fenced / inline code ticks
  s = s.replace(/`([^`]*?)`/g, "$1");

  /** Markdown bold / italic segments */
  s = s.replace(/\*\*\*([\s\S]+?)\*\*\*/g, "$1");
  s = s.replace(/\*\*([\s\S]+?)\*\*/g, "$1");
  s = s.replace(/\*([\s\S]+?)\*/g, "$1");
  s = s.replace(/_{3}([\s\S]+?)_{3}/g, "$1");
  s = s.replace(/__([\s\S]+?)__/g, "$1");
  s = s.replace(/_([\s\S]+?)_/g, "$1");

  // Stray asterisks that often leak from gateways
  s = s.replace(/\*{1,}/g, "");

  // Normalize decorative bullets → simple dash
  s = s.replace(/^\s*[•●▪►]\s*/gm, "- ");

  // Collapse stray repeated punctuation/spaces between words
  s = s.replace(/[ ]{2,}/g, " ");
  s = s.replace(/\n{3,}/g, "\n\n");

  return s
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
    .trim();
}

/** Extra cleanup tuned for spoken output (fewer parentheses, tighter pauses). */
export function sanitizeForSpeech(text: string): string {
  let s = sanitizeAssistantReply(text);
  // soften parenthetical asides LLMs love
  s = s.replace(/\s*\([^)]{80,}\)\s*/g, " "); // drop very long parentheses
  s = s.replace(/\s+/g, " ").trim();
  return s;
}

function splitRoughSentences(t: string): string[] {
  const chunks = t
    .match(/[^.!?]+[.!?]+|[^.!?]+$/g)
    ?.map((s) => s.trim())
    .filter(Boolean);
  return chunks?.length ? chunks : [t];
}

function splitIntoSpeechChunks(text: string, maxLen: number): string[] {
  const t = sanitizeForSpeech(text);
  if (!t) return [];

  const sentences = splitRoughSentences(t);
  const out: string[] = [];
  let cur = "";

  const pushCur = () => {
    const v = cur.trim();
    if (v) out.push(v);
    cur = "";
  };

  for (const sentence of sentences) {
    const next = cur ? `${cur} ${sentence}` : sentence;
    if (next.length > maxLen && cur) {
      pushCur();
      cur = sentence;
    } else {
      cur = next;
    }
  }
  pushCur();

  const packed = out.length ? out : [t];
  return packed.flatMap((block) =>
    block.length > maxLen
      ? Array.from({ length: Math.ceil(block.length / maxLen) }, (_, i) =>
          block.slice(i * maxLen, (i + 1) * maxLen).trim(),
        ).filter(Boolean)
      : [block],
  );
}

function pickSpeechVoice(lang: string): SpeechSynthesisVoice | null {
  if (typeof window === "undefined") return null;
  const voices = window.speechSynthesis.getVoices();
  const full = lang.toLowerCase();
  const base = full.split("-")[0] ?? "en";

  return (
    voices.find((v) => v.default && v.lang.toLowerCase().startsWith(base)) ??
    voices.find((v) => v.lang.toLowerCase().startsWith(full)) ??
    voices.find((v) => v.lang.toLowerCase().startsWith(base)) ??
    voices.find((v) => v.default) ??
    voices[0] ??
    null
  );
}

function voicesReadyPromise(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.speechSynthesis.getVoices().length > 0) return Promise.resolve();
  return new Promise((resolve) => {
    const done = () => resolve();
    window.speechSynthesis.addEventListener("voiceschanged", done, { once: true });
    window.setTimeout(done, 600);
    window.speechSynthesis.getVoices();
  });
}

/**
 * Reliable browser TTS: warm voices list, strip markdown, gently pace long answers.
 */
export async function speakAssistantText(text: string, lang: string): Promise<void> {
  if (typeof window === "undefined") return;
  window.speechSynthesis.cancel();

  const chunks = splitIntoSpeechChunks(text, 420);
  if (chunks.length === 0) return;

  await voicesReadyPromise();
  const voice = pickSpeechVoice(lang);

  for (const chunk of chunks) {
    await new Promise<void>((resolve) => {
      const u = new SpeechSynthesisUtterance(chunk);
      u.lang = lang;
      if (voice) u.voice = voice;
      u.rate = 0.94;
      u.pitch = 1;
      u.onend = () => resolve();
      u.onerror = () => resolve();
      window.speechSynthesis.speak(u);
    });
  }
}

export function stopAssistantSpeech(): void {
  if (typeof window === "undefined") return;
  window.speechSynthesis.cancel();
}
