---
name: Vivid Explorer
colors:
  surface: '#f7fbe8'
  surface-dim: '#d8dcca'
  surface-bright: '#f7fbe8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f6e3'
  surface-container: '#ecf0dd'
  surface-container-high: '#e6ead8'
  surface-container-highest: '#e0e4d2'
  on-surface: '#191d12'
  on-surface-variant: '#424936'
  inverse-surface: '#2e3226'
  inverse-on-surface: '#eff3e0'
  outline: '#727a64'
  outline-variant: '#c2cab0'
  surface-tint: '#446900'
  primary: '#446900'
  on-primary: '#ffffff'
  primary-container: '#a3e635'
  on-primary-container: '#416400'
  inverse-primary: '#98da27'
  secondary: '#555f6f'
  on-secondary: '#ffffff'
  secondary-container: '#d6e0f3'
  on-secondary-container: '#596373'
  tertiary: '#784f85'
  on-tertiary: '#ffffff'
  tertiary-container: '#f3c1ff'
  on-tertiary-container: '#734b80'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#b2f746'
  primary-fixed-dim: '#98da27'
  on-primary-fixed: '#121f00'
  on-primary-fixed-variant: '#334f00'
  secondary-fixed: '#d9e3f6'
  secondary-fixed-dim: '#bdc7d9'
  on-secondary-fixed: '#121c2a'
  on-secondary-fixed-variant: '#3d4756'
  tertiary-fixed: '#fad7ff'
  tertiary-fixed-dim: '#e7b6f3'
  on-tertiary-fixed: '#2f093d'
  on-tertiary-fixed-variant: '#5e376b'
  background: '#f7fbe8'
  on-background: '#191d12'
  surface-variant: '#e0e4d2'
typography:
  headline-xl:
    fontFamily: Space Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: 0em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: 0em
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.04em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 48px
  gutter: 20px
  margin-mobile: 20px
  margin-desktop: 64px
---

## Brand & Style

The design system is engineered for a modern travel experience that feels energetic, precise, and high-velocity. It targets a demographic of tech-savvy travelers who value efficiency and bold aesthetics.

The style is a fusion of **Minimalism** and **High-Contrast Modernism**. By utilizing a muted, cool-toned canvas punctuated by aggressive lime accents and deep slate typography, the UI creates a sense of clarity and forward momentum. The aesthetic avoids unnecessary decoration, relying instead on heavy whitespace, oversized typography, and intentional color pops to guide the user journey. The emotional response is one of confidence, freshness, and "digital-native" sophistication.

## Colors

The color palette is built on extreme contrast to ensure legibility and visual impact:

- **Primary (Accent):** `#A3E635` (Vibrant Lime). Used exclusively for primary calls-to-action, active states, and critical highlights. It represents energy and "go" signals.
- **Secondary (Core):** `#1F2937` (Deep Slate). This is the workhorse color for all primary text, headings, and the background of high-priority buttons. It provides a grounded, professional anchor.
- **Background (Canvas):** `#F3F4F6` (Cool Gray). Used for the main page surface to reduce eye strain compared to pure white, providing a sophisticated, "app-like" feel.
- **Surface (Elevated):** `#FFFFFF` (White). Used for cards and containers to pop against the cool gray background.

## Typography

This design system utilizes a dual-font strategy. **Space Grotesk** is used for headings to provide a technical, geometric edge that feels futuristic and bold. **Inter** is used for all body copy and UI labels to ensure maximum readability across all screen sizes.

Headlines should use tight letter spacing and heavy weights to emphasize the high-contrast aesthetic. Body text maintains standard tracking for optimal legibility during long-form reading (e.g., travel itineraries or destination descriptions).

## Layout & Spacing

The design system employs a **Fluid Grid** model based on an 8px stepping scale for internal component spacing and a 4px scale for micro-adjustments.

- **Mobile:** 4-column layout with 20px margins and 20px gutters.
- **Tablet:** 8-column layout with 32px margins and 20px gutters.
- **Desktop:** 12-column layout with a maximum content width of 1280px. Margins are dynamic, but gutters remain fixed at 24px.

Emphasis is placed on "Generous White Space," specifically using `xl` (48px) spacing between major sections to maintain a clean, airy feel despite the high-contrast elements.

## Elevation & Depth

Visual hierarchy is established through **Tonal Layering** and **Low-Contrast Outlines** rather than heavy shadows.

- **Level 0 (Canvas):** `#F3F4F6` - The base layer.
- **Level 1 (Cards):** `#FFFFFF` - Used for primary content containers. No shadow; instead, a 1px border of `#E5E7EB` (Light Gray) is used for definition.
- **Level 2 (Interaction):** A soft, highly diffused ambient shadow (`0px 10px 30px rgba(31, 41, 55, 0.05)`) is used only for floating elements like bottom sheets or navigation bars.
- **Overlays:** A 40% opacity blur is applied to background elements when modals are active to maintain the "Glassmorphism" hint without losing the clean aesthetic.

## Shapes

The design system uses a signature **22px corner radius** for all primary containers, cards, and buttons. This significant rounding softens the aggressive high-contrast color palette, making the interface feel approachable and friendly.

Smaller elements like input fields or tags should use a scaled-down radius of 12px to maintain visual harmony. Icon containers should be circles or have a 12px radius.

## Components

### Buttons
- **Primary:** Background `#A3E635`, Text `#1F2937`, Bold weight. 22px corner radius.
- **Secondary:** Background `#1F2937`, Text `#FFFFFF`. Used for "Alternative" primary actions.
- **Ghost:** Transparent background, Border 1px `#1F2937`, Text `#1F2937`.

### Input Fields
Background `#FFFFFF`, Border 1px `#D1D5DB`, 12px corner radius. On focus, the border changes to `#1F2937` with a 2px width.

### Cards
Background `#FFFFFF`, 22px corner radius. Padding should be minimum `lg` (24px). Images within cards must also inherit a 22px (or nested 18px) radius.

### Chips & Tags
Background `#1F2937` with `#FFFFFF` text for "Active/Selected" or `#E5E7EB` with `#1F2937` text for "Default." Always fully rounded (pill-shaped).

### Lists
List items are separated by a 1px border (`#E5E7EB`) with 16px vertical padding. Iconography within lists should use a consistent `#1F2937` color.