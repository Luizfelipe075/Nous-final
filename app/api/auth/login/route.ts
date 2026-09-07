import { NextResponse } from "next/server"
import { z } from "zod"
import { AUTH_COOKIE, authenticateDemoAccount, createSessionToken } from "@/lib/server-auth"

export const runtime = "nodejs"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["paciente", "psicologo"]),
})

export async function POST(request: Request) {
  const parsed = loginSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: "Preencha um e-mail válido e uma senha com pelo menos 8 caracteres." }, { status: 400 })
  }

  const user = authenticateDemoAccount(parsed.data.email, parsed.data.password, parsed.data.role)
  if (!user) return NextResponse.json({ error: "Credenciais demonstrativas inválidas para o perfil selecionado." }, { status: 401 })

  const response = NextResponse.json({ user })
  response.cookies.set(AUTH_COOKIE, createSessionToken(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 8 * 60 * 60,
  })
  return response
}

