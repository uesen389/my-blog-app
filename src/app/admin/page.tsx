'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getPostList, deletePost } from '@/lib/github';
import { PostMeta } from '@/lib/types';
import { Plus, Edit, Trash2, ExternalLink, MessageSquare } from 'lucide-react';

export default function AdminPage() {
  const [posts, setPosts] = useState<PostMeta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    const data = await getPostList();
    setPosts(data);
    setLoading(false);
  };

  const handleDelete = async (slug: string, sha?: string) => {
    if (!sha) return;
    if (!confirm('本当に削除しますか？')) return;

    try {
      await deletePost(slug, sha);
      loadPosts(); // Reload
    } catch (error) {
      alert('削除に失敗しました');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">記事管理</h1>
          <div className="flex gap-2">
            <Link
              href="/admin/comments"
              className="flex items-center gap-2 bg-white text-black border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors"
            >
              <MessageSquare size={20} />
              コメント管理
            </Link>
            <Link
              href="/admin/edit/new"
              className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors"
            >
              <Plus size={20} />
              新規作成
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10">読み込み中...</div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="p-4 font-semibold text-gray-600">タイトル</th>
                  <th className="p-4 font-semibold text-gray-600">日付</th>
                  <th className="p-4 font-semibold text-gray-600">ステータス</th>
                  <th className="p-4 font-semibold text-gray-600 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {posts.map((post) => (
                  <tr key={post.slug} className="hover:bg-gray-50">
                    <td className="p-4">
                      <div className="font-medium text-gray-900">{post.title}</div>
                      <div className="text-sm text-gray-500">{post.slug}</div>
                    </td>
                    <td className="p-4 text-gray-600">{post.date}</td>
                    <td className="p-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs rounded-full ${
                          post.published
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {post.published ? '公開' : '下書き'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          className="p-2 text-gray-400 hover:text-gray-600"
                          title="プレビュー"
                        >
                          <ExternalLink size={18} />
                        </Link>
                        <Link
                          href={`/admin/edit/${post.slug}`}
                          className="p-2 text-blue-600 hover:text-blue-800"
                          title="編集"
                        >
                          <Edit size={18} />
                        </Link>
                        <button
                          onClick={() => handleDelete(post.slug, post.sha)}
                          className="p-2 text-red-600 hover:text-red-800"
                          title="削除"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {posts.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-500">
                      記事がありません
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
