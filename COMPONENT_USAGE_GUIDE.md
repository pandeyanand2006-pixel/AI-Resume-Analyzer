# ResumeAI Component Usage Guide

Quick reference for using the redesigned component system.

---

## 🎨 Design System Tokens

### Import Design System
```jsx
// Automatically imported via global.css
// Access via CSS variables: var(--token-name)
```

### Common Tokens
```css
/* Colors */
--color-primary
--color-secondary
--color-success, --color-warning, --color-error
--color-text-primary, --color-text-secondary

/* Spacing */
--spacing-2  /* 8px */
--spacing-4  /* 16px */
--spacing-6  /* 24px */
--spacing-8  /* 32px */

/* Typography */
--font-size-sm, --font-size-base, --font-size-lg
--font-weight-normal, --font-weight-semibold, --font-weight-bold

/* Effects */
--shadow-sm, --shadow-md, --shadow-lg
--radius-md, --radius-lg, --radius-xl
--transition-base
```

---

## 📦 Component Imports

### Barrel Import (Recommended)
```jsx
import { Button, Input, Select, Card } from '../../components/ui';
```

### Individual Imports
```jsx
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
```

---

## 🔘 Button Component

### Basic Usage
```jsx
import { Button } from '../../components/ui';

<Button variant="primary" size="md">
  Click Me
</Button>
```

### All Variants
```jsx
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="danger">Danger</Button>
<Button variant="success">Success</Button>
<Button variant="ai">AI Feature</Button>
```

### Sizes
```jsx
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>  {/* Default */}
<Button size="lg">Large</Button>
```

### With Icons
```jsx
import { SparklesIcon } from '../../components/ui/Icons';

<Button variant="primary" icon={<SparklesIcon />} iconPosition="left">
  Generate
</Button>

<Button variant="outline" icon={<SparklesIcon />} iconPosition="right">
  Next
</Button>

{/* Icon only */}
<Button variant="ghost" icon={<SparklesIcon />} />
```

### States
```jsx
<Button loading={isLoading}>
  {isLoading ? 'Saving...' : 'Save'}
</Button>

<Button disabled>Disabled</Button>

<Button fullWidth>Full Width</Button>
```

### Complete Example
```jsx
const [loading, setLoading] = useState(false);

const handleSubmit = async () => {
  setLoading(true);
  await api.post('/data');
  setLoading(false);
};

<Button
  variant="primary"
  size="lg"
  icon={<SaveIcon />}
  loading={loading}
  onClick={handleSubmit}
  fullWidth
>
  Save Changes
</Button>
```

---

## 📝 Input Component

### Basic Text Input
```jsx
import { Input } from '../../components/ui';

<Input
  label="Email Address"
  type="email"
  name="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  placeholder="you@example.com"
  required
  fullWidth
/>
```

### With Icon
```jsx
import { MailIcon } from '../../components/ui/Icons';

<Input
  label="Email"
  type="email"
  icon={<MailIcon />}
  iconPosition="left"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  fullWidth
/>
```

### Password Input
```jsx
<Input
  label="Password"
  type="password"
  name="password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  placeholder="Enter password"
  required
  fullWidth
/>
{/* Automatically shows toggle icon */}
```

### With Error
```jsx
<Input
  label="Username"
  value={username}
  onChange={(e) => setUsername(e.target.value)}
  error={usernameError}
  required
  fullWidth
/>
```

### Textarea
```jsx
<Input
  label="Description"
  type="textarea"
  rows={5}
  value={description}
  onChange={(e) => setDescription(e.target.value)}
  placeholder="Enter description..."
  fullWidth
/>
```

### Helper Text
```jsx
<Input
  label="API Key"
  value={apiKey}
  onChange={(e) => setApiKey(e.target.value)}
  helperText="Keep this secret and secure"
  fullWidth
/>
```

---

## 📋 Select Component

### Basic Select
```jsx
import { Select } from '../../components/ui';

const options = [
  { value: 'tech', label: 'Technology' },
  { value: 'finance', label: 'Finance' },
  { value: 'healthcare', label: 'Healthcare' }
];

<Select
  label="Industry"
  options={options}
  value={industry}
  onChange={(e) => setIndustry(e.target.value)}
  placeholder="Select an industry"
  required
  fullWidth
/>
```

### With Error
```jsx
<Select
  label="Experience Level"
  options={experienceLevels}
  value={experience}
  onChange={(e) => setExperience(e.target.value)}
  error={experienceError}
  fullWidth
/>
```

---

## 🎴 Card Component

### Basic Card
```jsx
import { Card } from '../../components/ui';

<Card variant="default" padding="md">
  <h3>Card Title</h3>
  <p>Card content goes here</p>
</Card>
```

