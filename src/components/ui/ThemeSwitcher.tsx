import React from "react";
import { Moon, Sun } from "lucide-react";
import { useAppStore, Theme } from "@/store/useAppStore";
import { useT } from "@/i18n";

// Dark / light theme picker: compact = icon-only for the top bar
export const ThemeSwitcher: React.FC<{ compact?: boolean }> = ({ compact }) => {
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);
  const t = useT();
  const options: { value: Theme; label: string; icon: React.ReactNode }[] = [
    { value: "dark", label: t("theme.dark"), icon: <Moon aria-hidden="true" className="h-3.5 w-3.5" /> },
    { value: "light", label: t("theme.light"), icon: <Sun aria-hidden="true" className="h-3.5 w-3.5" /> },
  ];

  return (
    <div role="radiogroup" aria-label={t("theme.label")}
      className={`flex items-center gap-0.5 rounded-btn border border-borderLine bg-white p-0.5 ${compact ? "h-8" : "w-full"}`}>
      {options.map((option) => {
        const active = option.value === theme;
        return (
          <button key={option.value} type="button" role="radio" aria-checked={active}
            onClick={() => setTheme(option.value)}
            title={option.label}
            aria-label={option.label}
            className={`press flex items-center justify-center gap-1.5 rounded-lg font-semibold transition-colors ${compact ? "px-2 py-1 text-[11px]" : "flex-1 py-1.5 text-xs"} ${
              active ? "bg-brand text-white shadow-sm" : "text-ink-muted hover:text-ink hover:bg-slate-50"}`}>
            {option.icon}
            {!compact && <span>{option.label}</span>}
          </button>
        );
      })}
    </div>
  );
};
