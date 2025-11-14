import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  project: process.env.OPENAI_PROJECT_ID
});

export async function POST(req) {
  try {
    const { messages } = await req.json();

    // --- Validation ---
    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "Invalid request: messages missing or not an array" }),
        { status: 400 }
      );
    }

    // --- Safety check: Make sure assistant ID exists ---
    if (!process.env.WORKWISE_ASSISTANT_ID) {
      console.error("❌ ERROR: WORKWISE_ASSISTANT_ID is not loaded from environment variables.");
      return new Response(
        JSON.stringify({
          error: "Server misconfiguration: Assistant ID missing.",
        }),
        { status: 500 }
      );
    }

    console.log("Loaded assistant ID:", process.env.WORKWISE_ASSISTANT_ID);

    // --- Create a thread for this conversation ---
    const thread = await client.beta.threads.create();

    // --- Add user's latest message ---
    await client.beta.threads.messages.create(thread.id, {
      role: "user",
      content: messages[messages.length - 1].content
    });

    // --- Run assistant on the thread ---
    const run = await client.beta.threads.runs.createAndPoll(thread.id, {
      assistant_id: process.env.WORKWISE_ASSISTANT_ID
    });

    // --- If assistant completed normally ---
    if (run.status === "completed") {
      const messagesList = await client.beta.threads.messages.list(thread.id);

      const assistantMessages = messagesList.data.filter(
        (m) => m.role === "assistant"
      );

      const lastMessage = assistantMessages[0];

      return new Response(
        JSON.stringify({
          reply: lastMessage?.content?.[0]?.text?.value || ""
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // --- Any other status (failed, requires_action, etc.) ---
    return new Response(
      JSON.stringify({
        error: `Run did not complete. Status: ${run.status}`,
        run,
      }),
      { status: 500 }
    );

  } catch (err) {
    console.error("🔥 API ERROR:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Unknown server error" }),
      { status: 500 }
    );
  }
}