"use client"

import { LanguageProvider } from "@/lib/i18n/language-context"
import { Toaster } from "@/components/ui/sonner"

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider defaultLang="en">
      {children}
      <Toaster />
    </LanguageProvider>
  )
}
