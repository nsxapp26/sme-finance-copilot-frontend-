import React, { useState, useCallback } from "react";
import { useAppStore } from "@/store/useAppStore";
import { apiClient } from "@/api/client";
import { CostBreakdown } from "@/api/contracts/types";
import { envelopeMode, useEnvelope } from "@/hooks/useEnvelope";
import { DataKindBadge } from "@/components/signature/DataKindBadge";
import { StateRenderer } from "@/components/ui/StateRenderer";
import {
  PieChart,
  Calculator,
  ArrowRight,
  Sparkles,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";
import { tr, useT } from "@/i18n";

export const CostPage: React.FC = () => {
  const t = useT();
  const { setCurrentPage } = useAppStore();
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const load = useCallback(() => apiClient.getCostBreakdown(), []);
  const state = useEnvelope<CostBreakdown>(load);
  const { envelope: costEnvelope, loading, error, reload: loadData } = state;
  // An unknown cost metric is null plus a name in missing. It is rendered as
  // "No data", never as a zero placeholder and never via .toLocaleString().
  const money = (value: number | null | undefined) =>
    value == null ? t("cost.1") : `฿${value.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
  const units = (value: number | null | undefined) =>
    value == null ? t("cost.1") : value.toLocaleString("en-US", { maximumFractionDigits: 2 });
  const mode = envelopeMode(state, (data) =>
    data.costPerUnit == null &&
    data.profitPerUnit == null &&
    data.breakevenUnits == null &&
    data.currentMonthlyFixedCost == null &&
    data.currentMonthlyVariableCost == null &&
    data.categories.length === 0 &&
    data.investmentPlans.length === 0);

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <div className="h-40 bg-slate-200 rounded-card animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-64 bg-slate-200 rounded-card animate-pulse" />
          <div className="h-64 bg-slate-200 rounded-card animate-pulse" />
        </div>
      </div>
    );
  }

  const cost = costEnvelope?.data;
  const missing = costEnvelope?.missing || [];

  if (!cost || mode === "error" || mode === "unavailable" || mode === "insufficient_data") {
    return (
      <StateRenderer
        currentMode={mode === "error" ? "error" : mode === "unavailable" ? "unavailable" : "insufficient_data"}
        errorMessage={error || t("cost.2")}
        unavailableReason={t("cost.x.1")}
        missingItems={missing}
        onRetry={loadData}
        onAddData={() => setCurrentPage("import")}
      >
        {null}
      </StateRenderer>
    );
  }

  return (
    <StateRenderer currentMode={mode === "stale" ? "stale" : undefined} onRetry={loadData} onReanalyze={() => setCurrentPage("import")}>
      <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6 text-ink animate-fade-in">
        {/* Header Bar */}
        <div className="page-header flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-brand text-white flex items-center justify-center font-bold">
                <PieChart className="w-4 h-4" />
              </div>
              <h1 className="text-xl font-display font-bold text-ink">
                {t("cost.3")}
              </h1>
              <DataKindBadge kind={costEnvelope?.kind ?? "actual"} size="md" />
            </div>
            <p className="text-xs text-ink-muted mt-0.5">
              {t("cost.x.2")}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage("unlock")}
              className="px-3.5 py-1.5 bg-resource-light hover:bg-resource/20 border border-resource/30 text-resource-dark text-xs font-semibold rounded-btn flex items-center gap-1 transition-colors"
            >
              <span>{t("cost.4")}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Section 1: Current Cost Breakdown & Breakeven */}
        <div data-tilt className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white p-5 rounded-card border border-borderLine shadow-soft-sm">
          <div>
            <span className="text-[10px] text-ink-muted block uppercase tracking-wider">{t("cost.5")}</span>
            <span className="text-2xl font-bold font-mono text-ink">{money(cost.costPerUnit)}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {cost.costPerUnit == null ? t("cost.6") : t("cost.7")}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-ink-muted block uppercase tracking-wider">{t("cost.8")}</span>
            <span className="text-2xl font-bold font-mono text-brand">{money(cost.profitPerUnit)}</span>
            <span className="text-[10px] text-brand/80 block mt-0.5">
              {cost.profitPerUnit == null ? t("cost.9") : t("cost.10")}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-ink-muted block uppercase tracking-wider">{t("cost.x.3")}</span>
            <span className="text-2xl font-bold font-mono text-emerald-700">{units(cost.breakevenUnits)}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {cost.breakevenUnits == null ? t("cost.11") : t("cost.12")}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-ink-muted block uppercase tracking-wider">{t("cost.13")}</span>
            <span className="text-2xl font-bold font-mono text-ink">{money(cost.currentMonthlyFixedCost)}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {cost.currentMonthlyVariableCost == null
                ? t("cost.14")
                : t("cost.tpl.variable", { amount: money(cost.currentMonthlyVariableCost) })}
            </span>
          </div>
        </div>

        {/* Section 2: Investment Appraisal Plans (A vs B in Single Screen) */}
        <div className="bg-white rounded-card p-5 border border-borderLine space-y-4 shadow-soft-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-display font-bold text-xs uppercase tracking-wider text-ink">
                {t("cost.w1")}
              </h3>
              <p className="text-[11px] text-ink-muted">
                {cost.investmentPlans.length
                  ? t("cost.15")
                  : t("cost.16")}
              </p>
            </div>
            <DataKindBadge kind="forecast" size="sm" />
          </div>

          <div data-tilt-grid className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cost.investmentPlans.map((plan, planIndex) => {
              const isSelected = (selectedPlanId || cost.investmentPlans[0]?.id) === plan.id;
              // Highlight is position in the returned list only. The engine does
              // not return a recommendation, so none is claimed here.
              const isPlanB = planIndex > 0;

              return (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlanId(plan.id)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                    isSelected
                      ? isPlanB
                        ? "bg-resource-light/40 border-resource ring-2 ring-resource/30 shadow-soft-md"
                        : "bg-brand/5 border-brand ring-2 ring-brand/30 shadow-soft-md"
                      : "bg-slate-50 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-chip ${isPlanB ? "bg-resource text-white" : "bg-slate-200 text-ink"}`}>
                        {isPlanB ? t("cost.17") : t("cost.18")}
                      </span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    </div>

                    <h4 className="font-display font-bold text-sm text-ink mb-3 leading-snug">
                      {plan.name}
                    </h4>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-3 gap-2 p-3 bg-white rounded-xl border border-slate-200 text-center text-xs mb-3">
                      <div>
                        <span className="text-[10px] text-ink-muted block">{t("cost.19")}</span>
                        <span className="font-bold font-mono text-ink">฿{plan.initialInvestment.toLocaleString()}</span>
                      </div>
                      <div className="border-x border-slate-200">
                        <span className="text-[10px] text-ink-muted block">{t("cost.20")}</span>
                        <span className="font-bold font-mono text-emerald-700">{t("cost.m1", { paybackMonths: plan.paybackMonths })}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-ink-muted block">IRR</span>
                        <span className="font-bold font-mono text-brand">{plan.irr}%</span>
                      </div>
                    </div>

                    {/* Assumptions */}
                    <div className="space-y-1.5 text-[11px] text-ink-muted">
                      <span className="font-bold text-ink block text-[10px]">{t("cost.21")}</span>
                      {plan.assumptions.map((asm, idx) => (
                        <div key={idx} className="flex justify-between border-b border-slate-100/60 pb-1">
                          <span>{asm.label}</span>
                          <span className="font-bold font-mono text-ink">
                            {asm.value.toLocaleString()} {asm.unit}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                    <span className="text-ink-muted">{t("cost.22")} <strong>฿{plan.npv.toLocaleString()}</strong></span>
                    <span className="text-brand font-bold">
                      {isSelected ? t("cost.23") : t("cost.24")}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </StateRenderer>
  );
};
