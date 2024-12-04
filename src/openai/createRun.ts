import OpenAI from "openai";
import { Run } from "openai/resources/beta/threads/runs/runs";
import { Thread } from "openai/resources/beta/threads/threads";

export async function createRun(client: OpenAI, thread: Thread, assistantId: string): Promise<Run> {
    console.log(`🎬 Creating run for thread ${thread.id} with assistant ${assistantId}`);

    let run = await client.beta.threads.runs.create(thread.id, {
        assistant_id: assistantId
    });

    console.log(`⏳ Run ${run.id} created, waiting for completion...`);

    // Wait for the run to complete and keep polling
    while (run.status === 'in_progress' || run.status === 'queued') {
        console.log(`🔄 Run status: ${run.status}`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        run = await client.beta.threads.runs.retrieve(thread.id, run.id);
    }

    console.log(`✅ Run ${run.id} completed with status: ${run.status}`);
    return run;
}
