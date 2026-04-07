import { useEffect, useState } from 'react'

const DISMISSED_KEY = 'pwa-install-dismissed'

interface InstallPWAProps {
  onBannerChange?: (visible: boolean) => void
}

export function InstallPWA({ onBannerChange }: InstallPWAProps) {
  const [prompt, setPrompt] = useState<any>(null)
  const [showBanner, setShowBanner] = useState(false)
  const [showIOSModal, setShowIOSModal] = useState(false)
  const [installed, setInstalled] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
  const checkMobile = () => setIsMobile(window.innerWidth < 1024)
  checkMobile()
  window.addEventListener('resize', checkMobile)

  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent)
  const standalone = window.matchMedia('(display-mode: standalone)').matches
  setIsIOS(ios)

  const dismissed = localStorage.getItem(DISMISSED_KEY)


  if ((window as any).__pwaPrompt) {
    setPrompt((window as any).__pwaPrompt)
    if (!dismissed) setShowBanner(true)
  }


  const handlePrompt = (e: any) => {
    e.preventDefault()
    setPrompt(e)
    if (!dismissed) setShowBanner(true)
  }
  window.addEventListener('beforeinstallprompt', handlePrompt)

  // iOS
  if (ios && !standalone && !dismissed) setShowBanner(true)

  window.addEventListener('appinstalled', () => {
    setInstalled(true)
    setShowBanner(false)
    setPrompt(null)
  })

  return () => {
    window.removeEventListener('resize', checkMobile)
    window.removeEventListener('beforeinstallprompt', handlePrompt)
    }
  }, [])

  useEffect(() => {
    onBannerChange?.(showBanner)
  }, [showBanner])

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSModal(true)
      return
    }
    if (!prompt) return
    prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') {
      setInstalled(true)
      setShowBanner(false)
    }
    setPrompt(null)
  }

  const handleDismiss = () => {
    setShowBanner(false)
    localStorage.setItem(DISMISSED_KEY, 'true')
  }

  if (!isMobile || installed) return null

  return (
    <>
      {/* ── Modal iOS ─────────────────────────────────────────────────────── */}
      {showIOSModal && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setShowIOSModal(false)}
        >
          <div
            className="w-full max-w-sm mx-4 mb-6 bg-white rounded-2xl p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-[#012657]">Cómo instalar en iPhone</p>
              <button
                onClick={() => setShowIOSModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xs p-1"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {/* Paso 1 */}
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl border border-gray-100 p-3">
                <div className="w-7 h-7 rounded-full bg-[#008B8B] flex items-center justify-center shrink-0">
                  <span className="text-xs font-semibold text-white">1</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 mb-1">Toca el botón compartir</p>
                  <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-2 py-1 w-fit">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="#2E5871" strokeWidth="2.5">
                      <path d="M8 12H3v9h18v-9h-5M12 3v12M8 7l4-4 4 4"/>
                    </svg>
                    <span className="text-xs font-medium text-[#008B8B]">Compartir</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <svg className="w-3.5 h-3.5 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12l7 7 7-7"/>
                </svg>
              </div>

              {/* Paso 2 */}
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl border border-gray-100 p-3">
                <div className="w-7 h-7 rounded-full bg-[#008B8B] flex items-center justify-center shrink-0">
                  <span className="text-xs font-semibold text-white">2</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 mb-1">Desplázate y toca</p>
                  <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-2 py-1 w-fit">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="#008B8B" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="3"/>
                      <path d="M12 8v8M8 12h8"/>
                    </svg>
                    <span className="text-xs font-medium text-[#008B8B]">Agregar a pantalla de inicio</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <svg className="w-3.5 h-3.5 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12l7 7 7-7"/>
                </svg>
              </div>

              {/* Paso 3 */}
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl border border-gray-100 p-3">
                <div className="w-7 h-7 rounded-full bg-[#008B8B] flex items-center justify-center shrink-0">
                  <span className="text-xs font-semibold text-white">3</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 mb-1">Confirma tocando</p>
                  <div className="bg-yellow-400 rounded-lg px-3 py-1 w-fit">
                    <span className="text-xs font-semibold text-[#008B8B]">Agregar</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Banner principal ───────────────────────────────────────────────── */}
      {showBanner && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#2E5871] border-t border-[#1e3d50] shadow-lg p-4">
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 text-white/60 hover:text-white p-1 text-xs"
            aria-label="Cerrar"
          >
            ✕
          </button>
          <div className="flex items-center gap-3 pr-4">
            <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0">
              <img
                src="/icons/icon-192x192.png"
                alt="App icon"
                className="w-full h-full object-cover object-top"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white">Instala El Chat</p>
              <p className="text-xs text-white/70">Accede rápido desde tu pantalla de inicio</p>
            </div>
            <button
              onClick={handleInstall}
              className="shrink-0 bg-[#E15E29] text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-[#c94f20] transition-colors"
            >
              {isIOS ? 'Ver cómo' : 'Instalar'}
            </button>
          </div>
        </div>
      )}

      {/* ── Footer minimalista (banner descartado pero prompt disponible) ─── */}
      {!showBanner && prompt && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#2E5871] border-t border-[#1e3d50] flex justify-center py-2">
          <button
            onClick={handleInstall}
            className="flex items-center gap-2 text-sm text-yellow-400 hover:text-yellow-300 transition-colors px-4 py-1"
          >
            <span>⬇</span>
            <span>Descargar app</span>
          </button>
        </div>
      )}
    </>
  )
}