
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Search, User, Star, Briefcase, LogOut } from "lucide-react";
import { getSavedLeads, getTopLeads, saveLeadsToFirestore } from "@/services/firestore";
import { enrichLead } from "@/ai/flows/lead-enrichment";
import type { Lead } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Logo } from "@/components/Logo";
import { SavedLeadsTable } from "@/components/SavedLeadsTable";
import { TopLeadsList } from "@/components/TopLeadsList";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";


export default function DashboardPage() {
    const router = useRouter();
    const { user, loading, signOut } = useAuth();
    const [savedLeads, setSavedLeads] = useState<Lead[]>([]);
    const [topLeads, setTopLeads] = useState<{ leads: Lead[] }[]>([]);
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [selectedIndustry, setSelectedIndustry] = useState<string>("All");
    const { toast } = useToast();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);
    
    useEffect(() => {
        if (user) {
            const fetchData = async () => {
                setIsDataLoading(true);
                const [savedLeadsResult, topLeadsResult] = await Promise.all([
                    getSavedLeads(user.uid),
                    getTopLeads(user.uid)
                ]);

                if (savedLeadsResult.leads) {
                    setSavedLeads(savedLeadsResult.leads);
                }
                if (topLeadsResult.topLeads) {
                    setTopLeads(topLeadsResult.topLeads);
                }
                setIsDataLoading(false);
            };
            fetchData();
        }
    }, [user]);

    const industries = useMemo(() => {
        const allIndustries = savedLeads.map(lead => lead.industry).filter(Boolean) as string[];
        return ["All", ...Array.from(new Set(allIndustries)).sort()];
    }, [savedLeads]);

    const filteredLeads = useMemo(() => {
        if (selectedIndustry === "All") {
            return savedLeads;
        }
        return savedLeads.filter(lead => lead.industry === selectedIndustry);
    }, [savedLeads, selectedIndustry]);

    const handleEnrich = async (leadToEnrich: Lead) => {
        if (!user) return;
    
        setSavedLeads(prev => prev.map(l => l.id === leadToEnrich.id ? { ...l, isEnriching: true } : l));
        try {
          const enrichedData = await enrichLead({
            name: leadToEnrich.name,
            company: leadToEnrich.companyName || leadToEnrich.name,
            location: leadToEnrich.address,
            website: leadToEnrich.website,
          });
          
          const updatedLead = { ...leadToEnrich, ...enrichedData, isEnriching: false };
    
          await saveLeadsToFirestore(user.uid, [updatedLead]);
    
          setSavedLeads(prev => prev.map(l => l.id === leadToEnrich.id ? updatedLead : l));
          
          toast({
            title: "Lead Enriched",
            description: `${leadToEnrich.name} has been successfully enriched.`,
          });
        } catch (error) {
          console.error("Enrichment Error:", error);
          toast({
            variant: "destructive",
            title: "Enrichment Failed",
            description: `Could not enrich lead: ${leadToEnrich.name}.`,
          });
          setSavedLeads(prev => prev.map(l => l.id === leadToEnrich.id ? { ...l, isEnriching: false } : l));
        }
      };
    
    if (loading || !user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col font-body bg-muted/40">
            <header className="flex items-center justify-between p-4 border-b bg-card">
                <div className="flex items-center gap-3">
                    <Logo className="h-8 w-8 text-primary" />
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">LeadGenius Dashboard</h1>
                </div>
                <div className="flex items-center gap-4">
                     <Button variant="outline" size="sm" onClick={() => router.push('/')}>
                        <Search className="mr-2 h-4 w-4" />
                        New Search
                    </Button>
                    <Button variant="ghost" size="sm" onClick={signOut}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                    </Button>
                </div>
            </header>

            <main className="flex-1 p-4 sm:p-6 md:p-8 space-y-8">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Saved Leads</CardTitle>
                            <User className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{savedLeads.length}</div>
                            <p className="text-xs text-muted-foreground">All leads saved from your searches</p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Top Rated Leads</CardTitle>
                            <Star className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {savedLeads.filter(l => (l.score ?? 0) >= 80).length}
                            </div>
                            <p className="text-xs text-muted-foreground">Leads with a score of 80 or higher</p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Top Industries</CardTitle>
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {[...new Set(savedLeads.map(l => l.industry).filter(Boolean))].length}
                            </div>
                            <p className="text-xs text-muted-foreground">Unique industries in your saved leads</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-8 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-4">
                        <Card>
                           <CardHeader>
                               <CardTitle>Filter Saved Leads</CardTitle>
                               <CardDescription>Select an industry to filter the leads below.</CardDescription>
                           </CardHeader>
                           <CardContent>
                               <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                                   <SelectTrigger className="w-full md:w-1/2">
                                       <SelectValue placeholder="Select an industry" />
                                   </SelectTrigger>
                                   <SelectContent>
                                       <SelectGroup>
                                           <SelectLabel>Industries</SelectLabel>
                                           {industries.map(industry => (
                                               <SelectItem key={industry} value={industry}>
                                                   {industry}
                                               </SelectItem>
                                           ))}
                                       </SelectGroup>
                                   </SelectContent>
                               </Select>
                           </CardContent>
                        </Card>
                       <SavedLeadsTable leads={filteredLeads} isLoading={isDataLoading} onEnrich={handleEnrich} />
                    </div>
                    <div>
                        <TopLeadsList topLeadsBatches={topLeads} isLoading={isDataLoading} />
                    </div>
                </div>
            </main>
             <footer className="text-center p-4 text-sm text-muted-foreground border-t bg-card">
                <p>&copy; {new Date().getFullYear()} LeadGenius. All rights reserved.</p>
            </footer>
        </div>
    );
}
