import { NextResponse } from 'next/server'

interface Summary {
  summary: string
  keyPoints: string[]
  topics: string[]
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { transcript } = body

    if (!transcript) {
      return NextResponse.json(
        { error: 'Transcript is required' },
        { status: 400 }
      )
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 60000) // 60 segundos de timeout

    try {
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content: `Eres un asistente experto en resumir y analizar contenido. 
              IMPORTANTE: Debes responder ÚNICAMENTE con un objeto JSON sin ningún texto adicional.
              El objeto JSON debe seguir esta estructura exacta:
              {
                "summary": "Breve resumen del contenido",
                "keyPoints": ["Punto clave 1", "Punto clave 2"],
                "topics": ["Tema 1", "Tema 2"]
              }`
            },
            {
              role: "user",
              content: `Resume la siguiente transcripción. RESPONDE ÚNICAMENTE CON UN OBJETO JSON que contenga:
                - "summary": Un resumen general conciso
                - "keyPoints": Lista de máximo 5 puntos clave
                - "topics": Lista de máximo 3 temas principales
                
                Transcripción: ${transcript}`
            }
          ],
          temperature: 0.3,
          max_tokens: 4000,
          response_format: {
            type: 'json_object'
          }
        }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      const data = await response.json()

      if (!response.ok) {
        console.error('Deepseek API error:', data)
        return NextResponse.json(
          { error: data.error?.message || 'Error al generar el resumen' },
          { status: response.status }
        )
      }

      const content = data.choices[0].message.content
      try {
        // Asegurarnos de que no hay caracteres extra antes o después del JSON
        const jsonStr = content.trim()
        const parsedContent = JSON.parse(jsonStr) as Summary
        return NextResponse.json(parsedContent)
      } catch (parseError) {
        console.error('Error parsing Deepseek response:', parseError, content)
        return NextResponse.json(
          { error: 'Error al procesar la respuesta del servidor' },
          { status: 500 }
        )
      }
    } catch (fetchError) {
      clearTimeout(timeoutId)
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return NextResponse.json(
          { error: 'La generación del resumen tomó demasiado tiempo. Por favor, intenta de nuevo.' },
          { status: 504 }
        )
      }
      throw fetchError
    }
  } catch (error) {
    console.error('Summary error:', error)
    return NextResponse.json(
      { error: 'Error al generar el resumen' },
      { status: 500 }
    )
  }
}
