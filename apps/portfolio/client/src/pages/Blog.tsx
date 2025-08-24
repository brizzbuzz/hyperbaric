import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

interface BlogPost {
  title: string;
  date: string;
  component: React.ComponentType;
}

const blogPosts: Record<string, () => Promise<{ default: React.ComponentType; frontmatter?: any }>> = {
  'hello-world': () => import('../blog/hello-world.mdx'),
};

export default function Blog() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPost() {
      if (!slug) {
        setError('No blog post specified');
        setLoading(false);
        return;
      }

      const postLoader = blogPosts[slug];
      if (!postLoader) {
        setError(`Blog post "${slug}" not found`);
        setLoading(false);
        return;
      }

      try {
        const module = await postLoader();
        const Component = module.default;
        const frontmatter = module.frontmatter || {};

        setPost({
          title: frontmatter.title || 'Untitled Post',
          date: frontmatter.date || new Date().toISOString().split('T')[0],
          component: Component,
        });
      } catch (err) {
        setError(`Failed to load blog post: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    }

    loadPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading blog post...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error">
          <h2>Error</h2>
          <p>{error}</p>
          <p>
            <a href="/">← Back to Home</a>
          </p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container">
        <div className="error">
          <h2>Post Not Found</h2>
          <p>The requested blog post could not be found.</p>
          <p>
            <a href="/">← Back to Home</a>
          </p>
        </div>
      </div>
    );
  }

  const PostComponent = post.component;

  return (
    <div className="container">
      <article className="prose">
        <header style={{ marginBottom: 'var(--ui-spacing-6, 1.5rem)' }}>
          <h1>{post.title}</h1>
          <p style={{
            color: 'var(--ui-color-text-secondary, #4a4a4a)',
            fontSize: '0.875rem',
            marginBottom: 0
          }}>
            Published on {new Date(post.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </header>
        <PostComponent />
      </article>
    </div>
  );
}
