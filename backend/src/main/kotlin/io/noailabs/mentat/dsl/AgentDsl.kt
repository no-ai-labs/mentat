package io.noailabs.mentat.dsl

import io.noailabs.mentat.dsl.tool.ToolBuilder
import io.github.noailabs.spice.Tool

// Data classes for DSL
data class ToolDef(
    val name: String,
    val tool: Tool
)

data class PersonaDef(
    val role: String,
    val goal: String,
    val context: String? = null
)

data class AgentDef(
    val name: String,
    val model: String,
    val temperature: Double,
    val tools: List<ToolDef>,
    val persona: PersonaDef?
)

// Builder for Persona
class PersonaBuilder {
    var role: String = ""
    var goal: String = ""
    var context: String? = null
    
    fun build(): PersonaDef = PersonaDef(role, goal, context)
}

// dsl/AgentDsl.kt
class AgentBuilder(val name: String) {
    var model: String = "gpt-3.5"
    var temperature: Double = 0.7
    val tools = mutableListOf<ToolDef>()
    var persona: PersonaDef? = null

    fun tool(name: String, block: ToolBuilder.() -> Unit) {
        val builder = ToolBuilder(name).apply(block)
        val tool = builder.build()
        tools += ToolDef(name, tool)
    }

    fun persona(block: PersonaBuilder.() -> Unit) {
        persona = PersonaBuilder().apply(block).build()
    }

    fun build(): AgentDef = AgentDef(name, model, temperature, tools, persona)
}

fun agent(name: String, block: AgentBuilder.() -> Unit): AgentDef {
    return AgentBuilder(name).apply(block).build()
}