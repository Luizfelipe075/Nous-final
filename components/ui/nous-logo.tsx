"use client"

/**
 * NousLogo — logo completa Noûs (ícone + texto "noûs").
 * Tamanho nativo: 109 × 36 px  →  proporção ~3.03 : 1
 *
 * Uso:
 *   <NousLogo />           → 109 × 36 (tamanho natural)
 *   <NousLogo height={28} /> → escala proporcional pela altura
 */
const NATIVE_W = 109
const NATIVE_H = 36

export function NousLogo({ height = NATIVE_H, className }: { height?: number; size?: number; className?: string }) {
  const w = Math.round(height * (NATIVE_W / NATIVE_H))
  return (
    <img
      src="/nous-logo-full.png"
      alt="Noûs"
      className={className}
      width={w}
      height={height}
      style={{ width: w, height, objectFit: "contain", display: "inline-block", flexShrink: 0 }}
    />
  )
}
