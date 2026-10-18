import React, { useCallback, useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { apiClient } from "@/api/client";
import { Shop, ShopFinance } from "@/api/contracts/types";
import { envelopeMode, useEnvelope } from "@/hooks/useEnvelope";
import { useCapabilities } from "@/hooks/useCapabilities";
import { DataKindBadge } from "@/components/signature/DataKindBadge";
import { StateRenderer } from "@/components/ui/StateRenderer";
import {
  Users,
  Coins,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  FileCheck,
  ShieldCheck,
  Building,
} from "lucide-react";
import { tr, useT } from "@/i18n";

export const ShopFinancePage: React.FC = () => {
  const t = useT();
  const { selectedShopId, setSelectedShopId, setCurrentPage, addToast } = useAppStore();
  // The switcher lists the shops the backend actually has, with their real
  // UUIDs. Placeholder identifiers cannot be used to read a stored record.
  const shopsState = useEnvelope<Shop[]>(useCallback(() => apiClient.getShops(), []));
  const shops = shopsState.envelope?.data || [];
  const activeShopId = selectedShopId || shops[0]?.id || "";
  // Adopt the first real shop once the catalogue arrives, so the selection is a
  // UUID the backend can read rather than an empty or placeholder identifier.
  const firstShopId = shops[0]?.id;
  useEffect(() => {
    if (!selectedShopId && firstShopId) setSelectedShopId(firstShopId);
  }, [selectedShopId, firstShopId, setSelectedShopId]);
  const financeState = useEnvelope<ShopFinance | null>(useCallback(
    () => (activeShopId ? apiClient.getShopFinance(activeShopId) : Promise.reject(new Error(t("shopfin.x.1")))),
    [activeShopId]), [activeShopId]);
  const capabilityState = useCapabilities();
  const canSign = capabilityState.isAvailable("agreementSignature");
  const signBlockedReason = capabilityState.reasonFor("agreementSignature", t("shopfin.x.2"));
  const finance = financeState.envelope?.data || null;
  const loading = shopsState.loading || financeState.loading;
  const error = shopsState.error || financeState.error;
  const loadData = () => { shopsState.reload(); financeState.reload(); };
  const mode = envelopeMode(financeState, (data) => data == null);
  const amount = (value: number | null | undefined) =>
    value == null ? t("shopfin.1") : `฿${value.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
  // Stored acceptance flags. The page shows what is recorded and never signs.
  const parties = finance?.partyAcceptance;

  const handleSignAgreement = () => {
    // /capabilities declares agreementSignature unavailable: there is no actor,
    // no persisted signature and no status transition behind this button.
    addToast({
      type: "warning",
      title: t("shopfin.2"),
      message: t("shopfin.tpl.blocked", { reason: signBlockedReason }),
      duration: 9000,
    });
  };

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <div className="h-40 bg-slate-200 rounded-card animate-pulse" />
        <div className="h-96 bg-slate-200 rounded-card animate-pulse" />
      </div>
    );
  }

  if (!finance || mode === "error" || mode === "unavailable" || mode === "insufficient_data") {
    return (
      <StateRenderer
        currentMode={mode === "error" ? "error" : "unavailable"}
        errorMessage={error || t("shopfin.3")}
        unavailableReason={shops.length
          ? t("shopfin.4")
          : t("shopfin.5")}
        missingItems={[...(shopsState.envelope?.missing || []), ...(financeState.envelope?.missing || [])]}
        onRetry={loadData}
        onAddData={() => setCurrentPage("swarm")}
      >
        {null}
      </StateRenderer>
    );
  }

  const isShortage = finance.fundingGap > 0;

  return (
    <StateRenderer onRetry={loadData}>
      <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6 text-ink animate-fade-in">
        {/* Header Bar */}
        <div className="page-header flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-display font-bold text-ink">
                {t("shopfin.6")}
              </h1>
              <DataKindBadge kind={financeState.envelope?.kind ?? "forecast"} size="md" />
            </div>
            <p className="text-xs text-ink-muted mt-0.5">
              {t("shopfin.x.3")}
            </p>
          </div>

          {/* Shop Switcher Pills */}
          <div className="flex flex-wrap items-center gap-1.5 pb-1 max-w-full">
            {shops.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelectedShopId(s.id)}
                className={`px-3 py-1 rounded-chip text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedShopId === s.id
                    ? "bg-brand text-white shadow-xs"
                    : "bg-white border border-borderLine text-ink hover:border-brand/40"
                }`}
              >
                {s.fundingGap > 0 ? t("shopfin.r.short", { name: s.name, gap: amount(s.fundingGap) }) : s.name}
              </button>
            ))}
          </div>
        </div>

        {/* Essential Headline Callout: 'รับงานเพิ่มแล้วเหลือเงินเพิ่มจริงไหม' (Rule D & G10) */}
        <div className="p-5 rounded-card bg-gradient-to-r from-brand/5 via-white to-emerald-50/50 border border-brand/20 space-y-2 shadow-soft-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-display font-bold text-ink flex items-center gap-2">
              <Coins className="w-4 h-4 text-brand" />
              <span>{t("shopfin.7")}</span>
            </h2>
            <DataKindBadge kind={financeState.envelope?.kind ?? "forecast"} size="sm" />
          </div>
          <p className="text-xs text-ink-muted leading-relaxed">
            {t("shopfin.r.summary", {
              name: finance.name,
              capacity: `${finance.boxesPerDay} ${finance.totalBoxes ? t("shopfin.tpl.perDay", { n: finance.totalBoxes }) : t("shopfin.8")}`,
              revenue: amount(finance.revenue),
              cost: amount(finance.totalCost),
              profit: amount(finance.projectedProfit),
              margin: finance.profitMarginPercent,
            })}{" "}·{" "}
            <strong>{t("shopfin.m1", { minCashBalance: amount(finance.minCashBalance) })}</strong>
            {finance.minCashBalance < 0
              ? t("shopfin.9")
              : t("shopfin.10")}
          </p>
        </div>

        {/* Financial Metrics Cards */}
        <div data-tilt-grid className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3 bg-white rounded-card border border-borderLine">
            <span className="text-[10px] text-ink-muted block">{t("shopfin.11")}</span>
            <span className="text-sm font-bold font-mono text-ink">
              {t("shopfin.m2", { boxesPerDay: finance.boxesPerDay })}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">{t("shopfin.m3", { totalBoxes: finance.totalBoxes })}</span>
          </div>

          <div className="p-3 bg-white rounded-card border border-borderLine">
            <span className="text-[10px] text-ink-muted block">{t("shopfin.12")}</span>
            <span className="text-sm font-bold font-mono text-ink">
              ฿{finance.revenue.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">{t("shopfin.m4", { sellingPricePerBox: finance.sellingPricePerBox })}</span>
          </div>

          <div className="p-3 bg-white rounded-card border border-borderLine">
            <span className="text-[10px] text-ink-muted block">{t("shopfin.13")}</span>
            <span className="text-sm font-bold font-mono text-ink">
              ฿{finance.totalCost.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">{t("shopfin.14")}</span>
          </div>

          <div className="p-3 bg-white rounded-card border border-brand/30 bg-brand/5">
            <span className="text-[10px] font-bold text-brand block">{t("shopfin.15")}</span>
            <span className="text-sm font-extrabold font-mono text-brand">
              ฿{finance.projectedProfit.toLocaleString()}
            </span>
            <span className="text-[10px] text-brand/80 block mt-0.5">{t("shopfin.m5", { profitMarginPercent: finance.profitMarginPercent })}</span>
          </div>

          <div className="p-3 bg-white rounded-card border border-borderLine">
            <span className="text-[10px] text-ink-muted block">{t("shopfin.16")}</span>
            <span className="text-sm font-bold font-mono text-ink">
              ฿{finance.upfrontCashNeeded.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">{t("shopfin.17")}</span>
          </div>

          <div className={`p-3 rounded-card border ${isShortage ? "bg-red-50 border-danger" : "bg-emerald-50 border-emerald-300"}`}>
            <span className={`text-[10px] font-bold block ${isShortage ? "text-danger" : "text-emerald-800"}`}>
              {isShortage ? t("shopfin.18") : t("shopfin.19")}
            </span>
            <span className={`text-sm font-extrabold font-mono ${isShortage ? "text-danger" : "text-emerald-700"}`}>
              {isShortage ? t("shopfin.r.shortby", { gap: finance.fundingGap.toLocaleString("en-US") }) : t("shopfin.20")}
            </span>
            {isShortage && (
              <button
                type="button"
                onClick={() => setCurrentPage("funding", { shopId: finance.shopId })}
                className="text-[10px] font-bold text-danger underline block mt-0.5"
              >
                {t("shopfin.21")}
              </button>
            )}
          </div>
        </div>

        {/* Cost Itemization Table */}
        <div className="bg-white rounded-card border border-borderLine p-4 space-y-3">
          <h3 className="text-xs font-display font-bold text-ink uppercase tracking-wider">
            {t("shopfin.22")}
          </h3>
          <div data-tilt-grid className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 bg-slate-50 rounded-xl">
              <span className="text-ink-muted block text-[10px]">{t("shopfin.23")}</span>
              <span className="font-bold text-ink font-mono">฿{finance.rawMaterialCost.toLocaleString()}</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl">
              <span className="text-ink-muted block text-[10px]">{t("shopfin.24")}</span>
              <span className="font-bold text-ink font-mono">฿{finance.additionalLaborCost.toLocaleString()}</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl">
              <span className="text-ink-muted block text-[10px]">{t("shopfin.x.4")}</span>
              <span className="font-bold text-ink font-mono">฿{finance.deliveryCost.toLocaleString()}</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl">
              <span className="text-ink-muted block text-[10px]">{t("shopfin.25")}</span>
              <span className="font-bold text-ink font-mono">฿{finance.serviceFee.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Cashflow Timeline Events */}
        <div className="bg-white rounded-card border border-borderLine p-4 space-y-3">
          <h3 className="text-xs font-display font-bold text-ink uppercase tracking-wider flex items-center justify-between">
            <span>{t("shopfin.26")}</span>
            <DataKindBadge kind={financeState.envelope?.kind ?? "forecast"} size="sm" />
          </h3>

          <div className="space-y-2">
            {finance.cashTimeline.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-brand bg-brand/10 px-2 py-0.5 rounded text-[11px]">
                    {item.date}
                  </span>
                  <div>
                    <div className="font-semibold text-ink">{item.title}</div>
                    <div className="text-[11px] text-ink-muted">{item.note}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className={`font-mono font-bold text-xs ${
                      item.amount > 0 ? "text-emerald-700" : item.amount < 0 ? "text-danger" : "text-slate-500"
                    }`}
                  >
                    {item.amount > 0 ? "+" : ""}{item.amount !== 0 ? `฿${item.amount.toLocaleString("en-US")}` : t("shopfin.27")}
                  </div>
                  <div className="text-[10px] text-ink-muted font-mono">
                    {t("shopfin.m6", { cashBalance: item.cashBalance.toLocaleString("en-US") })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4-Party Agreement Sign-off Box */}
        <div className="p-5 rounded-card bg-white border border-borderLine space-y-4 shadow-soft-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-display font-bold text-ink uppercase tracking-wider">
                {t("shopfin.x.5")}
              </h3>
              <p className="text-[11px] text-ink-muted">
                {t("shopfin.28")}
              </p>
            </div>
            <DataKindBadge kind={financeState.envelope?.kind ?? "actual"} size="sm" />
          </div>

          <div data-tilt-grid className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[10px] text-slate-400 block">{t("shopfin.29")}</span>
              <div className="font-bold text-ink">
                {parties?.buyerSigned ? t("shopfin.30") : t("shopfin.31")}
              </div>
              {parties?.buyerSigned && (
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-3 h-3" /> {t("shopfin.r.acc")}
                </span>
              )}
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[10px] text-slate-400 block">{t("shopfin.32")}</span>
              <div className="font-bold text-ink">
                {parties?.logisticsSigned ? t("shopfin.33") : t("shopfin.34")}
              </div>
              {parties?.logisticsSigned && (
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-3 h-3" /> {t("shopfin.r.acc")}
                </span>
              )}
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[10px] text-slate-400 block">{t("shopfin.35")}</span>
              <div className="font-bold text-ink">{finance.name}</div>
              {parties?.shopSigned ? (
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-3 h-3" /> {t("shopfin.r.acc")}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] text-amber-700 font-semibold">
                  <AlertTriangle className="w-3 h-3" /> {t("shopfin.r.noacc")}
                </span>
              )}
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[10px] text-slate-400 block">{t("shopfin.36")}</span>
              <div className="font-bold text-ink">{t("shopfin.37")}</div>
              {parties?.funderSigned ? (
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-3 h-3" /> {t("shopfin.r.acc")}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] text-slate-400">
                  {t("shopfin.38")}
                </span>
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-ink-muted">
              {canSign
                ? t("shopfin.39")
                : t("shopfin.tpl.statusRead", { reason: signBlockedReason })}
            </span>
            <button
              type="button"
              onClick={handleSignAgreement}
              disabled={!canSign}
              title={canSign ? undefined : signBlockedReason}
              className="px-5 py-2 bg-brand hover:bg-brand-dark disabled:opacity-50 text-white rounded-btn text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              <FileCheck className="w-4 h-4" />
              <span>{canSign ? t("shopfin.40") : t("shopfin.41")}</span>
            </button>
          </div>
        </div>
      </div>
    </StateRenderer>
  );
};
