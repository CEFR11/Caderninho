import { useEffect, useState } from 'react'

// Mesmo valor usado para decidir entre layout de celular e de computador.
const CONSULTA = '(min-width: 1024px)'

export function useEhDesktop() {
  const [ehDesktop, setEhDesktop] = useState(() => window.matchMedia(CONSULTA).matches)

  useEffect(() => {
    const media = window.matchMedia(CONSULTA)
    const aoMudar = (e) => setEhDesktop(e.matches)
    media.addEventListener('change', aoMudar)
    return () => media.removeEventListener('change', aoMudar)
  }, [])

  return ehDesktop
}
