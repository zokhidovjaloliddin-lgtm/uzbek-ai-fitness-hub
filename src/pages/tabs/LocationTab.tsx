import { useMemo, useState } from "react";
import { MapPin, Navigation } from "lucide-react";
import { useLang } from "@/lib/i18n";

type Gym = {
  name: string; district: string; tags: ("mma"|"cali"|"power"|"mixed")[];
  lat: number; lng: number; note: { en: string; uz: string; ru: string };
};

const GYMS: Gym[] = [
  { name: "Ekopark Calisthenics Zone", district: "Yunusabad", tags:["cali","mixed"], lat: 41.362, lng: 69.288,
    note: { en: "Iconic outdoor bar park.", uz: "Mashhur turnik maydoni.", ru: "Известный уличный парк." } },
  { name: "Magic City Workout", district: "Mirzo Ulugbek", tags:["cali"], lat: 41.325, lng: 69.328,
    note: { en: "Wide bar setup, evening crowd.", uz: "Katta turnik maydoni.", ru: "Большая площадка турников." } },
  { name: "Tashkent City Park Bars", district: "Yakkasaray", tags:["cali","mixed"], lat: 41.311, lng: 69.279,
    note: { en: "Central, well-maintained.", uz: "Markazda, saranjom.", ru: "В центре, чисто." } },
  { name: "Chilanzar Workout Zone", district: "Chilanzar", tags:["cali","mma"], lat: 41.283, lng: 69.203,
    note: { en: "Local classic.", uz: "Mahalliy klassika.", ru: "Локальная классика." } },
  { name: "Sergeli Sports Park", district: "Sergeli", tags:["mixed"], lat: 41.221, lng: 69.223,
    note: { en: "Space for combat drills.", uz: "Jangovar mashqlar uchun joy.", ru: "Место для боевых упражнений." } },
  { name: "Absolute MMA Club", district: "Yashnabad", tags:["mma"], lat: 41.319, lng: 69.345,
    note: { en: "Sparring nights.", uz: "Sparring kechalari.", ru: "Спарринг вечера." } },
  { name: "Iron Frame Powerhouse", district: "Shayxontohur", tags:["power"], lat: 41.322, lng: 69.243,
    note: { en: "Serious barbell platforms.", uz: "Jiddiy shtanga zonalari.", ru: "Серьёзные штанги." } },
  { name: "Borz Fight Academy", district: "Mirobod", tags:["mma"], lat: 41.293, lng: 69.290,
    note: { en: "Wrestling + boxing focus.", uz: "Kurash va boks.", ru: "Борьба и бокс." } },
];

export default function LocationTab() {
  const { t, lang } = useLang();
  const [filter, setFilter] = useState<"all"|"mma"|"cali"|"power"|"mixed">("all");
  const [origin, setOrigin] = useState<{ lat: number; lng: number } | null>(null);

  const sorted = useMemo(() => {
    let arr = filter === "all" ? GYMS : GYMS.filter((g) => g.tags.includes(filter));
    if (origin) {
      arr = [...arr].sort((a, b) => hav(a, origin) - hav(b, origin));
    }
    return arr;
  }, [filter, origin]);

  function useGeo() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (p) => setOrigin({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => {},
    );
  }

  return (
    <section className="container mx-auto max-w-2xl px-4 pt-6 pb-8">
      <h2 className="font-display text-3xl tracking-wider">{t("loc_title")}</h2>
      <p className="mt-1 font-mono-tech text-[10px] uppercase tracking-widest text-muted-foreground">{t("loc_sub")}</p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {(["all","mma","cali","power","mixed"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`border px-3 py-1.5 font-mono-tech text-[10px] uppercase tracking-widest transition ${filter === f ? "border-crimson bg-crimson text-primary-foreground" : "border-border text-muted-foreground hover:text-foreground"}`}>
            {f === "all" ? t("loc_filter_all") : f.toUpperCase()}
          </button>
        ))}
        <button onClick={useGeo}
          className="ml-auto inline-flex items-center gap-1 border border-border px-3 py-1.5 font-mono-tech text-[10px] uppercase tracking-widest text-muted-foreground transition hover:border-crimson hover:text-crimson">
          <Navigation className="h-3 w-3" /> {t("loc_nearest")}
        </button>
      </div>

      <div className="mt-4 aspect-video w-full overflow-hidden border-crimson-glow">
        <iframe
          title="Tashkent map"
          className="h-full w-full"
          src="https://www.openstreetmap.org/export/embed.html?bbox=69.05%2C41.19%2C69.45%2C41.42&layer=mapnik"
        />
      </div>

      <div className="mt-5 grid gap-3">
        {sorted.map((g) => (
          <a key={g.name}
            href={`https://www.google.com/maps/search/?api=1&query=${g.lat}%2C${g.lng}`}
            target="_blank" rel="noreferrer"
            className="border-frame group flex items-start gap-3 bg-card p-3 transition hover:border-crimson">
            <div className="grid h-10 w-10 shrink-0 place-items-center border border-crimson bg-crimson/10 text-crimson">
              <MapPin className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate font-display text-lg leading-tight tracking-wider">{g.name}</div>
              <div className="mt-0.5 font-mono-tech text-[10px] uppercase tracking-widest text-muted-foreground">
                {g.district} · {g.tags.join(" · ").toUpperCase()}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">{g.note[lang]}</div>
            </div>
            <span className="ml-auto self-center font-mono-tech text-[9px] uppercase tracking-widest text-crimson opacity-0 transition group-hover:opacity-100">
              {t("loc_open_map")}
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}

function hav(a: {lat:number;lng:number}, b: {lat:number;lng:number}) {
  const R = 6371;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s = Math.sin(dLat/2)**2 + Math.cos(toRad(a.lat))*Math.cos(toRad(b.lat))*Math.sin(dLng/2)**2;
  return 2 * R * Math.asin(Math.sqrt(s));
}