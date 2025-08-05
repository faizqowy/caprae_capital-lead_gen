
"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Building2, Star, Trophy } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { Lead } from "@/types";

type TopLeadsListProps = {
  topLeadsBatches: { leads: Lead[] }[];
  isLoading: boolean;
};

export function TopLeadsList({ topLeadsBatches, isLoading }: TopLeadsListProps) {

  const renderLoading = () => (
    <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-full" />
            </div>
        ))}
    </div>
  );

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2"><Trophy className="h-6 w-6 text-yellow-500" /> Top Leads</CardTitle>
        <CardDescription>Your highest-scoring saved leads.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          renderLoading()
        ) : topLeadsBatches.length > 0 ? (
          <Accordion type="single" collapsible className="w-full">
            {topLeadsBatches.map((batch, index) => (
              <AccordionItem value={`item-${index}`} key={index}>
                <AccordionTrigger>
                    Top Leads Batch #{index + 1}
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-4">
                    {batch.leads.map((lead) => (
                      <li key={lead.id} className="flex items-start gap-4">
                        <div className="flex-shrink-0 bg-muted rounded-full h-10 w-10 flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-grow">
                          <p className="font-semibold">{lead.companyName}</p>
                          <p className="text-sm text-muted-foreground">{lead.city}, {lead.state}</p>
                        </div>
                         <Badge variant="secondary" className="flex items-center gap-1">
                           <Star className="h-3 w-3 text-yellow-400" /> {lead.score}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="h-24 flex items-center justify-center text-center text-muted-foreground">
            No top leads saved yet.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

    