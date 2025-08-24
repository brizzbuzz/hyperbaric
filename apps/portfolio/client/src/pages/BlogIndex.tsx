import { Link } from "react-router-dom";

interface BlogPostMeta {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags?: string[];
}

const blogPosts: BlogPostMeta[] = [
  {
    slug: "hello-world",
    title: "Hello World - My First MDX Post",
    date: "2024-01-15",
    description: "Welcome to my blog! This is my first post using MDX, demonstrating how to combine Markdown with React components for rich, interactive content.",
    tags: ["mdx", "react", "vite", "blogging"]
  }
];

export default function BlogIndex() {
  return (
    <div className="container">
      <div className="prose">
        <h1>Blog</h1>

        <p>
          Welcome to my blog! Here I write about web development, technology,
          and share insights from my coding journey. All posts are written in
          MDX, allowing for interactive components and rich content.
        </p>

        <div className="blog-posts">
          {blogPosts.map((post) => (
            <article
              key={post.slug}
              style={{
                padding: "var(--ui-spacing-4, 1rem)",
                border: "1px solid var(--ui-color-border, #e5e7eb)",
                borderRadius: "0.5rem",
                margin: "var(--ui-spacing-4, 1rem) 0",
                backgroundColor: "var(--ui-color-background, #ffffff)",
              }}
            >
              <h2 style={{ marginTop: 0, marginBottom: "0.5rem" }}>
                <Link
                  to={`/blog/${post.slug}`}
                  style={{
                    textDecoration: "none",
                    color: "var(--ui-color-text-primary, #1a1a1a)",
                  }}
                >
                  {post.title}
                </Link>
              </h2>

              <p
                style={{
                  fontSize: "0.875rem",
                  color: "var(--ui-color-text-secondary, #4a4a4a)",
                  marginBottom: "0.75rem",
                }}
              >
                Published on{" "}
                {new Date(post.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>

              <p style={{ marginBottom: "1rem" }}>{post.description}</p>

              {post.tags && post.tags.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    flexWrap: "wrap",
                    marginBottom: "1rem",
                  }}
                >
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        padding: "0.25rem 0.5rem",
                        backgroundColor: "var(--ui-color-background-secondary, #f8f9fa)",
                        color: "var(--ui-color-text-secondary, #4a4a4a)",
                        borderRadius: "0.25rem",
                        fontSize: "0.75rem",
                        fontWeight: "500",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <Link
                to={`/blog/${post.slug}`}
                style={{
                  display: "inline-block",
                  padding: "0.5rem 1rem",
                  backgroundColor: "var(--ui-color-primary, #3b82f6)",
                  color: "white",
                  borderRadius: "0.25rem",
                  textDecoration: "none",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  transition: "var(--ui-transition, all 150ms ease)",
                }}
              >
                Read More →
              </Link>
            </article>
          ))}
        </div>

        {blogPosts.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "var(--ui-spacing-8, 2rem)",
              color: "var(--ui-color-text-secondary, #4a4a4a)",
            }}
          >
            <p>No blog posts yet. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  );
}
