# Design System Overview

This is a comprehensive design system framework for token architecture, component specifications, and presentation generation.

## Core Purpose

The system implements a three-layer token structure: "Primitive (raw values) → Semantic (purpose aliases) → Component (component-specific)" tokens. This architecture enables systematic design consistency across CSS variables, spacing, typography, and component states.

## Key Components

**Token Management:**
- Three-layer hierarchy for maintainability
- CSS variable generation and validation
- Integration with Tailwind configuration

**Slide Generation System:**
- BM25-powered search for contextual slide recommendations
- Decision CSVs mapping goals to layouts, typography, colors, and animations
- Chart.js integration for data visualization
- Pattern-breaking based on Duarte's sparkline methodology

**Primary Tools:**
Scripts include token generation, validation, slide searching, and compliance checking. Templates provide starter configurations for standardized implementations.

## Critical Requirement

"ALL slides MUST: Import `assets/design-tokens.css` - single source of truth" and exclusively use CSS variables rather than hardcoded values. This ensures brand compliance and enables theme switching.

**Use Case:** Design-to-code handoff, systematic branding, persuasion-focused presentations (licensed MIT).