### With Subcomponents
```jsx
<Card variant="elevated" padding="none">
  <Card.Header>
    <h3>Header Content</h3>
  </Card.Header>
  
  <Card.Body>
    <p>Main content</p>
  </Card.Body>
  
  <Card.Footer>
    <Button variant="primary">Action</Button>
  </Card.Footer>
</Card>
```

### Interactive Card
```jsx
<Card 
  variant="outlined" 
  hover 
  onClick={() => navigate('/details')}
>
  <h3>Clickable Card</h3>
  <p>Click to view details</p>
</Card>
```

### Variants & Padding
```jsx
{/* Variants */}
<Card variant="default">Default</Card>
<Card variant="elevated">Elevated</Card>
<Card variant="outlined">Outlined</Card>
<Card variant="interactive">Interactive</Card>

{/* Padding */}
<Card padding="none">No Padding</Card>
<Card padding="sm">Small</Card>
<Card padding="md">Medium (default)</Card>
<Card padding="lg">Large</Card>
```

---

## 🎭 Icons

### Available Icons
```jsx
import {
  SparklesIcon,
  UserIcon,
  MailIcon,
  BellIcon,
  SearchIcon,
  FileTextIcon,
  LayoutDashboardIcon,
  TargetIcon,
  RouteIcon,
  MicIcon,
  BriefcaseIcon,
  BarChart3Icon,
  BotIcon,
  GitCompareIcon,
  SettingsIcon,
  LogOutIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  // ... and more
} from '../../components/ui/Icons';
```

### Usage
```jsx
<SparklesIcon size={24} />
<UserIcon size={20} className="icon-custom" />
```

---

## 📱 Layout Components

### AppLayout (For Protected Pages)
```jsx
import AppLayout from '../../components/layout/AppLayout';

function MyPage() {
  return (
    <AppLayout 
      pageTitle="My Page" 
      breadcrumbs={[
        { label: 'Home', path: '/dashboard' },
        { label: 'My Page' }
      ]}
    >
      <div className="content-container">
        {/* Your page content */}
      </div>
    </AppLayout>
  );
}
```

### Header (For Landing Pages)
```jsx
import Header from '../../components/layout/Header';

function LandingPage() {
  return (
    <div>
      <Header />
      {/* Rest of landing page */}
    </div>
  );
}
```

### FloatingAIChat
```jsx
// Automatically included in AppLayout
// No manual import needed for protected pages
```

---

## 🎨 Custom Styling

### Using Design Tokens
```css
.my-component {
  padding: var(--spacing-6);
  background: var(--color-bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  transition: all var(--transition-base);
}

.my-component:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}
```

### Typography Classes
```jsx
<h1 className="page-header__title">Page Title</h1>
<p className="page-header__subtitle">Subtitle</p>
```

---

## ✅ Form Example (Complete)

```jsx
import { useState } from 'react';
import { Input, Select, Button } from '../../components/ui';

function MyForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    bio: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const roles = [
    { value: 'developer', label: 'Developer' },
    { value: 'designer', label: 'Designer' },
    { value: 'manager', label: 'Manager' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await api.post('/submit', formData);
      // Success
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '600px' }}>
      <Input
        label="Full Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        error={errors.name}
        required
        fullWidth
      />

      <Input
        label="Email"
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
        required
        fullWidth
      />

      <Select
        label="Role"
        name="role"
        options={roles}
        value={formData.role}
        onChange={handleChange}
        error={errors.role}
        required
        fullWidth
      />

      <Input
        label="Bio"
        type="textarea"
        name="bio"
        value={formData.bio}
        onChange={handleChange}
        rows={4}
        fullWidth
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={loading}
        fullWidth
      >
        {loading ? 'Submitting...' : 'Submit'}
      </Button>
    </form>
  );
}
```

---

## 🎯 Best Practices

1. **Always use design tokens** - No hardcoded colors/spacing
2. **Consistent sizing** - Use provided size props
3. **Accessibility** - Include labels, proper types, required indicators
4. **Loading states** - Show feedback during async operations
5. **Error handling** - Display clear error messages
6. **Responsive** - Use `fullWidth` prop for mobile
7. **Icons** - Use provided icon set for consistency

---

## 🐛 Common Issues

### Issue: Input not showing icon
**Solution**: Ensure icon is wrapped in component
```jsx
// ❌ Wrong
<Input icon="mail" />

// ✅ Correct
<Input icon={<MailIcon />} />
```

### Issue: Button not full width on mobile
**Solution**: Add fullWidth prop
```jsx
<Button fullWidth>Button</Button>
```

### Issue: Design tokens not working
**Solution**: Ensure global.css is imported in main.jsx
```jsx
import './styles/global.css';
```

---

## 📚 Reference Links

- Design System: `styles/design-system.css`
- Component Source: `components/ui/`
- Icons: `components/ui/Icons.jsx`
- Layout: `components/layout/`

---

**Last Updated**: Current Session
