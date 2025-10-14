# TrustTech Minimal Design System

## Overview
A modern, professional design system for TransCrypt - combining the best of Notion, Coinbase, and university portals for a trustworthy, calm, and sleek user experience.

## 🌈 Color Palette

### Primary Colors
- **Primary**: `#4F46E5` (Indigo-600) - Trustworthy and modern
- **Primary Hover**: `#4338CA` (Indigo-700)
- **Primary Light**: `#6366F1` (Indigo-500) - Used in gradients
- **Accent**: `#22C55E` (Green-500) - Success/verified states

### Neutral Colors
- **Background**: `#F9FAFB` (Gray-50) - Clean off-white
- **Surface**: `#FFFFFF` - Cards and elevated surfaces
- **Text Primary**: `#111827` (Gray-900) - Strong, readable
- **Text Secondary**: `#6B7280` (Gray-500) - Metadata and hints
- **Border**: `#E5E7EB` (Gray-200) - Subtle boundaries

### Semantic Colors
- **Success**: `#22C55E` (Green-500) - "Transcript verified"
- **Danger**: `#EF4444` (Red-500) - Revoke access, errors
- **Info**: `#3B82F6` (Blue-500) - Notifications, hover states
- **Warning**: `#F59E0B` (Amber-500) - Warnings

## ✍️ Typography

### Font Families
- **Headings & Body**: `Inter` (400, 500, 600, 700)
  - Geometric and modern, optimized for screen readability
  - Features: cv11, ss01
- **Monospace**: `IBM Plex Mono` (400, 500)
  - For wallet addresses, code snippets
  - Gives subtle tech vibe

### Font Sizes
- **H1**: 3rem (48px) on desktop, 2rem (32px) mobile
- **H2**: 1.5rem (24px) on desktop, 1.375rem (22px) mobile
- **H3**: 1.25rem (20px)
- **Body**: 0.9375rem (15px)
- **Small**: 0.875rem (14px)
- **Tiny**: 0.8125rem (13px)

### Line Heights
- **Headings**: 1.2 (tight)
- **Body**: 1.7 (relaxed for readability)

## 🧩 Components

### Buttons

#### Primary Button
```css
.button
```
- Gradient background (Indigo-500 → Indigo-600)
- Shadow: `0 2px 6px rgba(79, 70, 229, 0.2)`
- Hover: Elevated shadow + translateY(-2px) + scale(1.02)
- Active: scale(0.98)

#### Secondary Button
```css
.button-secondary
```
- White background with 1.5px border
- Hover: Gray background

#### Success Button
```css
.button-success
```
- Green background
- Used for "Grant access" actions

#### Danger Button
```css
.button-danger
```
- Red background
- Used for "Revoke" actions

#### Ghost Button
```css
.button-ghost
```
- Transparent background
- Secondary text color

### Cards
```css
.card
```
- White background
- Border radius: 1.5rem (24px)
- Border: 1px solid gray-200
- Shadow: Subtle on default, elevated on hover
- Hover: translateY(-2px) + enhanced shadow
- Padding: 2rem (32px)

### Form Elements

#### Input Fields
- Border radius: 0.75rem (12px)
- Border: 1.5px solid border color
- Focus: Primary color border + ring shadow
- Padding: 0.875rem 1rem

#### Labels
- Font weight: 500
- Font size: 0.875rem
- Margin bottom: 0.5rem

#### Wallet Address Display
```css
.wallet-address
```
- Monospace font (IBM Plex Mono)
- Background: var(--background)
- Border: 1px solid border
- Rounded corners

### Badges
```css
.badge, .badge-primary, .badge-success, etc.
```
- Pill-shaped (border-radius: 9999px)
- Transparent background with theme color tint
- Font size: 0.8125rem
- Font weight: 500
- Icons included (🎓, ✓, 🏛️, ⚡, 👤)

### Status Messages
```css
.status-success, .status-error, .status-info, .status-warning
```
- Rounded: 0.75rem
- Transparent background with semantic color tint
- Border with semantic color
- Padding: 1rem 1.25rem

### Navigation
```css
.nav-link
```
- Default: Transparent with secondary text
- Hover: Surface background + border
- Active: Primary gradient + white text + shadow
- Border radius: 0.75rem
- Padding: 0.625rem 1.5rem

## 🎨 Animations

### Keyframe Animations
- **fadeIn**: Opacity 0→1 + translateY(10px→0)
- **slideUp**: Opacity 0→1 + translateY(20px→0)
- **loading**: Skeleton shimmer effect
- **spin**: Loading spinner rotation
- **pulse**: Opacity pulsing 1→0.5→1

