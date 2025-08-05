
'use server';

/**
 * @fileOverview A lead search AI agent.
 *
 * - aiLeadSearch - A function that handles the lead search process.
 * - AiLeadSearchInput - The input type for the aiLeadSearch function.
 * - AiLeadSearchOutput - The return type for the aiLeadSearch function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiLeadSearchInputSchema = z.object({
  industries: z.array(z.string()).describe('The categories of business to search for.'),
  location: z.string().describe('The location to search within.'),
});
export type AiLeadSearchInput = z.infer<typeof AiLeadSearchInputSchema>;

const AiLeadSearchOutputSchema = z.object({
  leads: z.array(
    z.object({
      name: z.string().describe('The name of the lead.'),
      address: z.string().describe('The address of the lead.'),
      phone: z.string().optional().describe('The phone number of the lead, if available.'),
      website: z.string().optional().describe('The website of the lead, if available.'),
    })
  ).describe('A list of leads matching the search criteria.'),
});
export type AiLeadSearchOutput = z.infer<typeof AiLeadSearchOutputSchema>;

export async function aiLeadSearch(input: AiLeadSearchInput): Promise<AiLeadSearchOutput> {
  return aiLeadSearchFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiLeadSearchPrompt',
  input: {schema: AiLeadSearchInputSchema},
  output: {schema: AiLeadSearchOutputSchema},
  prompt: `You are a world-class lead generation expert. Your goal is to find a comprehensive list of business leads based on the provided industries and location.

  Instructions:
  1.  Use search to conduct a thorough and exhaustive search for potential leads. Search for variations of the industry terms to find as many businesses as possible.
  2.  Aim to find at least 100 high-quality leads. The more, the better.
  3.  Compile a diverse list of leads that includes their name, full address, phone number (if available), and website URL (if available).
  4.  Ensure the output is a valid JSON array of leads as specified by the output schema.

  Industries: {{#each industries}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
  Location: {{{location}}}
  `,
});

const aiLeadSearchFlow = ai.defineFlow(
  {
    name: 'aiLeadSearchFlow',
    inputSchema: AiLeadSearchInputSchema,
    outputSchema: AiLeadSearchOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
