import { getPostList, getSettings } from '@/lib/github';
import Link from 'next/link';
import { BlogList } from '@/components/BlogList';

export default async function BlogPage() {
  const posts = await getPostList();
  const settings = await getSettings();

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

      {/* Main Content (Client Component for filtering) */}
      <BlogList posts={posts} settings={settings} />
    </div>
  );
}