import React, { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { DataKindBadge } from "@/components/signature/DataKindBadge";
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  X,
  Sparkles,
  AlertTriangle,
  Coins,
  CheckCircle2,
  Users,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { tr, useT } from "@/i18n";

export const StoryModeModal: React.FC = () => {
  const t = useT();
  const {
    isStoryModeOpen,
    storyCurrentScene,
    setStoryModeOpen,
    setStoryScene,
    nextStoryScene,
    prevStoryScene,
  } = useAppStore();

  // Keyboard navigation: ArrowLeft, ArrowRight, Space, Escape
  useEffect(() => {
    if (!isStoryModeOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        nextStoryScene();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prevStoryScene();
      } else if (e.key === "Escape") {
        e.preventDefault();
        setStoryModeOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isStoryModeOpen, nextStoryScene, prevStoryScene, setStoryModeOpen]);

  if (!isStoryModeOpen) return null;

  const scenes = [
    {
      act: t("story.1"),
      title: t("story.2"),
      subtitle: t("story.3"),
      highlightMetric: t("story.4"),
      metricLabel: t("story.5"),
      content: (
        <div className="bg-navy-surface p-6 rounded-card border border-navy-border space-y-4 max-w-xl mx-auto text-left">
          <div className="flex items-center justify-between">
            <span className="text-xs text-brand-glow font-semibold tracking-wider uppercase">
              {t("story.6")}
            </span>
            <DataKindBadge kind="simulated" size="sm" />
          </div>
          <p className="text-sm text-slate-200 leading-relaxed">
            {t("story.w1")}
          </p>
          <div className="p-3 bg-navy-card rounded-xl border border-navy-border flex items-center justify-between text-xs">
            <span className="text-slate-300">{t("story.7")}</span>
            <span className="text-white font-medium">{t("story.8")}</span>
          </div>
        </div>
      ),
    },
    {
      act: t("story.9"),
      title: t("story.10"),
      subtitle: t("story.11"),
      highlightMetric: t("story.12"),
      metricLabel: t("story.13"),
      content: (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-2xl mx-auto text-left">
          {[
            { name: t("story.14"), role: t("story.15"), gap: t("story.16") },
            { name: t("story.17"), role: t("story.18"), gap: t("story.19") },
            { name: t("story.20"), role: t("story.x.1"), gap: t("story.21") },
            { name: t("story.22"), role: t("story.x.2"), gap: t("story.19") },
            { name: t("story.23"), role: t("story.24"), gap: t("story.19") },
            { name: t("story.25"), role: t("story.26"), gap: t("story.19") },
          ].map((s, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-navy-surface border border-navy-border text-xs">
              <div className="font-semibold text-white truncate">{s.name}</div>
              <div className="text-[11px] text-slate-400">{t("story.r.role", { role: s.role })}</div>
              <div className={`text-[10px] mt-2 font-mono font-bold ${s.gap.includes("Shortfall") ? "text-danger" : "text-emerald-400"}`}>
                {s.gap}
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      act: t("story.27"),
      title: t("story.28"),
      subtitle: t("story.x.3"),
      highlightMetric: "฿29,500",
      metricLabel: t("story.29"),
      content: (
        <div className="bg-navy-surface p-6 rounded-card border border-danger/40 max-w-xl mx-auto text-left space-y-4 shadow-glow-danger">
          <div className="flex items-center gap-2 text-danger font-bold text-sm">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{t("story.30")}</span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed">
            {t("story.w2")}
          </p>
          <div className="p-3 bg-red-950/40 rounded-xl border border-danger/30 text-xs text-red-200 flex items-center justify-between">
            <span>{t("story.31")}</span>
            <span className="font-bold text-danger">{t("story.32")}</span>
          </div>
        </div>
      ),
    },
    {
      act: t("story.33"),
      title: t("story.34"),
      subtitle: t("story.35"),
      highlightMetric: t("story.36"),
      metricLabel: t("story.37"),
      content: (
        <div className="bg-navy-surface p-6 rounded-card border border-resource/40 max-w-xl mx-auto text-left space-y-4 shadow-glow-resource">
          <div className="flex items-center gap-2 text-resource font-bold text-sm">
            <Coins className="w-4 h-4 shrink-0" />
            <span>{t("story.x.4")}</span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed">
            {t("story.38")}
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-navy-card border border-navy-border">
              <span className="text-slate-400 block text-[10px]">{t("story.39")}</span>
              <span className="text-white font-bold font-mono">{t("story.40")}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-navy-card border border-navy-border">
              <span className="text-slate-400 block text-[10px]">{t("story.41")}</span>
              <span className="text-resource font-bold">{t("story.42")}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      act: t("story.43"),
      title: t("story.44"),
      subtitle: t("story.45"),
      highlightMetric: t("story.46"),
      metricLabel: t("story.47"),
      content: (
        <div className="bg-navy-surface p-6 rounded-card border border-attention/40 max-w-xl mx-auto text-left space-y-4">
          <div className="flex items-center gap-2 text-attention font-bold text-sm">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>{t("story.48")}</span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed">
            {t("story.49")}
          </p>
          <div className="p-3 bg-navy-card rounded-xl border border-navy-border flex items-center justify-between text-xs">
            <span className="text-slate-300">{t("story.50")}</span>
            <span className="text-emerald-400 font-bold">{t("story.51")}</span>
          </div>
        </div>
      ),
    },
    {
      act: t("story.52"),
      title: t("story.53"),
      subtitle: t("story.54"),
      highlightMetric: "฿69,000",
      metricLabel: t("story.55"),
      content: (
        <div className="bg-navy-surface p-6 rounded-card border border-brand/40 max-w-xl mx-auto text-left space-y-4 shadow-glow-primary">
          <div className="flex items-center gap-2 text-brand-glow font-bold text-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{t("story.56")}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-3 rounded-xl bg-navy-card border border-navy-border">
              <span className="text-[10px] text-slate-400 block">{t("story.x.5")}</span>
              <span className="text-sm font-bold text-emerald-400">{t("story.57")}</span>
            </div>
            <div className="p-3 rounded-xl bg-navy-card border border-navy-border">
              <span className="text-[10px] text-slate-400 block">{t("story.58")}</span>
              <span className="text-sm font-bold text-resource">{t("story.57")}</span>
            </div>
            <div className="p-3 rounded-xl bg-navy-card border border-navy-border">
              <span className="text-[10px] text-slate-400 block">{t("story.x.6")}</span>
              <span className="text-sm font-bold text-emerald-400">{t("story.57")}</span>
            </div>
          </div>
          <p className="text-xs text-slate-300 text-center leading-relaxed">
            “{t("story.w3")}”
          </p>
        </div>
      ),
    },
  ];

  const current = scenes[storyCurrentScene - 1];

  return (
    <div className="fixed inset-0 z-50 bg-navy-deep text-white flex flex-col justify-between p-4 sm:p-6 overflow-y-auto animate-fade-in">
      {/* Top Stepper Bar */}
      <div className="max-w-5xl w-full mx-auto flex flex-wrap items-center justify-between gap-3 border-b border-navy-border pb-4">
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 rounded-chip bg-brand/20 border border-brand text-brand-glow text-xs font-bold font-mono">
            {t("story.59")}
          </span>
          <span className="text-xs text-slate-400 font-medium">
            {t("story.60")}
          </span>
        </div>

        {/* Scene Progress Dots */}
        <div className="flex items-center gap-2">
          {scenes.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setStoryScene(idx + 1)}
              className={`h-2 rounded-full transition-all duration-300 ${
                storyCurrentScene === idx + 1
                  ? "w-8 bg-brand-glow shadow-glow-primary"
                  : idx + 1 < storyCurrentScene
                  ? "w-2 bg-emerald-400"
                  : "w-2 bg-navy-border"
              }`}
              title={`Scene ${idx + 1}`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => setStoryModeOpen(false)}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-navy-surface rounded-lg transition-colors flex items-center gap-1 text-xs"
        >
          <span>{t("story.61")}</span>
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Center Cinematic Stage */}
      <div className="max-w-4xl w-full mx-auto my-auto text-center space-y-6">
        <div>
          <span className="text-xs font-bold text-brand-glow tracking-widest uppercase block mb-1">
            {current.act}
          </span>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-2 leading-tight">
            {current.title}
          </h2>
          <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            {current.subtitle}
          </p>
        </div>

        {/* Big Key Metric Pill */}
        <div className="inline-flex flex-col items-center p-3 px-6 rounded-2xl bg-navy-surface/80 border border-navy-border shadow-soft-lg">
          <span className="text-2xl md:text-4xl font-display font-extrabold text-brand-glow tracking-tight">
            {current.highlightMetric}
          </span>
          <span className="text-xs text-slate-400 font-medium mt-1">
            {current.metricLabel}
          </span>
        </div>

        {/* Scene Interactive Content */}
        <div>{current.content}</div>
      </div>

      {/* Bottom Controller Bar */}
      <div className="max-w-5xl w-full mx-auto flex items-center justify-between border-t border-navy-border pt-4 text-xs">
        <button
          type="button"
          onClick={() => setStoryScene(1)}
          className="text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{t("story.62")}</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={prevStoryScene}
            disabled={storyCurrentScene === 1}
            className="px-4 py-2 rounded-btn bg-navy-surface border border-navy-border text-slate-200 hover:bg-navy-card disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{t("story.63")}</span>
          </button>

          <span className="font-mono text-slate-400">
            {storyCurrentScene} / {scenes.length}
          </span>

          <button
            type="button"
            onClick={() => {
              if (storyCurrentScene === scenes.length) {
                setStoryModeOpen(false);
              } else {
                nextStoryScene();
              }
            }}
            className="px-5 py-2 rounded-btn bg-brand hover:bg-brand-dark text-white font-semibold flex items-center gap-1 shadow-glow-primary transition-all"
          >
            <span>{storyCurrentScene === scenes.length ? t("story.64") : t("story.65")}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="text-[11px] text-slate-500 font-mono">
          {t("story.66")}
        </div>
      </div>
    </div>
  );
};
