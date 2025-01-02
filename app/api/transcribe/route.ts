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

    // Validar formato de URL de YouTube
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/
    if (!youtubeRegex.test(url)) {
      return NextResponse.json(
        { error: 'Por favor, ingresa una URL válida de YouTube' },
        { status: 400 }
      )
    }

    const videoId = extractYoutubeId(url)
    if (!videoId) {
      return NextResponse.json(
        { error: 'No se pudo extraer el ID del video' },
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

    if (!response.ok) {
      const errorText = await response.text()
      console.error('SUPADATA API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      })

      let errorMessage = 'Error al obtener la transcripción'
      try {
        const errorData = JSON.parse(errorText)
        errorMessage = errorData.error || errorMessage
      } catch {
        // Si no podemos parsear el error, usamos el mensaje por defecto
        console.error('Error parsing error response:')
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      )
    }

    const responseText = await response.text()
    let data
    try {
      data = JSON.parse(responseText)
    } catch {
      console.error('Error parsing SUPADATA response:', responseText)
      return NextResponse.json(
        { error: 'Error al procesar la respuesta del servidor' },
        { status: 500 }
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
