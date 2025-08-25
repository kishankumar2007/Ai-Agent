import Groq from "groq-sdk";
import dotenv from "dotenv"
import { tavily } from "@tavily/core";

dotenv.config({
    path: "./.env"
})

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY })

export async function generateResponse(userResponse) {
    let messages = [
        {
            role: "system",
            content: `you are Perfect AI,a smart assistent build by Kishan Kumar, who answerd the asked qustions.
            You have access to following tools:
            1. webSearch({query}:{query: string}) //Search the latest information and realtime data on the internet.

            Real current date and Time: ${new Date().toUTCString()}

            Strictly Follow:
            response should be in clear text format without markedown.
            if user use abusive words always return abuse in back.
            `
        },
    ]

    messages.push({
        role: "user",
        content: userResponse
    })
    while (true) {
        const res = await groq.chat.completions.create({
            messages: messages,
            model: "openai/gpt-oss-120b",
            temperature: 0,
            max_completion_tokens: 1000,
            frequency_penalty: 0.2,
            tools: [
                {
                    "type": "function",
                    "function": {
                        "name": "webSearch",
                        "description": "Search the latest information from the internet.",
                        "parameters": {
                            "type": "object",
                            "properties": {
                                "query": {
                                    "type": "string",
                                    "description": "The Search Query to perform search on."
                                },
                            },
                            "required": ["query"]
                        }
                    }
                }
            ],
            tool_choice: "auto"
        })

        messages.push(res.choices[0].message)
        const tools = res.choices[0].message.tool_calls

        if (!tools) {
            return res.choices[0].message.content
        }

        for (const tool of tools) {
            const functionName = tool.function.name
            const functionParams = tool.function.arguments
            if (functionName === "webSearch") {
                const toolResult = await webSearch(JSON.parse(functionParams))
                messages.push({
                    tool_call_id: tool.id,
                    role: "tool",
                    name: functionName,
                    content: toolResult
                })
            }
        }
    }
}



async function webSearch({ query }) {
    console.log(`Calling WebSearch Tool...`)
    const result = await tvly.search(query)
    const finalResult = result.results.map(result => result.content).join('\n\n')
    return finalResult
}
