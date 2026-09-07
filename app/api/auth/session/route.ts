import { NextResponse } from "next/server"
import { readUserFromRequest } from "@/lib/server-auth"

export const runtime = "nodejs"

export async function GET(request: Request) {
  return NextResponse.json({ user: readUserFromRequest(request) })
}

