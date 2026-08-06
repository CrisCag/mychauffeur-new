import { cn } from "@/lib/utils";

type SilhouetteProps = {
  className?: string;
  title: string;
};

/** Original decorative sedan profile — no brand marks or specific models. */
export function SedanSilhouette({ className, title }: SilhouetteProps) {
  return (
    <svg
      viewBox="0 0 320 120"
      role="img"
      aria-hidden={false}
      className={cn("h-auto w-full", className)}
    >
      <title>{title}</title>
      <desc>
        Illustrazione stilizzata di una berlina premium in profilo laterale.
      </desc>
      <defs>
        <linearGradient id="demoSedanBody" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="oklch(0.32 0.03 265)" />
          <stop offset="100%" stopColor="oklch(0.22 0.02 265)" />
        </linearGradient>
        <linearGradient id="demoSedanAccent" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="oklch(0.82 0.12 85)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="oklch(0.82 0.12 85)" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <ellipse
        cx="160"
        cy="98"
        rx="118"
        ry="8"
        fill="oklch(0.12 0.02 265)"
        opacity="0.45"
      />
      <path
        d="M42 78 C58 78 68 58 88 52 C112 44 138 38 168 38 C198 38 228 46 252 56 C268 64 278 72 286 78 L286 86 C270 88 250 90 160 90 C70 90 48 88 34 86 Z"
        fill="url(#demoSedanBody)"
      />
      <path
        d="M96 52 C118 42 148 36 176 36 C204 36 230 44 248 54 L236 72 C214 64 188 58 160 58 C132 58 110 62 96 68 Z"
        fill="oklch(0.55 0.03 250)"
        opacity="0.55"
      />
      <path
        d="M52 78 H278"
        stroke="url(#demoSedanAccent)"
        strokeWidth="2"
        fill="none"
      />
      <circle
        cx="88"
        cy="88"
        r="14"
        fill="oklch(0.16 0.02 265)"
        stroke="oklch(0.72 0.08 85)"
        strokeWidth="2"
      />
      <circle cx="88" cy="88" r="5" fill="oklch(0.45 0.02 265)" />
      <circle
        cx="236"
        cy="88"
        r="14"
        fill="oklch(0.16 0.02 265)"
        stroke="oklch(0.72 0.08 85)"
        strokeWidth="2"
      />
      <circle cx="236" cy="88" r="5" fill="oklch(0.45 0.02 265)" />
      <rect
        x="268"
        y="70"
        width="10"
        height="6"
        rx="1"
        fill="oklch(0.82 0.12 85)"
        opacity="0.7"
      />
    </svg>
  );
}

/** Original decorative van profile — no brand marks or specific models. */
export function VanSilhouette({ className, title }: SilhouetteProps) {
  return (
    <svg
      viewBox="0 0 320 120"
      role="img"
      aria-hidden={false}
      className={cn("h-auto w-full", className)}
    >
      <title>{title}</title>
      <desc>
        Illustrazione stilizzata di un van premium in profilo laterale.
      </desc>
      <defs>
        <linearGradient id="demoVanBody" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="oklch(0.34 0.03 265)" />
          <stop offset="100%" stopColor="oklch(0.22 0.02 265)" />
        </linearGradient>
        <linearGradient id="demoVanAccent" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="oklch(0.82 0.12 85)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="oklch(0.82 0.12 85)" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <ellipse
        cx="160"
        cy="100"
        rx="124"
        ry="8"
        fill="oklch(0.12 0.02 265)"
        opacity="0.45"
      />
      <path
        d="M36 82 C44 82 52 48 78 40 C104 30 150 28 198 28 C240 28 268 36 286 52 L286 86 C270 88 248 90 160 90 C72 90 48 88 30 86 Z"
        fill="url(#demoVanBody)"
      />
      <path
        d="M78 42 C110 34 150 30 196 30 C232 30 258 36 274 48 L266 68 C246 58 216 52 180 52 C140 52 108 56 86 64 Z"
        fill="oklch(0.55 0.03 250)"
        opacity="0.5"
      />
      <path
        d="M48 78 H278"
        stroke="url(#demoVanAccent)"
        strokeWidth="2"
        fill="none"
      />
      <line
        x1="140"
        y1="52"
        x2="140"
        y2="78"
        stroke="oklch(0.72 0.08 85)"
        strokeOpacity="0.35"
        strokeWidth="1.5"
      />
      <line
        x1="190"
        y1="52"
        x2="190"
        y2="78"
        stroke="oklch(0.72 0.08 85)"
        strokeOpacity="0.35"
        strokeWidth="1.5"
      />
      <circle
        cx="92"
        cy="90"
        r="14"
        fill="oklch(0.16 0.02 265)"
        stroke="oklch(0.72 0.08 85)"
        strokeWidth="2"
      />
      <circle cx="92" cy="90" r="5" fill="oklch(0.45 0.02 265)" />
      <circle
        cx="238"
        cy="90"
        r="14"
        fill="oklch(0.16 0.02 265)"
        stroke="oklch(0.72 0.08 85)"
        strokeWidth="2"
      />
      <circle cx="238" cy="90" r="5" fill="oklch(0.45 0.02 265)" />
      <rect
        x="270"
        y="58"
        width="10"
        height="6"
        rx="1"
        fill="oklch(0.82 0.12 85)"
        opacity="0.7"
      />
    </svg>
  );
}
