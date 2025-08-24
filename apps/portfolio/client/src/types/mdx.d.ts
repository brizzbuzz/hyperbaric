declare module '*.mdx' {
  import type { ComponentType } from 'react'

  interface MDXProps {
    components?: Record<string, ComponentType<any>>
  }

  const MDXComponent: ComponentType<MDXProps>
  export default MDXComponent

  export const frontmatter: {
    title?: string
    date?: string
    author?: string
    description?: string
    tags?: string[]
    [key: string]: any
  }
}

declare module '*.md' {
  import type { ComponentType } from 'react'

  interface MDXProps {
    components?: Record<string, ComponentType<any>>
  }

  const MDXComponent: ComponentType<MDXProps>
  export default MDXComponent

  export const frontmatter: {
    title?: string
    date?: string
    author?: string
    description?: string
    tags?: string[]
    [key: string]: any
  }
}

// Extend the JSX namespace to include MDX components
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any
    }
  }
}
