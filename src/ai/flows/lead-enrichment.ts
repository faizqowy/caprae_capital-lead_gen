'use server';

/**
 * @fileOverview Enriches lead data with details like email, industry, LinkedIn profile, website, names, addresses, and coordinates.
 *
 * - enrichLead - A function that enriches lead data.
 * - EnrichLeadInput - The input type for the enrichLead function.
 * - EnrichLeadOutput - The return type for the enrichLead function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EnrichLeadInputSchema = z.object({
  name: z.string().describe('The name of the lead.'),
  company: z.string().describe('The company the lead belongs to.'),
  location: z.string().describe('The location of the lead or company.'),
  website: z.string().optional().describe('The website of the company, if available.'),
});
export type EnrichLeadInput = z.infer<typeof EnrichLeadInputSchema>;

const EnrichLeadOutputSchema = z.object({
  website: z.string().optional().describe('The website of the company.'),
  industry: z.string().optional().describe('The industry the company operates in.'),
  productServiceCategory: z.string().optional().describe('The specific category of products or services offered.'),
  businessType: z.string().optional().describe('The business model, e.g., B2B, B2C, B2B2C.'),
  employeesCount: z.number().optional().describe('The estimated number of employees.'),
  revenue: z.string().optional().describe('The estimated annual revenue.'),
  yearFounded: z.number().optional().describe('The year the company was founded.'),
  bbbRating: z.string().optional().describe('The Better Business Bureau rating, if available.'),
  street: z.string().optional().describe('The street address of the company.'),
  city: z.string().optional().describe('The city where the company is located.'),
  state: z.string().optional().describe('The state or province where the company is located.'),
  companyPhone: z.string().optional().describe('The primary phone number for the company.'),
  companyLinkedIn: z.string().optional().describe('The URL of the company\'s LinkedIn profile.'),
  ownerFirstName: z.string().optional().describe('The first name of the owner or key executive.'),
  ownerLastName: z.string().optional().describe('The last name of the owner or key executive.'),
  ownerTitle: z.string().optional().describe('The job title of the owner or key executive.'),
  ownerLinkedIn: z.string().optional().describe('The LinkedIn profile URL of the owner or key executive.'),
  ownerPhoneNumber: z.string().optional().describe('The phone number of the owner or key executive.'),
  ownerEmail: z.string().optional().describe('The email address of the owner or key executive.'),
  source: z.string().optional().describe('The source from where the information was gathered.'),
  createdDate: z.string().optional().describe('The date the lead was created.'),
  updatedDate: z.string().optional().describe('The date the lead was last updated.'),
  coordinates: z.object({
    latitude: z.number().optional().describe('The latitude of the company location.'),
    longitude: z.number().optional().describe('The longitude of the company location.'),
  }).optional().describe('The geographic coordinates of the company.'),
});
export type EnrichLeadOutput = z.infer<typeof EnrichLeadOutputSchema>;

export async function enrichLead(input: EnrichLeadInput): Promise<EnrichLeadOutput> {
  return enrichLeadFlow(input);
}

const enrichLeadPrompt = ai.definePrompt({
  name: 'enrichLeadPrompt',
  input: {schema: EnrichLeadInputSchema},
  output: {schema: EnrichLeadOutputSchema},
  prompt: `You are an AI assistant tasked with enriching lead data with as much information as possible.

  Given the following lead information, use online resources and tools to find additional details.

  Lead Name: {{{name}}}
  Company: {{{company}}}
  Location: {{{location}}}
  Website: {{{website}}}

  Find the following information:
  - Company Website
  - Industry
  - Product/Service Category
  - Business Type (B2B, B2B2C, B2C)
  - Employees Count
  - Estimated Revenue
  - Year Founded
  - BBB Rating
  - Full Address (Street, City, State)
  - Geographic Coordinates (Latitude, Longitude)
  - Company Phone Number
  - Company LinkedIn Profile URL
  - Owner's First Name
  - Owner's Last Name
  - Owner's Title (e.g., CEO, Founder, Owner)
  - Owner's LinkedIn Profile URL
  - Owner's Phone Number
  - Owner's Email Address
  - Source of information
  - Date of creation and last update

  Provide the enriched lead data in the structured format specified.
  Consider the website provided as a starting point, if available. Otherwise, search online.
  Prioritize accuracy and relevance in your search.
  If a particular piece of information cannot be found, leave that field blank.
`,
});

const enrichLeadFlow = ai.defineFlow(
  {
    name: 'enrichLeadFlow',
    inputSchema: EnrichLeadInputSchema,
    outputSchema: EnrichLeadOutputSchema,
  },
  async input => {
    const {output} = await enrichLeadPrompt(input);
    return output!;
  }
);
