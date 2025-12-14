import React from "react";
import { KeyAccessType, ManagedByType, ManagementInfo } from "../types";

type Props = {
  value: ManagementInfo;
  onChange: (next: ManagementInfo) => void;
};

export function ManagementStep({ value, onChange }: Props) {
  const set = (patch: Partial<ManagementInfo>) => onChange({ ...value, ...patch });

  return (
    <div className="space-y-8">
      {/* OWNER / CLIENT DETAILS */}
      <section>
        <div className="flex items-center gap-2 text-slate-500 font-bold tracking-wider uppercase text-xs mb-4">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-600">
            {/* icon placeholder */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M20 21a8 8 0 0 0-16 0" stroke="currentColor" strokeWidth="2" />
              <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
            </svg>
          </span>
          Owner / Client Details
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Owner Name</label>
            <input
              value={value.ownerName || ""}
              onChange={(e) => set({ ownerName: e.target.value })}
              placeholder="e.g. Jane Doe"
              className="w-full border border-slate-300 rounded-lg px-3 py-3 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Owner Email</label>
            <input
              value={value.ownerEmail || ""}
              onChange={(e) => set({ ownerEmail: e.target.value })}
              placeholder="jane@example.com"
              className="w-full border border-slate-300 rounded-lg px-3 py-3 text-sm"
            />
          </div>

          <div className="md:col-span-1">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Owner Phone</label>
            <input
              value={value.ownerPhone || ""}
              onChange={(e) => set({ ownerPhone: e.target.value })}
              placeholder="0400 000 000"
              className="w-full border border-slate-300 rounded-lg px-3 py-3 text-sm"
            />
          </div>
        </div>
      </section>

      <hr className="border-slate-200" />

      {/* MANAGEMENT & ACCESS */}
      <section>
        <div className="flex items-center gap-2 text-slate-500 font-bold tracking-wider uppercase text-xs mb-4">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-600">
            {/* icon placeholder */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M4 4h16v16H4V4Z" stroke="currentColor" strokeWidth="2" />
              <path d="M8 8h.01M8 12h.01M8 16h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </span>
          Management & Access
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Managed By</label>
            <select
              value={value.managedBy}
              onChange={(e) => set({ managedBy: e.target.value as ManagedByType })}
              className="w-full border border-slate-300 rounded-lg px-3 py-3 text-sm bg-white"
            >
              <option value={ManagedByType.REAL_ESTATE_AGENCY}>Real Estate Agency</option>
              <option value={ManagedByType.PRIVATE_LANDLORD}>Private Landlord</option>
              <option value={ManagedByType.OTHER}>Other</option>
            </select>

            {value.managedBy === ManagedByType.REAL_ESTATE_AGENCY && (
              <div className="mt-3">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Agency Name</label>
                <input
                  value={value.managingAgencyName || ""}
                  onChange={(e) => set({ managingAgencyName: e.target.value })}
                  placeholder="e.g. Acme Realty"
                  className="w-full border border-slate-300 rounded-lg px-3 py-3 text-sm"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Key Access Details</label>
            <select
              value={value.keyAccess}
              onChange={(e) => set({ keyAccess: e.target.value as KeyAccessType })}
              className="w-full border border-slate-300 rounded-lg px-3 py-3 text-sm bg-white"
            >
              <option value={KeyAccessType.HELD_WITH_AGENT}>Held with Agent</option>
              <option value={KeyAccessType.HELD_WITH_LANDLORD}>Held with Landlord</option>
              <option value={KeyAccessType.SAFEBOX_LOCKBOX}>Safebox / Lockbox</option>
              <option value={KeyAccessType.TENANT_PROVIDE_ACCESS}>Tenant to provide access</option>
              <option value={KeyAccessType.OTHER}>Other</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Additional Notes</label>
            <textarea
              value={value.accessNotes || ""}
              onChange={(e) => set({ accessNotes: e.target.value })}
              placeholder="Access codes, specific instructions, etc."
              rows={4}
              className="w-full border border-slate-300 rounded-lg px-3 py-3 text-sm"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
