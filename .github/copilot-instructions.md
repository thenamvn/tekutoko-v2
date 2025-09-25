# GitHub Copilot Instructions

## Project Overview
This is a React.js quiz/game room platform using:
- React 18 with Create React App
- npm for package management  
- Tailwind CSS for styling
- Node.js/Express backend (tekutoko.js)
- MySQL database
- Firebase Storage for file uploads
- i18next for internationalization (vi, en, ja)

Follow the project structure and coding guidelines below when generating code.

---

## Project Structure
When creating new files, always place them inside `src/` following this layout:

```
src/
  components/                # Reusable UI components
    ui/                      # Small atomic UI elements (Button, Input...)
    layout/                  # Layout components (Header, Sidebar, Footer...)
    home/                    # Dashboard/Home page components
    room/                    # Game room related components
    room_admin/              # Admin room management components
    login/                   # Authentication components
    discovery/               # Room discovery components
    coupon/                  # Voucher/reward components
    introProfile/            # User profile components
    slideshow/               # Slideshow components

  locales/                   # Internationalization files
    vi/                      # Vietnamese translations
      translation.json
    en/                      # English translations
      translation.json  
    ja/                      # Japanese translations
      translation.json

  utils/                     # Utility functions and helpers
  styles/                    # CSS files and styling
  input.css                  # Tailwind input file
  output.css                 # Compiled Tailwind output

public/                      # Static assets (images, icons, etc.)
tekutoko.js                  # Backend Express server file
```

---

## Coding Conventions
- Use **JavaScript** (`.js`/`.jsx` files) - this is not a TypeScript project
- Use **npm** for dependency management (`npm install` instead of yarn/pnpm)
- Style using **Tailwind CSS** only for all layout, spacing, colors, and typography
- Use **glassmorphism design patterns** with backdrop-blur, semi-transparent backgrounds
- Use **gradient backgrounds** (`bg-gradient-to-r from-violet-600 to-indigo-600`)
- Use **rounded corners** (`rounded-xl`, `rounded-2xl`) and **shadows** (`shadow-lg`, `shadow-2xl`)
- Use **modern spacing** with adequate padding and margins
- Components should use **React hooks** (useState, useEffect, etc.)
- Use **useTranslation** hook from react-i18next for all text content
- Use **responsive design** with Tailwind responsive classes
- Follow **camelCase** for JavaScript variables and functions
- Use **PascalCase** for React component names
- Keep files in **kebab-case** or **camelCase** naming

---

## UI/UX Design Patterns
**Every component should follow these design patterns:**
1. **Glassmorphism**: Use `bg-white/80 backdrop-blur-xl` or similar semi-transparent backgrounds
2. **Modern Cards**: `rounded-2xl shadow-2xl border border-white/20`
3. **Gradient Headers**: `bg-gradient-to-r from-violet-600 to-indigo-600`
4. **Hover Effects**: `hover:scale-[1.02] transition-all duration-200`
5. **Color Scheme**: 
   - Primary: violet/indigo gradients
   - Success: green-500/emerald-500
   - Error: red-500/red-600
   - Text: slate-700/slate-800
   - Muted: slate-400/slate-500
6. **Spacing**: Use generous padding (`p-6`, `p-8`) and margins
7. **Typography**: Bold headings, clear hierarchy with `font-semibold`, `font-bold`

---

## Internationalization
- **Always use translation keys** instead of hardcoded text
- Translation keys follow dot notation: `"dashboard.title"`, `"room.joinRoom"`
- Use `const { t } = useTranslation();` in components
- Wrap user-facing text with `{t('translation.key')}`
- Add new translations to all language files (vi, en, ja)

---

## Backend Integration
- API calls should be made to `process.env.REACT_APP_API_URL`
- Backend server file is `tekutoko.js` (Express.js)
- Use MySQL queries for database operations
- Firebase Storage for file/image uploads
- JWT tokens for authentication stored in localStorage

---

## Output Format for Copilot
**Every time you generate code, you MUST:**
1. Clearly state the **full file path** where this code should be placed (relative to project root)
2. Provide only the code for that file in a fenced code block
3. If multiple files are needed, list them in order with separate headings and fenced code blocks for each
4. Follow the existing UI patterns and design system
5. Use translation keys for all text content
6. Include proper error handling and loading states

**Example Output:**

File: `src/components/room/ExampleComponent.jsx`
```jsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const ExampleComponent = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl max-w-md w-full border border-white/30">
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-4 text-white rounded-t-2xl">
          <h2 className="text-xl font-bold">{t('example.title')}</h2>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <p className="text-slate-700">{t('example.description')}</p>
        </div>
      </div>
    </div>
  );
};

export default ExampleComponent;
```

---

## Additional Notes
- Keep consistent with existing component patterns in the codebase
- Use modern React patterns (functional components, hooks)
- Ensure mobile responsiveness with Tailwind responsive classes
- Add proper loading states and error handling
- Follow the established folder structure strictly
- Test components work with the existing backend API structure