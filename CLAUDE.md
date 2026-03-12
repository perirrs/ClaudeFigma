# Claude Code + Figma Integration

## Figma MCP Server Setup

This project uses the Figma MCP server to bridge designs and code.

### Quick Start (Remote MCP — Recommended)

```bash
# Add the Figma remote MCP server to Claude Code
claude mcp add --transport http figma-remote-mcp https://mcp.figma.com/mcp

# To make it available across ALL projects:
claude mcp add --transport http --scope user figma-remote-mcp https://mcp.figma.com/mcp
```

After adding, type `/mcp` in Claude Code → select **figma** → **Authenticate** → allow access.

### Alternative: Desktop MCP Server

If you have the Figma desktop app running:

```bash
claude mcp add --transport sse figma-local http://127.0.0.1:3845/sse
```

## Workflows

### Design → Code (Figma to Code)

1. Open your Figma file and select a frame/component
2. In Claude Code, either:
   - **Selection-based**: "Implement the currently selected Figma frame as a React component"
   - **Link-based**: "Convert this design to code: https://www.figma.com/file/..."
3. Claude reads design tokens, layout, and component structure via MCP
4. Generated code lands in `src/components/`

### Code → Design (Code to Canvas)

1. Build a component with Claude Code and preview it in the browser
2. Tell Claude: "Send this to Figma"
3. The running UI is captured as editable Figma layers
4. Designers can then refine on canvas

## Project Conventions

- Components go in `src/components/`
- Styles use Tailwind CSS utility classes
- Design tokens from Figma map to `tailwind.config.js` `theme.extend`
- Each component gets its own directory: `src/components/ComponentName/index.tsx`
