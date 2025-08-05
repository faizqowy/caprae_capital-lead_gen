'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LeadScoringInputSchema = z.object({
  leadDetails: z.string().describe('Details of the lead to be scored.'),
  scoringPrompt: z.string().describe('The prompt to use for scoring the lead.'),
});
export type LeadScoringInput = z.infer<typeof LeadScoringInputSchema>;

const LeadScoringOutputSchema = z.object({
  score: z.number().describe('The score of the lead based on the scoring prompt.'),
  reason: z.string().describe('The reasoning behind the assigned score.'),
});
export type LeadScoringOutput = z.infer<typeof LeadScoringOutputSchema>;

export async function leadScoring(input: LeadScoringInput): Promise<LeadScoringOutput> {
  return leadScoringFlow(input);
}

const prompt = ai.definePrompt({
  name: 'leadScoringPrompt',
  input: {schema: LeadScoringInputSchema},
  output: {schema: LeadScoringOutputSchema},
  prompt: `You are an expert lead scorer. Given the following lead details and scoring prompt, provide a score and reasoning.

Lead Details: {{{leadDetails}}}

Scoring Prompt: {{{scoringPrompt}}}

Score (0-100): 
Reasoning: `,
});

const leadScoringFlow = ai.defineFlow(
  {
    name: 'leadScoringFlow',
    inputSchema: LeadScoringInputSchema,
    outputSchema: LeadScoringOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
