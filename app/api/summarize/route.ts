import { NextResponse } from 'next/server'

const systemPrompt = `
You are an expert at analyzing video transcripts and providing comprehensive summaries.
Given a transcript from a YouTube video, create a detailed analysis with the following structure:

1. A concise main summary of the video content
2. Key points discussed in the video
3. Important timestamps or sections
4. Relevant topics or tags

Please output the analysis in JSON format following this structure:

{
  "summary": "Brief overview of the main content",
  "keyPoints": [
    "Point 1",
    "Point 2",
    ...
  ],
  "sections": [
    {
      "title": "Section title",
      "content": "Section content summary"
    },
    ...
  ],
  "topics": [
    "Topic 1",
    "Topic 2",
    ...
  ]
}
`

export async function POST(request: Request) {
  try {
    const { transcript } = await request.json()

    if (!transcript) {
      return NextResponse.json(
        { error: 'Transcript is required' },
        { status: 400 }
      )
    }

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: transcript }
        ],
        stream: false,
        response_format: {
          type: 'json_object'
        }
      })
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Deepseek API error:', error)
      return NextResponse.json(
        { error: 'Error generating summary' },
        { status: response.status }
      )
    }

    const data = await response.json()
    const summary = data.choices[0].message.content

    try {
      // Asegurarse de que el contenido sea un JSON válido
      const parsedSummary = JSON.parse(summary)
      return NextResponse.json(parsedSummary)
    } catch (parseError) {
      console.error('Error parsing summary JSON:', parseError)
      return NextResponse.json(
        { error: 'Error parsing summary response' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Summary error:', error)
    return NextResponse.json(
      { error: 'Error generating summary' },
      { status: 500 }
    )
  }
}
