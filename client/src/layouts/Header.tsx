import { useState, useRef, useEffect } from "react";
import {
  Search,
  Bell,
  User,
  Settings,
  BookOpen,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProfile } from "../features/profileSlice";
import type { AppDispatch, RootState } from "@/app/store";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/common/mode-toggle";

export default function Header() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { data: profile, loading } = useSelector((s: RootState) => s.profile);

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  // Fetch profile once on mount
  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ⌘K / Ctrl+K shortcut to focus search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        document.getElementById("global-search")?.focus();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const handleLogout = async () => {
    setMenuOpen(false);
    navigate("/login");
  };

  const fullName =
    profile?.firstName && profile?.lastName
      ? `${profile.firstName} ${profile.lastName}`
      : (profile?.firstName ?? "User");

  const initials =
    profile?.firstName && profile?.lastName
      ? `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase()
      : (profile?.firstName?.[0]?.toUpperCase() ?? "U");

  const menuItems = [
    { label: "My profile", icon: User, action: () => navigate("/my-profile") },
    {
      label: "Settings",
      icon: Settings,
      action: () => navigate("/my-profile"),
    },
    {
      label: "Trade journal",
      icon: BookOpen,
      action: () => navigate("/trades"),
      badge: "247",
    },
  ];

  return (
    <header className="h-14 bg-card border-b border-border flex items-center justify-between gap-4 px-5 shrink-0">
      {/* ── Search ──────────────────────────────── */}
      <div className="flex items-center gap-2 flex-1 max-w-xs h-9 px-3 bg-muted border border-border rounded-lg focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10 transition-all">
        <Search size={14} className="text-muted-foreground shrink-0" />
        <input
          id="global-search"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search trades, symbols…"
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
        <kbd className="hidden sm:inline text-[11px] text-muted-foreground bg-background border border-border rounded px-1.5 py-px font-mono">
          ⌘K
        </kbd>
      </div>

      {/* ── Right side ──────────────────────────── */}
      <div className="flex items-center gap-2.5">
        {/* Bell */}
        <button className="relative h-8 w-8 flex items-center justify-center rounded-lg border border-border hover:bg-accent transition-colors">
          <Bell size={15} className="text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full border border-card" />
        </button>

        <div className="p-1.5 space-y-px">
          <ModeToggle />
        </div>

        <div className="w-px h-5 bg-border" />

        {/* User menu */}
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            disabled={loading}
            className={cn(
              "flex items-center gap-2 pl-2.5 pr-1.5 py-1 rounded-lg border border-border hover:bg-accent transition-colors",
              menuOpen && "bg-accent",
            )}
          >
            {/* Name — skeleton while loading */}
            {loading ? (
              <span className="hidden sm:block h-3.5 w-20 bg-muted rounded animate-pulse" />
            ) : (
              <span className="text-sm font-medium text-foreground hidden sm:block">
                {fullName}
              </span>
            )}

            {/* Avatar */}
            <div className="h-7 w-7 rounded-md bg-blue-600/20 flex items-center justify-center text-blue-400 text-xs font-semibold">
              {loading ? (
                <span className="w-3 h-3 rounded-sm bg-blue-400/30 animate-pulse" />
              ) : (
                initials
              )}
            </div>

            <ChevronDown
              size={13}
              className={cn(
                "text-muted-foreground transition-transform duration-200",
                menuOpen && "rotate-180",
              )}
            />
          </button>

          {/* Dropdown */}
          {menuOpen && (
            <div className="absolute right-0 top-[calc(100%+8px)] w-56 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50 animate-fade-in">
              {/* User info */}
              <div className="px-3.5 py-3 border-b border-border">
                <p className="text-sm font-medium text-foreground">
                  {fullName}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {profile?.email ?? "—"}
                </p>
              </div>

              {/* Items */}

              <div className="p-1.5 space-y-px">
                {menuItems.map(({ label, icon: Icon, action, badge }) => (
                  <button
                    key={label}
                    onClick={() => {
                      action();
                      setMenuOpen(false);
                    }}
                    className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-sm text-foreground hover:bg-accent transition-colors text-left"
                  >
                    <Icon
                      size={14}
                      className="text-muted-foreground shrink-0"
                    />
                    <span className="flex-1">{label}</span>
                    {badge && (
                      <span className="text-[10px] px-1.5 py-px rounded-full bg-blue-500/10 text-blue-400 font-medium">
                        {badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="h-px bg-border mx-1.5" />

              <div className="p-1.5">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut size={14} className="shrink-0" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
