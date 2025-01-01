import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Crear el cliente de Supabase para cada petición
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: Request) {
  try {
    const { url, transcript, summary } = await request.json()

    if (!url || !transcript || !summary) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('video_summaries')
      .insert([
        {
          url,
          transcript,
          summary: JSON.stringify(summary),
          created_at: new Date().toISOString(),
        }
      ])
      .select()

    if (error) {
      console.error('Error saving to Supabase:', error)
      return NextResponse.json(
        { error: 'Error saving result' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Save error:', error)
    return NextResponse.json(
      { error: 'Error saving result' },
      { status: 500 }
    )
  }
}
