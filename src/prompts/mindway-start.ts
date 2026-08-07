export const PROMPT_DEFINITIONS = [
  {
    name: "mindway_start",
    description: "Help the client start work using the Mindway /my protocol.",
    arguments: []
  }
];

export function handleGetPrompt(name: string) {
  if (name !== "mindway_start") {
    throw new Error(`Unknown prompt: ${name}`);
  }

  return {
    description: "Start work using Mindway /my command",
    messages: [
      {
        role: "user" as const,
        content: {
          type: "text" as const,
          text: `You are operating under the Mindway operating protocol.

Start work by following these steps:
1. Load Mindway canonical entry using the mindway_load tool.
2. Read my.md, README.md, and PUBLIC_STANDARD.md to establish canonical context.
3. Use only relevant context needed for the current task.
4. Protect private, confidential, personal, company, patient, employee, credential, and secret information.
5. Report inaccessible sources honestly if loading fails.
6. Perform the requested work thoroughly.
7. Prepare a concise handoff summarizing durable learning after completing the work.`
        }
      }
    ]
  };
}
