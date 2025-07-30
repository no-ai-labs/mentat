package io.noailabs.mentat.dsl.tool

import io.github.noailabs.spice.*
import kotlinx.serialization.json.JsonElement

/**
 * DSL Builder for defining a Tool.
 */
class ToolBuilder(val name: String) {
    var description: String = ""
    private val parameters = mutableMapOf<String, ParameterSchema>()
    private var execLogic: suspend (Map<String, Any>) -> ToolResult = {
        ToolResult.error("Execution logic not implemented")
    }

    fun parameter(
        name: String,
        type: String,
        description: String,
        required: Boolean = false,
        default: JsonElement? = null
    ) {
        parameters[name] = ParameterSchema(
            type = type,
            description = description,
            required = required,
            default = default
        )
    }

    fun execute(block: suspend (Map<String, Any>) -> String) {
        this.execLogic = { params -> ToolResult.success(block(params)) }
    }

    fun executeRaw(block: suspend (Map<String, Any>) -> ToolResult) {
        this.execLogic = block
    }

    fun build(): Tool {
        return object : Tool {
            override val name: String = this@ToolBuilder.name
            override val description: String = this@ToolBuilder.description
            override val schema: ToolSchema = ToolSchema(name, description, parameters)
            
            override suspend fun execute(parameters: Map<String, Any>): ToolResult {
                return execLogic(parameters)
            }
        }
    }
}