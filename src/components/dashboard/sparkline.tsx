"use client";

type SparklineProps = {
  data: { date: string; count: number }[];
  color?: string;
  height?: number;
};

export function Sparkline({
  data,
  color = "var(--brand)",
  height = 32,
}: SparklineProps) {
  if (!data || data.length === 0) return null;

  const counts = data.map((d) => d.count);
  const max = Math.max(...counts, 1);
  const width = 80;
  const points = counts
    .map((c, i) => {
      const x = (i / (counts.length - 1)) * width;
      const y = height - (c / max) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      className="opacity-70"
    >
      <polyline
        points={points}
        stroke={color}
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
