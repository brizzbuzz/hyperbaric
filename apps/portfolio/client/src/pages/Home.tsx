export default function Home() {
  return (
    <div className="container">
      <div className="prose">
        <h1>Welcome to My Portfolio</h1>

        <p>
          Hi, I'm a developer passionate about building modern web applications.
          This portfolio is built with React, Vite, and MDX to showcase my work
          and share my thoughts through blogging.
        </p>

        <h2>About This Site</h2>

        <p>
          This portfolio demonstrates modern web development practices using:
        </p>

        <ul>
          <li>
            <strong>React 18</strong> - For building interactive user interfaces
          </li>
          <li>
            <strong>Vite</strong> - For lightning-fast development and builds
          </li>
          <li>
            <strong>MDX</strong> - For writing content with embedded React
            components
          </li>
          <li>
            <strong>TypeScript</strong> - For type-safe development
          </li>
          <li>
            <strong>CSS Custom Properties</strong> - For maintainable styling
          </li>
        </ul>

        <h2>Recent Posts</h2>

        <p>Check out my latest blog post to see MDX in action:</p>

        <div
          style={{
            padding: "var(--ui-spacing-4, 1rem)",
            border: "1px solid var(--ui-color-border, #e5e7eb)",
            borderRadius: "0.5rem",
            margin: "var(--ui-spacing-4, 1rem) 0",
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: "0.5rem" }}>
            <a href="/blog/hello-world">Hello World - My First MDX Post</a>
          </h3>
          <p
            style={{
              marginBottom: 0,
              fontSize: "0.875rem",
              color: "var(--ui-color-text-secondary, #4a4a4a)",
            }}
          >
            A sample blog post demonstrating MDX capabilities with React
            components, code highlighting, and more.
          </p>
        </div>

        <h2>Get in Touch</h2>

        <p>
          Feel free to explore the blog and see how MDX allows me to create
          rich, interactive content that goes beyond traditional markdown.
        </p>
      </div>
    </div>
  );
}
