import { NextResponse } from "next/server"
import { readUserFromRequest } from "@/lib/server-auth"
import { getPilotView, performPilotAction, PilotActionError } from "@/lib/server-pilot-store"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const user = readUserFromRequest(request)
  if (!user) return NextResponse.json({ error: "Sessão necessária." }, { status: 401 })
  return NextResponse.json({ state: await getPilotView(user) })
}

export async function POST(request: Request) {
  const user = readUserFromRequest(request)
  if (!user) return NextResponse.json({ error: "Sessão necessária." }, { status: 401 })

  try {
    const body = await request.json() as { action?: string; payload?: unknown }
    if (!body.action) return NextResponse.json({ error: "Ação não informada." }, { status: 400 })
    return NextResponse.json({ state: await performPilotAction(user, body.action, body.payload) })
  } catch (error) {
    if (error instanceof PilotActionError) return NextResponse.json({ error: error.message }, { status: error.status })
    console.error(error)
    return NextResponse.json({ error: "Não foi possível concluir a operação." }, { status: 500 })
  }
}

