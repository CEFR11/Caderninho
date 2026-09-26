import { useEffect, useRef, useState } from 'react'

// Reconhecimento de voz nativo do navegador (Chrome/Android, Safari). Só funciona em
// contexto seguro (https ou localhost); fora disso, ou sem suporte, o botão não aparece.
const SpeechRecognition = typeof window !== 'undefined'
  ? window.SpeechRecognition || window.webkitSpeechRecognition
  : null
const vozDisponivel = Boolean(SpeechRecognition) && typeof window !== 'undefined' && window.isSecureContext

export default function MicButton({ aoOuvir }) {
  const [ouvindo, setOuvindo] = useState(false)
  const reconhecimentoRef = useRef(null)

  useEffect(() => () => reconhecimentoRef.current?.abort(), [])

  if (!vozDisponivel) return null

  function alternar() {
    if (ouvindo) {
      reconhecimentoRef.current?.stop()
      return
    }

    const reconhecimento = new SpeechRecognition()
    reconhecimento.lang = 'pt-BR'
    reconhecimento.interimResults = false
    reconhecimento.maxAlternatives = 1

    reconhecimento.onresult = (e) => {
      const texto = e.results[0][0].transcript.trim()
      if (texto) aoOuvir(texto)
    }
    reconhecimento.onend = () => setOuvindo(false)
    reconhecimento.onerror = () => setOuvindo(false)

    reconhecimentoRef.current = reconhecimento
    reconhecimento.start()
    setOuvindo(true)
  }

  return (
    <button
      type="button"
      className={`mic ${ouvindo ? 'on' : ''}`}
      onClick={alternar}
      aria-label={ouvindo ? 'Parar de ouvir' : 'Falar'}
    >
      🎙
    </button>
  )
}
