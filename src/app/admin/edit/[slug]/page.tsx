'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getPostContent, savePost } from '@/lib/github';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import Link from 'next/link';

export default function EditPage() {
  const { slug: slugParam } = useParams();
  const router = useRouter();
  
  const isNew = slugParam === 'new';
  // slugParam can be string or string[], ensure string
  const slugStr = Array.isArray(slugParam) ? slugParam[0] : slugParam;
  
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [published, setPublished] = useState(false);
  const [category, setCategory] = useState('');
  const [sha, setSha] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!isNew && slugStr) {
      loadPost(slugStr);
    }
  }, [slugStr, isNew]);

  const loadPost = async (s: string) => {
    setLoading(true);
    const post = await getPostContent(s);
    if (post) {
      setTitle(post.title);
      setSlug(post.slug);
      setContent(post.content);
      setDate(post.date);
      setPublished(post.published || false);
      setCategory(post.category || '');
      setSha(post.sha);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!slug || !title) {
      alert('タイトルとスラッグは必須です');
      return;
    }

    setSaving(true);
    try {
      const frontmatter = {
        title,
        date,
        published,
        category,
      };
      
      await savePost(slug, content, sha, frontmatter);
      alert('保存しました');
      if (isNew) {
        router.push(`/admin/edit/${slug}`);
      } else {
        // Reload to get new SHA if needed, but simpler to just stay or refresh
        loadPost(slug);
      }
    } catch (error) {
      console.error(error);
      alert('保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">読み込み中...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-gray-500 hover:text-gray-800">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-xl font-bold text-gray-800">{isNew ? '新規作成' : '記事編集'}</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            <Save size={18} />
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Settings Sidebar */}
        <aside className="w-64 bg-white border-r overflow-y-auto p-4 space-y-6 hidden lg:block">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">タイトル</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-black focus:outline-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">スラッグ (URL)</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              disabled={!isNew}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-black focus:outline-none disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">カテゴリ</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-black focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">日付</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-black focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="published"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
            />
            <label htmlFor="published" className="text-sm font-medium text-gray-700">
              公開する
            </label>
          </div>
        </aside>

        {/* Editor & Preview */}
        <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Markdown Input */}
          <div className="flex-1 flex flex-col border-r">
            <div className="bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-500 border-b">MARKDOWN</div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="flex-1 w-full p-4 resize-none focus:outline-none font-mono text-sm"
              placeholder="# 本文をここに書く..."
            />
          </div>

          {/* Preview */}
          <div className="flex-1 flex flex-col bg-white">
             <div className="bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-500 border-b flex items-center gap-2">
               <Eye size={14} /> PREVIEW
             </div>
             <div className="flex-1 overflow-y-auto p-8 prose prose-sm max-w-none">
               <h1>{title}</h1>
               <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{content}</ReactMarkdown>
             </div>
          </div>
        </main>
      </div>
    </div>
  );
}
