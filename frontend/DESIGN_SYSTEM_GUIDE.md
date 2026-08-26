# ResumeAI Design System Guide

## 📱 Responsive Design Implementation

### Breakpoints
All CSS files use consistent responsive breakpoints:

```css
/* Mobile: < 640px (default) */
/* Tablet: 640px - 1023px */
@media (max-width: 1023px) { }

/* Mobile: < 640px */
@media (max-width: 639px) { }
```

### Responsive Patterns Implemented

#### 1. **Grid Layouts**
- Desktop: `grid-template-columns: repeat(auto-fit, minmax(300px, 1fr))`
- Tablet: `grid-template-columns: repeat(auto-fit, minmax(250px, 1fr))`
- Mobile: `grid-template-columns: 1fr`

#### 2. **Typography Scale**
- Desktop: Base 16px (1rem)
- Mobile: Adjusted via clamp() functions
  - Hero: `clamp(2.5rem, 6vw, 4.5rem)`
  - Headings: `clamp(1.5rem, 4vw, 2.5rem)`

#### 3. **Spacing**
- Desktop: Full spacing scale (spacing-1 to spacing-20)
- Mobile: Reduced by 25-50% for compact layouts

#### 4. **Component Adaptations**

**Buttons:**
- Desktop: Normal size
- Mobile: Full width on small screens

**Forms:**
- Desktop: 2-column grid
- Mobile: Single column stack

**Cards:**
- Desktop: Grid with gutters
- Mobile: Single column, reduced padding

**Navigation:**
- Desktop: Horizontal menu
- Tablet: Collapsed sidebar
- Mobile: Bottom navigation or hamburger

### Testing Checklist

✅ All pages tested at:
- Desktop: 1920px, 1440px, 1280px
- Tablet: 1024px, 768px
- Mobile: 414px (iPhone), 375px, 360px

✅ All components responsive:
- Button (3 sizes work on all screens)
- Input (full width on mobile)
- Select (touch-friendly on mobile)
- Card (stacks properly)
- Badge (readable at all sizes)

✅ All layouts responsive:
- Header (sticky, collapses properly)
- Sidebar (hidden/collapsed on mobile)
- AppLayout (adjusts spacing)
- FloatingAIChat (scales for mobile)

---

## 🎨 Design System Overview

### Color Palette

**Primary Colors:**
- Primary: `#6366f1` (Indigo)
- Primary Light: `#818cf8`
- Primary Dark: `#4f46e5`

**Semantic Colors:**
- Success: `#10b981` (Green)
- Warning: `#f59e0b` (Amber)
- Error: `#ef4444` (Red)
- Info: `#3b82f6` (Blue)

**Neutral Colors:**
- Background: `#f8fafc` (Gray 50)
- Surface: `#ffffff` (White)
- Border: `#e2e8f0` (Gray 200)

### Typography

**Font Families:**
- Display: Inter, system-ui, -apple-system
- Body: Inter, system-ui, -apple-system

**Font Sizes:**
```css
--font-size-xs: 0.75rem;    /* 12px */
--font-size-sm: 0.875rem;   /* 14px */
--font-size-base: 1rem;     /* 16px */
--font-size-lg: 1.125rem;   /* 18px */
--font-size-xl: 1.25rem;    /* 20px */
--font-size-2xl: 1.5rem;    /* 24px */
--font-size-3xl: 1.875rem;  /* 30px */
--font-size-4xl: 2.25rem;   /* 36px */
```

### Spacing Scale
```css
--spacing-1: 0.25rem;   /* 4px */
--spacing-2: 0.5rem;    /* 8px */
--spacing-3: 0.75rem;   /* 12px */
--spacing-4: 1rem;      /* 16px */
--spacing-5: 1.25rem;   /* 20px */
--spacing-6: 1.5rem;    /* 24px */
--spacing-8: 2rem;      /* 32px */
--spacing-10: 2.5rem;   /* 40px */
--spacing-12: 3rem;     /* 48px */
--spacing-16: 4rem;     /* 64px */
--spacing-20: 5rem;     /* 80px */
```

### Border Radius
```css
--radius-sm: 0.25rem;    /* 4px */
--radius-md: 0.5rem;     /* 8px */
--radius-lg: 0.75rem;    /* 12px */
--radius-xl: 1rem;       /* 16px */
--radius-2xl: 1.5rem;    /* 24px */
--radius-3xl: 2rem;      /* 32px */
--radius-full: 9999px;   /* Full circle */
```

### Shadows
```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15);
--shadow-2xl: 0 25px 50px rgba(0, 0, 0, 0.25);
```

---

## 🧩 Component Library

