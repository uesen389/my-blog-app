'use client';

import Link from 'next/link';
import { PostMeta, BlogSettings } from '@/lib/types';
import { Calendar, Tag } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';

type BlogListProps = {
  posts: PostMeta[];
  settings: BlogSettings;
};

function BlogListContent({ posts, settings }: BlogListProps) {
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get('category');
  const selectedArchive = searchParams.get('archive');

  // Helper to format YYYY-MM to Japanese
  const formatArchiveDate = (ym: string) => {
    const [y, m] = ym.split('-');
    return `${y}年${parseInt(m)}月`;
  };

  // Update document title for client-side navigation
  useEffect(() => {
    if (selectedCategory) {
      document.title = `${selectedCategory} | ${settings.blogTitle}`;
    } else if (selectedArchive) {
      document.title = `${formatArchiveDate(selectedArchive)} | ${settings.blogTitle}`;
    } else {
      document.title = settings.blogTitle;
    }
  }, [selectedCategory, selectedArchive, settings.blogTitle]);

  // Filter published posts for Sidebar and Menu
  const publishedPosts = posts.filter(p => p.published);

  // Extract categories
  const desiredOrder = ['合気道', '技術', 'ラーメン', 'ガジェット', '地理', '日常'];
  const uniqueCategories = Array.from(new Set(publishedPosts.map(p => p.category).filter(Boolean))) as string[];
  const sortedCategories = desiredOrder.filter(cat => uniqueCategories.includes(cat));
  const otherCategories = uniqueCategories.filter(cat => !desiredOrder.includes(cat)).sort();
  const categories = [...sortedCategories, ...otherCategories];

  const categoryCounts = categories.reduce((acc, cat) => {
    acc[cat] = publishedPosts.filter(p => p.category === cat).length;
    return acc;
  }, {} as Record<string, number>);

  // Extract archives (YYYY-MM)
  const archives = publishedPosts.reduce((acc, post) => {
    if (!post.date) return acc;
    const yearMonth = post.date.substring(0, 7); // YYYY-MM
    acc[yearMonth] = (acc[yearMonth] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedArchives = Object.entries(archives).sort(([a], [b]) => b.localeCompare(a)) as [string, number][];

  // Helper to format YYYY-MM to Japanese
  const formatArchiveDate = (ym: string) => {
    const [y, m] = ym.split('-');
    return `${y}年${parseInt(m)}月`;
  };

  // Filter posts for Main Content
  let filteredPosts = publishedPosts;
  
  if (selectedCategory) {
    filteredPosts = filteredPosts.filter(p => p.category === selectedCategory);
  } else if (selectedArchive) {
    filteredPosts = filteredPosts.filter(p => p.date.startsWith(selectedArchive));
  }

  return (
    <>
      {/* Navigation Bar (Moved here because it relies on categories) */}
      <nav className="w-full border-t border-b border-black bg-blue-50">
        <div className="max-w-[1200px] mx-auto px-4">
          <ul className="flex flex-wrap gap-8 py-4 text-sm md:text-base font-medium">
            <li>
              <Link 
                href="/blog" 
                className={`transition-colors hover:text-red-600 ${!selectedCategory ? 'text-black' : 'text-gray-600'}`}
              >
                すべて
              </Link>
            </li>
            {categories.map((cat) => (
              <li key={cat}>
                <Link 
                  href={`/blog?category=${cat}`}
                  className={`transition-colors hover:text-red-600 ${selectedCategory === cat ? 'text-black' : 'text-gray-600'}`}
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
          
          {/* Post List */}
          <main className="w-full lg:flex-[2] space-y-8">
            {(selectedCategory || selectedArchive) && (
              <div className="mb-6 flex items-center justify-between">
                 <h2 className="text-xl font-bold">
                   {selectedCategory ? `カテゴリー: ${selectedCategory}` : `アーカイブ: ${formatArchiveDate(selectedArchive!)}`}
                 </h2>
                 <Link href="/blog" className="text-sm text-gray-500 hover:text-black">全て表示</Link>
              </div>
            )}

            {filteredPosts.map((post) => (
              <article key={post.slug} className="border-b border-gray-200 pb-8 last:border-0">
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <time>{post.date}</time>
                  </div>
                  {post.category && (
                    <Link 
                      href={`/blog?category=${post.category}`}
                      className="flex items-center gap-1 text-blue-600 hover:underline"
                    >
                      <Tag size={14} />
                      <span>{post.category}</span>
                    </Link>
                  )}
                </div>
                
                <Link href={`/blog/${post.slug}`} className="group">
                  <h2 className="text-2xl font-bold mb-3 group-hover:text-gray-600 transition-colors">
                    {post.title}
                  </h2>
                </Link>
                
                <p className="text-gray-600 line-clamp-3 mb-4">
                   {post.excerpt || '記事を読む...'}
                </p>
                
                <Link 
                  href={`/blog/${post.slug}`}
                  className="inline-block text-black font-medium border-b border-black pb-0.5 hover:opacity-70 transition-opacity"
                >
                  READ MORE
                </Link>
              </article>
            ))}
            
            {filteredPosts.length === 0 && (
               <p>記事がありません。</p>
            )}
          </main>

          {/* Sidebar */}
          <aside className="w-full lg:flex-[1] space-y-8">
            {/* Profile */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-bold text-lg mb-4 border-b pb-2">Profile</h3>
              <div className="flex items-center gap-4 mb-4">
                 <div className="w-16 h-16 rounded-full flex-shrink-0 overflow-hidden">
                   <img src="/images/aikkkiii_cirkle_k_60.jpg" alt="Profile" className="w-full h-full object-cover" />
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
                {publishedPosts.slice(0, 5).map((post) => (
                  <li key={post.slug}>
                    <Link href={`/blog/${post.slug}`} className="block group">
                      <span className="text-sm text-gray-600 group-hover:text-black line-clamp-2">
                        {post.title}
                      </span>
                      <span className="text-xs text-gray-400 block mt-1">{post.date}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h3 className="font-bold text-lg mb-4 border-b pb-2">Categories</h3>
              <ul className="space-y-2">
                {/* Show "All" link */}
                <li>
                    <Link href="/blog" className={`flex justify-between items-center hover:text-black ${!selectedCategory && !selectedArchive ? 'font-bold text-black' : 'text-gray-600'}`}>
                      <span>すべて</span>
                      <span className="bg-gray-100 text-xs px-2 py-1 rounded-full">{posts.filter(p => p.published).length}</span>
                    </Link>
                </li>
                {Object.entries(categoryCounts).map(([cat, count]) => (
                  <li key={cat}>
                    <Link 
                      href={`/blog?category=${cat}`} 
                      className={`flex justify-between items-center hover:text-black ${selectedCategory === cat ? 'font-bold text-black' : 'text-gray-600'}`}
                    >
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
                      className={`flex justify-between items-center hover:text-black ${selectedArchive === ym ? 'font-bold text-black' : 'text-gray-600'}`}
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
    </>
  );
}

export function BlogList(props: BlogListProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BlogListContent {...props} />
    </Suspense>
  );
}
