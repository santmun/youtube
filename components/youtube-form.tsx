'use client'

import { useState } from 'react'

interface Summary {
  summary: string
  keyPoints: string[]
  sections: Array<{
    title: string
    content: string
  }>
  topics: string[]
}

interface Error {
  message: string;
}

export default function YoutubeForm() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [transcript, setTranscript] = useState('')
  const [summary, setSummary] = useState<Summary | null>(null)
  const [step, setStep] = useState<'idle' | 'transcribing' | 'summarizing'>('idle')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setTranscript('')
    setSummary(null)

    // Validar formato de URL de YouTube
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/
    if (!youtubeRegex.test(url)) {
      setError('Por favor, ingresa una URL válida de YouTube')
      return
    }

    try {
      setLoading(true)
      setStep('transcribing')

      // Obtener transcripción
      const transcribeResponse = await fetch('/api/transcribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      })

      if (!transcribeResponse.ok) {
        const errorData = await transcribeResponse.json()
        throw new Error(errorData.error || 'Error al obtener la transcripción')
      }

      const transcribeData = await transcribeResponse.json()
      
      if (!transcribeData.transcript) {
        throw new Error('No se pudo obtener la transcripción del video')
      }

      setTranscript(transcribeData.transcript)
      setStep('summarizing')

      // Generar resumen
      const summaryResponse = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcript: transcribeData.transcript }),
      })

      if (!summaryResponse.ok) {
        const errorData = await summaryResponse.json()
        throw new Error(errorData.error || 'Error al generar el resumen')
      }

      const summaryData = await summaryResponse.json()
      setSummary(summaryData)
    } catch (error: unknown) {
      console.error('Error:', error)
      setError(error instanceof Error ? error.message : 'Ocurrió un error al procesar el video')
    } finally {
      setLoading(false)
      setStep('idle')
    }
  }

  const handleSave = async () => {
    if (!url || !transcript || !summary) return

    try {
      setSaving(true)
      const response = await fetch('/api/save-result', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          transcript,
          summary,
        }),
      })

      if (!response.ok) {
        throw new Error('Error saving result')
      }

      const data = await response.json()
      if (data.success) {
        // Redirigir a la página de resultados guardados
        window.location.href = '/saved'
      }
    } catch (error) {
      console.error('Error:', error)
      setError('Error al guardar el resultado')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Ingresa la URL del video de YouTube"
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
              bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 
              focus:ring-2 focus:ring-indigo-500 focus:border-transparent
              placeholder-gray-500 dark:placeholder-gray-400"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 
              dark:hover:bg-indigo-600 text-white rounded-lg shadow-md hover:shadow-lg 
              transition-all duration-200 transform hover:-translate-y-0.5 
              disabled:opacity-50 disabled:cursor-not-allowed
              w-full md:w-auto"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin" />
                {step === 'transcribing' ? 'Transcribiendo...' : 'Generando...'}
              </div>
            ) : (
              'Procesar'
            )}
          </button>
        </div>
      </form>

      {error && (
        <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg">
          {error}
        </div>
      )}

      {(transcript || summary) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {transcript && (
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-xl shadow-lg">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Transcripción
              </h2>
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {transcript}
                </p>
              </div>
            </div>
          )}

          {summary && (
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-xl shadow-lg">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Resumen
                </h2>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 dark:bg-green-500 
                    dark:hover:bg-green-600 text-white rounded-lg shadow-md hover:shadow-lg 
                    transition-all duration-200 transform hover:-translate-y-0.5 
                    disabled:opacity-50 disabled:cursor-not-allowed
                    text-sm flex items-center gap-2"
                >
                  {saving ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-t-2 border-b-2 border-white rounded-full animate-spin" />
                      Guardando...
                    </div>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Guardar Resultado
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
                    Resumen General
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                    <p className="text-gray-700 dark:text-gray-300">
                      {summary.summary}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
                    Puntos Clave
                  </h3>
                  <ul className="list-none space-y-2">
                    {summary.keyPoints.map((point, index) => (
                      <li key={index} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                        <span className="text-indigo-500 mt-1">•</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
                    Temas
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {summary.topics.map((topic, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 
                          text-indigo-700 dark:text-indigo-300 rounded-full text-sm"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
