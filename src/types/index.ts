import type { AiLeadSearchOutput } from "@/ai/flows/ai-lead-search";
import type { EnrichLeadOutput } from "@/ai/flows/lead-enrichment";

type BaseLead = AiLeadSearchOutput["leads"][0];

export type Lead = BaseLead &
  Partial<EnrichLeadOutput> & {
    id: string;
    companyName?: string;
    score?: number;
    scoreReason?: string;
    isEnriching?: boolean;
    isScoring?: boolean;
    industries?: string[];
    savedAt?: string;
    coordinates?: {
      latitude?: number;
      longitude?: number;
    };
  };
