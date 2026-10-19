// Read GET /capabilities once per page instead of repeating useEnvelope everywhere.
// If it fails to load or the app is in demo mode, treat everything as unsupported
// (never assume a feature is available).

import { useCallback } from "react";
import { apiClient } from "@/api/client";
import { Capabilities, Capability } from "@/api/contracts/types";
import { useEnvelope } from "@/hooks/useEnvelope";
import { TranslationKey, tr } from "@/i18n";

export type CapabilityName = keyof Capabilities;

const fallbackReason: Record<string, TranslationKey> = {
  business_contract_required: "capReason.businessContract",
  export_contract_required: "capReason.exportContract",
  quantity_and_time_contract_required: "capReason.reservationContract",
};

export function capabilityReason(capability: Capability | undefined, unknownText: string): string {
  if (!capability) return unknownText;
  if (capability.available) return "";
  if (capability.reason) return fallbackReason[capability.reason] ? tr(fallbackReason[capability.reason]) : capability.reason;
  if (capability.requiresDatabase) return tr("capReason.needsDatabase");
  return unknownText;
}

export function useCapabilities() {
  const load = useCallback(
    () => (apiClient.isDemoMode()
      ? Promise.reject(new Error(tr("capReason.demo")))
      : apiClient.getCapabilities()),
    [],
  );
  const state = useEnvelope<Capabilities>(load);
  const data = state.envelope?.data ?? null;

  // available is true only when the backend says true
  const isAvailable = (name: CapabilityName) => data?.[name]?.available === true;
  const reasonFor = (name: CapabilityName, unknownText = tr("capReason.unknown")) =>
    capabilityReason(data?.[name], state.error ? `${unknownText} (${state.error})` : unknownText);

  return { ...state, capabilities: data, isAvailable, reasonFor };
}
