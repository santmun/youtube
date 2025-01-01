'use client'

import { YoutubeForm } from '../components/youtube-form'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900">
      <main className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
            AI Video Insights
          </h1>
          <Link
            href="/saved"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 
              dark:hover:bg-indigo-600 text-white rounded-lg shadow-md hover:shadow-lg 
              transition-all duration-200 transform hover:-translate-y-0.5 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
            Resultados Guardados
          </Link>
        </div>
        <div className="max-w-7xl mx-auto">
          <YoutubeForm />
        </div>
      </main>
    </div>
  )
}