### Button
**Variants:** primary, secondary, outline, ghost, danger, success, ai  
**Sizes:** sm, md, lg  
**States:** default, hover, active, disabled, loading

```jsx
<Button variant="primary" size="lg" loading={isLoading}>
  Click Me
</Button>
```

### Input
**Types:** text, email, password, number, textarea  
**Features:** Password toggle, icons, error states, focus rings

```jsx
<Input 
  type="password" 
  placeholder="Enter password"
  error={errors.password}
/>
```

### Select
**Features:** Custom styling, error states, disabled state

```jsx
<Select value={value} onChange={handleChange}>
  <option value="1">Option 1</option>
  <option value="2">Option 2</option>
</Select>
```

### Card
**Variants:** default, elevated, outlined, interactive  
**Subcomponents:** Card.Header, Card.Body, Card.Footer, Card.Title, Card.Description

```jsx
<Card variant="elevated">
  <Card.Header>
    <Card.Title>Title</Card.Title>
    <Card.Description>Description</Card.Description>
  </Card.Header>
  <Card.Body>Content</Card.Body>
</Card>
```

### Badge
**Variants:** default, primary, success, warning, error, info

```jsx
<Badge variant="success">Active</Badge>
```

### Loading
**Types:** spinner, dots, text, card, table

```jsx
<Loading type="card" count={3} />
<Loading.Spinner />
<Loading.Text lines={5} />
```

### EmptyState
**Presets:** NoData, NoResults, Error, NoPermission, ComingSoon

```jsx
<EmptyState
  icon="📄"
  title="No resumes yet"
  description="Create your first resume"
  action={{ label: "Create", onClick: handleCreate }}
/>

<EmptyState.NoResults query={searchQuery} onClear={handleClear} />
```

---

## 📐 Layout Components

### AppLayout
Wraps all protected pages. Includes Sidebar, Topbar, and FloatingAIChat.

```jsx
<AppLayout pageTitle="Dashboard">
  {/* Page content */}
</AppLayout>
```

### Header
Landing page header with logo, navigation, auth buttons.

```jsx
<Header />
```

### FloatingAIChat
Bottom-left chat widget available on all protected pages.

---

## 🎯 Usage Examples

### Page Structure
```jsx
import AppLayout from '../../components/layout/AppLayout';
import { Card, Button, Badge, Loading, EmptyState } from '../../components/ui';

function MyPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  if (loading) return <Loading.Card count={3} />;
  if (!data.length) return <EmptyState.NoData resource="items" />;

  return (
    <AppLayout pageTitle="My Page">
      <div className="my-page">
        <section className="my-page__hero">
          <Badge variant="primary">Featured</Badge>
          <h1>Page Title</h1>
          <p>Description</p>
        </section>

        <section className="my-page__content">
          <Card variant="elevated">
            <Card.Header>
              <Card.Title>Section Title</Card.Title>
            </Card.Header>
            <Card.Body>
              {/* Content */}
            </Card.Body>
          </Card>
        </section>
      </div>
    </AppLayout>
  );
}
```

### CSS Structure
```css
.my-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-8) var(--spacing-6);
}

.my-page__hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: var(--radius-2xl);
  padding: var(--spacing-10) var(--spacing-8);
  color: white;
}

/* Responsive */
@media (max-width: 1023px) {
  .my-page__hero h1 {
    font-size: var(--font-size-3xl);
  }
}

@media (max-width: 639px) {
  .my-page {
    padding: var(--spacing-4);
  }
}
```

---

## ✨ Animations

All animations are defined in CSS:

```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { 
    opacity: 0; 
    transform: translateY(20px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

Usage:
```css
.element {
  animation: fadeIn 0.4s ease-out;
}
```

---

## 🎨 Best Practices

1. **Always use design tokens** (CSS variables) instead of hardcoded values
2. **Use the component library** instead of creating custom components
3. **Follow the spacing scale** for consistent layouts
4. **Test on mobile first**, then enhance for desktop
5. **Use semantic color names** (success, error, warning) not generic (green, red, yellow)
6. **Keep animations subtle** (0.2-0.4s duration)
7. **Ensure 4.5:1 contrast ratio** for text on backgrounds
8. **Add loading states** to all async operations
9. **Add empty states** to all data-driven views
10. **Make all interactive elements 44px minimum** for touch targets

---

## 📚 Additional Resources

- All design tokens: `frontend/src/styles/design-system.css`
- Component library: `frontend/src/components/ui/`
- Layout components: `frontend/src/components/layout/`
- Example pages: `frontend/src/pages/`

---

**Last Updated:** Professional UI/UX Redesign Complete  
**Version:** 1.0.0  
**Status:** Production Ready
