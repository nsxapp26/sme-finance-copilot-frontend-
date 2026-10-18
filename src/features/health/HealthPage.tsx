import React, { useState, useCallback } from "react";
import { useAppStore } from "@/store/useAppStore";
import { apiClient } from "@/api/client";
import { HealthIndicator } from "@/api/contracts/types";
import { envelopeMode, useAnalysisContext, useEnvelope } from "@/hooks/useEnvelope";
import { DataKindBadge } from "@/components/signature/DataKindBadge";
import { StateRenderer } from "@/components/ui/StateRenderer";
import {
  HeartPulse,
  TrendingUp,
  AlertTriangle,
  HelpCircle,
  FileQuestion,
  Info,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { tr, useT } from "@/i18n";

export const HealthPage: React.FC = () => {
  const t = useT();
  const { setAIPanelOpen, setCurrentPage } = useAppStore();
  const { stale } = useAnalysisContext();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [inspectFormulaId, setInspectFormulaId] = useState<string | null>(null);
  const load = useCallback(() => apiClient.getHealthIndicators(), []);
  const state = useEnvelope<HealthIndicator[]>(load);
  const { envelope: indicatorsEnvelope, loading, error, reload: loadData } = state;
  const mode = envelopeMode(state, (rows) => rows.length === 0);

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <div className="h-40 bg-slate-200 rounded-card animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-48 bg-slate-200 rounded-card animate-pulse" />
          <div className="h-48 bg-slate-200 rounded-card animate-pulse" />
          <div className="h-48 bg-slate-200 rounded-card animate-pulse" />
        </div>
      </div>
    );
  }

  const indicators = indicatorsEnvelope?.data || [];
  const filtered =
    activeCategory === "all"
      ? indicators
      : indicators.filter((i) => i.category === activeCategory);

  if (!indicatorsEnvelope || mode === "error" || mode === "unavailable" || mode === "insufficient_data") {
    return (
      <StateRenderer
        currentMode={mode === "error" ? "error" : mode === "unavailable" ? "unavailable" : "insufficient_data"}
        errorMessage={error || t("health.1")}
        unavailableReason={t("health.x.1")}
        missingItems={indicatorsEnvelope?.missing || []}
        onRetry={loadData}
        onAddData={() => setCurrentPage("import")}
      >
        {null}
      </StateRenderer>
    );
  }

  return (
    <StateRenderer currentMode={stale ? "stale" : undefined} onRetry={loadData} onReanalyze={() => setCurrentPage("import")}>
      <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6 text-ink animate-fade-in">
        {/* Header Bar */}
        <div className="page-header flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-brand text-white flex items-center justify-center font-bold">
                <HeartPulse className="w-4 h-4" />
              </div>
              <h1 className="text-xl font-display font-bold text-ink">
                {t("health.2")}
              </h1>
              <DataKindBadge kind={indicatorsEnvelope.kind} size="md" />
            </div>
            <p className="text-xs text-ink-muted mt-0.5">
              {t("health.3")}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAIPanelOpen(true)}
              className="px-3.5 py-1.5 bg-brand/10 hover:bg-brand/20 border border-brand/30 text-brand text-xs font-bold rounded-btn flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t("health.4")}</span>
            </button>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pb-1 text-xs">
          {[
            { id: "all", label: t("health.5") },
            { id: "liquidity", label: t("health.6") },
            { id: "profitability", label: t("health.7") },
            { id: "debt", label: t("health.8") },
            { id: "efficiency", label: t("health.9") },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-chip font-medium whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? "bg-brand text-white shadow-xs font-bold"
                  : "bg-white border border-borderLine text-ink hover:border-brand/40"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Indicators Grid */}
        <div data-tilt-grid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => {
            const isInsufficient = item.status === "insufficient" || item.value === null;

            return (
              <div
                key={item.id}
                className={`p-5 rounded-card border transition-all duration-200 flex flex-col justify-between space-y-3 ${
                  isInsufficient
                    ? "bg-amber-50/50 border-amber-300"
                    : "bg-white border-borderLine hover:border-brand/40 hover:shadow-soft-md"
                }`}
              >
                <div>
                  {/* Card Header: Name & Benchmark */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-[10px] font-mono text-ink-muted uppercase">
                        {item.nameEn}
                      </span>
                      <h3 className="font-display font-bold text-xs text-ink leading-snug">
                        {item.name}
                      </h3>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-chip border shrink-0 ${
                        item.status === "good"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                          : item.status === "warning"
                          ? "bg-amber-50 text-amber-800 border-amber-300"
                          : item.status === "danger"
                          ? "bg-red-50 text-danger border-danger/30"
                          : "bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                    >
                      {item.status === "good"
                        ? t("health.10")
                        : item.status === "warning"
                        ? t("health.11")
                        : item.status === "danger"
                        ? t("health.12")
                        : t("health.13")}
                    </span>
                  </div>

                  {/* Value or Insufficient Data Alert (Strict Rule #3: Never show 0!) */}
                  {isInsufficient ? (
                    <div className="p-3 bg-white rounded-xl border border-amber-200 space-y-1.5 my-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                        <FileQuestion className="w-4 h-4 text-attention shrink-0" />
                        <span>{item.missingFields?.length ? t("health.14") : t("health.15")}</span>
                      </div>
                      <ul className="text-[11px] text-amber-800 list-disc pl-4 space-y-0.5">
                        {(item.missingFields?.length ? item.missingFields : [item.interpretation || t("health.16")]).map((mf, idx) => (
                          <li key={idx}>{mf}</li>
                        ))}
                      </ul>
                      <button
                        type="button"
                        onClick={() => setCurrentPage("import")}
                        className="text-[10px] font-bold text-brand hover:underline block pt-1"
                      >
                        {t("health.17")}
                      </button>
                    </div>
                  ) : (
                    <div className="my-2">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-extrabold font-mono text-ink tabular-nums">
                          {item.value == null ? t("health.18") : item.value.toLocaleString("en-US", { maximumFractionDigits: 4 })}
                        </span>
                        <span className="text-xs font-semibold text-ink-muted">{item.unit}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {t("health.r.bench", { v: item.benchmark })}
                      </span>
                    </div>
                  )}

                  {/* Interpretation Note */}
                  <p className="text-[11px] text-ink-muted leading-relaxed line-clamp-2">
                    {item.interpretation}
                  </p>
                </div>

                {/* Footer: Formula Inspector */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <button
                    type="button"
                    onClick={() =>
                      setInspectFormulaId(inspectFormulaId === item.id ? null : item.id)
                    }
                    className="text-brand hover:underline font-medium flex items-center gap-1"
                  >
                    <Info className="w-3 h-3" />
                    <span>{inspectFormulaId === item.id ? t("health.19") : t("health.20")}</span>
                  </button>

                  <DataKindBadge kind={indicatorsEnvelope.kind} size="sm" />
                </div>

                {/* Formula Popover Dropdown */}
                {inspectFormulaId === item.id && (
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[10px] text-ink-muted font-mono animate-fade-in">
                    <strong>{t("health.21")}</strong> {item.formula}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </StateRenderer>
  );
};
