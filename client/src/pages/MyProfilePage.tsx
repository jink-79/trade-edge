// src/pages/MyProfilePage.tsx
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProfile, saveProfile } from "../features/profileSlice";
import type { AppDispatch, RootState } from "../app/store";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  TrendingUp,
  RefreshCw,
  Save,
  Camera,
  BadgeCheck,
  Calendar,
  Globe,
  DollarSign,
  BarChart2,
  Shield,
  Clock,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  timezone: string;
  bio: string;
  tradingExperience: string;
  preferredMarkets: string[];
  tradingStyle: string;
  accountCurrency: string;
  riskTolerance: string;
  website: string;
  avatarUrl: string;
}

const MARKETS = [
  "Stocks",
  "Forex",
  "Crypto",
  "Futures",
  "Options",
  "Commodities",
  "ETFs",
  "Indices",
];
const EXPERIENCE_LEVELS = [
  "Beginner (< 1 year)",
  "Intermediate (1–3 years)",
  "Advanced (3–5 years)",
  "Expert (5+ years)",
];
const TRADING_STYLES = [
  "Scalper",
  "Day Trader",
  "Swing Trader",
  "Position Trader",
  "Algorithmic",
];
const RISK_LEVELS = ["Conservative", "Moderate", "Aggressive"];
const CURRENCIES = ["USD", "EUR", "GBP", "INR", "JPY", "AUD", "CAD"];
const TIMEZONES = [
  "Asia/Kolkata",
  "America/New_York",
  "America/Chicago",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Asia/Tokyo",
  "Asia/Singapore",
  "Australia/Sydney",
];

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({
  title,
  icon: Icon,
  children,
  className,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-card border border-border rounded-xl p-6 shadow-sm",
        className,
      )}
    >
      <div className="flex items-center gap-2.5 mb-5">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <h3 className="font-semibold text-foreground text-sm tracking-wide uppercase">
          {title}
        </h3>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

// ─── Field Row ────────────────────────────────────────────────────────────────
function FieldRow({
  children,
  cols = 2,
}: {
  children: React.ReactNode;
  cols?: 1 | 2;
}) {
  return (
    <div
      className={cn(
        "grid gap-4",
        cols === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1",
      )}
    >
      {children}
    </div>
  );
}

