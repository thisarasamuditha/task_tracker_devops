import { useEffect, useMemo, useState } from "react";
import { useToast } from "../hooks/useToast";
import DashboardCard from "../components/DashboardCard";
import { StatCardSkeleton } from "../components/Skeletons";
import { getTasksByUser } from "../services/tasksService";

const RECHARTS_SPECIFIER = "recharts";

const STATUS_COLORS = {
  PENDING: "#FFC75F",
  IN_PROGRESS: "#89C2FF",
  COMPLETED: "#A3F7BF",
};

const PRIORITY_COLORS = {
  LOW: "#A3F7BF",
  MEDIUM: "#FFC75F",
  HIGH: "#FF6B6B",
};

function formatMaybeNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function DonutChart({ data, colors, centerLabel }) {
  const safeData = Array.isArray(data) ? data : [];
  const total = safeData.reduce((acc, d) => acc + formatMaybeNumber(d.value), 0);
  const segments = safeData
    .map((d) => ({
      ...d,
      value: formatMaybeNumber(d.value),
    }))
    .filter((d) => d.value > 0);

  let cumulative = 0;
  const rings = segments.map((d) => {
    const pct = total === 0 ? 0 : (d.value / total) * 100;
    const ring = {
      key: d.key,
      pct,
      offset: cumulative,
      color: colors?.[d.key] || "#999",
    };
    cumulative += pct;
    return ring;
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
      <div className="relative w-full max-w-[280px] mx-auto">
        <svg viewBox="0 0 42 42" className="w-full h-auto">
          <circle
            cx="21"
            cy="21"
            r="15.9155"
            fill="transparent"
            stroke="currentColor"
            className="text-surface dark:text-borderDark"
            strokeWidth="5"
          />

          {rings.map((r) => (
            <circle
              key={r.key}
              cx="21"
              cy="21"
              r="15.9155"
              fill="transparent"
              stroke={r.color}
              strokeWidth="5"
              strokeDasharray={`${r.pct} ${100 - r.pct}`}
              strokeDashoffset={-r.offset}
              strokeLinecap="round"
              transform="rotate(-90 21 21)"
            />
          ))}

          <text
            x="21"
            y="21"
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-text dark:fill-textDark"
            style={{ fontWeight: 800, fontSize: "6px" }}
          >
            {centerLabel}
          </text>
        </svg>
      </div>

      <div className="space-y-3">
        {safeData.map((d) => {
          const value = formatMaybeNumber(d.value);
          const pct = total === 0 ? 0 : Math.round((value / total) * 100);
          return (
            <div key={d.key} className="flex items-center gap-3">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ background: colors?.[d.key] || "#999" }}
                aria-hidden="true"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-text dark:text-textDark truncate">{d.name}</p>
                  <p className="text-xs text-muted dark:text-mutedDark">{value} ({pct}%)</p>
                </div>
                <div className="mt-2 h-2 rounded-full bg-surface dark:bg-borderDark overflow-hidden">
                  <div className="h-2 rounded-full" style={{ width: `${pct}%`, background: colors?.[d.key] || "#999" }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BarList({ data, colors }) {
  const safeData = Array.isArray(data) ? data : [];
  const maxValue = safeData.reduce((acc, d) => Math.max(acc, formatMaybeNumber(d.value)), 0);

  return (
    <div className="space-y-4">
      {safeData.map((d) => {
        const value = formatMaybeNumber(d.value);
        const pct = maxValue === 0 ? 0 : Math.round((value / maxValue) * 100);
        return (
          <div key={d.key}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-text dark:text-textDark">{d.name}</p>
              <p className="text-xs text-muted dark:text-mutedDark">{value}</p>
            </div>
            <div className="mt-2 h-2.5 rounded-full bg-surface dark:bg-borderDark overflow-hidden">
              <div
                className="h-2.5 rounded-full"
                style={{ width: `${pct}%`, background: colors?.[d.key] || "#999" }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Charts({ byStatus, byPriority }) {
  const [recharts, setRecharts] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Avoid build-time resolution when the dependency isn't installed.
        // When installed, this will load it at runtime and render the richer charts.
        const mod = await import(/* @vite-ignore */ RECHARTS_SPECIFIER);
        if (mounted) setRecharts(mod);
      } catch {
        if (mounted) setRecharts(null);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (recharts) {
    const {
      ResponsiveContainer,
      PieChart,
      Pie,
      Cell,
      Tooltip,
      BarChart,
      Bar,
      XAxis,
      YAxis,
      CartesianGrid,
    } = recharts;

    return (
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-surfaceDark border border-border dark:border-borderDark rounded-2xl shadow-sm p-5">
          <div className="mb-4">
            <p className="font-bold text-text dark:text-textDark">Tasks by status</p>
            <p className="text-sm text-muted dark:text-mutedDark">Distribution across workflow.</p>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byStatus} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={4}>
                  {byStatus.map((entry) => (
                    <Cell key={entry.key} fill={STATUS_COLORS[entry.key]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-surfaceDark border border-border dark:border-borderDark rounded-2xl shadow-sm p-5">
          <div className="mb-4">
            <p className="font-bold text-text dark:text-textDark">Tasks by priority</p>
            <p className="text-sm text-muted dark:text-mutedDark">Keep an eye on high-impact work.</p>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byPriority} margin={{ left: 8, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                  {byPriority.map((entry) => (
                    <Cell key={entry.key} fill={PRIORITY_COLORS[entry.key]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  }

  // Fallback charts (no external deps)
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <div className="bg-white dark:bg-surfaceDark border border-border dark:border-borderDark rounded-2xl shadow-sm p-5">
        <div className="mb-4">
          <p className="font-bold text-text dark:text-textDark">Tasks by status</p>
          <p className="text-sm text-muted dark:text-mutedDark">Distribution across workflow.</p>
        </div>
        <div className="h-72 flex items-center">
          <div className="w-full">
            <DonutChart data={byStatus} colors={STATUS_COLORS} centerLabel="Status" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-surfaceDark border border-border dark:border-borderDark rounded-2xl shadow-sm p-5">
        <div className="mb-4">
          <p className="font-bold text-text dark:text-textDark">Tasks by priority</p>
          <p className="text-sm text-muted dark:text-mutedDark">Keep an eye on high-impact work.</p>
        </div>
        <div className="h-72 flex items-center">
          <div className="w-full">
            <BarList data={byPriority} colors={PRIORITY_COLORS} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const toast = useToast();
  const userId = localStorage.getItem("userId");

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const data = await getTasksByUser(userId);
        setTasks(Array.isArray(data) ? data : []);
      } catch (err) {
        toast.error({ title: "Failed to load dashboard", message: err.message });
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === "COMPLETED").length;
    const pending = tasks.filter((t) => t.status === "PENDING").length;
    const inProgress = tasks.filter((t) => t.status === "IN_PROGRESS").length;

    const pct = total === 0 ? 0 : Math.round((completed / total) * 100);

    const byStatus = [
      { name: "Todo", key: "PENDING", value: pending },
      { name: "In Progress", key: "IN_PROGRESS", value: inProgress },
      { name: "Completed", key: "COMPLETED", value: completed },
    ];

    const byPriority = [
      { name: "Low", key: "LOW", value: tasks.filter((t) => t.priority === "LOW").length },
      { name: "Medium", key: "MEDIUM", value: tasks.filter((t) => t.priority === "MEDIUM").length },
      { name: "High", key: "HIGH", value: tasks.filter((t) => t.priority === "HIGH").length },
    ];

    return { total, completed, pending, inProgress, pct, byStatus, byPriority };
  }, [tasks]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-display font-extrabold text-text dark:text-textDark">Dashboard</h1>
          <p className="text-muted dark:text-mutedDark mt-2">A quick view of your productivity.</p>
        </div>

        <div className="bg-white dark:bg-surfaceDark border border-border dark:border-borderDark rounded-2xl shadow-sm px-5 py-4">
          <p className="text-sm text-muted dark:text-mutedDark">Completion</p>
          <div className="mt-2 flex items-center gap-4">
            <div className="flex-1">
              <div className="h-3 rounded-full bg-surface dark:bg-borderDark overflow-hidden">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-primary to-secondary"
                  style={{ width: `${stats.pct}%` }}
                />
              </div>
            </div>
            <div className="text-lg font-extrabold text-text dark:text-textDark w-14 text-right">
              {stats.pct}%
            </div>
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, idx) => <StatCardSkeleton key={idx} />)
        ) : (
          <>
            <DashboardCard
              title="Total tasks"
              value={stats.total}
              tone="primary"
              icon={
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
                </svg>
              }
            />
            <DashboardCard
              title="Completed"
              value={stats.completed}
              tone="success"
              icon={
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <DashboardCard
              title="Todo"
              value={stats.pending}
              tone="warning"
              icon={
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <DashboardCard
              title="In progress"
              value={stats.inProgress}
              tone="info"
              icon={
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
            />
          </>
        )}
      </div>

      {/* Charts */}
      <Charts byStatus={stats.byStatus} byPriority={stats.byPriority} />
    </div>
  );
}
