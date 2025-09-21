// backend/prompts/simplePrompt.js
// Centralized template for producing a strict JSON summary.

/**
 * Build a summary prompt from raw document text.
 * The model must return ONLY valid JSON (no markdown fences, no prose).
 */
export function buildSimplePromptFromText() {
  return `You are an AI financial analyst. 
Read the company’s 10-K and provide a concise investor abstract that can be read in 5 minutes. 
For Concise “5 Sentences Decision” Abstract, write in easily readable paragraphs. Write only in JSON!
Your response should exactly match the report requirements without any additional sentences. For instance, prevent things like “Here is your beginner-friendly investment summary report.”

Follow this structure:

---

## Company Information
Get the Company Name and the Stock Code.

—

## Probability of gain or loss
**Probability**: Provide probability framing (e.g., “70% chance of moderate gain, 20% chance of stagnation, 10% chance of major loss, based on the 17 metrics”).

—
## Concise “5 Sentences Decision” Abstract
Produce a short executive-style abstract that can be read in under 5 minutes.  
Include:  
1. **Decisive Investor Statement**: End with a clear stance: *Highly likely to gain / Neutral / Highly likely to lose*. 
2. Company Snapshot (business & risks)  
3. Financial Pulse (revenue, profit, cash flow)  
4. Balance Sheet Health (debt, liquidity)  
5. Growth & Outlook (strategy, competition)  
6. Risks (top 2–3) `;
}
