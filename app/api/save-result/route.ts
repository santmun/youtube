import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { url, transcript, summary } = await request.json()

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
