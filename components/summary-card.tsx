type SummaryCardProps = {
  label: string;
  value: string;
  detail: string;
  tone: "accent" | "warning" | "danger" | "default";
};

const toneMap = {
  accent: "text-accent",
  warning: "text-warning",
  danger: "text-danger",
  default: "text-text"
};

export function SummaryCard({ label, value, detail, tone }: SummaryCardProps) {
  return (
    <article className="rounded-2xl p-5 panel">
      <p className="text-sm text-muted">{label}</p>
      <p className={`mt-3 text-3xl font-bold ${toneMap[tone]}`}>{value}</p>
      <p className="mt-3 text-sm text-muted">{detail}</p>
    </article>
  );
}
