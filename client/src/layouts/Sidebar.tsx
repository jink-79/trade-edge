import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  PlusCircle,
  Briefcase,
  History,
  Eye,
  Zap,
  BarChart3,
  Settings,
  TrendingUp,
  MoreVertical,
} from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "../app/store";
const mainNav = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "New trade", path: "/new-trade", icon: PlusCircle },
];

const insightsNav = [
  {
    name: "Signals",
    path: "/signals",
    icon: Zap,
    badge: 2,
    badgeVariant: "warning" as const,
  },
  { name: "Analytics", path: "/analytics", icon: BarChart3 },
];

const bottomNav = [
  { name: "Preferences", path: "/preferences", icon: Settings },
];

type NavItem = {
  name: string;
  path: string;
  icon: React.ElementType;
  badge?: number;
  badgeVariant?: "default" | "warning";
};

function NavGroup({ label, items }: { label: string; items: NavItem[] }) {
  return (
    <div>
      <p className="px-2 pt-3 pb-1.5 text-[10px] font-medium uppercase tracking-widest text-muted-foreground/70">
        {label}
      </p>
      {items.map((item) => (
        <NavItem key={item.path} item={item} />
      ))}
    </div>
  );
}

function NavItem({ item }: { item: NavItem }) {
  return (
    <NavLink
      to={item.path}
      end={item.path === "/"}
      className={({ isActive }) =>
        `group flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors ${
          isActive
            ? "bg-primary/10 text-primary font-medium"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <item.icon
            size={16}
            className={
              isActive
                ? "text-primary"
                : "text-muted-foreground group-hover:text-foreground"
            }
          />
          <span className="flex-1 truncate">{item.name}</span>
          {item.badge != null && (
            <span
              className={`rounded-full px-2 py-px text-[12px] font-medium text-white ${
                item.badgeVariant === "warning" ? "bg-amber-600" : "bg-primary"
              }`}
            >
              {item.badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}

export default function Sidebar() {
  const { data } = useSelector((state: RootState) => state.openPositions);
  const openPositionsNum = data.length;

  const positionsNav = [
    {
      name: "Open positions",
      path: "/open-positions",
      icon: Briefcase,
      badge: openPositionsNum,
    },
    { name: "Trade history", path: "/history", icon: History },
    {
      name: "Mutual Funds",
      path: "/mutual-funds",
      icon: Briefcase,
    },
    { name: "Watchlist", path: "/watchlist", icon: Eye },
  ];
  return (
    <aside className="flex w-64 flex-col border-r border-border bg-card text-card-foreground">
      {/* Logo */}
      <div className="flex items-center gap-2.5 border-b border-border px-4 py-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
          <TrendingUp size={16} className="text-primary-foreground" />
        </div>
        <div>
          <p className="text-[15px] font-medium leading-none tracking-tight text-foreground">
            TradeEdge
          </p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">
            Trading Platform
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-px overflow-y-auto px-2.5 py-3">
        <NavGroup label="Overview" items={mainNav} />
        <NavGroup label="Positions" items={positionsNav} />
        <NavGroup label="Insights" items={insightsNav} />

        <div className="my-2 border-t border-border" />

        {bottomNav.map((item) => (
          <NavItem key={item.path} item={item} />
        ))}
      </nav>

      {/* User */}
      <div className="border-t border-border p-2.5">
        <button className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left transition-colors hover:bg-muted">
          <div className="flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
            TR
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium text-foreground">
              Trader Pro
            </p>
            <p className="text-[11px] text-muted-foreground">
              Standard account
            </p>
          </div>
          <MoreVertical size={14} className="shrink-0 text-muted-foreground" />
        </button>
      </div>
    </aside>
  );
}
