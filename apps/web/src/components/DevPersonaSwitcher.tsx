"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useDevPersonas, useCurrentDevPersona, useSwitchDevPersona } from "@/hooks/useDevPersona";
import { useSystemHealth } from "@/hooks/useFoundationProfile";
import { UserCheck, Shield, Database, ChevronUp, ChevronDown, Check, RefreshCw } from "lucide-react";

export default function DevPersonaSwitcher() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { data: personas, isLoading: loadingPersonas } = useDevPersonas();
  const { data: currentPersona, isLoading: loadingCurrent } = useCurrentDevPersona();
  const { data: health } = useSystemHealth();
  const switchMutation = useSwitchDevPersona();

  const handleSelectPersona = async (personaId: string, defaultRoute: string) => {
    await switchMutation.mutateAsync(personaId);
    setIsOpen(false);
    router.push(defaultRoute);
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: "18px",
        left: "18px",
        zIndex: 99999,
        fontFamily: "var(--font-sans, system-ui, sans-serif)",
      }}
    >
      {/* Persona Drawer / Dropdown */}
      {isOpen && (
        <div
          style={{
            marginBottom: "8px",
            background: "#14151a",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            borderRadius: "16px",
            padding: "14px",
            width: "320px",
            boxShadow: "0 20px 50px rgba(0,0,0,0.7)",
            animation: "fadeIn 0.15s ease-out",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#60a5fa", textTransform: "uppercase" }}>
              Development Personas
            </span>
            <span style={{ fontSize: "10.5px", color: health?.database_connected ? "#34d399" : "#f87171", display: "flex", alignItems: "center", gap: "4px" }}>
              <Database style={{ width: "11px", height: "11px" }} />
              <span>{health?.database_connected ? "PG 16 Live" : "Offline"}</span>
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {personas?.map((p) => {
              const isActive = currentPersona?.id === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectPersona(p.id, p.default_route)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 10px",
                    borderRadius: "10px",
                    background: isActive ? "rgba(37, 99, 235, 0.15)" : "rgba(255,255,255,0.03)",
                    border: isActive ? "1px solid rgba(59, 130, 246, 0.4)" : "1px solid rgba(255,255,255,0.06)",
                    color: "#ffffff",
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "12.5px", fontWeight: 700, color: isActive ? "#60a5fa" : "#e2e8f0" }}>
                      {p.name}
                    </div>
                    <div style={{ fontSize: "10.5px", color: "#94a3b8" }}>
                      {p.title}
                    </div>
                  </div>
                  {isActive && <Check style={{ width: "14px", height: "14px", color: "#34d399" }} />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Floating Trigger Pill */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          background: "rgba(17, 18, 24, 0.95)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          backdropFilter: "blur(12px)",
          padding: "7px 12px",
          borderRadius: "999px",
          color: "#ffffff",
          fontSize: "12px",
          fontWeight: 600,
          cursor: "pointer",
          boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
        }}
      >
        <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: health?.database_connected ? "#10b981" : "#f59e0b" }} />
        <span>Dev Persona: <b>{currentPersona?.name || "Aarav Sharma"}</b></span>
        {isOpen ? <ChevronDown style={{ width: "13px", height: "13px" }} /> : <ChevronUp style={{ width: "13px", height: "13px" }} />}
      </button>
    </div>
  );
}
