# UI Components & Design System

This document covers the shared UI package, design system principles, and how to effectively use and extend our component library across all applications in the Hyperbaric monorepo.

## Overview

The `@repo/ui` package provides a centralized design system and component library that ensures consistency, accessibility, and maintainability across all applications.

## Design System Philosophy

### Core Principles

1. **Consistency**: Unified visual language across all applications
2. **Accessibility**: WCAG 2.1 AA compliance by default
3. **Composability**: Components designed for flexible composition
4. **Performance**: Optimized for bundle size and runtime performance
5. **Developer Experience**: Type-safe, well-documented, and easy to use

### Design Tokens

Our design system is built on a foundation of design tokens that define:

- **Colors**: Primary, secondary, neutral, semantic colors
- **Typography**: Font families, sizes, weights, line heights
- **Spacing**: Consistent spacing scale (4px base unit)
- **Shadows**: Elevation and depth system
- **Border Radius**: Consistent corner radius values
- **Breakpoints**: Responsive design breakpoints

## Package Structure

```
packages/ui/
├── src/
│   ├── components/         # React components
│   │   └── Button.tsx      # Button component with CSS
│   │   └── Button.css      # Button styles
│   └── index.ts            # Public API exports
├── package.json
└── tsconfig.json
```

## Current Components

### Button
The foundational interactive element with multiple variants:

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'small' | 'medium' | 'large'
  loading?: boolean
  children: React.ReactNode
}

// Usage
<Button variant="primary" size="medium">Click me</Button>
<Button variant="danger" loading>Processing...</Button>
```

### Future Components
Additional components will be added as needed. Common components that may be added include:
- Input/Form components
- Typography components
- Layout components (Card, Grid, etc.)
- Navigation components
- Data display components

## Styling Approach

The UI package uses CSS files alongside React components:
- Each component has its own CSS file
- CSS classes follow BEM-like naming: `repo-button`, `repo-button--primary`
- Styling is component-scoped and imported directly

## Customization

Currently, customization is done through CSS custom properties and direct CSS modifications. A more sophisticated theming system may be added in the future.

## Accessibility Features

### Built-in Accessibility

- **Keyboard Navigation**: All interactive elements support keyboard navigation
- **Screen Reader Support**: Proper ARIA labels and roles
- **Color Contrast**: WCAG AA compliant color combinations
- **Focus Management**: Visible focus indicators and logical tab order
- **Semantic HTML**: Proper HTML elements for semantic meaning

### Accessibility Props

```typescript
interface AccessibilityProps {
  'aria-label'?: string
  'aria-describedby'?: string
  'aria-expanded'?: boolean
  'aria-hidden'?: boolean
  role?: string
  tabIndex?: number
}
```

### Testing Accessibility

```typescript
// Automated accessibility testing
import { axe } from '@axe-core/react'

