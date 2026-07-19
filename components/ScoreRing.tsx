"use client";

export default function ScoreRing({ score }: { score: number }) {
  const radius = 54;
  const stroke = 8;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  const color =
    score >= 80 ? "#33D6A0" : score >= 50 ? "#F2B84B" : "#FF6B5E";

  const label =
    score >= 80 ? "SIAP" : score >= 50 ? "HATI-HATI" : "BELUM SIAP";

  return (
    <div className="flex items-center gap-4">
      <div className="relative shrink-0" style={{ width: radius * 2, height: radius * 2 }}>
        <svg height={radius * 2} width={radius * 2} className="-rotate-90">
          <circle
            stroke="#232A35"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <circle
            stroke={color}
            fill="transparent"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${circumference} ${circumference}`}
            style={{
              strokeDashoffset: offset,
              transition: "stroke-dashoffset 0.4s ease, stroke 0.4s ease",
            }}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="font-mono text-2xl font-semibold tabular-nums"
            style={{ color }}
          >
            {score}
          </div>
        </div>
      </div>
      <div>
        <div className="font-mono text-xs tracking-widest text-mist">
          SETUP SCORE
        </div>
        <div
          className="mt-1 font-mono text-sm font-semibold tracking-wide"
          style={{ color }}
        >
          {label}
        </div>
      </div>
    </div>
  );
}
