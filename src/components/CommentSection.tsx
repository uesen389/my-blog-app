'use client';

import { useState, useEffect } from 'react';
import { Comment } from '@/lib/types';
import { Send, User } from 'lucide-react';

export function CommentSection({ slug }: { slug: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [slug]);

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/comments?slug=${slug}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (error) {
      console.error('Failed to fetch comments', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !content.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postSlug: slug, author, content }),
      });

      if (res.ok) {
        const newComment = await res.json();
        setComments([...comments, newComment]);
        setContent(''); // Clear content but keep author
        alert('コメントを送信しました');
      } else {
        alert('送信に失敗しました');
      }
    } catch (error) {
      console.error(error);
      alert('エラーが発生しました');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-12 pt-8 border-t border-gray-200">
      <h3 className="text-xl font-bold mb-6">コメント</h3>

      {/* Post Form */}
      <form onSubmit={handleSubmit} className="mb-10 bg-gray-50 p-6 rounded-lg">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">お名前</label>
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-black focus:outline-none"
            placeholder="名無しさん"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">コメント</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-black focus:outline-none h-24"
            placeholder="記事の感想などをどうぞ"
            required
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="bg-black text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-gray-800 disabled:opacity-50 transition-colors"
        >
          <Send size={16} />
          {submitting ? '送信中...' : 'コメントする'}
        </button>
      </form>

      {/* Comment List */}
      <div className="space-y-6">
        {loading ? (
          <p className="text-gray-500">読み込み中...</p>
        ) : comments.length === 0 ? (
          <p className="text-gray-500 text-sm">まだコメントはありません。</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="bg-white border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                  <User size={16} />
                </div>
                <div>
                  <div className="font-bold text-sm">{comment.author}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(comment.date).toLocaleString()}
                  </div>
                </div>
              </div>
              <p className="text-gray-800 text-sm whitespace-pre-wrap">{comment.content}</p>
              
              {/* Admin Reply */}
              {comment.reply && (
                <div className="mt-3 ml-4 pl-4 border-l-2 border-gray-300 bg-gray-50 p-3 rounded">
                  <div className="text-xs font-bold text-gray-600 mb-1">管理者より</div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.reply}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
