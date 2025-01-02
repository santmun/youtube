'use client'

import Link from 'next/link'
import YoutubeForm from '@/components/youtube-form'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900">
      <main className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 md:mb-12">
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 text-center md:text-left mb-4 md:mb-0">
              YouTube Insights
            </h1>
            <Link
              href="/saved"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 
                text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform 
                hover:-translate-y-0.5 flex items-center gap-2 w-full md:w-auto justify-center"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              Ver Guardados
            </Link>
          </div>

          <div className="max-w-7xl mx-auto">
            <YoutubeForm />
          </div>
        </div>
      </main>
    </div>
  )
}