test('component is accessible', async () => {
  const { container } = render(<MyComponent />)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
```

## Usage Guidelines

### Installation

The UI package is automatically available in all apps:

```typescript
// Import components
import { Button } from '@repo/ui'

// Import types
import type { ButtonProps } from '@repo/ui'
```

### Best Practices

#### Component Composition
```typescript
// Good: Composable and flexible
<Card>
  <CardHeader>
    <Text variant="h3">Title</Text>
  </CardHeader>
  <CardContent>
    <Text variant="body">Content</Text>
  </CardContent>
</Card>

// Avoid: Too specific and rigid
<UserProfileCard user={user} showActions={true} />
```

#### Prop Design
```typescript
// Good: Simple and predictable
interface ButtonProps {
  variant: 'primary' | 'secondary'
  size: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

// Avoid: Too many boolean props
interface ButtonProps {
  isPrimary?: boolean
  isSecondary?: boolean
  isSmall?: boolean
  isMedium?: boolean
  isLarge?: boolean
}
```

#### Style Overrides
```typescript
// Good: Use CSS custom properties
<Button style={{ '--button-bg': 'red' }}>
  Custom Button
</Button>

// Avoid: Inline styles that break the design system
<Button style={{ backgroundColor: 'red', padding: '20px' }}>
  Custom Button
</Button>
```

### Performance Considerations

#### Bundle Optimization
- Tree-shaking enabled for unused components
- Dynamic imports for heavy components
- Minimal runtime dependencies
- CSS-in-JS optimizations

#### Component Performance
```typescript
// Use React.memo for expensive components
const ExpensiveComponent = React.memo(({ data }) => {
  return <ComplexVisualization data={data} />
})

// Optimize re-renders with useCallback
const handleClick = useCallback(() => {
  onAction(item.id)
}, [onAction, item.id])
```

## Testing Components

### Component Testing
```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@repo/ui'

test('button handles click events', () => {
  const handleClick = jest.fn()
  render(<Button onClick={handleClick}>Click me</Button>)
  
  fireEvent.click(screen.getByRole('button'))
  expect(handleClick).toHaveBeenCalledTimes(1)
})
```

### Visual Testing
```typescript
// Storybook stories for visual testing
export default {
  title: 'Components/Button',
  component: Button,
  args: {
    children: 'Button'
  }
}

export const Primary = { args: { variant: 'primary' } }
export const Secondary = { args: { variant: 'secondary' } }
export const Loading = { args: { loading: true } }
```

## Storybook Integration

The UI package includes comprehensive Storybook documentation:

```bash
# Start Storybook
turbo run dev --filter=storybook

# Build Storybook
turbo run build --filter=storybook
```

### Story Structure
- **Controls**: Interactive props for testing
- **Documentation**: Component API and usage examples
- **Accessibility**: A11y addon for accessibility testing
- **Design Tokens**: Visual token documentation

## Contributing to UI Package

### Adding New Components

1. **Create Component File**
   ```
   packages/ui/src/components/atoms/NewComponent.tsx
   ```

2. **Export from Index**
   ```typescript
   // packages/ui/src/index.ts
   export { NewComponent } from './components/atoms/NewComponent'
   ```

3. **Add Storybook Story**
   ```
   apps/storybook/src/stories/NewComponent.stories.tsx
   ```

4. **Write Tests**
   ```
   packages/ui/src/components/atoms/NewComponent.test.tsx
   ```

### Modifying Existing Components

1. **Ensure Backward Compatibility**: Don't break existing APIs
2. **Add Deprecation Warnings**: For API changes
3. **Update Documentation**: Stories and prop descriptions
4. **Test All Applications**: Verify changes don't break apps

### Design Token Updates

1. **Update Theme Definition**
2. **Test Visual Impact**: Check all components
3. **Update Documentation**: Reflect new tokens
4. **Consider Migration Path**: For breaking changes

## Application-Specific Customization

### Null Horizon
- Financial data visualization components
- Chart and graph libraries
- Professional color schemes
- Data-dense layouts

### Chronicler
- Content-focused components
- Reading-optimized typography
- Feed layout components
- Social interaction elements

### Portfolio
- Showcase-oriented components
- Project display cards
- Interactive demonstrations
- Personal branding elements

## Future Roadmap

### Planned Enhancements
- **Animation System**: Consistent motion design
- **Advanced Charts**: Financial and data visualization
- **Form Builder**: Dynamic form generation
- **Layout System**: Grid and flexbox utilities
- **Icon Library**: Comprehensive icon set

### Technology Considerations
- **CSS-in-JS Migration**: From current styling approach
- **Design Token Automation**: Figma/design tool integration
- **Performance Monitoring**: Bundle size and runtime metrics
- **Accessibility Automation**: Enhanced a11y testing

---

The UI package serves as the foundation for consistent, accessible, and maintainable user interfaces across all Hyperbaric applications. By following these guidelines and contributing to the shared design system, we ensure a cohesive user experience while enabling rapid development and easy maintenance.