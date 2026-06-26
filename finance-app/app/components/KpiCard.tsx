interface Props {
  label: string;
  value: string;
  sub?: string;
  color?: string;
  icon?: React.ReactNode;
}

export default function KpiCard({ label, value, sub, color = "bg-white", icon }: Props) {
  return (
    <div className={`${color} rounded-xl p-3 md:p-4 shadow-sm border border-black/5`}>
      <div className="flex items-start justify-between">
        <p className="text-[10px] md:text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
      <p className="mt-1.5 md:mt-2 text-lg md:text-2xl font-bold text-gray-900">{value}</p>
      {sub && <p className="mt-0.5 md:mt-1 text-[10px] md:text-xs text-gray-400">{sub}</p>}
    </div>
  );
}
