
"use client";

import * as React from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Building2, Globe, Star, Mail, MapPin, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmailComposer } from "@/components/EmailComposer";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import type { Lead } from "@/types";

type SavedLeadsTableProps = {
  leads: Lead[];
  isLoading: boolean;
  onEnrich: (lead: Lead) => void;
};

export function SavedLeadsTable({ leads, isLoading, onEnrich }: SavedLeadsTableProps) {
  const [selectedLead, setSelectedLead] = React.useState<Lead | null>(null);

  const renderLoading = () => (
    Array.from({ length: 5 }).map((_, i) => (
      <TableRow key={i}>
        <TableCell><Skeleton className="h-5 w-full" /></TableCell>
        <TableCell><Skeleton className="h-5 w-full" /></TableCell>
        <TableCell><Skeleton className="h-5 w-full" /></TableCell>
        <TableCell><Skeleton className="h-5 w-full" /></TableCell>
        <TableCell><Skeleton className="h-5 w-full" /></TableCell>
      </TableRow>
    ))
  );

  return (
    <>
      <EmailComposer
        lead={selectedLead}
        isOpen={!!selectedLead}
        onClose={() => setSelectedLead(null)}
      />
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl">All Saved Leads</CardTitle>
          <CardDescription>
            {isLoading ? "Loading leads..." : `Showing ${leads.length} saved lead(s).`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead><div className="flex items-center gap-1"><Building2 className="h-4 w-4" /> Company</div></TableHead>
                  <TableHead><div className="flex items-center gap-1"><MapPin className="h-4 w-4" /> Location</div></TableHead>
                  <TableHead><div className="flex items-center gap-1"><Star className="h-4 w-4" /> Score</div></TableHead>
                  <TableHead><div className="flex items-center gap-1"><Mail className="h-4 w-4" /> Contact</div></TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  renderLoading()
                ) : leads.length > 0 ? (
                  leads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium whitespace-nowrap">
                          <div>{lead.companyName}</div>
                          {lead.website && <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1"><Globe className="h-3 w-3" /> {lead.website}</a>}
                      </TableCell>
                      <TableCell className="text-muted-foreground whitespace-nowrap">
                        {lead.coordinates?.latitude && lead.coordinates?.longitude ? (
                          <Link
                            href={`/map?lat=${lead.coordinates.latitude}&lng=${lead.coordinates.longitude}&name=${encodeURIComponent(lead.companyName || lead.name)}`}
                            className="text-primary hover:underline"
                          >
                            {lead.city}, {lead.state}
                          </Link>
                        ) : (
                          <div>{lead.city || lead.address}, {lead.state}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        {lead.score !== undefined ? (
                          <Badge variant="secondary">{lead.score}</Badge>
                        ) : 'N/A'}
                      </TableCell>
                      <TableCell className="text-muted-foreground whitespace-nowrap">
                        <div>{lead.ownerEmail || lead.companyPhone || lead.phone || 'N/A'}</div>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <TooltipProvider>
                           <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onEnrich(lead)}
                                        disabled={lead.isEnriching || !!lead.ownerEmail}
                                    >
                                        {lead.isEnriching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Enrich Lead</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                               <TooltipTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      disabled={!lead.ownerEmail}
                                      onClick={() => setSelectedLead(lead)}
                                    >
                                      <Mail className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Email Lead</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      No saved leads yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
