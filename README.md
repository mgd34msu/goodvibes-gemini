# Gemini GoodVibes Extension

A comprehensive full-stack development suite for the Gemini CLI, providing a powerful ecosystem of specialized agents, a vast skill library, and advanced MCP tools.

## Overview

Gemini GoodVibes transforms your Gemini CLI into an expert development assistant. It leverages specialized personas, predefined development patterns (skills), and deep system integration (tools) to streamline software engineering tasks from architectural design to deployment.

## Key Features

- **9 Specialized Agents**: Expert personas for backend, frontend, architecture, testing, and more.
- **172 Development Skills**: A massive library of predefined patterns and best practices for modern web development.
- **91 MCP Tools**: Deep integration for project analysis, code validation, database introspection, and system operations.
- **Lifecycle Hooks**: Automated session management and context-aware assistance.
- **Full-Stack Focus**: Comprehensive support for React, Next.js, Node.js, databases, and DevOps.

---

## Installation

To install this extension in Gemini CLI:

1. Clone the repository:
   ```bash
   git clone https://github.com/mgd34msu/goodvibes-gemini
   cd goodvibes-gemini
   ```

2. Run the automatic setup:
   ```bash
   npm install
   npm run setup
   ```

This will build the extension and register the MCP tools in your global Gemini configuration.

## Core Components

### 1. Specialized Agents
Adopt expert personas to solve specific problems. Use the `search_agents` tool or ask Gemini to "act as":

- **Backend Engineer**: API design, database architecture, server-side logic.
- **Frontend Architect**: UI/UX patterns, component libraries, state management.
- **Fullstack Integrator**: Connecting front and back ends, API integration.
- **Code Architect**: High-level system design, patterns, and refactoring.
- **DevOps Deployer**: CI/CD pipelines, containerization, cloud infrastructure.
- **Test Engineer**: Unit, integration, and e2e testing strategies.
- **Brutally Honest Reviewer**: Strict code reviews, security analysis, performance audits.
- **Workflow Planner**: Task decomposition and project roadmap planning.
- **Content Platform**: Documentation and content strategy.

### 2. Skill Library
Access over 170 skills covering:
- **Common Development**: Refactoring, debugging, project understanding.
- **Quality Assurance**: Security audits, testing strategies, code smells.
- **Web Development**: Deep knowledge of React, Next.js, Tailwind, Prisma, and more.
- **Workflows**: PR generation, commit messaging, documentation.

### 3. MCP Tools
91 tools across several categories:
- **Project Analysis**: `detect_stack`, `explain_codebase`, `get_conventions`.
- **LSP Features**: `go_to_definition`, `find_references`, `get_diagnostics`.
- **Validation**: `check_types`, `run_smoke_test`, `validate_implementation`.
- **Data & Schema**: `get_database_schema`, `query_database`, `generate_fixture`.
- **Maintenance**: `upgrade_package`, `find_dead_code`, `analyze_dependencies`.

---

## Usage & Integration

### Context Management
The extension uses `GEMINI.md` to provide system-level instructions and context. It is automatically included in your session once the extension is active.

### Lifecycle Hooks
Automated hooks assist with:
- **Session Management**: `SessionStart`, `SessionEnd`.
- **Tool Safety**: `PreToolUse` validation and `PermissionRequest`.
- **Intelligent Feedback**: `PostToolUse` and `PostToolUseFailure` analysis.

### Development Scripts
Use these commands for maintenance and development:
- `npm run build`: Full build of registries, server, and hooks.
- `npm run validate`: Validate the current configuration and registries.
- `npm run setup`: Run the installation and setup script.
- `npm run migrate`: Migrate content from older formats.

---

## Technical Details

- **Language**: TypeScript / Node.js
- **Architecture**: Modular Skill & Agent registry system.
- **Communication**: Model Context Protocol (MCP).
- **Extensibility**: Easily add new skills or agents in their respective directories.

## License

MIT