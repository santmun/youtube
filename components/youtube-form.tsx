'use client'

import { useState } from 'react'

interface Summary {
  summary: string
  keyPoints: string[]
  topics: string[]
}

export default function YoutubeForm() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [transcript, setTranscript] = useState('')
  const [summary, setSummary] = useState<Summary | null>(null)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setTranscript('')
    setSummary(null)

    try {
      const transcriptResponse = await fetch('/api/transcribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      })

      let transcriptData
      try {
        transcriptData = await transcriptResponse.json()
      } catch (error) {
        throw new Error('Error al procesar la respuesta del servidor')
      }

      if (!transcriptResponse.ok) {
        throw new Error(transcriptData.error || 'Error al obtener la transcripción')
      }

      setTranscript(transcriptData.transcript)

      const summaryResponse = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcript: transcriptData.transcript }),
      })

      let summaryData
      try {
        summaryData = await summaryResponse.json()
      } catch (error) {
        throw new Error('Error al procesar la respuesta del servidor')
      }

      if (!summaryResponse.ok) {
        throw new Error(summaryData.error || 'Error al generar el resumen')
      }

      setSummary(summaryData)
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('Ocurrió un error inesperado')
      }
    } finally {
      setLoading(false)
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
        throw new Error('Error al guardar el resultado')
      }

      const data = await response.json()
      console.log('Saved:', data)
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
                Procesando...
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
