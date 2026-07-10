type Props = {
  value: number; // 0..100
  size?: number;
  stroke?: number;
  label?: string;
};

export default function ProgressRing({ value, size = 72, stroke = 8, label }: Props) {
  const clamped = Math.max(0, Math.min(100, value));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = (clamped / 100) * c;
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="hsl(var(--border))"
          strokeWidth={stroke}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="hsl(var(--primary))"
          strokeWidth={stroke}
          fill="transparent"
          strokeDasharray={`${dash} ${c - dash}`}
          strokeLinecap="round"
          style={{ filter: "drop-shadow(0 0 6px hsl(var(--primary) / 0.6))", transition: "stroke-dasharray 500ms ease" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className="font-display text-lg leading-none text-foreground">{clamped}%</div>
          {label && <div className="mt-0.5 font-mono-tech text-[8px] uppercase tracking-widest text-muted-foreground">{label}</div>}
        </div>
      </div>
    </div>
  );
}