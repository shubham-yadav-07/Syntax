interface ComplexityCardProps {
  title: string;
  value: string;
  description: string;
}

export function ComplexityCard({
  title,
  value,
  description,
}: ComplexityCardProps) {
  return (
    <div className="p-4 bg-[#1E293B] border border-[#334155] rounded-lg">
      <h3 className="text-xs text-slate-400 mb-2">{title}</h3>
      <div className="text-2xl text-white mb-1">{value}</div>
      <p className="text-xs text-slate-500">{description}</p>
    </div>
  );
}
