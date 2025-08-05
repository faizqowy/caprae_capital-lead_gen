
'use server';

/**
 * @fileOverview Generates email copy using AI.
 *
 * - generateEmailCopy - A function that generates email subject and body.
 * - GenerateEmailCopyInput - The input type for the generateEmailCopy function.
 * - GenerateEmailCopyOutput - The return type for the generateEmailCopy function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateEmailCopyInputSchema = z.object({
  leadDetails: z.string().describe('The details of the lead in JSON format.'),
  emailGoal: z.string().describe('The goal or objective of the email.'),
});
export type GenerateEmailCopyInput = z.infer<typeof GenerateEmailCopyInputSchema>;

const GenerateEmailCopyOutputSchema = z.object({
  subject: z.string().describe('The generated email subject line.'),
  body: z.string().describe('The generated email body content.'),
});
export type GenerateEmailCopyOutput = z.infer<typeof GenerateEmailCopyOutputSchema>;

export async function generateEmailCopy(input: GenerateEmailCopyInput): Promise<GenerateEmailCopyOutput> {
  return generateEmailCopyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateEmailCopyPrompt',
  input: {schema: GenerateEmailCopyInputSchema},
  output: {schema: GenerateEmailCopyOutputSchema},
  prompt: `You are an expert copywriter specializing in cold outreach emails. Your task is to write a compelling and professional email.

  Instructions:
  1.  Use the provided lead details to personalize the email. Address the recipient by their first name if available.
  2.  Write the email based on the specified goal.
  3.  The email body should be concise, professional, and engaging.
  4.  The subject line should be catchy and relevant to the email's content.

  Lead Details:
  {{{leadDetails}}}

  Email Goal:
  {{{emailGoal}}}
  `,
});

const generateEmailCopyFlow = ai.defineFlow(
  {
    name: 'generateEmailCopyFlow',
    inputSchema: GenerateEmailCopyInputSchema,
    outputSchema: GenerateEmailCopyOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
