import { Octokit } from 'octokit';
import matter from 'gray-matter';
import { Post, PostMeta } from './types';
import { Buffer } from 'buffer';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.NEXT_PUBLIC_GITHUB_TOKEN;
const REPO_OWNER = process.env.REPO_OWNER || process.env.NEXT_PUBLIC_REPO_OWNER;
const REPO_NAME = process.env.REPO_NAME || process.env.NEXT_PUBLIC_REPO_NAME;

if (!GITHUB_TOKEN || !REPO_OWNER || !REPO_NAME) {
  console.error('GitHub configuration is missing. Please check .env.local');
}

const octokit = new Octokit({
  auth: GITHUB_TOKEN,
});

const POSTS_PATH = 'content/posts';

// Helper to encode/decode Base64 that works in both environments if possible, 
// or rely on Buffer (Node) / btoa (Browser). 
// Since we are in Next.js, Buffer is available in Node. In browser, we might need polyfill or native.
const encodeBase64 = (str: string) => {
    if (typeof window === 'undefined') {
        return Buffer.from(str).toString('base64');
    } else {
        return window.btoa(unescape(encodeURIComponent(str)));
    }
};

const decodeBase64 = (str: string) => {
    if (typeof window === 'undefined') {
        return Buffer.from(str, 'base64').toString('utf-8');
    } else {
        return decodeURIComponent(escape(window.atob(str)));
    }
};


export async function getPostList(): Promise<PostMeta[]> {
  try {
    const { data: files } = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
      owner: REPO_OWNER!,
      repo: REPO_NAME!,
      path: POSTS_PATH,
    });

    if (!Array.isArray(files)) {
      return [];
    }

    const posts = await Promise.all(
      files
        .filter((file: any) => file.name.endsWith('.md'))
        .map(async (file: any) => {
          const { data: fileData } = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
            owner: REPO_OWNER!,
            repo: REPO_NAME!,
            path: file.path,
          });

          if ('content' in fileData && fileData.content) {
            const content = decodeBase64(fileData.content);
            const { data, content: markdownContent } = matter(content);
            
            // Create a simple excerpt by removing basic markdown syntax
            const plainText = markdownContent
              .replace(/!\[.*?\]\(.*?\)/g, '') // Remove images completely
              .replace(/<[^>]*>/g, '')         // HTMLタグを削除 (例: <br>, <div>など)
              .replace(/[#*`~]/g, '')          // 基本的なMarkdown記号を削除
              .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Keep link text, remove url
              .replace(/\n+/g, ' ') // Replace newlines with spaces
              .trim();
            
            const excerpt = plainText.length > 140 
              ? plainText.slice(0, 140) + '...' 
              : plainText;

            return {
              slug: file.name.replace('.md', ''),
              title: data.title || file.name.replace('.md', ''),
              date: data.date ? new Date(data.date).toISOString().split('T')[0] : '',
              sha: file.sha,
              published: data.published,
              category: data.category,
              excerpt: excerpt,
            } as PostMeta;
          }
          return null;
        })
    );

    return posts.filter((p): p is PostMeta => p !== null).sort((a, b) => (a.date < b.date ? 1 : -1));
  } catch (error: any) {
    if (error.status === 404) return [];
    console.error('Error fetching post list:', error);
    return [];
  }
}

export async function getPostContent(slug: string): Promise<Post | null> {
  try {
    const path = `${POSTS_PATH}/${slug}.md`;
    const { data: fileData } = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
      owner: REPO_OWNER!,
      repo: REPO_NAME!,
      path: path,
    });

    if ('content' in fileData && fileData.content) {
      const rawContent = decodeBase64(fileData.content);
      const { data, content } = matter(rawContent);
      return {
        slug,
        title: data.title || '',
        date: data.date ? new Date(data.date).toISOString().split('T')[0] : '',
        content: content,
        sha: fileData.sha,
        published: data.published,
        category: data.category,
        excerpt: data.excerpt,
      };
    }
    return null;
  } catch (error: any) {
    if (error.status === 404) return null;
    console.error(`Error fetching post content for ${slug}:`, error);
    return null;
  }
}

export async function savePost(slug: string, content: string, sha?: string, frontmatter?: any): Promise<boolean> {
  try {
    const path = `${POSTS_PATH}/${slug}.md`;
    
    // Construct file content with frontmatter
    const fileContent = matter.stringify(content, frontmatter || {});
    const encodedContent = encodeBase64(fileContent);

    const params: any = {
      owner: REPO_OWNER!,
      repo: REPO_NAME!,
      path: path,
      message: `Update post: ${slug}`,
      content: encodedContent,
    };

    if (sha) {
      params.sha = sha;
    }

    await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', params);
    return true;
  } catch (error) {
    console.error('Error saving post:', error);
    throw error;
  }
}

export async function deletePost(slug: string, sha: string): Promise<boolean> {
  try {
    const path = `${POSTS_PATH}/${slug}.md`;
    await octokit.request('DELETE /repos/{owner}/{repo}/contents/{path}', {
      owner: REPO_OWNER!,
      repo: REPO_NAME!,
      path: path,
      message: `Delete post: ${slug}`,
      sha: sha,
    });
    return true;
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
}

// Comments Logic
const COMMENTS_PATH = 'content/comments';

export async function getComments(slug: string): Promise<import('./types').Comment[]> {
  try {
    const path = `${COMMENTS_PATH}/${slug}.json`;
    const { data: fileData } = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
      owner: REPO_OWNER!,
      repo: REPO_NAME!,
      path: path,
    });

    if ('content' in fileData && fileData.content) {
      const content = decodeBase64(fileData.content);
      return JSON.parse(content);
    }
    return [];
  } catch (error: any) {
    if (error.status === 404) return []; // No comments yet
    console.error(`Error fetching comments for ${slug}:`, error);
    return [];
  }
}

export async function saveComments(slug: string, comments: import('./types').Comment[]): Promise<boolean> {
  try {
    const path = `${COMMENTS_PATH}/${slug}.json`;
    
    // Get current SHA if file exists to update it
    let sha: string | undefined;
    try {
      const { data: currentFile } = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
        owner: REPO_OWNER!,
        repo: REPO_NAME!,
        path: path,
      });
      if ('sha' in currentFile) {
        sha = currentFile.sha;
      }
    } catch (e) {
      // File doesn't exist yet, that's fine
    }

    const content = JSON.stringify(comments, null, 2);
    const encodedContent = encodeBase64(content);

    const params: any = {
      owner: REPO_OWNER!,
      repo: REPO_NAME!,
      path: path,
      message: `Update comments for: ${slug}`,
      content: encodedContent,
    };

    if (sha) {
      params.sha = sha;
    }

    await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', params);
    return true;
  } catch (error) {
    console.error('Error saving comments:', error);
    throw error;
  }
}

export async function getAllComments(): Promise<import('./types').Comment[]> {
  try {
    const { data: files } = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
      owner: REPO_OWNER!,
      repo: REPO_NAME!,
      path: COMMENTS_PATH,
    });

    if (!Array.isArray(files)) return [];

    const allComments: import('./types').Comment[] = [];

    await Promise.all(
      files
        .filter((file: any) => file.name.endsWith('.json'))
        .map(async (file: any) => {
           const slug = file.name.replace('.json', '');
           const comments = await getComments(slug);
           allComments.push(...comments);
        })
    );

    return allComments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error: any) {
    if (error.status === 404) return [];
    console.error('Error fetching all comments:', error);
    return [];
  }
}
