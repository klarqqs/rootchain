import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type SpeechRec = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((ev: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
};

function getSpeechRecognitionCtor(): (new () => SpeechRec) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRec;
    webkitSpeechRecognition?: new () => SpeechRec;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export interface UseVoiceAssistantOptions {
  lang: string;
}

/**
 * Browser STT via Web Speech API — no API keys.
 */
export function useVoiceAssistant({ lang }: UseVoiceAssistantOptions) {
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<SpeechRec | null>(null);
  const finalsSinceStartRef = useRef<string[]>([]);
  const sessionRef = useRef(0);

  const supported = useMemo(() => getSpeechRecognitionCtor() !== null, []);

  useEffect(() => {
    return () => {
      sessionRef.current += 1;
      try {
        recRef.current?.stop();
      } catch {
        /* ignore */
      }
    };
  }, []);

  /**
   * `onPartial` fires with interim captions. `onFinal` fires once with all finalized phrases
   * after recognition ends (stop tapped, silence, or error).
   */
  const startCapture = useCallback(
    (onPartial: (interim: string) => void, onFinal: (text: string) => void) => {
      setError(null);
      const Ctor = getSpeechRecognitionCtor();
      if (!Ctor) {
        setError("Voice input is not supported in this browser.");
        return;
      }

      try {
        recRef.current?.stop();
      } catch {
        /* ignore */
      }

      finalsSinceStartRef.current = [];

      const session = sessionRef.current + 1;
      sessionRef.current = session;

      const rec = new Ctor();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = lang;

      rec.onresult = (event: SpeechRecognitionEvent) => {
        if (sessionRef.current !== session) return;
        let interimAll = "";
        for (let i = 0; i < event.results.length; i++) {
          const piece = event.results[i][0]?.transcript ?? "";
          if (!event.results[i].isFinal) interimAll += piece;
        }
        const inter = interimAll.trim();
        if (inter) onPartial(inter);

        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (!event.results[i].isFinal) continue;
          const fin = (event.results[i][0]?.transcript ?? "").trim().replace(/\s+/g, " ");
          if (fin) finalsSinceStartRef.current.push(fin);
        }
      };

      rec.onerror = (ev) => {
        if (sessionRef.current !== session) return;
        if (ev.error === "aborted") return;

        if (recRef.current === rec) recRef.current = null;
        setListening(false);

        if (ev.error === "no-speech") {
          setError("No speech detected. Tap the mic and try again.");
          return;
        }
        if (ev.error === "not-allowed") {
          setError("Microphone permission denied. Allow access in browser settings.");
          return;
        }
        const msg =
          typeof ev.message === "string" && ev.message.trim()
            ? ev.message.trim()
            : ev.error === "network"
              ? "Speech service hit a network error."
              : "Speech capture failed.";
        setError(msg);
      };

      rec.onend = () => {
        if (sessionRef.current !== session) return;
        const joined = finalsSinceStartRef.current
          .join(" ")
          .replace(/\s+/g, " ")
          .trim();
        finalsSinceStartRef.current = [];

        setListening(false);
        if (recRef.current === rec) recRef.current = null;

        if (joined) onFinal(joined);
      };

      recRef.current = rec;
      try {
        setListening(true);
        rec.start();
      } catch {
        setListening(false);
        setError("Could not start microphone.");
        recRef.current = null;
      }
    },
    [lang],
  );

  const stopCapture = useCallback(() => {
    try {
      recRef.current?.stop();
    } catch {
      /* ignore */
    }
    setListening(false);
  }, []);

  return { listening, error, supported, startCapture, stopCapture };
}
