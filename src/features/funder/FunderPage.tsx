import React, { useCallback, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { apiClient } from "@/api/client";
import { FunderProject } from "@/api/contracts/types";
import { envelopeMode, useEnvelope } from "@/hooks/useEnvelope";
import { useCapabilities } from "@/hooks/useCapabilities";
import { DataKindBadge } from "@/components/signature/DataKindBadge";
import { StateRenderer } from "@/components/ui/StateRenderer";
import {
  Building,
  ShieldCheck,
  FileCheck2,
  AlertTriangle,
  Lock,
  Search,
  Sparkles,
  ArrowRight,
  CheckCircle,
  HelpCircle,
} from "lucide-react";
import { tr, useT } from "@/i18n";

export const FunderPage: React.FC = () => {
  const t = useT();
  const { setCurrentPage, addToast } = useAppStore();
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const state = useEnvelope<FunderProject[]>(useCallback(() => apiClient.getFunderProjects(), []));
  const { envelope: funderEnvelope, loading, error, reload: loadData } = state;
  const mode = envelopeMode(state, (rows) => rows.length === 0);
  const capabilityState = useCapabilities();
  const canRequestInfo = capabilityState.isAvailable("funderInfoRequest");
  const infoBlockedReason = capabilityState.reasonFor("funderInfoRequest", t("funder.x.1"));
  const amount = (value: number | null | undefined) =>
    value == null ? t("funder.1") : `฿${value.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
  const rbacOff = (funderEnvelope?.missing || []).includes("rbac_not_enforced");

  const handleToggleSelectProject = (id: string) => {
    if (selectedProjectIds.includes(id)) {
      setSelectedProjectIds(selectedProjectIds.filter((pid) => pid !== id));
    } else {
      setSelectedProjectIds([...selectedProjectIds, id]);
    }
  };

  const handleRequestInfo = (proj: FunderProject) => {
    // /capabilities declares funderInfoRequest unavailable: nothing is sent to
    // the project owner and no request record is created.
    addToast({
      type: "warning",
      title: t("funder.2"),
      message: t("funder.tpl.noRequest", { title: proj.title, reason: infoBlockedReason }),
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

  const projects = funderEnvelope?.data || [];

  if (!funderEnvelope || mode === "error" || mode === "unavailable" || mode === "insufficient_data") {
    return (
      <StateRenderer
        currentMode={mode === "error" ? "error" : mode === "unavailable" ? "unavailable" : "insufficient_data"}
        errorMessage={error || t("funder.3")}
        unavailableReason={t("funder.x.2")}
        missingItems={funderEnvelope?.missing || []}
        onRetry={loadData}
        onAddData={() => setCurrentPage("swarm")}
      >
        {null}
      </StateRenderer>
    );
  }

  // ไม่มี endpoint ไหนส่งยอดรวมงบมาให้ จึงไม่บวก/ลบเงินเองใน React
  // แสดงแค่จำนวนโครงการที่เลือก และยอดเป้าหมายของแต่ละโครงการตามที่ backend ส่งมา
  const selectedProjects = projects.filter((proj) => selectedProjectIds.includes(proj.id));
  const selectedShare = projects.length ? (selectedProjects.length / projects.length) * 100 : 0;

  return (
    <StateRenderer onRetry={loadData}>
      <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6 text-ink animate-fade-in">
        {/* Header Bar */}
        <div className="page-header flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-brand text-white flex items-center justify-center font-bold">
                <Building className="w-4 h-4" />
              </div>
              <h1 className="text-xl font-display font-bold text-ink">
                {t("funder.4")}
              </h1>
              <DataKindBadge kind={funderEnvelope?.kind ?? "forecast"} size="md" />
            </div>
            <p className="text-xs text-ink-muted mt-0.5">
              {t("funder.5")}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage("swarm")}
              className="px-3.5 py-1.5 bg-brand text-white rounded-btn text-xs font-semibold hover:bg-brand-dark flex items-center gap-1 transition-all shadow-sm"
            >
              <span>{t("funder.x.3")}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Budget Allocation Simulation Bar */}
        <div className="p-5 rounded-card bg-white border border-borderLine shadow-soft-sm space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold text-brand uppercase tracking-wider block">
                {t("funder.6")}
              </span>
              <h3 className="text-sm font-display font-bold text-ink">
                {t("funder.m1", { selectedProjects: selectedProjects.length, projects: projects.length })}
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
              {selectedProjects.length === 0 && <span className="text-ink-muted font-sans">{t("funder.7")}</span>}
              {selectedProjects.map((proj) => (
                <span key={proj.id} className="rounded-chip border border-brand/30 bg-brand/5 px-2 py-0.5">
                  <span className="font-sans">{proj.title}</span>: <span className="font-bold text-brand">{amount(proj.targetFunding)}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Allocation Progress Bar */}
          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 bg-brand"
              style={{
                width: `${selectedShare}%`,
              }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-ink-muted">
            <span>
              {t("funder.m2", { selectedProjectIds: selectedProjectIds.length })}
              {rbacOff ? t("funder.8") : ""}
            </span>
            <span className="font-mono">
              {t("funder.m3", { selectedProjects: selectedProjects.length, projects: projects.length })}
            </span>
          </div>
        </div>

        {/* Projects Cards with 3-Tier Evidence Badges */}
        <div className="space-y-4">
          <h3 className="text-sm font-display font-bold text-ink flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-brand" />
            <span>{t("funder.9")}</span>
          </h3>

          <div data-tilt-grid className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {projects.map((proj) => {
              const isSelected = selectedProjectIds.includes(proj.id);
              return (
                <div
                  key={proj.id}
                  className={`p-4 rounded-card bg-white border transition-all duration-200 flex flex-col justify-between space-y-4 select-none ${
                    isSelected
                      ? "border-brand ring-2 ring-brand/30 shadow-soft-md"
                      : "border-borderLine hover:border-brand/40"
                  }`}
                >
                  <div>
                    {/* 3-Tier Evidence Badge (Part G12) */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-chip border ${
                          proj.evidenceLevel === "confirmed_po"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                            : proj.evidenceLevel === "quotation"
                            ? "bg-amber-50 text-amber-800 border-amber-300"
                            : "bg-slate-100 text-slate-700 border-slate-200"
                        }`}
                      >
                        {proj.evidenceLevelBadge}
                      </span>
                      <DataKindBadge kind={funderEnvelope?.kind ?? "forecast"} size="sm" />
                    </div>

                    <h4 className="font-display font-bold text-xs text-ink leading-snug mb-1">
                      {proj.title}
                    </h4>
                    <p className="text-[11px] text-ink-muted mb-3">{proj.enterpriseName}</p>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 rounded-xl text-xs mb-3">
                      <div>
                        <span className="text-[10px] text-ink-muted block">{t("funder.10")}</span>
                        <span className="font-bold font-mono text-ink">
                          ฿{proj.targetFunding.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-ink-muted block">{t("funder.11")}</span>
                        <span className="font-bold font-mono text-emerald-700">
                          {t("funder.m4", { roiEstimatePercent: proj.roiEstimatePercent })}
                        </span>
                      </div>
                    </div>

                    {/* Funder Recommendation Decision (Rule: รองรับ 3 สถานะ) */}
                    <div
                      className={`p-2.5 rounded-xl text-xs border leading-relaxed mb-3 ${
                        proj.recommendationDecision === "recommend"
                          ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                          : proj.recommendationDecision === "reduced_amount_possible"
                          ? "bg-amber-50 border-amber-200 text-amber-900"
                          : "bg-slate-50 border-slate-200 text-slate-700"
                      }`}
                    >
                      <div className="font-bold flex items-center gap-1 mb-0.5">
                        {proj.recommendationDecision === "recommend" && <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />}
                        {proj.recommendationDecision === "reduced_amount_possible" && <AlertTriangle className="w-3.5 h-3.5 text-attention" />}
                        {proj.recommendationDecision === "insufficient_data" && <HelpCircle className="w-3.5 h-3.5 text-slate-500" />}
                        <span>
                          {proj.recommendationDecision === "recommend"
                            ? t("funder.12")
                            : proj.recommendationDecision === "reduced_amount_possible"
                            ? t("funder.13")
                            : t("funder.14")}
                        </span>
                      </div>
                      <p className="text-[10px] leading-tight">{proj.recommendationNote}</p>
                    </div>

                    {/* Documents verified status */}
                    <div className="space-y-1 text-[11px] text-ink-muted">
                      <span className="font-semibold block text-[10px] text-ink">{t("funder.15")}</span>
                      {proj.evidenceDocuments.map((doc, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          {doc.verified ? (
                            <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                          ) : (
                            <Lock className="w-3 h-3 text-slate-400 shrink-0" />
                          )}
                          <span className="truncate">{doc.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    {proj.hasAccessPermission ? (
                      <button
                        type="button"
                        onClick={() => handleToggleSelectProject(proj.id)}
                        className={`w-full py-2 rounded-btn text-xs font-bold transition-all ${
                          isSelected
                            ? "bg-emerald-600 text-white shadow-sm"
                            : "bg-brand text-white hover:bg-brand-dark"
                        }`}
                      >
                        {isSelected ? t("funder.16") : t("funder.17")}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleRequestInfo(proj)}
                        disabled={!canRequestInfo}
                        title={canRequestInfo ? undefined : infoBlockedReason}
                        className="w-full py-2 rounded-btn text-xs font-medium bg-slate-100 text-ink hover:bg-slate-200 transition-colors flex items-center justify-center gap-1"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>{canRequestInfo ? t("funder.18") : t("funder.2")}</span>
                      </button>
                    )}
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
