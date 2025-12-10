import { NextResponse } from 'next/server';
import { getPostList } from '@/lib/github';

export async function GET() {
  try {
    const posts = await getPostList();
    return NextResponse.json(posts);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}
