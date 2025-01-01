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

export function YoutubeForm() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [transcript, setTranscript] = useState('')
  const [summary, setSummary] = useState<Summary | null>(null)
  const [step, setStep] = useState<'idle' | 'transcribing' | 'summarizing'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setTranscript('')
    setSummary(null)
    setStep('transcribing')

    try {
      const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/
      if (!youtubeRegex.test(url)) {
        throw new Error('Por favor ingresa una URL válida de YouTube')
      }

      // Obtener transcripción
      const transcriptResponse = await fetch('/api/transcribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      })

      if (!transcriptResponse.ok) {
        const data = await transcriptResponse.json()
        throw new Error(data.error || 'Error al transcribir el video')
      }

      const transcriptData = await transcriptResponse.json()
      setTranscript(transcriptData.content)

      // Generar resumen
      setStep('summarizing')
      const summaryResponse = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcript: transcriptData.content }),
      })

      if (!summaryResponse.ok) {
        const data = await summaryResponse.json()
        throw new Error(data.error || 'Error al generar el resumen')
      }

      const summaryData = await summaryResponse.json()
      setSummary(summaryData)
    } catch (err) {
      console.error('Error:', err)
      setError(err instanceof Error ? err.message : 'Ocurrió un error al procesar el video')
    } finally {
      setLoading(false)
      setStep('idle')
    }
  }

  const handleSave = async () => {
    if (!url || !transcript || !summary) return

    try {
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
    }
  }

  return (
    <div className="space-y-8">
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-8 rounded-xl shadow-lg transition-all">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label 
              htmlFor="youtube-url" 
              className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2"
            >
              URL del video de YouTube
            </label>
            <div className="relative">
              <input
                id="youtube-url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg 
                  focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                  placeholder-gray-400 dark:placeholder-gray-500
                  transition-all duration-200"
                required
                disabled={loading}
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 
              rounded-lg text-red-600 dark:text-red-400 text-sm animate-fadeIn">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200
              ${loading 
                ? 'bg-indigo-400 dark:bg-indigo-600 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transform hover:-translate-y-0.5'
              } text-white shadow-md hover:shadow-lg`}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{step === 'transcribing' ? 'Transcribiendo...' : 'Generando resumen...'}</span>
              </div>
            ) : (
              'Analizar Video'
            )}
          </button>
        </form>
      </div>

      {(transcript || summary) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fadeIn">
          {/* Columna de Transcripción */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-8 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Transcripción
            </h2>
            <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg 
              border border-gray-100 dark:border-gray-700
              text-gray-700 dark:text-gray-200
              max-h-[600px] overflow-y-auto custom-scrollbar">
              {transcript}
            </div>
          </div>

          {/* Columna de Resumen */}
          {summary && (
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-8 rounded-xl shadow-lg">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Resumen del Video
              </h2>
              
              <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg border border-gray-100 dark:border-gray-700">
                  <p className="text-gray-700 dark:text-gray-200">{summary.summary}</p>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 dark:bg-green-500 
                      dark:hover:bg-green-600 text-white rounded-lg shadow-md hover:shadow-lg 
                      transition-all duration-200 transform hover:-translate-y-0.5 flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    Guardar Resultado
                  </button>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
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
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                    </svg>
                    Secciones
                  </h3>
                  <div className="space-y-4">
                    {summary.sections.map((section, index) => (
                      <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{section.title}</h4>
                        <p className="text-gray-700 dark:text-gray-300">{section.content}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">Temas</h3>
                  <div className="flex flex-wrap gap-2">
                    {summary.topics.map((topic, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 
                          rounded-full text-sm font-medium"
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
