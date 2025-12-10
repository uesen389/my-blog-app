import { NextResponse } from 'next/server';
import { getComments, saveComments } from '@/lib/github';
import { Comment } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { postSlug, author, content } = body;

    if (!postSlug || !author || !content) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const currentComments = await getComments(postSlug);
    
    const newComment: Comment = {
      id: Date.now().toString(),
      postSlug,
      author,
      content,
      date: new Date().toISOString(),
      isRead: false,
    };

    const updatedComments = [...currentComments, newComment];
    await saveComments(postSlug, updatedComments);

    return NextResponse.json(newComment);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to save comment' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');

  if (!slug) {
    return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
  }

  const comments = await getComments(slug);
  return NextResponse.json(comments);
}
