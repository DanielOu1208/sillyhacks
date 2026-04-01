import type { ModelAdapter, ChatMessage } from "./providerAdapter.js";

const MOCK_RESPONSES: Record<string, string> = {
  opening: `After careful analysis, here is my initial position on this topic.

**Key Points:**
1. We need to consider the practical implications carefully before committing to any direction.
2. The trade-offs between the options are significant and deserve nuanced evaluation.
3. Historical precedent suggests that the most popular choice isn't always the best one.

**My Recommendation:** We should prioritize the option that balances long-term maintainability with short-term delivery speed. The team's existing expertise is a critical factor that's often underweighted in these decisions.

**Confidence: 65%** — I need to hear counterarguments before firming up this position.`,

  critique: `Having reviewed the other positions, I have several observations:

**Agreements:**
- The emphasis on team expertise is well-placed. Productivity trumps theoretical performance in most real-world scenarios.

**Disagreements:**
1. The risk assessment seems overly optimistic. Migration costs are consistently underestimated.
2. The performance benchmarks cited are synthetic and may not reflect our actual workload patterns.
3. There's insufficient consideration of the ecosystem maturity and library availability.

**Revised Thinking:** The strongest argument from the other side is about ecosystem momentum. However, this needs to be weighed against our specific requirements rather than general industry trends.`,

  convergence: `After considering all perspectives and critiques, here is my refined position:

**Final Stance:** I've moved closer to a pragmatic middle ground. The key insight from this debate is that the "right" choice depends heavily on context-specific factors.

**What Changed My Mind:**
- The critique about migration costs was compelling
- The ecosystem maturity argument holds more weight than I initially gave it

**What I Still Maintain:**
- Team expertise should be the primary driver
- We should prototype with both options before committing

**Confidence: 78%** — The debate has clarified the key trade-offs significantly.`,

  synthesis: `# Final Synthesis & Recommendation

## Summary of the Debate
The agents engaged in a thorough analysis, examining technical merits, practical considerations, and strategic implications.

## Key Areas of Agreement
1. **Team expertise matters most** — All agents converged on the importance of leveraging existing team knowledge.
2. **Prototyping before committing** — There was consensus that a small proof-of-concept would de-risk the decision.
3. **Ecosystem maturity** — The availability of libraries and community support is a critical factor.

## Key Areas of Disagreement
1. **Risk tolerance** — Agents differed on how much technical risk is acceptable for potential performance gains.
2. **Time horizon** — Short-term vs long-term optimization preferences varied.

## Final Recommendation
**Proceed with a two-week prototype phase** using the option that best matches the team's current skills, with a clear set of performance benchmarks to validate. If the prototype meets requirements, commit fully. If not, evaluate the alternative with the data gathered.

**Confidence: 82%**
This recommendation balances pragmatism with thoroughness and has buy-in from the majority of perspectives.`,
};

function detectPhase(messages: ChatMessage[]): string {
  const text = messages.map((m) => m.content).join(" ").toLowerCase();
  if (text.includes("synthesiz") || text.includes("synthesis") || text.includes("final recommendation")) return "synthesis";
  if (text.includes("convergence") || text.includes("refined") || text.includes("final stance")) return "convergence";
  if (text.includes("critique") || text.includes("review") || text.includes("counterargument")) return "critique";
  return "opening";
}

export function createMockAdapter(variant: string): ModelAdapter {
  const delay = variant === "mock-fast" ? 5 : 20; // ms per word

  return {
    async *generateStream(messages: ChatMessage[]): AsyncGenerator<string> {
      const phase = detectPhase(messages);
      const response = MOCK_RESPONSES[phase] ?? MOCK_RESPONSES.opening;
      const words = response.split(" ");

      for (const word of words) {
        await new Promise((r) => setTimeout(r, delay));
        yield word + " ";
      }
    },
  };
}
