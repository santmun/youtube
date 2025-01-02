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

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 segundos de timeout

    try {
      const response = await fetch(`https://api.supadata.ai/v1/youtube/transcript?url=${encodeURIComponent(url)}&text=true`, {
        method: 'GET',
        headers: {
          'x-api-key': `${process.env.SUPADATA_API_KEY}`,
        },
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      let errorText = ''
      try {
        errorText = await response.text()
      } catch {
        errorText = 'Error desconocido'
      }

      if (!response.ok) {
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
          console.error('Error parsing error response')
        }

        return NextResponse.json(
          { error: errorMessage },
          { status: response.status }
        )
      }

      let data
      try {
        data = JSON.parse(errorText)
      } catch {
        console.error('Error parsing SUPADATA response:', errorText)
        return NextResponse.json(
          { error: 'Error al procesar la respuesta del servidor' },
          { status: 500 }
        )
      }

      if (!data.content) {
        return NextResponse.json(
          { error: 'No se pudo obtener la transcripción' },
          { status: 400 }
        )
      }

      return NextResponse.json({ transcript: data.content })
    } catch (fetchError) {
      clearTimeout(timeoutId)
      if (fetchError.name === 'AbortError') {
        return NextResponse.json(
          { error: 'La solicitud tomó demasiado tiempo. Por favor, intenta de nuevo.' },
          { status: 504 }
        )
      }
      throw fetchError
    }
  } catch (error) {
    console.error('Transcription error:', error)
    return NextResponse.json(
      { error: 'Error al procesar la transcripción' },
      { status: 500 }
    )
  }
}
