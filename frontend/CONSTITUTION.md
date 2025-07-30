# 📜 Mentat Constitution V4.0 - Message Era

**Version**: 4.0  
**Adopted**: 2025-07-11  
**Effective**: Upon Spice Framework Integration  
**Amendment Reason**: Transition to Message-based Agent Architecture

> *"Mentat은 더 이상 DAG 기반 워크플로우 시스템이 아니다.  
> Mentat은 Message 기반 Agent 사회다."*

---

## 🎯 Preamble (전문)

We, the architects of Mentat, in order to create a more intelligent, flexible, and powerful AI orchestration system, do hereby establish this Constitution for the Message Era. 

This Constitution represents a **philosophical paradigm shift** from rigid node connections to dynamic message flows, from procedural workflows to intelligent agent societies.

The fundamental principle is simple: **Everything is an Agent, Everything flows through Messages**.

---

## 📖 Table of Contents

1. [Core Principles](#core-principles)
2. [Message Types](#message-types)
3. [Agent Types](#agent-types)
4. [Agent Selection Rules](#agent-selection-rules)
5. [Message Routing](#message-routing)
6. [Tool Integration](#tool-integration)
7. [Workflow Control](#workflow-control)
8. [Constraints](#constraints)
9. [Implementation Guidelines](#implementation-guidelines)

---

## 🎯 Core Principles

### Article I: The Four Pillars

1. **Everything is an Agent**
   - All processing units are Agents with clear capabilities
   - No special cases, no exceptions, no legacy concepts
   - Uniform interface: `Agent.processMessage(message: Message): Message`

2. **All Communication via Messages**
   - No direct node-to-node connections
   - All data flows through typed Messages
   - Message metadata enables intelligent routing

3. **Flexible Routing over Rigid Constraints**
   - Dynamic message routing replaces static rules
   - Runtime intelligence over compile-time restrictions
   - Adaptation over enforcement

4. **Tool-First Approach**
   - Extensibility through Tool ecosystem
   - Agent capabilities defined by available Tools
   - Composable functionality

---

## 📨 Message Types

### Article II: Core Message Classification

#### Primary Types
```kotlin
enum class MessageType {
    TEXT,           // General text communication
    SYSTEM,         // System control messages
    DATA,           // Data transfer and processing
    RESULT,         // Final or intermediate results
    
    TOOL_CALL,      // Tool invocation requests
    TOOL_RESULT,    // Tool execution outcomes
    
    WORKFLOW_START, // Workflow initiation
    WORKFLOW_END,   // Workflow termination
    
    BRANCH,         // Conditional flow control
    MERGE,          // Flow convergence
    
    INTERRUPT,      // Execution suspension (V4)
    RESUME,         // Execution continuation (V4)
    
    ERROR           // Error conditions
}
```

#### Message Structure
```kotlin
data class Message(
    val id: String,
    val content: String,
    val type: MessageType,
    val sender: String,
    val receiver: String?,
    val metadata: Map<String, String>,
    val timestamp: Long,
    val parentId: String?,
    val conversationId: String?
)
```

#### Message Lifecycle
1. **Creation**: Agent or User generates Message
2. **Routing**: MessageRouter applies transformation rules
3. **Selection**: AgentEngine selects appropriate Agent
4. **Processing**: Agent.processMessage() executes
5. **Response**: New Message(s) generated

---

## 🤖 Agent Types

### Article III: Agent Classification and Responsibilities

| Agent Type | Primary Role | Message Compatibility | Capabilities |
|-----------|-------------|---------------------|--------------|
| **PromptAgent** | User prompt processing | TEXT, PROMPT, SYSTEM | `prompt_processing` |
| **DataAgent** | Data input and management | DATA, TEXT, WORKFLOW_* | `data_provision` |
| **ResultAgent** | Result formatting and visualization | TEXT, DATA, RESULT | `result_processing`, `visualization` |
| **BranchAgent** | Conditional logic processing | TEXT, SYSTEM, BRANCH | `conditional_logic`, `branching` |
| **MergeAgent** | Multi-flow convergence | TEXT, SYSTEM, MERGE | `flow_merging`, `aggregation` |
| **ActionAgent** | External system integration | TOOL_CALL, API calls | `side_effects`, `external_integration` |

#### Agent Interface Contract
```kotlin
interface Agent {
    val id: String
    val name: String
    val description: String
    val capabilities: List<String>
    
    suspend fun processMessage(message: Message): Message
    fun canHandle(message: Message): Boolean
    fun getTools(): List<Tool>
    fun isReady(): Boolean
}
```

#### Agent Lifecycle
1. **Registration**: `AgentEngine.registerAgent(agent)`
2. **Selection**: Based on message type and capabilities
3. **Execution**: `processMessage()` with context management
4. **Tool Integration**: Automatic tool registration and execution

---

## 🚦 Agent Selection Rules

### Article IV: Intelligent Agent Selection Algorithm

#### Selection Priority (Descending Order)
1. **Explicit Receiver** (Score: 10)
   - `message.receiver` explicitly specifies target Agent
   - Highest priority, bypasses all other rules

2. **Capability Matching** (Score: 5)
   - `message.metadata["requiredCapability"]` matches `agent.capabilities`
   - Ensures functional compatibility

3. **Message Type Compatibility** (Score: 3)
   - `agent.canHandle(message)` returns true
   - Type-based routing for standard workflows

4. **Context Continuity** (Score: 2)
   - Recent Agent usage in same ExecutionContext
   - Maintains conversation flow

#### Selection Algorithm
```kotlin
fun selectAgent(message: Message, context: ExecutionContext): Agent {
    val candidates = agents.filter { it.canHandle(message) }
    return candidates.maxByOrNull { calculateScore(it, message, context) }
        ?: throw NoAvailableAgentException()
}

fun calculateScore(agent: Agent, message: Message, context: ExecutionContext): Int {
    var score = 0
    
    // Explicit receiver
    if (message.receiver == agent.id) score += 10
    
    // Capability matching
    message.metadata["requiredCapability"]?.let { capability ->
        if (agent.capabilities.contains(capability)) score += 5
    }
    
    // Type compatibility
    if (agent.canHandle(message)) score += 3
    
    // Context continuity
    if (context.lastAgentId == agent.id) score += 2
    
    return score
}
```

---

## 🔄 Message Routing

### Article V: Dynamic Message Transformation

#### Routing Rules
The MessageRouter applies intelligent transformations to enable seamless flow:

1. **DATA → RESULT Transformation**
   ```kotlin
   // Automatic SYSTEM message insertion
   if (message.type == DATA && targetType == RESULT) {
       insertSystemMessage(message.withMetadata("autoInserted", "dataToResult"))
   }
   ```

2. **Sequential PROMPT Handling**
   ```kotlin
   // Second PROMPT becomes SYSTEM
   if (message.type == PROMPT && isSecondPrompt(message)) {
       message.withType(SYSTEM).withMetadata("autoUpgraded", "promptToSystem")
   }
   ```

3. **BRANCH Expansion**
   ```kotlin
   // Branch messages create multiple parallel flows
   if (message.type == BRANCH) {
       expandToMultiplePaths(message)
   }
   ```

#### Router Implementation
```kotlin
class MessageRouter {
    private val rules = mutableListOf<MessageRoutingRule>()
    
    fun route(message: Message): List<Message> {
        val applicableRules = rules.filter { it.canRoute(message) }
        return if (applicableRules.isEmpty()) {
            listOf(message)
        } else {
            applicableRules.map { it.route(message) }
        }
    }
}
```

---

## 🛠️ Tool Integration

### Article VI: Extensible Tool Ecosystem

#### Tool Interface
```kotlin
interface Tool {
    val name: String
    val description: String
    val schema: ToolSchema
    
    suspend fun execute(parameters: Map<String, Any>): ToolResult
    fun canExecute(parameters: Map<String, Any>): Boolean
}
```

#### Tool Execution Flow
1. **Registration**: Agent registers Tools with ToolRunner
2. **Invocation**: TOOL_CALL message triggers tool execution
3. **Execution**: ToolRunner.executeTool() with parameter validation
4. **Response**: TOOL_RESULT message with execution outcome

#### Built-in Tools
- **WebSearchTool**: Internet search capabilities
- **FileReadTool** / **FileWriteTool**: File system operations
- **Custom Tools**: DSL-based tool creation

#### Tool DSL Example
```kotlin
val calculator = buildTool("calculator") {
    description = "Mathematical calculations"
    
    parameter("operation", "string", "Math operation", required = true)
    parameter("a", "number", "First number", required = true)
    parameter("b", "number", "Second number", required = true)
    
    execute { params ->
        val op = params["operation"] as String
        val a = (params["a"] as Number).toDouble()
        val b = (params["b"] as Number).toDouble()
        
        val result = when (op) {
            "add" -> a + b
            "subtract" -> a - b
            "multiply" -> a * b
            "divide" -> if (b != 0.0) a / b else error("Division by zero")
            else -> error("Unknown operation: $op")
        }
        
        ToolResult.success("Result: $result")
    }
}
```

---

## 🎛️ Workflow Control

### Article VII: Execution Context and Flow Management

#### ExecutionContext
```kotlin
data class ExecutionContext(
    val id: String,
    val startTime: Long,
    val messageHistory: MutableList<Message>,
    var isTerminated: Boolean,
    var lastAgentId: String?,
    var isSuspended: Boolean = false,
    var suspendedAgentId: String? = null
)
```

#### Workflow Lifecycle
1. **Initiation**: WORKFLOW_START message creates ExecutionContext
2. **Execution**: Continuous message processing loop
3. **State Management**: Message history and Agent context tracking
4. **Termination**: Automatic or explicit workflow completion

#### Cycle Support
- **Feedback Loops**: `Agent → Result → Agent`
- **Iterative Improvement**: Result-based reprocessing
- **User Interaction**: INTERRUPT/RESUME for real-time control

#### Interrupt/Resume Mechanism (V4 Innovation)
```kotlin
// Suspend execution for user input
suspend fun pauseAgent(contextId: String, agentId: String) {
    val context = executionContexts[contextId]
    context?.let {
        it.isSuspended = true
        it.suspendedAgentId = agentId
    }
}

// Resume with user response
suspend fun resumeAgent(contextId: String, reply: Message): AgentMessage {
    val context = executionContexts[contextId]
    require(context?.isSuspended == true) { "Context not suspended" }
    
    context.isSuspended = false
    context.suspendedAgentId = null
    
    return receive(reply.copy(conversationId = contextId))
}
```

#### Termination Conditions
1. **Explicit**: WORKFLOW_END message
2. **Keyword**: "TERMINATE" in message content
3. **Result Finalization**: `resultType=final` metadata
4. **Safety**: Maximum 50 iterations per workflow
5. **Error**: Unrecoverable execution failures

---

## 🔒 Constraints

### Article VIII: Simplified Constraint Framework

#### Core Constraints (Only 4!)
1. **Agent Readiness**: `agent.isReady()` must return true
2. **Message Validation**: Non-empty content and sender required
3. **Tool Availability**: TOOL_CALL requires existing tool
4. **Context Limits**: Maximum 50 messages in ExecutionContext

#### Removed Constraints ❌
- ~~Node connection restrictions~~
- ~~Auto-upgrade rules~~
- ~~Maximum node count limits~~
- ~~PromptNode special cases~~
- ~~Forbidden connection patterns~~

#### Validation Logic
```kotlin
fun validateMessage(message: Message) {
    require(message.content.isNotBlank()) { "Message content cannot be empty" }
    require(message.sender.isNotBlank()) { "Message sender must be specified" }
}

fun validateAgent(agent: Agent) {
    require(agent.isReady()) { "Agent ${agent.id} is not ready" }
}
```

---

## 🛠️ Implementation Guidelines

### Article IX: Development and Migration Standards

#### Agent Development Pattern
```kotlin
class CustomAgent : BaseAgent(
    id = "custom-agent",
    name = "Custom Processing Agent",
    description = "Specialized agent for custom logic",
    capabilities = listOf("custom_processing", "data_analysis")
) {
    override suspend fun processMessage(message: Message): Message {
        return when (message.type) {
            MessageType.TEXT -> processText(message)
            MessageType.DATA -> processData(message)
            else -> message.createReply("Processed by $name", id)
        }
    }
    
    private suspend fun processText(message: Message): Message {
        val processed = "Custom processing: ${message.content}"
        return message.createReply(processed, id, MessageType.TEXT)
    }
}
```

#### DSL-based Agent Creation
```kotlin
val textProcessor = buildAgent {
    id = "text-processor"
    name = "Text Processing Agent"
    description = "Processes and transforms text"
    
    capabilities {
        add("text_processing")
        add("natural_language")
    }
    
    tools {
        add(WebSearchTool())
        custom("summarize") {
            description = "Summarize text content"
            parameter("text", "string", "Text to summarize", required = true)
            parameter("length", "number", "Summary length", required = false)
            
            execute { params ->
                val text = params["text"] as String
                val length = (params["length"] as? Number)?.toInt() ?: 100
                ToolResult.success("Summary: ${text.take(length)}...")
            }
        }
    }
    
    messageHandler { message ->
        when (message.type) {
            MessageType.TEXT -> {
                val processed = message.content.uppercase()
                message.createReply(processed, id)
            }
            else -> message.createReply("Processed: ${message.content}", id)
        }
    }
}
```

#### Migration from V3
1. **Agent Conversion**: Convert node types to Agent implementations
2. **Message Adaptation**: Wrap existing logic with Message interface
3. **Tool Integration**: Extract tools from Agent implementations
4. **Context Migration**: Map workflow state to ExecutionContext

#### Testing Framework
```kotlin
class AgentTest {
    @Test
    fun testMessageProcessing() = runTest {
        val agent = PromptAgent()
        val message = Message(
            content = "Test prompt",
            sender = "user",
            type = MessageType.TEXT
        )
        
        val response = agent.processMessage(message)
        
        assertEquals(MessageType.TEXT, response.type)
        assertTrue(response.content.contains("Processed"))
    }
}
```

#### Performance Guidelines
- **Async Processing**: All Agent operations are suspending functions
- **Context Management**: Automatic cleanup of expired contexts
- **Memory Efficiency**: Message history limited to 50 entries
- **Tool Caching**: Reuse tool instances across Agent executions

---

## 📊 V3 → V4 Migration Guide

### Concept Mapping
| V3 Concept | V4 Equivalent | Migration Action |
|-----------|---------------|------------------|
| promptNode | PromptAgent | Convert to Agent interface |
| agentNode | Various Agents | Specialize by capability |
| dataNode | DataAgent | Implement data handling |
| resultNode | ResultAgent | Focus on visualization |
| branchNode | BranchAgent | Implement conditional logic |
| mergeNode | MergeAgent | Handle flow convergence |
| actionNode | ActionAgent + Tools | Extract tools, implement actions |

### Breaking Changes
- **Node → Agent**: All nodes become Agent implementations
- **Direct Connection → Message**: No direct node connections
- **Rules → Routing**: Static rules become dynamic routing
- **Auto-upgrade → MessageRouter**: Transformation logic centralized

### Compatibility Layer
```kotlin
// V3 compatibility wrapper
class V3NodeAdapter(private val v3Node: V3Node) : Agent {
    override suspend fun processMessage(message: Message): Message {
        val v3Input = message.toV3Input()
        val v3Output = v3Node.process(v3Input)
        return v3Output.toMessage(id)
    }
}
```

---

## 🎉 Conclusion

### The Message Era Promise

Mentat Constitution V4.0 represents more than a technical upgrade—it embodies a **philosophical transformation** from procedural thinking to intelligent agent societies.

We have moved from:
- **Rigid** → **Flexible**
- **Procedural** → **Intelligent**
- **Constrained** → **Extensible**
- **Static** → **Dynamic**

### The Four Pillars in Practice

1. **Everything is an Agent**: Unified, predictable interfaces
2. **All Communication via Messages**: Trackable, transformable flows
3. **Flexible Routing over Rigid Constraints**: Adaptive, intelligent behavior
4. **Tool-First Approach**: Unlimited extensibility

### Future Vision

V4 establishes the foundation for:
- **Real-time Collaboration**: Human-Agent partnerships
- **Intelligent Orchestration**: Self-organizing workflows
- **Infinite Extensibility**: Tool-based capability expansion
- **Enterprise Scale**: Complex business process automation

---

## 📚 Appendices

### Appendix A: Complete MessageType Reference
[Detailed enumeration of all message types with examples]

### Appendix B: Agent Implementation Patterns
[Common patterns and best practices for Agent development]

### Appendix C: Tool Development Guide
[Comprehensive guide for creating custom Tools]

### Appendix D: Performance Optimization
[Guidelines for high-performance Message processing]

---

*"In the Message Era, intelligence flows where it needs to go,  
when it needs to go there, in the form it needs to take."*

**🌶️ The Spice must flow, and now the Message flows with it.**

---

**Ratified by**: Mentat Constitutional Convention  
**Effective Date**: Upon Spice Framework Integration  
**Version**: 4.0.0  
**Document ID**: MENTAT-CONST-V4  
**Last Updated**: 2025-07-11 