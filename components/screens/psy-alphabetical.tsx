"use client"

import { PsyPatients } from "./psy-patients"

// A rota histórica é preservada, mas reutiliza a fonte única de gestão de pacientes.
export function PsyAlphabetical() {
  return <PsyPatients />
}