// ─── Market Toggle ────────────────────────────────────────────────────────────
function MarketToggle({
  market,
  selected,
  onToggle,
}: {
  market: string;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150 select-none",
        selected
          ? "bg-primary text-primary-foreground border-primary shadow-sm"
          : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground",
      )}
    >
      {market}
    </button>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
}) {
  return (
    <div className="flex flex-col gap-1 p-4 rounded-xl bg-muted/60 border border-border/60">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Icon className="w-3.5 h-3.5" />
        <span className="text-xs">{label}</span>
      </div>
      <p className="text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function MyProfilePage() {
  const dispatch = useDispatch<AppDispatch>();
  const { data, loading, saving, error, lastSaved } = useSelector(
    (s: RootState) => s.profile,
  );

  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<ProfileFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: "",
    timezone: "Asia/Kolkata",
    bio: "",
    tradingExperience: "",
    preferredMarkets: [],
    tradingStyle: "",
    accountCurrency: "USD",
    riskTolerance: "",
    website: "",
    avatarUrl: "",
  });
  const [refreshing, setRefreshing] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  useEffect(() => {
    if (data) setForm({ ...form, ...data });
  }, [data]);

  const set = (key: keyof ProfileFormData, value: string | string[]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const toggleMarket = (m: string) =>
    set(
      "preferredMarkets",
      form.preferredMarkets.includes(m)
        ? form.preferredMarkets.filter((x) => x !== m)
        : [...form.preferredMarkets, m],
    );

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAvatarPreview(url);
    set("avatarUrl", url);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchProfile());
    setTimeout(() => setRefreshing(false), 600);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(saveProfile(form));
  };

  const initials =
    [form.firstName[0], form.lastName[0]]
      .filter(Boolean)
      .join("")
      .toUpperCase() || "TE";

  return (
    <div className="min-h-screen bg-background">
      {/* ── Top bar ── */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h1 className="text-xl font-bold text-foreground tracking-tight">
                My Profile
              </h1>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Manage your trading identity and preferences
            </p>
          </div>

          <div className="flex items-center gap-2">
            {lastSaved && (
              <span className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                Saved {lastSaved}
              </span>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing || loading}
              className="gap-1.5"
            >
              <RefreshCw
                className={cn("w-3.5 h-3.5", refreshing && "animate-spin")}
              />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <Button
              type="submit"
              form="profile-form"
              size="sm"
              disabled={saving}
              className="gap-1.5"
            >
              {saving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              {saving ? "Saving…" : "Save Profile"}
            </Button>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form id="profile-form" onSubmit={handleSubmit} className="space-y-6">
          {/* ── Hero / Avatar Card ── */}
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            {/* Banner */}
            <div className="h-28 bg-linear-to-r from-primary/20 via-primary/10 to-accent/20 relative">
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, var(--primary) 10px, var(--primary) 11px)`,
                  backgroundSize: "20px 20px",
                }}
              />
            </div>

            <div className="px-6 pb-6">
              <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10">
                {/* Avatar */}
                <div className="relative w-fit">
                  <Avatar className="w-20 h-20 border-4 border-card shadow-md">
                    <AvatarImage src={avatarPreview ?? form.avatarUrl} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-lg font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors"
                  >
                    <Camera className="w-3 h-3" />
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>

                {/* Name / badge */}
                <div className="flex-1 pb-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-bold text-foreground">
                      {[form.firstName, form.lastName]
                        .filter(Boolean)
                        .join(" ") || "Your Name"}
                    </h2>
                    {form.tradingExperience && (
                      <Badge variant="secondary" className="text-xs gap-1">
                        <BadgeCheck className="w-3 h-3" />
                        {form.tradingExperience.split(" ")[0]}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {form.email || "your@email.com"}
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 sm:w-auto w-full">
                  <StatCard
                    label="Style"
                    value={form.tradingStyle || "—"}
                    icon={BarChart2}
                  />
                  <StatCard
                    label="Risk"
                    value={form.riskTolerance || "—"}
                    icon={Shield}
                  />
                  <StatCard
                    label="Currency"
                    value={form.accountCurrency || "—"}
                    icon={DollarSign}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Two column grid ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column — 2/3 width */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Info */}
              <Section title="Personal Information" icon={User}>
                <FieldRow>
                  <div className="space-y-1.5">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      placeholder="John"
                      value={form.firstName}
                      onChange={(e) => set("firstName", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      value={form.lastName}
                      onChange={(e) => set("lastName", e.target.value)}
                    />
                  </div>
                </FieldRow>

                <FieldRow>
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        className="pl-9"
                        value={form.email}
                        onChange={(e) => set("email", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        placeholder="+91 00000 00000"
                        className="pl-9"
                        value={form.phone}
                        onChange={(e) => set("phone", e.target.value)}
                      />
                    </div>
                  </div>
                </FieldRow>

                <FieldRow>
                  <div className="space-y-1.5">
                    <Label htmlFor="location">Location</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="location"
                        placeholder="Mumbai, India"
                        className="pl-9"
                        value={form.location}
                        onChange={(e) => set("location", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="website">Website / LinkedIn</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="website"
                        placeholder="https://yoursite.com"
                        className="pl-9"
                        value={form.website}
                        onChange={(e) => set("website", e.target.value)}
                      />
                    </div>
                  </div>
                </FieldRow>

                <div className="space-y-1.5">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about yourself and your trading journey…"
                    className="resize-none h-24"
                    value={form.bio}
                    onChange={(e) => set("bio", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {form.bio.length}/300
                  </p>
                </div>
              </Section>

              {/* Trading Preferences */}
              <Section title="Trading Preferences" icon={BarChart2}>
                <FieldRow>
                  <div className="space-y-1.5">
                    <Label>Trading Experience</Label>
                    <Select
                      value={form.tradingExperience}
                      onValueChange={(v) => set("tradingExperience", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        {EXPERIENCE_LEVELS.map((l) => (
                          <SelectItem key={l} value={l}>
                            {l}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Trading Style</Label>
                    <Select
                      value={form.tradingStyle}
                      onValueChange={(v) => set("tradingStyle", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select style" />
                      </SelectTrigger>
                      <SelectContent>
                        {TRADING_STYLES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </FieldRow>

                <div className="space-y-2">
                  <Label>Preferred Markets</Label>
                  <div className="flex flex-wrap gap-2">
                    {MARKETS.map((m) => (
                      <MarketToggle
                        key={m}
                        market={m}
                        selected={form.preferredMarkets.includes(m)}
                        onToggle={() => toggleMarket(m)}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {form.preferredMarkets.length} market
                    {form.preferredMarkets.length !== 1 ? "s" : ""} selected
                  </p>
                </div>
              </Section>
            </div>

            {/* Right column — 1/3 width */}
            <div className="space-y-6">
              {/* Account Settings */}
              <Section title="Account Settings" icon={Briefcase}>
                <div className="space-y-1.5">
                  <Label>Account Currency</Label>
                  <Select
                    value={form.accountCurrency}
                    onValueChange={(v) => set("accountCurrency", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Risk Tolerance</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {RISK_LEVELS.map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => set("riskTolerance", r)}
                        className={cn(
                          "py-2 px-1 rounded-lg text-xs font-medium border transition-all",
                          form.riskTolerance === r
                            ? r === "Conservative"
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:text-emerald-400"
                              : r === "Moderate"
                                ? "bg-amber-500/10 text-amber-600 border-amber-500/30 dark:text-amber-400"
                                : "bg-red-500/10 text-red-600 border-red-500/30 dark:text-red-400"
                            : "bg-background text-muted-foreground border-border hover:border-primary/40",
                        )}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              </Section>

              {/* Timezone */}
              <Section title="Timezone & Region" icon={Calendar}>
                <div className="space-y-1.5">
                  <Label>Timezone</Label>
                  <Select
                    value={form.timezone}
                    onValueChange={(v) => set("timezone", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMEZONES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t.replace("_", " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </Section>

              {/* Profile completeness */}
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">
                    Profile Completeness
                  </span>
                  <span className="text-sm font-bold text-primary">
                    {Math.round(
                      ([
                        form.firstName,
                        form.lastName,
                        form.email,
                        form.phone,
                        form.location,
                        form.bio,
                        form.tradingExperience,
                        form.tradingStyle,
                        form.riskTolerance,
                      ].filter(Boolean).length /
                        9) *
                        100,
                    )}
                    %
                  </span>
                </div>
                <div className="w-full bg-border rounded-full h-1.5">
                  <div
                    className="bg-primary h-1.5 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.round(
                        ([
                          form.firstName,
                          form.lastName,
                          form.email,
                          form.phone,
                          form.location,
                          form.bio,
                          form.tradingExperience,
                          form.tradingStyle,
                          form.riskTolerance,
                        ].filter(Boolean).length /
                          9) *
                          100,
                      )}%`,
                    }}
                  />
                </div>
                <ul className="space-y-1">
                  {[
                    {
                      label: "Full name",
                      done: !!(form.firstName && form.lastName),
                    },
                    {
                      label: "Email & phone",
                      done: !!(form.email && form.phone),
                    },
                    { label: "Bio written", done: form.bio.length > 20 },
                    {
                      label: "Markets selected",
                      done: form.preferredMarkets.length > 0,
                    },
                    { label: "Risk level set", done: !!form.riskTolerance },
                  ].map(({ label, done }) => (
                    <li key={label} className="flex items-center gap-2 text-xs">
                      <span
                        className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          done ? "bg-primary" : "bg-border",
                        )}
                      />
                      <span
                        className={cn(
                          done ? "text-foreground" : "text-muted-foreground",
                        )}
                      >
                        {label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* ── Footer save bar ── */}
          <div className="flex items-center justify-between pt-2 pb-6">
            <p className="text-xs text-muted-foreground">
              Your profile data is stored securely and used only within
              TradeEdge.
            </p>
            <Button type="submit" disabled={saving} className="gap-2 min-w-32">
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? "Saving…" : "Save Profile"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
