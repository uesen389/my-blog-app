import { getPostList } from '@/lib/github';
import Link from 'next/link';
import { BlogList } from '@/components/BlogList';

export default async function BlogPage() {
  const posts = await getPostList();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="w-full py-8 md:py-12 px-4">
        <div className="max-w-[1200px] mx-auto">
          <Link href="/blog" className="text-3xl md:text-4xl font-bold mb-3 block">
            Kouryuの記録帳
          </Link>
          <p className="text-gray-700">
            思考の発散場所。合気道、日々の生活での気づき、その他ガジェット関係など。
          </p>
        </div>
      </header>

      {/* Main Content (Client Component for filtering) */}
      <BlogList posts={posts} />
    </div>
  );
}
