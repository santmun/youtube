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
            content: "Eres un asistente experto en resumir y analizar contenido. Genera resúmenes concisos y estructurados."
          },
          {
            role: "user",
            content: `Por favor, analiza esta transcripción y genera un resumen estructurado con los siguientes elementos:
              1. Un resumen general conciso
              2. Los puntos clave más importantes (máximo 5)
              3. Los temas principales mencionados (máximo 3)
              
              Transcripción: ${transcript}`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
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
      
      // Si no podemos parsear la respuesta como JSON, intentamos estructurarla
      const content = data.choices[0].message.content
      const keyPointMatches = content.match(/(?<=•|\*)\s*([^\n]+)/g) || []
      const topicMatches = content.match(/(?<=Temas:|Topics:)\s*([^\n]+)/g)?.[0]?.split(',') || []
      
      const summary: Summary = {
        summary: content.split('\n\n')[0] || '',
        keyPoints: keyPointMatches.map((point: string) => point.trim()),
        topics: topicMatches.map((topic: string) => topic.trim())
      }
      
      return NextResponse.json(summary)
    }
  } catch (error) {
    console.error('Summary error:', error)
    return NextResponse.json(
      { error: 'Error al generar el resumen' },
      { status: 500 }
    )
  }
}
