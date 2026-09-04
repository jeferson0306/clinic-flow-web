'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import pt from '@/locales/pt.json'
import en from '@/locales/en.json'
import es from '@/locales/es.json'

export type Locale = 'pt' | 'en' | 'es'

const LOCALES: Record<Locale, typeof pt> = { pt, en, es }

export const LOCALE_LABELS: Record<Locale, { label: string; flag: string }> = {
  pt: { label: 'Português', flag: '🇧🇷' },
  en: { label: 'English',   flag: '🇺🇸' },
  es: { label: 'Español',   flag: '🇪🇸' },
}

function get(obj: Record<string, unknown>, path: string): string {
  const val = path.split('.').reduce<unknown>((o, k) => (o && typeof o === 'object' ? (o as Record<string, unknown>)[k] : undefined), obj)
  return typeof val === 'string' ? val : path
}

type I18nCtx = { locale: Locale; setLocale: (l: Locale) => void; t: (key: string) => string }

const I18nContext = createContext<I18nCtx>({ locale: 'pt', setLocale: () => {}, t: (k) => k })

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('pt')
  const router = useRouter()

  useEffect(() => {
    // Same as Sidebar's mount effect: localStorage has no SSR-time value to
    // derive from, so this can only run after mount.
    const saved = localStorage.getItem('locale') as Locale | null
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved && saved in LOCALES) setLocaleState(saved)
  }, [])

  function apply(l: Locale) {
    const changed = l !== locale
    setLocaleState(l)
    localStorage.setItem('locale', l)
    // 1-year expiry: mirrors localStorage's own persistence, read by
    // lib/i18n-server.ts so server components render the same language.
    document.cookie = `locale=${l};path=/;max-age=31536000;samesite=lax`
    document.documentElement.lang = l
    if (changed) router.refresh()
  }

  const dict = LOCALES[locale] as unknown as Record<string, unknown>

  return (
    <I18nContext.Provider value={{ locale, setLocale: apply, t: (key) => get(dict, key) }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useTranslation() {
  return useContext(I18nContext)
}
