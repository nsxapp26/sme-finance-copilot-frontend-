import React, { useCallback, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { apiClient } from "@/api/client";
import { UnlockResource } from "@/api/contracts/types";
import { OrderComparison, OrderContext } from "@/api/client";
import { envelopeMode, useEnvelope } from "@/hooks/useEnvelope";
import { useCapabilities } from "@/hooks/useCapabilities";
import { ResourceTile } from "@/components/signature/ResourceTile";
import { DataKindBadge } from "@/components/signature/DataKindBadge";
import { StateRenderer } from "@/components/ui/StateRenderer";
import {
  Wrench,
  Sparkles,
  RotateCcw,
  Coins,
  Truck,
  ChefHat,
  Cog,
  Users,
  Building2,
  TrendingDown,
  TrendingUp,
  ArrowRight,
  Sliders,
  CheckCircle2,
} from "lucide-react";
import { tr, useT } from "@/i18n";

export const UnlockPage: React.FC = () => {
  const t = useT();
  const {
    detachedResourceIds,
    toggleDetachResource,
    resetSimulation,
    addToast,
    setCurrentPage,
  } = useAppStore();

  // Before/After Value Split Slider (0 to 100%)
  const [splitRatio, setSplitRatio] = useState(50);

  // Active Category Filter
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const state = useEnvelope<UnlockResource[]>(useCallback(() => apiClient.getUnlockResources(), []));
  const { envelope: resourcesEnvelope, loading, error, reload: loadData } = state;
  const mode = envelopeMode(state, (rows) => rows.length === 0);
  const capabilityState = useCapabilities();
  const canReserve = capabilityState.isAvailable("resourceReservation");
  const reserveBlockedReason = capabilityState.reasonFor("resourceReservation", t("unlock.x.1"));

  // Taking a resource out of the plan is recomputed by the engine through
  // POST /simulate/order with unavailable_resource_ids. The browser does not
  // add up a stored "impact if detached" figure and call it the new cost.
  const [outage, setOutage] = useState<{ comparison: OrderComparison | null; error: string; pending: boolean }>(
    { comparison: null, error: "", pending: false });
  const [baseline, setBaseline] = useState<OrderContext | null>(null);
  const outageSequence = React.useRef(0);

  const recomputeOutage = async (resourceIds: string[]) => {
    if (apiClient.isDemoMode()) { setOutage({ comparison: null, error: t("unlock.1"), pending: false }); return; }
    if (resourceIds.length === 0) { setOutage({ comparison: null, error: "", pending: false }); return; }
    const id = ++outageSequence.current;
    setOutage((previous) => ({ ...previous, pending: true, error: "" }));
    try {
      const context = baseline || (await apiClient.getOrderContext()).data;
      if (!baseline) setBaseline(context);
      // Only identifiers present in the baseline may be disabled; the engine
      // answers HTTP 422 for anything else rather than inventing a dependency.
      const known = new Set(context.shops.flatMap((shop) => (shop.resources || []).map((item) => item.resource_id).filter(Boolean)));
      const applicable = resourceIds.filter((value) => known.has(value));
      if (applicable.length === 0) {
        if (outageSequence.current === id) setOutage({ comparison: null, pending: false,
          error: t("unlock.2") });
        return;
      }
      const result = await apiClient.simulateOrder(context, {
        unit_price: context.unit_price,
        cost_per_unit: null, // Keep each shop's own cost; impose no average.
        deposit_ratio: context.deposit_ratio,
        payment_terms_days: context.payment_terms_days,
        remove_shops: [],
        unavailable_resource_ids: applicable,
      });
      if (outageSequence.current === id) setOutage({ comparison: result, error: "", pending: false });
    } catch (err) {
      if (outageSequence.current === id) setOutage({ comparison: null, error: (err as Error).message, pending: false });
    }
  };

  const handleToggleDetach = (res: UnlockResource) => {
    toggleDetachResource(res.id);
    const isNowDetached = !detachedResourceIds.includes(res.id);
    const next = isNowDetached
      ? [...detachedResourceIds, res.id]
      : detachedResourceIds.filter((value) => value !== res.id);
    void recomputeOutage(next);
    addToast({
      type: "info",
      title: isNowDetached ? t("unlock.3") : t("unlock.4"),
      message: t("unlock.tpl.preview", { title: res.title })
        + ` · ${t("unlock.tpl.unchanged", { reason: reserveBlockedReason })}`,
      duration: 9000,
    });
  };

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

  const allResources = resourcesEnvelope?.data || [];
  const filteredResources =
    activeCategory === "all"
      ? allResources
      : allResources.filter((r) => r.category === activeCategory);

  if (!resourcesEnvelope || mode === "error" || mode === "unavailable" || mode === "insufficient_data") {
    return (
      <StateRenderer
        currentMode={mode === "error" ? "error" : mode === "unavailable" ? "unavailable" : "insufficient_data"}
        errorMessage={error || t("unlock.5")}
        unavailableReason={t("unlock.x.2")}
        missingItems={resourcesEnvelope?.missing || []}
        onRetry={loadData}
      >
        {null}
      </StateRenderer>
    );
  }

  // Effect of the outage as the engine recomputed it: Plan B against Plan A for
  // this order only. Null means the engine has not produced a comparison.
  const planA = outage.comparison?.data.planA;
  const planB = outage.comparison?.data.planB;
  const amount = (value: number | string | null | undefined) =>
    value == null ? t("unlock.6") : `฿${Number(value).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
  const outageSummary = outage.pending
    ? t("unlock.7")
    : outage.error
    ? outage.error
    : planA && planB
    ? t("unlock.tpl.capacity", { now: planB.totalCapacityAssigned, was: planA.totalCapacityAssigned })
      + ` · ${t("unlock.tpl.shortfall", { now: planB.deficitBoxesPerDay, was: planA.deficitBoxesPerDay })}`
      + ` · ${t("unlock.tpl.profit", { now: amount(planB.totalProfit), was: amount(planA.totalProfit) })}`
      + ` · ${t("unlock.tpl.gap", { now: amount(planB.totalFundingGap), was: amount(planA.totalFundingGap) })}`
    : t("unlock.8");

  return (
    <StateRenderer onRetry={loadData}>
      <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6 text-ink animate-fade-in">
        {/* Header Bar */}
        <div className="page-header flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-resource text-white flex items-center justify-center font-bold">
                <Wrench className="w-4 h-4" />
              </div>
              <h1 className="text-xl font-display font-bold text-ink">
                {t("unlock.9")}
              </h1>
              <DataKindBadge kind={resourcesEnvelope.kind} size="md" />
            </div>
            <p className="text-xs text-ink-muted mt-0.5">
              {t("unlock.10")}
              {t("unlock.r.nothing")}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {detachedResourceIds.length > 0 && (
              <button
                type="button"
                onClick={() => { resetSimulation(); void recomputeOutage([]); }}
                className="px-3 py-1.5 bg-white border border-borderLine hover:border-brand/40 text-xs font-semibold rounded-btn flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5 text-ink-muted" />
                <span>{t("unlock.m1", { detachedResourceIds: detachedResourceIds.length })}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setCurrentPage("swarm")}
              className="px-4 py-1.5 bg-brand hover:bg-brand-dark text-white text-xs font-bold rounded-btn flex items-center gap-1.5 shadow-sm transition-all"
            >
              <span>{t("unlock.11")}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Signature S5: Detached Part Alert Banner */}
        {detachedResourceIds.length > 0 && (
          <div className="p-4 rounded-card bg-red-50 border-2 border-danger text-danger flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-soft-sm animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-danger text-white flex items-center justify-center shrink-0">
                !
              </div>
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider">
                  {t("unlock.m2", { detachedResourceIds: detachedResourceIds.length })}
                </h3>
                <p className="text-xs text-red-900 mt-0.5">
                  <strong>{outageSummary}</strong>
                  {planB ? t("unlock.12") : ""}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => { resetSimulation(); void recomputeOutage([]); }}
              className="px-4 py-1.5 bg-danger text-white text-xs font-bold rounded-btn hover:bg-danger-dark transition-all shrink-0"
            >
              {t("unlock.13")}
            </button>
          </div>
        )}

        {/* Value Unlocked Split Comparison Slider (ซื้อเอง vs ใช้ร่วม) */}
        <div className="bg-white rounded-card p-5 border border-borderLine shadow-soft-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-display font-bold text-xs uppercase tracking-wider text-ink flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-resource-dark" />
                <span>{t("unlock.14")}</span>
              </h3>
              <p className="text-[11px] text-ink-muted">
                {t("unlock.15")}
                {t("unlock.16")}
              </p>
            </div>
            <DataKindBadge kind="simulated" size="sm" />
          </div>

          {/* Side-by-Side Split View */}
          <div data-tilt-grid className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Column A: Buy Individually */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider block">
                {t("unlock.17")}
              </span>
              <div className="text-2xl font-extrabold font-mono text-ink">{t("unlock.6")}</div>
              <p className="text-[11px] text-ink-muted leading-relaxed">
                {t("unlock.w1")}
              </p>
              <div className="text-[10px] text-danger font-medium mt-2">
                {t("unlock.18")}
              </div>
            </div>

            {/* Column B: Shared Opportunity via SME UNLOCK */}
            <div className="p-4 rounded-xl bg-resource-light/60 border border-resource/40 space-y-2">
              <span className="text-[10px] font-bold text-resource-dark uppercase tracking-wider block">
                {t("unlock.19")}
              </span>
              <div className="text-2xl font-extrabold font-mono text-resource-dark">{t("unlock.6")}</div>
              <p className="text-[11px] text-ink-muted leading-relaxed">
                {t("unlock.r.count", { n: allResources.length })}
                {t("unlock.20")}
              </p>
              <div className="text-[11px] text-resource-dark font-bold mt-2 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{t("unlock.21")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {[
            { id: "all", label: `All (${allResources.length})` },
            { id: "kitchen", label: t("unlock.22") },
            { id: "truck", label: t("unlock.23") },
            { id: "machine", label: t("unlock.24") },
            { id: "team", label: t("unlock.25") },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-chip font-medium whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? "bg-resource text-white shadow-xs font-bold"
                  : "bg-white border border-borderLine text-ink hover:border-resource"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Resources Grid with Detach Buttons (Signature S5) */}
        <div data-tilt-grid className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredResources.map((res) => {
            const isDetached = detachedResourceIds.includes(res.id);
            return (
              <ResourceTile
                key={res.id}
                resource={res}
                dataKind={resourcesEnvelope.kind}
                isDetached={isDetached}
                onToggleDetach={() => handleToggleDetach(res)}
              />
            );
          })}
        </div>
      </div>
    </StateRenderer>
  );
};
