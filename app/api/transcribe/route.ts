import { NextResponse } from 'next/server'

// Función para extraer el ID del video de YouTube
function extractYoutubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^[a-zA-Z0-9_-]{11}$/
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }

  return null
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { url } = body

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    const videoId = extractYoutubeId(url)
    if (!videoId) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL' },
        { status: 400 }
      )
    }

    const response = await fetch('https://api.supada.com/youtube/transcript', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPADATA_API_KEY}`,
      },
      body: JSON.stringify({
        video_id: videoId,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('SUPADATA API error:', data)
      return NextResponse.json(
        { error: data.error || 'Error al obtener la transcripción' },
        { status: response.status }
      )
    }

    if (!data.transcript) {
      return NextResponse.json(
        { error: 'No se pudo obtener la transcripción' },
        { status: 400 }
      )
    }

    return NextResponse.json({ transcript: data.transcript })
  } catch (error) {
    console.error('Transcription error:', error)
    return NextResponse.json(
      { error: 'Error al procesar la transcripción' },
      { status: 500 }
    )
  }
}
