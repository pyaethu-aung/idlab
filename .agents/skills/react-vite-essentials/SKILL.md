---
name: react-vite-essentials
description: Essential React and Vite best practices for high-quality, performant Single Page Applications (SPAs). Use when writing, refactoring, or reviewing React code in this project.
metadata:
  version: "1.0.0"
  author: custom
---

# React + Vite Essentials

Concise guidelines for building maintainable, performant React applications with Vite.

## 1. Component Architecture

### Composition over Configuration
Avoid "God Components" with many boolean props. Use composition to build flexible UIs.

**❌ AVOID:**
```jsx
// Too many boolean props make this hard to maintain and test
<Button primary icon="search" loading size="large" onClick={...}>Search</Button>
```

**✅ PREFER:**
```jsx
// Composition makes it flexible and easy to read
<Button variant="primary" size="large" onClick={...}>
  <Icon name="search" />
  {isLoading ? <Spinner /> : "Search"}
</Button>
```

### File Structure
- **One Component per File**: Default export the main component. Named exports for sub-components or types.
- **Colocation**: Keep styles (CSS/Modules), tests, and sub-components near where they are used.
- **Barrel Files**: Avoid purely re-exporting `index.js` files for internal components (can cause circular deps and tree-shaking issues). Import directly from the file.

## 2. Hooks & State Management

### Strict Effects
`useEffect` is for synchronization with external systems (DOM, network, subscriptions), NOT for derived state.

**❌ AVOID:**
```jsx
const [firstName, setFirstName] = useState('John');
const [lastName, setLastName] = useState('Doe');
const [fullName, setFullName] = useState('');

useEffect(() => {
  setFullName(`${firstName} ${lastName}`); // 🚩 Redundant render
}, [firstName, lastName]);
```

**✅ PREFER:**
```jsx
const [firstName, setFirstName] = useState('John');
const [lastName, setLastName] = useState('Doe');
// ✅ Derived during render - faster, less code, no sync bugs
const fullName = `${firstName} ${lastName}`;
```

### Custom Hooks
Extract complex stateful logic into `useName` hooks.
- **Naming**: Must start with `use`.
- **Purpose**: Encapsulate logic, not UI.
- **Return**: Return values/functions needed by the consumer.

## 3. Performance (Vite Specific)

### Code Splitting
Use `React.lazy` and `Suspense` for route-level code splitting. This keeps the initial bundle size small, which is critical for SPA load performance.

```jsx
// In App.jsx or router config
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Settings = React.lazy(() => import('./pages/Settings'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Suspense>
  );
}
```

### Bundle Optimization
- **Dynamic Imports**: Use `import('heavy-lib')` for heavy libraries that are only used in specific interactions (e.g., exporting a PDF).
- **Asset Handling**: Import images/assets directly in JS (`import logo from './logo.svg'`) to let Vite optimize distinct files vs inlining.

## 4. Testing (Vitest)
- **Unit Logic**: Test utility functions and hooks in isolation (`.test.js`).
- **Component Behavior**: Test user interactions (clicks, inputs) and accessible outputs (text, aria-labels) rather than internal state implementation details.
- **Globals**: Use `vi` for mocks, `describe/it` for structure.

## Check Procedure
When writing or reviewing code, verify:
1.  **Is this state necessary?** Can it be derived from props or other state?
2.  **Are strict effects being used properly?** Ensure they aren't managing data flow that should be event-driven.
3.  **Is "Prop Drilling" avoided?** Use Composition or Context (sparingly) instead of passing props down 5 levels.
4.  **Are heavy routes lazy-loaded?** Ensure the main bundle stays lightweight.
