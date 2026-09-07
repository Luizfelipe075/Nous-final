export const LIKERT_VALUES = [1, 2, 3, 4, 5] as const
export type LikertValue = (typeof LIKERT_VALUES)[number]

export const likertLabels: Record<LikertValue, string> = {
  1: "Muito baixo",
  2: "Baixo",
  3: "Moderado",
  4: "Alto",
  5: "Muito alto",
}

export const likertIntensityDescriptions: Record<LikertValue, string> = {
  1: "A emoção é leve e quase não interfere no momento.",
  2: "A emoção está presente, mas interfere pouco no momento.",
  3: "A emoção está perceptível e influencia parcialmente o momento.",
  4: "A emoção é forte e influencia bastante pensamentos ou ações.",
  5: "A emoção é muito intensa e domina grande parte do momento.",
}

export const likertColors: Record<LikertValue, string> = {
  1: "#78716c",
  2: "#a16207",
  3: "#c2410c",
  4: "#0f766e",
  5: "#115e59",
}

export function asLikert(value: number): LikertValue {
  return Math.min(5, Math.max(1, Math.round(value))) as LikertValue
}

export function likertLabel(value: number) {
  return likertLabels[asLikert(value)]
}

