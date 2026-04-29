import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Weight, Ruler, Activity, Save } from "lucide-react";
import { storage, classifyBmi } from "@/lib/storage";
import { toast } from "sonner";
import SectionHeader from "./SectionHeader";

const BodyAnalysis = () => {
  const [height, setHeight] = useState<string>("");
  const [weight, setWeight] = useState<string>("");

  useEffect(() => {
    const saved = storage.getBmi();
    if (saved) {
      setHeight(String(saved.height));
      setWeight(String(saved.weight));
    }
  }, []);

  const bmi = useMemo(() => {
    const h = parseFloat(height) / 100;
    const w = parseFloat(weight);
    if (!h || !w || h <= 0) return 0;
    return +(w / (h * h)).toFixed(1);
  }, [height, weight]);

  const cls = bmi > 0 ? classifyBmi(bmi) : null;

  const colorClasses: Record<string, string> = {
    "gauge-under": "border-gauge-under text-gauge-under",
    "gauge-normal": "border-gauge-normal text-gauge-normal",
    "gauge-over": "border-gauge-over text-gauge-over",
    "gauge-obese": "border-gauge-obese text-gauge-obese",
  };

  const onSave = () => {
    if (!cls) { toast.error("Enter height and weight first."); return; }
    storage.setBmi({
      height: parseFloat(height),
      weight: parseFloat(weight),
      bmi, category: cls.label,
      savedAt: new Date().toISOString(),
    });
    toast.success("Stats saved. Zo'r ish, brat!");
  };

  return (
    <section id="analysis" className="border-b border-border py-24">
      <div className="container mx-auto">
        <SectionHeader
          tag="01 / Body Analysis"
          title={<>KNOW YOUR <span className="text-crimson">FRAME.</span></>}
          subtitle="Enter your raw stats. The system computes your BMI in real time and locks it into your local vault."
        />

        <div className="grid gap-px border-frame bg-border lg:grid-cols-2">
          <div className="bg-card p-8 md:p-12">
            <div className="space-y-6">
              <Field icon={<Ruler className="h-4 w-4" />} label="Height (cm)" value={height} onChange={setHeight} placeholder="178" />
              <Field icon={<Weight className="h-4 w-4" />} label="Weight (kg)" value={weight} onChange={setWeight} placeholder="72" />

              <button
                onClick={onSave}
                disabled={!cls}
                className="inline-flex w-full items-center justify-center gap-2 bg-crimson px-6 py-4 font-mono-tech text-xs uppercase tracking-widest text-primary-foreground transition hover:bg-primary-glow disabled:cursor-not-allowed disabled:opacity-30"
              >
                <Save className="h-4 w-4" /> Lock Into Vault
              </button>
            </div>
          </div>

          <div className="relative bg-card p-8 md:p-12 corner-frame">
            <div className="font-mono-tech text-xs uppercase tracking-widest text-muted-foreground">Result Index</div>
            <div className="mt-2 flex items-end gap-4">
              <motion.div
                key={bmi}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-display text-8xl leading-none md:text-9xl"
              >
                {bmi > 0 ? bmi : "—"}
              </motion.div>
              <div className="pb-3 font-mono-tech text-xs text-muted-foreground">BMI</div>
            </div>

            <div className={`mt-3 inline-flex items-center gap-2 border px-3 py-1 font-mono-tech text-xs uppercase tracking-widest ${cls ? colorClasses[cls.color] : "border-border text-muted-foreground"}`}>
              <Activity className="h-3.5 w-3.5" /> {cls?.label ?? "Awaiting input"}
            </div>

            <div className="mt-10">
              <div className="relative h-3 w-full overflow-hidden">
                <div className="absolute inset-0 flex">
                  <div className="flex-1 bg-gauge-under" />
                  <div className="flex-1 bg-gauge-normal" />
                  <div className="flex-1 bg-gauge-over" />
                  <div className="flex-1 bg-gauge-obese" />
                </div>
                {cls && (
                  <motion.div
                    initial={{ left: 0 }}
                    animate={{ left: `${cls.pos}%` }}
                    transition={{ type: "spring", stiffness: 120, damping: 16 }}
                    className="absolute -top-1 h-5 w-1 -translate-x-1/2 bg-foreground shadow-crimson"
                  />
                )}
              </div>
              <div className="mt-2 grid grid-cols-4 gap-1 font-mono-tech text-[10px] uppercase tracking-widest text-muted-foreground">
                <span>Under</span>
                <span>Normal</span>
                <span>Over</span>
                <span>Obese</span>
              </div>
            </div>

            <div className="mt-10 border-t border-border pt-6 font-mono-tech text-xs text-muted-foreground">
              <div className="flex justify-between"><span>Height</span><span className="text-foreground">{height || "—"} cm</span></div>
              <div className="mt-1 flex justify-between"><span>Weight</span><span className="text-foreground">{weight || "—"} kg</span></div>
              <div className="mt-1 flex justify-between"><span>Persisted</span><span className="text-foreground">localStorage ✓</span></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Field = ({ icon, label, value, onChange, placeholder }: { icon: React.ReactNode; label: string; value: string; onChange: (v: string) => void; placeholder: string }) => (
  <label className="block">
    <div className="mb-2 flex items-center gap-2 font-mono-tech text-xs uppercase tracking-widest text-muted-foreground">
      {icon} {label}
    </div>
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full border border-border bg-background px-4 py-4 font-mono-tech text-2xl text-foreground outline-none transition focus:border-primary focus:shadow-crimson"
    />
  </label>
);

export default BodyAnalysis;