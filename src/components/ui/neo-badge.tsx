/**
 * ═══════════════════════════════════════════════════════════════
 * IP-NEXUS SILK DESIGN SYSTEM — NeoBadge
 * Neumorphic badge for numeric indicators
 * ═══════════════════════════════════════════════════════════════
 */

import React from 'react';

interface NeoBadgeProps {
  value: string | number;
  label?: string;
  color: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  active?: boolean;
}

const sizes = {
  sm: { width: 34, height: 34, radius: 10, valueSize: 12, labelSize: 7 },
  md: { width: 46, height: 46, radius: 12, valueSize: 16, labelSize: 8 },
  lg: { width: 54, height: 54, radius: 14, valueSize: 19, labelSize: 9 },
};

export const NeoBadge: React.FC<NeoBadgeProps> = ({
  value,
  label,
  color,
  size = "md",
  className = "",
  active = false,
}) => {
  const s = sizes[size];

  return (
    <div
      className={`flex-shrink-0 ${className}`}
      style={{
        width: s.width,
        height: s.height,
        borderRadius: s.radius,
        background: "#f1f4f9",
        boxShadow: "4px 4px 10px #cdd1dc, -4px -4px 10px #ffffff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        outline: active ? "2px solid #00b4d8" : "none",
        outlineOffset: active ? "2px" : "0",
      }}
    >
      {/* Bottom gradient */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "45%",
          background: `linear-gradient(to top, ${color}0c, transparent)`,
          borderRadius: s.radius,
        }}
      />

      {/* Base line */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: "18%",
          right: "18%",
          height: 2,
          background: color,
          borderRadius: 2,
          opacity: 0.25,
          boxShadow: `0 0 5px ${color}30`,
        }}
      />

      {/* Value */}
      <span
        style={{
          fontSize: s.valueSize,
          fontWeight: 200,
          color: color,
          position: "relative",
          lineHeight: 1,
        }}
      >
        {value}
      </span>

      {/* Label */}
      {label && (
        <span
          style={{
            fontSize: s.labelSize,
            color: "#94a3b8",
            position: "relative",
            marginTop: 1,
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
};

export default NeoBadge;

/**
 * NeoBadgeInline - Versión inline para fases (F1, F2, etc.)
 * Más pequeño, para usar inline con texto
 */
export interface NeoBadgeInlineProps extends React.HTMLAttributes<HTMLSpanElement> {
  value: string | number;
  color?: string;
}

export const NeoBadgeInline: React.FC<NeoBadgeInlineProps> = ({
  value,
  color = "#64748b",
  className = "",
  ...props
}) => {
  return (
    <span
      className={`relative inline-flex items-center justify-center overflow-hidden ${className}`}
      style={{
        width: 28,
        height: 28,
        borderRadius: 8,
        background: "#f1f4f9",
        boxShadow: "3px 3px 6px #cdd1dc, -3px -3px 6px #ffffff",
      }}
      {...props}
    >
      <span
        style={{
          fontSize: 11,
          fontWeight: 200,
          color: color,
          position: "relative",
          lineHeight: 1,
        }}
      >
        {value}
      </span>

      {/* Bottom color line */}
      <span
        style={{
          position: "absolute",
          bottom: 0,
          left: "20%",
          right: "20%",
          height: 2,
          background: color,
          borderRadius: 2,
          opacity: 0.25,
        }}
      />
    </span>
  );
};
