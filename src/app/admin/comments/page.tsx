'use client';

import { useEffect, useState } from 'react';
import { getAllComments } from '@/lib/github';
import { Comment } from '@/lib/types';
import Link from 'next/link';
import { ArrowLeft, MessageSquare } from 'lucide-react';

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadComments();
  }, []);

  const loadComments = async () => {
    const data = await getAllComments();
    setComments(data);
    setLoading(false);
  };

  const unreadCount = comments.filter(c => !c.isRead).length;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin" className="text-gray-500 hover:text-gray-800">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">コメント管理</h1>
        </div>

        <div className="bg-white p-6 rounded-lg shadow mb-6 flex items-center gap-4">
           <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
             <MessageSquare size={24} />
           </div>
           <div>
             <div className="text-sm text-gray-500">未読コメント</div>
             <div className="text-2xl font-bold">{unreadCount} 件</div>
           </div>
        </div>

        <div className="space-y-4">
          {loading ? (
             <div className="text-center py-10">読み込み中...</div>
          ) : comments.length === 0 ? (
             <div className="text-center text-gray-500">コメントはありません</div>
          ) : (
             comments.map(comment => (
               <Link 
                 key={comment.id} 
                 href={`/admin/comments/${comment.postSlug}`}
                 className={`block bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow border-l-4 ${comment.isRead ? 'border-transparent' : 'border-blue-500'}`}
               >
                 <div className="flex justify-between items-start mb-2">
                   <div>
                     <span className="font-bold text-gray-900 mr-2">{comment.author}</span>
                     <span className="text-xs text-gray-400">{new Date(comment.date).toLocaleString()}</span>
                   </div>
                   {!comment.isRead && (
                     <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">New</span>
                   )}
                 </div>
                 <p className="text-gray-600 text-sm line-clamp-2 mb-2">{comment.content}</p>
                 <div className="text-xs text-gray-400">
                   記事: {comment.postSlug}
                 </div>
               </Link>
             ))
          )}
        </div>
      </div>
    </div>
  );
}
