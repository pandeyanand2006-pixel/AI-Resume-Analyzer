# 🎨 Design Reference Guide - Enhancv Style

Quick reference for maintaining design consistency across the ResumeAI application.

---

## 🎨 Color Palette

### Primary Colors
```
Teal (Primary):     #1ECAD3
Teal Hover:         #18B3BC  
Teal Light (10%):   rgba(30, 202, 211, 0.1)
Purple (Accent):    #7C3AED
Purple Light (10%): rgba(124, 58, 237, 0.1)
```

### Semantic Colors
```
Success (Green):  #10B981
Warning (Orange): #F59E0B
Error (Red):      #EF4444
Info (Blue):      #3B82F6
```

### Neutral Colors
```
Text Primary:   #1a1a1a
Text Secondary: #6b7280
Text Tertiary:  #9ca3af
Border Light:   #e5e7eb
Border Dark:    #d1d5db
Background:     #f9fafb
```

---

## 🌈 Gradients

### Hero Gradient (Mint to Purple)
```css
background: linear-gradient(135deg, #E6F9FA 0%, #EDE9FE 100%);
```

### Primary Gradient (Teal to Purple)
```css
background: linear-gradient(135deg, #1ECAD3 0%, #7C3AED 100%);
```

### Dark Section
```css
background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
```

---

## 📐 Spacing Scale

```
space-1:  4px
space-2:  8px
space-3:  12px
space-4:  16px
space-5:  20px
space-6:  24px
space-8:  32px
space-10: 40px
space-12: 48px
space-16: 64px
space-20: 80px
space-24: 96px
```

### Common Uses
- **Buttons:** padding: space-3 space-6 (12px 24px)
- **Cards:** padding: space-6 to space-8 (24px to 32px)
- **Sections:** padding: space-20 space-6 (80px 24px)
- **Gap (Grid):** gap: space-4 to space-6 (16px to 24px)

---

## 🔘 Border Radius

```
radius-sm:     4px   (small elements)
radius-lg:     12px  (cards, containers)
radius-button: 12px  (buttons)
radius-card:   16px  (main cards)
radius-input:  8px   (form inputs)
radius-full:   9999px (circular, pills)
```

---

## 🎯 Component Patterns

### Card with Hover Effect
```css
.card {
  padding: var(--space-6);
  background: white;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-card);
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--gradient-primary);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.3s ease;
}

.card:hover {
  border-color: var(--primary);
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.card:hover::before {
  transform: scaleX(1);
}
```

### Circular Icon Background
```css
.icon-circle {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-light);
  border-radius: var(--radius-full);
  color: var(--primary);
}
```

### Badge/Pill
```css
.badge {
  display: inline-block;
  padding: var(--space-2) var(--space-4);
  background: var(--primary-light);
  color: var(--primary);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  letter-spacing: 0.05em;
}
```

### Progress Bar
```css
.progress-bar {
  height: 8px;
  background: var(--background-gray);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--gradient-primary);
  border-radius: var(--radius-full);
  transition: width 1s ease-out;
}
```

---

## 📝 Typography

### Font Weights
```
Regular:  400
Medium:   500
Semibold: 600
Bold:     700
```

### Font Sizes
```
text-xs:   12px
text-sm:   14px
text-base: 16px
text-lg:   18px
text-xl:   20px
text-2xl:  24px
text-3xl:  30px
text-4xl:  36px
text-5xl:  48px
```

### Common Combinations
- **Page Title:** text-3xl, font-bold, text-primary
- **Section Title:** text-2xl, font-bold, text-primary
- **Card Title:** text-xl, font-semibold, text-primary
- **Body Text:** text-base, font-normal, text-secondary
- **Small Text:** text-sm, font-medium, text-tertiary

---

## 🎭 Shadows

```css
--shadow-sm:  0 1px 2px rgba(0, 0, 0, 0.05)
--shadow-md:  0 4px 6px rgba(0, 0, 0, 0.1)
--shadow-lg:  0 10px 15px rgba(0, 0, 0, 0.1)
--shadow-xl:  0 20px 25px rgba(0, 0, 0, 0.15)
--shadow-2xl: 0 25px 50px rgba(0, 0, 0, 0.25)

/* Primary button shadow */
--shadow-primary: 0 4px 12px rgba(30, 202, 211, 0.3)
```

---

## 🎬 Animations

### Transitions
```css
/* Default */
transition: all 0.2s ease;

/* Fast */
transition: all 0.15s ease;

/* Slow */
transition: all 0.3s ease;
```

### Common Animations

#### Fade In
```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

#### Pulse
```css
@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 0 8px rgba(30, 202, 211, 0.2);
  }
  50% {
    box-shadow: 0 0 0 16px rgba(30, 202, 211, 0);
  }
}
```

#### Spin (Loading)
```css
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
```

---

## 📱 Responsive Breakpoints

```css
/* Mobile */
@media (max-width: 480px) { }

/* Tablet */
@media (max-width: 768px) { }

/* Desktop */
@media (max-width: 1024px) { }

/* Large Desktop */
@media (max-width: 1280px) { }
```

### Mobile-First Approach
Design for mobile first, then enhance for larger screens.

---

## ♿ Accessibility

### Focus States
```css
.element:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
```

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}
```

### High Contrast
```css
@media (prefers-contrast: high) {
  .card {
    border-width: 2px;
  }
}
```

### Minimum Touch Target
- Buttons: min 44px height
- Interactive elements: min 44px × 44px

---

## 🎨 Icon Styling

### Icon Sizes
```
Small:  16px
Medium: 20px
Large:  24px
XL:     32px
```

### Icon in Circular Background
```css
.icon-circle {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-light);
  border-radius: var(--radius-full);
}

.icon-circle svg {
  width: 24px;
  height: 24px;
  color: var(--primary);
}
```

---

## 📋 Form Elements

### Input Focus State
```css
.input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(30, 202, 211, 0.1);
}
```

### Error State
```css
.input--error {
  border-color: var(--error);
  background: rgba(239, 68, 68, 0.05);
}
```

### Disabled State
```css
.input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: var(--background-gray);
}
```

---

## 🎯 Layout Patterns

### Container Widths
```css
--container-sm:  640px
--container-md:  768px
--container-lg:  1024px
--container-xl:  1280px
```

### Common Grid Patterns

#### Auto-fit Cards
```css
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-6);
}
```

#### Two-Column Layout
```css
.layout {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: var(--space-6);
}

@media (max-width: 1024px) {
  .layout {
    grid-template-columns: 1fr;
  }
}
```

---

## 🚀 Quick Copy-Paste Snippets

### Teal Button
```jsx
<Button variant="primary" size="lg">
  Get Started →
</Button>
```

### Card with Icon
```jsx
<CategoryCard 
  icon="📄"
  title="Feature Title"
  description="Feature description"
  variant="primary"
/>
```

### Score Gauge
```jsx
<CircularProgress 
  score={92} 
  size="xl"
  color="auto"
  label="ATS Score"
/>
```

### Dark Section
```jsx
<DarkSection variant="dark">
  <DarkSection.Header 
    badge="FEATURES"
    title="Section Title"
  />
</DarkSection>
```

---

## 📚 Resources

- **Design Inspiration:** Enhancv (enhancv.com)
- **Color Tool:** https://coolors.co
- **Gradient Generator:** https://cssgradient.io
- **Shadow Generator:** https://shadows.brumm.af

---

**Last Updated:** $(date)
**Maintained by:** Development Team