### Usage
```css
.fade-in      /* Apply to new elements */
.slide-up     /* Apply to page containers */
.skeleton     /* Loading placeholders */
.loading-spinner /* Button loading state */
```

### Transitions
- Duration: 0.2s for buttons, 0.3s for cards
- Easing: cubic-bezier(0.4, 0, 0.2, 1)
- Properties: all, background, transform, shadow

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 768px
  - Reduced padding
  - Smaller font sizes
  - Stack layouts
  - Full-width buttons

### Mobile Adjustments
- Container padding: 1.5rem → 1rem
- Card padding: 2rem → 1.5rem
- H1: 3rem → 1.75rem
- Transcript actions: Stack vertically
- Navigation: Smaller gaps

## 🎯 UI Tone & Copy

### Voice
- Professional but approachable
- Clear, not overly technical
- Blockchain aspects kept subtle

### Examples
✅ **Good**: "Grant access to an employer so they can verify your transcript securely."
❌ **Avoid**: "Deploy cryptographic key wrapper via x25519-xsalsa20-poly1305 encryption schema."

✅ **Good**: "Decrypt using your MetaMask wallet to view transcript details."
❌ **Avoid**: "Invoke eth_decrypt RPC method on encrypted ciphertext payload."

### Status Messages
- Success: "✓ Access granted successfully"
- Error: "⚠ Failed to load transcripts"
- Info: Use for helpful hints and explanations

## 🔧 Implementation Files

### Updated Files
1. **`frontend/src/styles.css`** - Complete design system
2. **`frontend/src/App.tsx`** - Header with gradient title
3. **`frontend/src/components/StudentGrantAccessForm.tsx`** - Styled grant form
4. **`frontend/src/components/RoleBadges.tsx`** - Badge system with icons
5. **`frontend/src/components/ConnectButton.tsx`** - Modern wallet connection
6. **`frontend/src/pages/LandingPage.tsx`** - Hero section with features

### Key Classes Reference

**Layout**
- `.container` - Max 1200px, centered
- `.card` - Elevated surface
- `.grant-form` - Form container with background

**Buttons**
- `.button` - Primary gradient
- `.button-secondary` - Outlined
- `.button-success` - Green
- `.button-danger` - Red
- `.button-ghost` - Transparent

**Text**
- `.wallet-address` - Monospace display
- Use CSS variables: `var(--text-primary)`, `var(--text-secondary)`

**Status**
- `.status-success` - Green tinted
- `.status-error` - Red tinted
- `.status-info` - Blue tinted
- `.status-warning` - Amber tinted

**Badges**
- `.badge` - Base badge
- `.badge-primary` - Indigo
- `.badge-success` - Green
- `.badge-info` - Blue
- `.badge-warning` - Amber

**Animations**
- `.fade-in` - Gentle entrance
- `.slide-up` - Page load
- `.loading-spinner` - Button loading
- `.skeleton` - Content loading

## 🌙 Dark Mode Support
Automatic dark mode via `@media (prefers-color-scheme: dark)`:
- Background: `#0F172A`
- Surface: `#1E293B`
- Text Primary: `#F1F5F9`
- Text Secondary: `#94A3B8`
- Border: `#334155`

## ✨ Special Features

### Gradient Title Effect
```tsx
style={{
  background: "linear-gradient(135deg, var(--primary-light) 0%, var(--primary) 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent"
}}
```

### Elevated Card Hover
Cards lift on hover with enhanced shadow for interactive feedback.

### Loading States
- Skeleton loaders for content
- Spinner in buttons during async operations

### Icons
Emoji icons for quick visual recognition:
- 🎓 University
- ✓ Registrar
- 🏛️ Ministry
- ⚡ Admin
- 👤 Viewer
- 🔐 Encryption
- ⛓️ Blockchain
- 👥 Access Control

## 📊 Before & After

### Before
- Basic blue buttons
- Flat shadows
- Generic spacing
- System fonts
- No animations

### After (TrustTech Minimal)
- Gradient primary buttons with elevation
- Subtle shadows that respond to hover
- Consistent 8px grid spacing
- Custom Inter + IBM Plex Mono fonts
- Smooth transitions and entrance animations
- Professional color palette
- Clear visual hierarchy
- Mobile-responsive layouts

## 🚀 Getting Started

The design system is automatically loaded via `styles.css`. Simply use the provided classes in your components:

```tsx
<button className="button">Primary Action</button>
<button className="button button-secondary">Secondary</button>
<div className="card">Card content</div>
<span className="badge badge-success">✓ Verified</span>
<div className="status-message status-success">Success!</div>
```

---

**Design Philosophy**: Clean, trustworthy, minimal. Let the content shine while maintaining professional polish.
