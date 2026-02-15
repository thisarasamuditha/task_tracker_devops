export default function DashboardCard({ title, value, icon, tone = "primary" }) {
  const toneMap = {
    primary: "bg-primary/10 text-primary",
    warning: "bg-warning/10 text-warning",
    success: "bg-success/10 text-success",
    danger: "bg-danger/10 text-danger",
    info: "bg-secondary/10 text-secondary",
  };

  return (
    <div className="bg-white dark:bg-surfaceDark border border-border dark:border-borderDark rounded-2xl shadow-sm p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted dark:text-mutedDark">{title}</p>
          <p className="text-3xl font-extrabold text-text dark:text-textDark mt-2">
            {value}
          </p>
        </div>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${toneMap[tone] || toneMap.primary}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
