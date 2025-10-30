import { Injectable } from '@nestjs/common';
import TanakaAgent from './agents/tanaka.agent';

@Injectable()
export class AgentsService {
  constructor() {}

  // Agent functions
  async replyToUser({
    query,
    userDetails,
  }: {
    query: string;
    userDetails: string;
  }): Promise<string> {
    const res = await TanakaAgent.generate(
      [
        {
          role: 'user',
          content: `User Details: ${userDetails}\n\nQuery: ${query}`,
        },
      ],
      {
        memory: {
          thread: userDetails,
          resource: 'tanaka-agent-memory',
        },
      },
    );

    return res.text;
  }
}
