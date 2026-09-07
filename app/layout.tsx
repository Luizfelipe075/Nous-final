import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? process.env.URL ?? 'http://localhost:3000'),
  title: 'Noûs — acompanhamento entre sessões',
  description: 'Check-ins, tarefas, diário e resumo pré-sessão organizados para psicólogos e pacientes.',
  icons: {
    icon: '/icon.svg',
  },
  openGraph: {
    title: 'Noûs — acompanhamento entre sessões',
    description: 'Entenda o que aconteceu durante a semana antes da próxima sessão.',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Noûs - Cuidado emocional inteligente' }],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Noûs — acompanhamento entre sessões',
    description: 'Entenda o que aconteceu durante a semana antes da próxima sessão.',
    images: ['/og.png'],
  },
}

export const viewport: Viewport = {
  themeColor: '#ff7100',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
