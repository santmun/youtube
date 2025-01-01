import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  if (!process.env.SUPADATA_API_KEY) {
    console.error('SUPADATA_API_KEY is not defined')
    return NextResponse.json(
      { error: 'API key configuration error' },
      { status: 500 }
    )
  }

  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    console.log('Processing URL:', url)
    console.log('Using API Key:', process.env.SUPADATA_API_KEY.slice(0, 10) + '...')

    const apiUrl = new URL('https://api.supadata.ai/v1/youtube/transcript')
    apiUrl.searchParams.append('url', url)
    apiUrl.searchParams.append('text', 'true')

    console.log('Requesting:', apiUrl.toString())

    const response = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: {
        'x-api-key': process.env.SUPADATA_API_KEY,
        'Accept': 'application/json',
      },
    })

    console.log('Response status:', response.status)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
      console.error('API Error:', errorData)
      return NextResponse.json(
        { error: errorData.message || 'Failed to transcribe video' },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('Success! Received data:', typeof data)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Transcription error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
