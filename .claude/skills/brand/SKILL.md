# Brand Agent Overview

This Claude agent module manages **brand identity, voice, messaging, and asset consistency** across design systems.

## Key Capabilities

The agent handles:
- **Voice & Tone**: Content tone guidance and voice definition
- **Visual Identity**: Style guides, color palettes, typography specs
- **Messaging**: Framework creation and consistency audits
- **Assets**: Organization, validation, and approval workflows

## Core Workflows

**Quick validation:**
```bash
node scripts/validate-asset.cjs <asset-path>
node scripts/extract-colors.cjs --palette
```

**Brand sync process:**
1. Edit `docs/brand-guidelines.md`
2. Run `node scripts/sync-brand-to-tokens.cjs`
3. Verify output syncs to design tokens

## Primary Resources

The agent references documentation on voice frameworks, visual identity standards, messaging structures, consistency checklists, asset organization, color management, typography, logo usage, and approval processes—all maintained in the `references/` directory.

**Available subcommand:** `update` syncs brand identity changes across all design systems.
