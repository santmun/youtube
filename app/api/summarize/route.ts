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
            Genera resúmenes concisos y estructurados en formato JSON siguiendo esta estructura:
            {
              "summary": "Resumen general del contenido",
              "keyPoints": [
                "Punto clave 1",
                "Punto clave 2",
                ...
              ],
              "topics": [
                "Tema 1",
                "Tema 2",
                ...
              ]
            }`
          },
          {
            role: "user",
            content: `Analiza esta transcripción y genera un resumen estructurado con:
              1. Un resumen general conciso
              2. Los puntos clave más importantes (máximo 5)
              3. Los temas principales mencionados (máximo 3)
              
              Transcripción: ${transcript}`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        response_format: {
          type: 'json_object'
        }
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Deepseek API error:', data)
      return NextResponse.json(
        { error: data.error?.message || 'Error al generar el resumen' },
        { status: response.status }
      )
    }

    try {
      const content = data.choices[0].message.content
      const parsedContent = JSON.parse(content) as Summary
      return NextResponse.json(parsedContent)
    } catch (parseError) {
      console.error('Error parsing Deepseek response:', parseError)
      return NextResponse.json(
        { error: 'Error al procesar la respuesta del servidor' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Summary error:', error)
    return NextResponse.json(
      { error: 'Error al generar el resumen' },
      { status: 500 }
    )
  }
}
