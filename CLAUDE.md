# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mentat is an AI-powered smart document editor with a block-based architecture. It consists of:
- **Frontend**: Vue 3 application with TipTap editor and Vue Flow for visual workflows
- **Backend**: Kotlin/Spring Boot application using the Spice framework for AI agent orchestration

## Common Development Commands

### Backend (Kotlin/Spring Boot)
```bash
# Navigate to backend directory
cd backend/

# Build the project
./gradlew build

# Run tests
./gradlew test

# Run the application
./gradlew bootRun

# Clean build artifacts
./gradlew clean

# Check for compilation errors
./gradlew compileKotlin compileTestKotlin

# Run a specific test
./gradlew test --tests "TestClassName.testMethodName"
```

### Frontend (Vue 3)
```bash
# Navigate to frontend directory
cd frontend/

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Architecture Overview

### Backend Architecture
The backend uses a **Message-based Agent Architecture** built on the Spice framework:

- **Core Components**:
  - `AgentTool`: Base class for agent tools at `backend/src/main/kotlin/io/noailabs/mentat/core/AgentTool.kt`
  - `AgentDsl`: DSL for defining agents at `backend/src/main/kotlin/io/noailabs/mentat/dsl/AgentDsl.kt`
  - `ToolBuilder`: Builder pattern for tools at `backend/src/main/kotlin/io/noailabs/mentat/dsl/tool/ToolBuilder.kt`

- **Key Technologies**:
  - Kotlin 2.2.0 with Java 21
  - Spring Boot 3.5.3
  - Spice Framework 0.1.1 (from JitPack)
  - Kotlinx Coroutines for async operations

### Frontend Architecture
The frontend implements a block-based document editor:

- **Node Types** (each with specific colors and responsibilities):
  - **DataBlock** (Purple #8B5CF6): External data management
  - **PromptBlock** (Blue #3B82F6): AI prompts
  - **AgentBlock** (Green #10B981): AI agent execution
  - **ActionNode** (Orange #F97316): Workflow actions
  - **ResultBlock** (Pink #EC4899): Display results

- **Key Features**:
  - File upload support (CSV, TSV, JSON, TXT, XLSX)
  - Spreadsheet editing with Luckysheet
  - Visual workflow editor with Vue Flow
  - Block commands via slash commands (e.g., `/data`, `/prompt`)

## Important Notes

1. **Current Status**: The backend is in early development stages while the frontend is more mature
2. **Integration**: Frontend-backend integration is pending due to authentication implementation
3. **Architecture Evolution**: The project has evolved from DAG-based to message-based architecture (Constitution V4.0)
4. **Core Principle**: "Everything is an Agent, Everything flows through Messages"

## Development Tips

- When modifying the backend, ensure compatibility with the Spice framework patterns
- Frontend blocks should follow the established color scheme and node type conventions
- Use the existing DSL patterns when adding new agent capabilities
- Test file upload functionality with various formats when working on DataBlock features