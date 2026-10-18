import React, { useCallback, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { apiClient } from "@/api/client";
import { ProjectRecord } from "@/api/contracts/types";
import { envelopeMode, useEnvelope } from "@/hooks/useEnvelope";
import { useCapabilities } from "@/hooks/useCapabilities";
import { DataKindBadge } from "@/components/signature/DataKindBadge";
import { StateRenderer } from "@/components/ui/StateRenderer";
import { CapabilityList } from "@/components/ui/CapabilityList";
import {
  FileCheck2,
  Calendar,
  Building,
  CheckCircle2,
  PlayCircle,
  FileSpreadsheet,
  Download,
  AlertTriangle,
  Coins,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { tr, useT } from "@/i18n";

export const ProjectsPage: React.FC = () => {
  const t = useT();
  const { setStoryModeOpen, addToast } = useAppStore();
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const state = useEnvelope<ProjectRecord[]>(useCallback(() => apiClient.getProjectRecords(), []));
  const { envelope: projectsEnvelope, loading, error, reload: loadData } = state;
  const mode = envelopeMode(state, (rows) => rows.length === 0);
  const capabilityState = useCapabilities();
  const canExport = capabilityState.isAvailable("reportExport");
  const exportBlockedReason = capabilityState.reasonFor("reportExport", t("projects.x.1"));

  const handleExportPoster = () => {
    // /capabilities declares reportExport unavailable: no file is generated and
    // nothing is queued for download.
    addToast({
      type: "warning",
      title: t("projects.1"),
      message: t("projects.tpl.noFile", { reason: exportBlockedReason }),
      duration: 9000,
    });
  };

  if (loading) {
    return (
      <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6" role="status" aria-label="Loading projects">
        <div className="h-40 bg-slate-200 rounded-card animate-pulse" />
        <div className="h-96 bg-slate-200 rounded-card animate-pulse" />
      </div>
    );
  }

  const projects = projectsEnvelope?.data || [];

  if (!projectsEnvelope || mode === "error" || mode === "unavailable" || mode === "insufficient_data") {
    return (
      <div className="pb-4">
        <StateRenderer
          currentMode={mode === "error" ? "error" : mode === "unavailable" ? "unavailable" : "insufficient_data"}
          errorMessage={error || t("projects.2")}
          unavailableReason={t("projects.x.2")}
          missingItems={projectsEnvelope?.missing || []}
          onRetry={loadData}
        >
          {null}
        </StateRenderer>
        <div className="mx-4">
          <CapabilityList />
        </div>
      </div>
    );
  }

  const activeProj = projects.find((p) => p.id === selectedProjectId) || projects[0];

  return (
    <StateRenderer onRetry={loadData}>
      <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6 text-ink animate-fade-in">
        {/* Header Bar */}
        <div className="page-header flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-brand text-white flex items-center justify-center font-bold">
                <FileCheck2 className="w-4 h-4" />
              </div>
              <h1 className="text-xl font-display font-bold text-ink">
                {t("projects.w1")}
              </h1>
              <DataKindBadge kind={projectsEnvelope.kind} size="md" />
            </div>
            <p className="text-xs text-ink-muted mt-0.5">
              {t("projects.3")}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setStoryModeOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-navy-deep to-brand hover:opacity-95 text-white rounded-btn text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <PlayCircle className="w-4 h-4 text-brand-glow animate-pulse" />
              <span>{t("projects.4")}</span>
            </button>

            <button
              type="button"
              onClick={handleExportPoster}
              disabled={!canExport}
              title={canExport ? undefined : exportBlockedReason}
              className="px-3.5 py-2 bg-white border border-borderLine hover:border-brand text-xs font-semibold rounded-btn flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{canExport ? t("projects.5") : t("projects.6")}</span>
            </button>
          </div>
        </div>

        {/* Project Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {projects.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelectedProjectId(p.id)}
              className={`px-4 py-2 rounded-xl text-left border transition-all ${
                selectedProjectId === p.id
                  ? "bg-white border-brand ring-2 ring-brand/20 shadow-sm"
                  : "bg-slate-50 border-slate-200 text-ink-muted hover:bg-white"
              }`}
            >
              <div className="font-bold text-ink truncate max-w-xs">{p.title}</div>
              <div className="text-[10px] text-ink-muted flex items-center gap-1.5 mt-0.5">
                <span className="font-mono">{p.code}</span>
                <span>·</span>
                <span className={p.status === "completed" ? "text-emerald-700 font-bold" : "text-brand font-medium"}>
                  {p.statusText}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Active Project Delivery Timeline Schedule */}
        <div className="bg-white rounded-card p-5 border border-borderLine shadow-soft-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] font-bold text-brand uppercase tracking-wider block">
                {t("projects.x.3")}
              </span>
              <h3 className="font-display font-bold text-sm text-ink leading-snug">
                {activeProj.title} ({activeProj.clientName})
              </h3>
            </div>
            <div className="text-right text-xs">
              <span className="text-ink-muted block text-[10px]">{t("projects.7")}</span>
              <span className="font-bold font-mono text-brand text-sm">{activeProj.progressPercent}%</span>
            </div>
          </div>

          {/* Delivery Grid */}
          <div data-tilt-grid className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2 text-center text-xs">
            {activeProj.deliverySchedule.map((ds) => (
              <div
                key={ds.day}
                className={`p-2 rounded-xl border ${
                  ds.status === "done"
                    ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                    : ds.status === "delayed"
                    ? "bg-red-50 border-red-300 text-red-900"
                    : "bg-slate-50 border-slate-200 text-slate-600"
                }`}
              >
                <span className="font-bold font-mono text-[10px] block">{t("projects.m1", { day: ds.day })}</span>
                <span className="text-[11px] block">{ds.date}</span>
                <span className="font-bold font-mono text-[11px] block mt-1">
                  {ds.deliveredUnits}/{ds.targetUnits}
                </span>
                <span className="text-[9px] block mt-0.5 font-semibold">
                  {ds.status === "done" ? t("projects.8") : ds.status === "delayed" ? t("projects.9") : t("projects.10")}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Post-Mortem Actual vs Planned (When Project is Completed) */}
        {activeProj.postMortem && (
          <div className="bg-white rounded-card p-5 border border-borderLine shadow-soft-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-display font-bold text-xs uppercase tracking-wider text-ink flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{t("projects.x.4")}</span>
                </h3>
                <p className="text-[11px] text-ink-muted">
                  {t("projects.11")}
                </p>
              </div>
              <DataKindBadge kind={projectsEnvelope.kind} size="sm" />
            </div>

            <div data-tilt-grid className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-ink-muted block">{t("projects.x.5")}</span>
                <span className="text-xl font-bold font-mono text-emerald-700">
                  {activeProj.postMortem.unitsFulfillmentPercent}%
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">{t("projects.m2", { actualUnits: activeProj.postMortem.actualUnits.toLocaleString(), plannedUnits: activeProj.postMortem.plannedUnits.toLocaleString() })}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-ink-muted block">{t("projects.12")}</span>
                <span className="text-xl font-bold font-mono text-emerald-700">
                  {activeProj.postMortem.costVariancePercent}%
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">{t("projects.m3", { plannedCost: activeProj.postMortem.plannedCost.toLocaleString(), actualCost: activeProj.postMortem.actualCost.toLocaleString() })}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-ink-muted block">{t("projects.13")}</span>
                <span className="text-xl font-bold font-mono text-ink">
                  {t("projects.r.delay", { n: activeProj.postMortem.paymentDelayDays })}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">{t("projects.r.paid", { date: activeProj.postMortem.actualPaymentDate || t("projects.r.nodate") })}</span>
              </div>

              <div className="p-3 bg-brand/5 border border-brand/20 rounded-xl">
                <span className="text-[10px] font-bold text-brand block">{t("projects.14")}</span>
                <span className="text-xl font-extrabold font-mono text-brand">
                  {t("projects.m4", { shopNetProfits: activeProj.postMortem.shopNetProfits.length })}
                </span>
                {/* backend ไม่ได้ส่งยอดรวมมา เลยไม่บวกเองใน React ดูรายร้านด้านล่าง */}
                <span className="text-[10px] text-brand/80 block mt-0.5">{t("projects.15")}</span>
              </div>
            </div>

            {/* Per-Shop Net Profits Table */}
            <div className="pt-2">
              <span className="text-xs font-bold text-ink block mb-2">{t("projects.16")}</span>
              <div data-tilt-grid className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {activeProj.postMortem.shopNetProfits.map((sp, idx) => (
                  <div key={idx} className="p-2.5 bg-emerald-50/50 border border-emerald-200 rounded-xl">
                    <span className="font-semibold text-ink block truncate">{sp.shopName}</span>
                    <span className="font-extrabold font-mono text-emerald-700 text-sm">
                      +฿{sp.profit.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <CapabilityList />
      </div>
    </StateRenderer>
  );
};
