import TanakaAgent from "./tanaka.agent";

/* --- HELPER FUNCTION --- */
export const replyToUser = async ({
  query,
  userDetails,
}: {
  query: string;
  userDetails: string;
}): Promise<string> => {
  const res = await TanakaAgent.generate(
    [
      {
        role: "user",
        content: `User Details: ${userDetails}\n\nQuery: ${query}`,
      },
    ],
    {
      memory: {
        thread: userDetails,
        resource: "tanaka-agent-memory",
      },
    },
  );

  return res.text;
};
