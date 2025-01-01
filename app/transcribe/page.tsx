'use client'

import { YoutubeForm } from '@/components/youtube-form'

export default function TranscribePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">
          YouTube Transcriptor
        </h1>
        <div className="max-w-2xl mx-auto">
          <YoutubeForm />
        </div>
      </main>
    </div>
  )
}
