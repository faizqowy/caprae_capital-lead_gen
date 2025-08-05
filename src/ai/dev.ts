import { config } from 'dotenv';
config();

import '@/ai/flows/lead-enrichment.ts';
import '@/ai/flows/lead-scoring.ts';
import '@/ai/flows/ai-lead-search.ts';
import '@/ai/flows/generate-email-copy.ts';
