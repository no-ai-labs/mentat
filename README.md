# 🧠 Mentat - AI-Powered Graph Editor

## 📋 Project Overview

**Mentat** is an AI-powered graph editor built with Vue + TipTap, designed to intelligently execute user goals and visualize results. The system features a Spring Boot backend integrated with the Spice framework for AI agent orchestration.

### 🌟 Core Philosophy
- **Message-based Agent Architecture**: Everything is an Agent, Everything flows through Messages
- **Visual Workflow**: Intuitive graph-based interface for AI workflows
- **AI-First**: All features naturally integrated with AI capabilities
- **Extensible**: Easy to add new node types and AI capabilities

## 🏗️ System Architecture

### Frontend (Vue 3 + TipTap)
The frontend provides a rich block-based editor with visual workflow capabilities:

- **Block-based Editor**: TipTap-powered rich text editing
- **Visual Workflow**: Vue Flow for node connections
- **Node Types**:
  - **DataBlock** (Purple #8B5CF6): External data management
  - **PromptBlock** (Blue #3B82F6): AI prompts
  - **AgentBlock** (Green #10B981): AI agent execution
  - **ActionNode** (Orange #F97316): Workflow actions
  - **ResultBlock** (Pink #EC4899): Result visualization

### Backend (Spring Boot + Spice Framework)
The backend is being rebuilt with the Spice framework for advanced AI agent capabilities:

- **Spring Boot 3.5.3**: Core web framework
- **Kotlin 2.2.0** with Java 21
- **Spice Framework 0.1.2**: AI agent orchestration library
- **Message-based Architecture**: Asynchronous agent communication

## 🛠️ Tech Stack

### Frontend
- **Vue 3**: Reactive UI framework
- **TipTap**: ProseMirror-based rich text editor
- **Vue Flow**: Visual workflow editor
- **Tailwind CSS v4**: Utility-first CSS
- **Vite**: Fast build tool
- **Chart.js**: Data visualization
- **marked.js**: Markdown rendering

### Backend
- **Spring Boot 3.5.3**: Web framework
- **Kotlin 2.2.0**: Primary language
- **Spice Framework 0.1.2**: AI agent orchestration
- **Gradle**: Build tool
- **Coroutines**: Asynchronous programming

## 🚀 Getting Started

### Prerequisites
- Node.js 23.11.1 (managed by Volta)
- Java 21
- Docker (for future services)

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Backend Setup
```bash
cd backend
./gradlew build
./gradlew bootRun
```

## 📊 Current Status

### ✅ Frontend (Complete)
- Rich block-based editor with TipTap
- 5 node types implemented (Data, Prompt, Agent, Action, Result)
- Visual workflow with Vue Flow
- Chart.js integration for data visualization
- Markdown support with marked.js
- Responsive design with Tailwind CSS v4

### 🚧 Backend (Under Development)
- Basic Spring Boot setup complete
- Spice framework integration in progress
- Core DSL components:
  - `AgentBuilder`: DSL for defining agents
  - `ToolBuilder`: DSL for creating tools
  - Data models for agents and tools
- Authentication and API endpoints pending

## 🎯 Roadmap

### Phase 1: Core Infrastructure (Current)
- [x] Frontend implementation
- [x] Basic backend setup
- [x] Spice framework integration
- [ ] Authentication system
- [ ] Basic API endpoints

### Phase 2: AI Integration
- [ ] Connect to AI models (OpenAI, Google PaLM, etc.)
- [ ] Implement agent execution engine
- [ ] Real-time message streaming
- [ ] Context management

### Phase 3: Advanced Features
- [ ] Multi-agent collaboration
- [ ] Advanced visualization options
- [ ] Plugin system
- [ ] Real-time collaboration

## 🤝 Contributing

This project is currently in active development. Contributions are welcome!

## 📄 License

[License information to be added]

---

**Last Updated**: January 2025  
**Status**: Backend architecture migration in progress