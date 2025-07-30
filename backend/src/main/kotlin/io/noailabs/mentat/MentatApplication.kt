package io.noailabs.mentat

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class MentatApplication

fun main(args: Array<String>) {
    runApplication<MentatApplication>(*args)
} 