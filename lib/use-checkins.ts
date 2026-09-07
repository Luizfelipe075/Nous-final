"use client"

import { useMemo } from "react"
import { usePilot } from "@/lib/pilot-context"
import type { MoodEntry } from "@/lib/store"

export function useCheckins(patientId?: string) {
  const { checkins, addCheckin } = usePilot()
  const entries = useMemo(
    () => patientId ? checkins.filter((entry) => entry.patientId === patientId) : checkins,
    [checkins, patientId],
  )

  const addEntry = async (entry: Omit<MoodEntry, "id">) => {
    await addCheckin(entry)
  }

  return { entries, addEntry }
}

