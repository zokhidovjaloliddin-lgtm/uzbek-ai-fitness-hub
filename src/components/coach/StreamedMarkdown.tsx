import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Types the coach reply out character-by-character for a real-time AI feel.
 * Already-persisted history renders instantly (`animate={false}`).
 */
export default function StreamedMarkdown({
  text,
  animate = true,
  onTick,
}: {
  text: string;
  animate?: boolean;
  onTick?: () => void;
}) {
  const [shown, setShown] = useState(animate ? "" : text);

  useEffect(() => {
    if (!animate) { setShown(text); return; }
    setShown("");
    let i = 0;
    // ~4 chars per frame keeps long plans fast while still feeling live.
    const step = Math.max(2, Math.round(text.length / 400));
    const id = window.setInterval(() => {
      i = Math.min(text.length, i + step);
      setShown(text.slice(0, i));
      onTick?.();
      if (i >= text.length) window.clearInterval(id);
    }, 16);
    return () => window.clearInterval(id);
  }, [text, animate]);

  return (
    <div className="prose prose-invert prose-sm max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{shown}</ReactMarkdown>
      {animate && shown.length < text.length && (
        <span className="ml-0.5 inline-block h-3.5 w-[7px] translate-y-0.5 animate-pulse bg-crimson align-baseline" />
      )}
    </div>
  );
}
