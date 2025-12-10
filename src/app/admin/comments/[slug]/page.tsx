'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getComments, saveComments } from '@/lib/github';
import { Comment } from '@/lib/types';
import Link from 'next/link';
import { ArrowLeft, Check, Reply } from 'lucide-react';

export default function AdminCommentDetail() {
  const { slug } = useParams();
  const slugStr = Array.isArray(slug) ? slug[0] : slug;
  
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState<Record<string, string>>({});

  useEffect(() => {
    if (slugStr) loadComments(slugStr);
  }, [slugStr]);

  const loadComments = async (s: string) => {
    const data = await getComments(s);
    setComments(data);
    setLoading(false);
  };

  const handleMarkAsRead = async (commentId: string) => {
    if (!slugStr) return;
    const updated = comments.map(c => 
      c.id === commentId ? { ...c, isRead: true } : c
    );
    await saveComments(slugStr, updated);
    setComments(updated);
  };

  const handleReply = async (commentId: string) => {
    if (!slugStr) return;
    const reply = replyText[commentId];
    if (!reply) return;

    const updated = comments.map(c => 
      c.id === commentId ? { ...c, reply: reply, isRead: true } : c
    );
    
    await saveComments(slugStr, updated);
    setComments(updated);
    alert('返信を保存しました');
  };

  if (loading) return <div className="p-8 text-center">読み込み中...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin/comments" className="text-gray-500 hover:text-gray-800">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">コメント返信: {slugStr}</h1>
        </div>

        <div className="space-y-6">
          {comments.length === 0 ? (
             <p>コメントはありません</p>
          ) : (
             comments.map(comment => (
               <div key={comment.id} className={`bg-white p-6 rounded-lg shadow border-l-4 ${comment.isRead ? 'border-gray-200' : 'border-blue-500'}`}>
                 <div className="flex justify-between items-start mb-4">
                   <div>
                     <div className="font-bold text-lg">{comment.author}</div>
                     <div className="text-sm text-gray-500">{new Date(comment.date).toLocaleString()}</div>
                   </div>
                   {!comment.isRead && (
                     <button 
                       onClick={() => handleMarkAsRead(comment.id)}
                       className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded-full flex items-center gap-1 hover:bg-blue-100"
                     >
                       <Check size={14} /> 既読にする
                     </button>
                   )}
                 </div>
                 
                 <p className="text-gray-800 mb-6 bg-gray-50 p-4 rounded">{comment.content}</p>

                 <div className="border-t pt-4">
                   <div className="font-bold text-sm text-gray-600 mb-2 flex items-center gap-2">
                     <Reply size={16} /> 管理者返信
                   </div>
                   <textarea
                     value={comment.reply || replyText[comment.id] || ''}
                     onChange={(e) => setReplyText(prev => ({ ...prev, [comment.id]: e.target.value }))}
                     className="w-full p-2 border rounded focus:ring-2 focus:ring-black focus:outline-none mb-2"
                     placeholder="返信を入力..."
                     rows={3}
                   />
                   <div className="text-right">
                     <button
                       onClick={() => handleReply(comment.id)}
                       className="bg-black text-white px-4 py-2 rounded text-sm hover:bg-gray-800"
                     >
                       返信を保存
                     </button>
                   </div>
                 </div>
               </div>
             ))
          )}
        </div>
      </div>
    </div>
  );
}
