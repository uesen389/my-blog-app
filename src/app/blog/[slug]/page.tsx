import { getPostContent, getPostList, getSettings } from '@/lib/github';
import Link from 'next/link';
import { Calendar, Tag, ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  const posts = await getPostList();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const post = await getPostContent(resolvedParams.slug);
  const settings = await getSettings();

  if (!post) {
    notFound();
  }

  // Fetch for Sidebar & Navigation
  const allPosts = await getPostList();
  
  // Find current post index for navigation
  // allPosts is sorted by date desc (newest first)
  const currentIndex = allPosts.findIndex(p => p.slug === resolvedParams.slug);
  const nextPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null; // Newer post
  const prevPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null; // Older post

  const categories = Array.from(new Set(allPosts.map(p => p.category).filter(Boolean))) as string[];
  
  const desiredOrder = ['合気道', '技術', 'ラーメン', 'ガジェット', '地理', '日常'];
  const uniqueCategories = Array.from(new Set(allPosts.map(p => p.category).filter(Boolean))) as string[];
  const sortedCategories = desiredOrder.filter(cat => uniqueCategories.includes(cat));
  const otherCategories = uniqueCategories.filter(cat => !desiredOrder.includes(cat)).sort();
  const allDisplayCategories = [...sortedCategories, ...otherCategories]; // For menu bar and sidebar

  const categoryCounts = allDisplayCategories.reduce((acc, cat) => {
    acc[cat] = allPosts.filter(p => p.category === cat).length;
    return acc;
  }, {} as Record<string, number>);

  // Archive logic
  const archives = allPosts.reduce((acc, p) => {
    if (!p.date) return acc;
    const yearMonth = p.date.substring(0, 7);
    acc[yearMonth] = (acc[yearMonth] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const sortedArchives = Object.entries(archives).sort(([a], [b]) => b.localeCompare(a));

  const formatArchiveDate = (ym: string) => {
    const [y, m] = ym.split('-');
    return `${y}年${parseInt(m)}月`;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="w-full py-8 md:py-12 px-4">
        <div className="max-w-[1200px] mx-auto">
          <Link href="/blog" className="text-3xl md:text-4xl font-bold mb-3 block">
            {settings.blogTitle}
          </Link>
          <p className="text-gray-700 whitespace-pre-wrap">
             {settings.blogDescription}
          </p>
        </div>
      </header>

      {/* Navigation Bar */}
      <nav className="w-full border-t border-b border-black bg-blue-50">
        <div className="max-w-[1200px] mx-auto px-4">
          <ul className="flex flex-wrap gap-8 py-4 text-sm md:text-base font-medium">
            <li>
              <Link 
                href="/blog" 
                className="text-gray-600 transition-colors hover:text-red-600"
              >
                すべて
              </Link>
            </li>
            {allDisplayCategories.map((cat) => (
              <li key={cat}>
                <Link 
                  href={`/blog?category=${cat}`}
                  className={`transition-colors hover:text-red-600 ${post.category === cat ? 'text-black' : 'text-gray-600'}`}
                >
                  {cat}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Main Content */}
          <main className="w-full lg:flex-[2]">
            <article>
              <div className="mb-6">
                 <Link href="/blog" className="inline-flex items-center text-sm text-gray-500 hover:text-black mb-4">
                   <ArrowLeft size={16} className="mr-1" /> Back to list
                 </Link>
                 <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <time>{post.date}</time>
                    </div>
                    {post.category && (
                      <Link href={`/blog?category=${post.category}`} className="flex items-center gap-1 text-blue-600 hover:underline">
                        <Tag size={14} />
                        <span>{post.category}</span>
                      </Link>
                    )}
                 </div>
                 <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                   {post.title}
                 </h1>
              </div>

              <div className="prose prose-lg max-w-none text-gray-800 border-b pb-8 mb-8">
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{post.content}</ReactMarkdown>
              </div>

              {/* Bottom Category Link */}
              {post.category && (
                <div className="mb-8">
                  <span className="font-bold mr-2">カテゴリ:</span>
                  <Link href={`/blog?category=${post.category}`} className="text-blue-600 hover:underline">
                    {post.category}
                  </Link>
                </div>
              )}

              {/* Prev/Next Navigation */}
              <div className="flex justify-between items-center py-4 border-t border-b border-gray-100">
                <div className="w-1/2 pr-4">
                  {prevPost ? (
                    <Link href={`/blog/${prevPost.slug}`} className="block group">
                      <span className="text-lg text-gray-500 mb-1 block">« 前の記事</span>
                      <span className="text-base font-medium group-hover:text-blue-600 line-clamp-2">
                        {prevPost.title}
                      </span>
                    </Link>
                  ) : (
                    <div className="text-gray-300 cursor-not-allowed">
                      <span className="text-lg mb-1 block">« 前の記事</span>
                      <span className="text-base font-medium">なし</span>
                    </div>
                  )}
                </div>
                <div className="w-1/2 pl-4 text-right border-l border-gray-100">
                  {nextPost ? (
                    <Link href={`/blog/${nextPost.slug}`} className="block group">
                      <span className="text-lg text-gray-500 mb-1 block">次の記事 »</span>
                      <span className="text-base font-medium group-hover:text-blue-600 line-clamp-2">
                        {nextPost.title}
                      </span>
                    </Link>
                  ) : (
                    <div className="text-gray-300 cursor-not-allowed">
                      <span className="text-lg mb-1 block">次の記事 »</span>
                      <span className="text-base font-medium">なし</span>
                    </div>
                  )}
                </div>
              </div>

            </article>
          </main>

          {/* Sidebar */}
          <aside className="w-full lg:flex-[1] space-y-8">
            {/* Profile */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-bold text-lg mb-4 border-b pb-2">Profile</h3>
              <div className="flex items-center gap-4 mb-4">
                 <div className="w-16 h-16 rounded-full flex-shrink-0 overflow-hidden">
                   <img src="/my-blog-app/images/aikkkiii_cirkle_k_60.jpg" alt="Profile" className="w-full h-full object-cover" />
                 </div>
                 <div>
                   <div className="font-bold">{settings.profileName}</div>
                 </div>
              </div>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">
                {settings.profileDescription}
              </p>
            </div>

            {/* Recent Posts */}
            <div>
              <h3 className="font-bold text-lg mb-4 border-b pb-2">Recent Posts</h3>
              <ul className="space-y-3">
                {allPosts.slice(0, 5).map((p) => (
                  <li key={p.slug}>
                    <Link href={`/blog/${p.slug}`} className="block group">
                      <span className="text-sm text-gray-600 group-hover:text-black line-clamp-2">
                        {p.title}
                      </span>
                      <span className="text-xs text-gray-400 block mt-1">{p.date}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h3 className="font-bold text-lg mb-4 border-b pb-2">Categories</h3>
              <ul className="space-y-2">
                {Object.entries(categoryCounts).map(([cat, count]) => (
                   <li key={cat}>
                    <Link href={`/blog?category=${cat}`} className="flex justify-between items-center text-gray-600 hover:text-black">
                      <span>{cat}</span>
                      <span className="bg-gray-100 text-xs px-2 py-1 rounded-full">{count}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Archive */}
            <div>
              <h3 className="font-bold text-lg mb-4 border-b pb-2">Archive</h3>
              <ul className="space-y-2">
                {sortedArchives.map(([ym, count]: [string, number]) => (
                  <li key={ym}>
                    <Link 
                      href={`/blog?archive=${ym}`} 
                      className="flex justify-between items-center text-gray-600 hover:text-black"
                    >
                      <span>{formatArchiveDate(ym)}</span>
                      <span className="bg-gray-100 text-xs px-2 py-1 rounded-full">{count}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}