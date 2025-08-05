
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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowDown,
  ArrowUp,
  Building2,
  Gem,
  Linkedin,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  Star,
  Globe,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  User,
  Briefcase,
  Calendar,
  DollarSign,
  Users,
  Info,
  StarHalf,
  Map,
} from "lucide-react";

import type { Lead } from "@/types";

type SortConfig = {
  key: keyof Lead | null;
  direction: "ascending" | "descending";
};

type LeadTableProps = {
  leads: Lead[];
  isLoading: boolean;
  onEnrich: (lead: Lead) => void;
  onScore: (lead: Lead) => void;
};

const LEADS_PER_PAGE = 20;

export function LeadTable({ leads, isLoading, onEnrich, onScore }: LeadTableProps) {
  const [sortConfig, setSortConfig] = React.useState<SortConfig>({ key: null, direction: "ascending" });
  const [currentPage, setCurrentPage] = React.useState(1);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [leads]);

  const sortedLeads = React.useMemo(() => {
    let sortableItems = [...leads];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        const valA = a[sortConfig.key!] ?? '';
        const valB = b[sortConfig.key!] ?? '';

        if (sortConfig.key === 'score' || sortConfig.key === 'employeesCount' || sortConfig.key === 'yearFounded') {
           const numA = typeof valA === 'number' ? valA : -1;
           const numB = typeof valB === 'number' ? valB : -1;
            if (numA < numB) {
                return sortConfig.direction === "ascending" ? -1 : 1;
            }
            if (numA > numB) {
                return sortConfig.direction === "ascending" ? 1 : -1;
            }
            return 0
        }

        if (valA < valB) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (valA > valB) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [leads, sortConfig]);

  const paginatedLeads = React.useMemo(() => {
    const startIndex = (currentPage - 1) * LEADS_PER_PAGE;
    return sortedLeads.slice(startIndex, startIndex + LEADS_PER_PAGE);
  }, [sortedLeads, currentPage]);

  const totalPages = Math.ceil(leads.length / LEADS_PER_PAGE);

  const requestSort = (key: keyof Lead) => {
    let direction: "ascending" | "descending" = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };
  
  const getSortIcon = (key: keyof Lead) => {
    if (sortConfig.key !== key) {
      return null;
    }
    return sortConfig.direction === 'ascending' ? <ArrowUp className="h-3 w-3 ml-1" /> : <ArrowDown className="h-3 w-3 ml-1" />;
  };

  const renderLoading = () => (
    Array.from({ length: 10 }).map((_, i) => (
      <TableRow key={i}>
        {Array.from({ length: 25 }).map((_, j) => (
            <TableCell key={j}><Skeleton className="h-5 w-full min-w-[150px]" /></TableCell>
        ))}
      </TableRow>
    ))
  );

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Lead Results</CardTitle>
        <CardDescription>
          {isLoading ? "Searching for leads..." : `Found ${leads.length} lead${leads.length !== 1 && 's'}. Enrich and score them to find the best prospects.`}
        </CardDescription>
         {isLoading && <div className="pt-2"><Progress value={undefined} className="w-full" /></div>}
      </CardHeader>
      <CardContent>
        <TooltipProvider>
        <div className="rounded-md border w-full overflow-x-auto">
          <Table className="min-w-max">
            <TableHeader>
              <TableRow>
                <TableHead onClick={() => requestSort("companyName")} className="cursor-pointer hover:bg-muted/50 whitespace-nowrap"><div className="flex items-center gap-1"><Building2 className="h-4 w-4" /> Company {getSortIcon("companyName")}</div></TableHead>
                <TableHead className="whitespace-nowrap"><div className="flex items-center gap-1"><Globe className="h-4 w-4" /> Website</div></TableHead>
                <TableHead onClick={() => requestSort("industry")} className="cursor-pointer hover:bg-muted/50 whitespace-nowrap"><div className="flex items-center gap-1"><Briefcase className="h-4 w-4" /> Industry {getSortIcon("industry")}</div></TableHead>
                <TableHead className="whitespace-nowrap"><div className="flex items-center gap-1"><Info className="h-4 w-4" /> Product/Service</div></TableHead>
                <TableHead className="whitespace-nowrap"><div className="flex items-center gap-1"><Info className="h-4 w-4" /> Business Type</div></TableHead>
                <TableHead onClick={() => requestSort("employeesCount")} className="cursor-pointer hover:bg-muted/50 whitespace-nowrap"><div className="flex items-center gap-1"><Users className="h-4 w-4" /> Employees {getSortIcon("employeesCount")}</div></TableHead>
                <TableHead className="whitespace-nowrap"><div className="flex items-center gap-1"><DollarSign className="h-4 w-4" /> Revenue</div></TableHead>
                <TableHead onClick={() => requestSort("yearFounded")} className="cursor-pointer hover:bg-muted/50 whitespace-nowrap"><div className="flex items-center gap-1"><Calendar className="h-4 w-4" /> Year Founded {getSortIcon("yearFounded")}</div></TableHead>
                <TableHead className="whitespace-nowrap"><div className="flex items-center gap-1"><StarHalf className="h-4 w-4" /> BBB Rating</div></TableHead>
                <TableHead className="whitespace-nowrap"><div className="flex items-center gap-1"><MapPin className="h-4 w-4" /> Street</div></TableHead>
                <TableHead className="whitespace-nowrap"><div className="flex items-center gap-1"><MapPin className="h-4 w-4" /> City</div></TableHead>
                <TableHead className="whitespace-nowrap"><div className="flex items-center gap-1"><MapPin className="h-4 w-4" /> State</div></TableHead>
                 <TableHead className="whitespace-nowrap"><div className="flex items-center gap-1"><Map className="h-4 w-4" /> Map</div></TableHead>
                <TableHead className="whitespace-nowrap"><div className="flex items-center gap-1"><Phone className="h-4 w-4" /> Company Phone</div></TableHead>
                <TableHead className="whitespace-nowrap"><div className="flex items-center gap-1"><Linkedin className="h-4 w-4" /> Company LinkedIn</div></TableHead>
                <TableHead className="whitespace-nowrap"><div className="flex items-center gap-1"><User className="h-4 w-4" /> Owner's First Name</div></TableHead>
                <TableHead className="whitespace-nowrap"><div className="flex items-center gap-1"><User className="h-4 w-4" /> Owner's Last Name</div></TableHead>
                <TableHead className="whitespace-nowrap"><div className="flex items-center gap-1"><Briefcase className="h-4 w-4" /> Owner's Title</div></TableHead>
                <TableHead className="whitespace-nowrap"><div className="flex items-center gap-1"><Linkedin className="h-4 w-4" /> Owner's LinkedIn</div></TableHead>
                <TableHead className="whitespace-nowrap"><div className="flex items-center gap-1"><Phone className="h-4 w-4" /> Owner's Phone</div></TableHead>
                <TableHead className="whitespace-nowrap"><div className="flex items-center gap-1"><Mail className="h-4 w-4" /> Owner's Email</div></TableHead>
                <TableHead className="whitespace-nowrap"><div className="flex items-center gap-1"><Info className="h-4 w-4" /> Source</div></TableHead>
                <TableHead onClick={() => requestSort("createdDate")} className="cursor-pointer hover:bg-muted/50 whitespace-nowrap"><div className="flex items-center gap-1"><Calendar className="h-4 w-4" /> Created {getSortIcon("createdDate")}</div></TableHead>
                <TableHead onClick={() => requestSort("updatedDate")} className="cursor-pointer hover:bg-muted/50 whitespace-nowrap"><div className="flex items-center gap-1"><Calendar className="h-4 w-4" /> Updated {getSortIcon("updatedDate")}</div></TableHead>
                <TableHead onClick={() => requestSort("score")} className="cursor-pointer hover:bg-muted/50 whitespace-nowrap"><div className="flex items-center gap-1"><Star className="h-4 w-4" /> Score {getSortIcon("score")}</div></TableHead>
                <TableHead className="text-right sticky right-0 bg-card whitespace-nowrap">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && paginatedLeads.length === 0 ? (
                renderLoading()
              ) : paginatedLeads.length > 0 ? (
                paginatedLeads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium whitespace-nowrap">{lead.companyName}</TableCell>
                    <TableCell className="whitespace-nowrap">{lead.website ? <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Visit</a> : "N/A"}</TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap">{lead.industry || "N/A"}</TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap">{lead.productServiceCategory || "N/A"}</TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap">{lead.businessType || "N/A"}</TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap">{lead.employeesCount || "N/A"}</TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap">{lead.revenue || "N/A"}</TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap">{lead.yearFounded || "N/A"}</TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap">{lead.bbbRating || "N/A"}</TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap">{lead.street || lead.address.split(',')[0] || "N/A"}</TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap">{lead.city || "N/A"}</TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap">{lead.state || "N/A"}</TableCell>
                     <TableCell className="whitespace-nowrap">
                        {lead.coordinates?.latitude && lead.coordinates?.longitude ? (
                            <Link href={`/map?lat=${lead.coordinates.latitude}&lng=${lead.coordinates.longitude}&name=${encodeURIComponent(lead.companyName || lead.name)}`} target="_blank" className="text-primary hover:underline">
                                View on Map
                            </Link>
                        ) : "N/A"}
                    </TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap">{lead.companyPhone || lead.phone || "N/A"}</TableCell>
                    <TableCell className="whitespace-nowrap">{lead.companyLinkedIn ? <a href={lead.companyLinkedIn} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Profile</a> : "N/A"}</TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap">{lead.ownerFirstName || "N/A"}</TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap">{lead.ownerLastName || "N/A"}</TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap">{lead.ownerTitle || "N/A"}</TableCell>
                    <TableCell className="whitespace-nowrap">{lead.ownerLinkedIn ? <a href={lead.ownerLinkedIn} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Profile</a> : "N/A"}</TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap">{lead.ownerPhoneNumber || "N/A"}</TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap">{lead.ownerEmail || "N/A"}</TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap">{lead.source || "N/A"}</TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap">{lead.createdDate ? new Date(lead.createdDate).toLocaleDateString() : "N/A"}</TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap">{lead.updatedDate ? new Date(lead.updatedDate).toLocaleDateString() : "N/A"}</TableCell>
                    <TableCell>
                      {lead.score !== undefined ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge variant="secondary" className="cursor-help flex items-center gap-1 whitespace-nowrap">
                              {lead.score} <HelpCircle className="h-3 w-3"/>
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p className="font-bold">Scoring Reason:</p>
                            <p className="text-sm text-muted-foreground">{lead.scoreReason}</p>
                          </TooltipContent>
                        </Tooltip>
                      ) : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right space-x-2 w-[120px] sticky right-0 bg-card">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEnrich(lead)}
                            disabled={lead.isEnriching || lead.isScoring}
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
                            onClick={() => onScore(lead)}
                            disabled={lead.isScoring || lead.isEnriching}
                          >
                            {lead.isScoring ? <Loader2 className="h-4 w-4 animate-spin" /> : <Gem className="h-4 w-4" />}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Score Lead</TooltipContent>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={26} className="h-24 text-center text-muted-foreground">
                    No leads found. Start a new search to see results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        </TooltipProvider>
      </CardContent>
      {totalPages > 1 && (
        <CardFooter className="justify-between">
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous Page</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next Page</span>
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
