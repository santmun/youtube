'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface SavedSummary {
  id: number
  url: string
  transcript: string
  summary: string
  created_at: string
}

export default function SavedResults() {
  const [summaries, setSummaries] = useState<SavedSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSummaries()
  }, [])

  const fetchSummaries = async () => {
    try {
      const { data, error } = await supabase
        .from('video_summaries')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching summaries:', error)
        return
      }

      setSummaries(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900">
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
            Resultados Guardados
          </h1>
          <Link
            href="/"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 
              dark:hover:bg-indigo-600 text-white rounded-lg shadow-md hover:shadow-lg 
              transition-all duration-200 transform hover:-translate-y-0.5 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al Inicio
          </Link>
        </div>

        <div className="grid gap-8 max-w-7xl mx-auto">
          {summaries.length === 0 ? (
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-8 rounded-xl shadow-lg text-center">
              <p className="text-gray-700 dark:text-gray-300">No hay resultados guardados aún.</p>
            </div>
          ) : (
            summaries.map((item) => {
              const summary = JSON.parse(item.summary)
              return (
                <div
                  key={item.id}
                  className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-8 rounded-xl shadow-lg"
                >
                  <div className="mb-4">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 dark:text-indigo-400 hover:underline break-all"
                    >
                      {item.url}
                    </a>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
                        Resumen
                      </h3>
                      <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg border border-gray-100 dark:border-gray-700">
                        <p className="text-gray-700 dark:text-gray-200">{summary.summary}</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
                        Puntos Clave
                      </h3>
                      <ul className="list-none space-y-2">
                        {summary.keyPoints.map((point: string, index: number) => (
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
                        {summary.topics.map((topic: string, index: number) => (
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
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
