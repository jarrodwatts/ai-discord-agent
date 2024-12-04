import OpenAI from "openai";
import { Run } from "openai/resources/beta/threads/runs/runs";
import { Thread } from "openai/resources/beta/threads/threads";
import { tools } from '../tools/allTools.js';

export async function handleRunToolCalls(run: Run, client: OpenAI, thread: Thread): Promise<Run> {
    console.log(`🔧 Checking for required tool calls in run ${run.id}`);

    const toolCalls = run.required_action?.submit_tool_outputs?.tool_calls;
    if (!toolCalls) {
        console.log('📭 No tool calls required');
        return run;
    }

    console.log(`🛠️ Processing ${toolCalls.length} tool calls`);

    const toolOutputs = await Promise.all(
        toolCalls.map(async (tool) => {
            const toolConfig = tools[tool.function.name];
            if (!toolConfig) {
                console.error(`❌ Tool not found: ${tool.function.name}`);
                return null;
            }

            console.log(`💾 Executing tool: ${tool.function.name}`);
            console.log(`📝 Tool arguments:`, tool.function.arguments);

            try {
                const args = JSON.parse(tool.function.arguments);
                console.log(`🎯 Parsed arguments:`, args);
                const output = await toolConfig.handler(args);
                console.log(`✅ Tool execution successful:`, output);
                return {
                    tool_call_id: tool.id,
                    output: String(output)
                };
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                console.error(`❌ Tool execution failed:`, errorMessage);
                return {
                    tool_call_id: tool.id,
                    output: `Error: ${errorMessage}`
                };
            }
        })
    );

    const validOutputs = toolOutputs.filter(Boolean) as OpenAI.Beta.Threads.Runs.RunSubmitToolOutputsParams.ToolOutput[];
    console.log(`📊 Valid tool outputs: ${validOutputs.length}/${toolCalls.length}`);

    if (validOutputs.length === 0) {
        console.log('⚠️ No valid tool outputs to submit');
        return run;
    }

    console.log(`📤 Submitting tool outputs to OpenAI`);
    return client.beta.threads.runs.submitToolOutputsAndPoll(
        thread.id,
        run.id,
        { tool_outputs: validOutputs }
    );
}
