
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FileDown, Loader2, Search, Sparkles, Gem, Save, LayoutDashboard, LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { aiLeadSearch } from "@/ai/flows/ai-lead-search";
import { enrichLead } from "@/ai/flows/lead-enrichment";
import { leadScoring } from "@/ai/flows/lead-scoring";
import { LeadTable } from "@/components/LeadTable";
import { Logo } from "@/components/Logo";
import { exportToCsv } from "@/lib/csv";
import type { Lead } from "@/types";
import { cn } from "@/lib/utils";
import { useLeads } from "@/hooks/useLeads";
import { useAuth } from "@/hooks/useAuth";
import { Progress } from "@/components/ui/progress";

const industries = [
  "Accounting", "Airlines/Aviation", "Alternative Dispute Resolution", "Alternative Medicine", "Animation",
  "Apparel & Fashion", "Architecture & Planning", "Arts & Crafts", "Automotive", "Aviation & Aerospace",
  "Banking", "Biotechnology", "Broadcast Media", "Building Materials", "Business Supplies & Equipment",
  "Capital Markets", "Chemicals", "Civic & Social Organization", "Civil Engineering", "Commercial Real Estate",
  "Computer & Network Security", "Computer Games", "Computer Hardware", "Computer Networking", "Computer Software",
  "Construction", "Consumer Electronics", "Consumer Goods", "Consumer Services", "Cosmetics", "Dairy", "Defense & Space",
  "Design", "Education Management", "E-learning", "Electrical/Electronic Manufacturing", "Entertainment",
  "Environmental Services", "Events Services", "Executive Office", "Facilities Services", "Farming", "F&B", "Financial Services",
  "Fine Art", "Fishery", "Food & Beverages", "Food Production", "Fundraising", "Furniture", "Gambling & Casinos",
  "Glass, Ceramics & Concrete", "Government Administration", "Government Relations", "Graphic Design", "Health, Wellness & Fitness",
  "Higher Education", "Hospital & Health Care", "Hospitality", "Human Resources", "Import & Export", "Individual & Family Services",
  "Industrial Automation", "Information Services", "Information Technology & Services", "Insurance", "International Affairs",
  "International Trade & Development", "Internet", "Investment Banking/Venture", "Investment Management", "Judiciary",
  "Law Enforcement", "Law Practice", "Legal Services", "Legislative Office", "Leisure, Travel & Tourism", "Libraries",
  "Logistics & Supply Chain", "Luxury Goods & Jewelry", "Machinery", "Management Consulting", "Maritime", "Market Research",
  "Marketing & Advertising", "Mechanical or Industrial Engineering", "Media Production", "Medical Devices", "Medical Practice",
  "Mental Health Care", "Military", "Mining & Metals", "Mobile Games", "Motion Pictures & Film", "Museums & Institutions",
  "Music", "Nanotechnology", "Newspapers", "Non-profit Organization Management", "Oil & Energy", "Online Media",
  "Outsourcing/Offshoring", "Package/Freight Delivery", "Packaging & Containers", "Paper & Forest Products", "Performing Arts",
  "Pharmaceuticals", "Philanthropy", "Photography", "Plastics", "Political Organization", "Primary/Secondary Education",
  "Printing", "Professional Training & Coaching", "Program Development", "Public Policy", "Public Relations & Communications",
  "Public Safety", "Publishing", "Railroad Manufacture", "Ranching", "Real Estate", "Recreational Facilities & Services",
  "Religious Institutions", "Renewables & Environment", "Research", "Restaurants", "Retail", "Security & Investigations",
  "Semiconductors", "Shipbuilding", "Sporting Goods", "Sports", "Staffing & Recruiting", "Supermarkets", "Telecommunications",
  "Textiles", "Think Tanks", "Tobacco", "Translation & Localization", "Transportation/Trucking/Railroad", "Utilities",
  "Venture Capital & Private Equity", "Veterinary", "Warehousing", "Wholesale", "Wine & Spirits", "Wireless", "Writing & Editing"
] as const;


const searchFormSchema = z.object({
  industry: z.string().min(1, { message: "Please enter an industry." }),
  location: z.string().min(2, { message: "Location must be at least 2 characters." }),
  scoringPrompt: z.string().optional(),
});

export default function Home() {
  const { leads, setLeads } = useLeads();
  const [isSearching, setIsSearching] = useState(false);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [bulkProgress, setBulkProgress] = useState<number | null>(null);
  const [bulkAction, setBulkAction] = useState<string>("");

  const { toast } = useToast();
  const router = useRouter();
  const { user, loading, signOut } = useAuth();


  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSuggestionsVisible, setIsSuggestionsVisible] = useState(false);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const form = useForm<z.infer<typeof searchFormSchema>>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      industry: "",
      location: "",
      scoringPrompt: "Score this lead based on its potential value as a customer. Consider factors like company size, industry, and online presence. A higher score means a better potential lead.",
    },
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);


  const handleSearch = async (values: z.infer<typeof searchFormSchema>) => {
    setIsSearching(true);
    setLeads([]);
    try {
      const result = await aiLeadSearch({
        industries: [values.industry],
        location: values.location,
      });
      if (result && result.leads) {
        setLeads(result.leads.map((lead, index) => ({
          ...lead,
          id: `${Date.now()}-${index}`,
          companyName: lead.name,
        })));
      } else {
        toast({
          variant: "destructive",
          title: "No Results",
          description: "The search did not return any leads. Try a different query.",
        });
      }
    } catch (error) {
      console.error("AI Lead Search Error:", error);
      toast({
        variant: "destructive",
        title: "Search Failed",
        description: "An error occurred while searching for leads. Please try again later.",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleEnrich = async (leadToEnrich: Lead) => {
    setLeads(prev => prev.map(l => l.id === leadToEnrich.id ? { ...l, isEnriching: true } : l));
    try {
      const enrichedData = await enrichLead({
        name: leadToEnrich.name,
        company: leadToEnrich.companyName || leadToEnrich.name,
        location: leadToEnrich.address,
        website: leadToEnrich.website,
      });

      setLeads(prev => prev.map(l => l.id === leadToEnrich.id ? { ...l, ...enrichedData, isEnriching: false } : l));
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
      setLeads(prev => prev.map(l => l.id === leadToEnrich.id ? { ...l, isEnriching: false } : l));
    }
  };

  const handleScore = async (leadToScore: Lead) => {
    const scoringPrompt = form.getValues("scoringPrompt");
    if (!scoringPrompt) {
      toast({
        variant: "destructive",
        title: "Scoring Prompt Missing",
        description: "Please provide a scoring prompt before scoring a lead.",
      });
      return;
    }

    setLeads(prev => prev.map(l => l.id === leadToScore.id ? { ...l, isScoring: true } : l));
    try {
      const leadDetails = JSON.stringify({
        name: leadToScore.name,
        address: leadToScore.address,
        phone: leadToScore.phone,
        website: leadToScore.website,
        email: leadToScore.email,
        industry: leadToScore.industry,
        linkedInProfile: leadToScore.companyLinkedIn,
      }, null, 2);
      const scoringResult = await leadScoring({ leadDetails, scoringPrompt });
      setLeads(prev => prev.map(l => l.id === leadToScore.id ? { ...l, score: scoringResult.score, scoreReason: scoringResult.reason, isScoring: false } : l));
      toast({
        title: "Lead Scored",
        description: `${leadToScore.name} has been scored ${scoringResult.score}.`,
      });
    } catch (error) {
      console.error("Scoring Error:", error);
      toast({
        variant: "destructive",
        title: "Scoring Failed",
        description: `Could not score lead: ${leadToScore.name}.`,
      });
      setLeads(prev => prev.map(l => l.id === leadToScore.id ? { ...l, isScoring: false } : l));
    }
  };

  const handleEnrichAll = async () => {
    setIsBulkProcessing(true);
    setBulkAction("Enriching");
    setBulkProgress(0);

    const leadsToProcess = leads.filter(l => !l.email);
    if (leadsToProcess.length === 0) {
        toast({ title: "No Leads to Enrich", description: "All leads have already been enriched." });
        setIsBulkProcessing(false);
        setBulkProgress(null);
        return;
    }

    toast({ title: "Starting Bulk Enrichment", description: `Enriching ${leadsToProcess.length} leads...` });

    for (let i = 0; i < leadsToProcess.length; i++) {
        await handleEnrich(leadsToProcess[i]);
        setBulkProgress(((i + 1) / leadsToProcess.length) * 100);
    }
    
    toast({ title: "Bulk Enrichment Complete", description: "All unprocessed leads have been enriched." });
    setIsBulkProcessing(false);
    setBulkProgress(null);
  };
  
  const handleScoreAll = async () => {
    setIsBulkProcessing(true);
    setBulkAction("Scoring");
    setBulkProgress(0);

    const leadsToProcess = leads.filter(l => l.score === undefined);
    if (leadsToProcess.length === 0) {
        toast({ title: "No Leads to Score", description: "All leads have already been scored." });
        setIsBulkProcessing(false);
        setBulkProgress(null);
        return;
    }
    
    toast({ title: "Starting Bulk Scoring", description: `Scoring ${leadsToProcess.length} leads...` });

    for (let i = 0; i < leadsToProcess.length; i++) {
        await handleScore(leadsToProcess[i]);
        setBulkProgress(((i + 1) / leadsToProcess.length) * 100);
    }

    toast({ title: "Bulk Scoring Complete", description: "All unscored leads have been scored." });
    setIsBulkProcessing(false);
    setBulkProgress(null);
  };

  const handleExport = () => {
    if (leads.length === 0) {
      toast({
        variant: "destructive",
        title: "No data to export",
        description: "Please search for leads first.",
      });
      return;
    }
    exportToCsv(leads, `leadgenius-export-${new Date().toISOString()}.csv`);
    toast({
      title: "Export Successful",
      description: "Your leads have been exported to CSV.",
    });
  };

  const handleSaveToFirestore = () => {
    if (leads.length === 0) {
      toast({
        variant: "destructive",
        title: "No data to save",
        description: "Please search for and enrich/score leads first.",
      });
      return;
    }
    router.push("/select-leads");
  };

  const fetchSuggestions = useCallback((query: string) => {
    if (!query) {
      setSuggestions([]);
      return;
    }
    setIsFetchingSuggestions(true);
    setTimeout(() => {
      const filtered = industries.filter(i =>
        i.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(filtered);
      setHighlightedIndex(-1);
      setIsFetchingSuggestions(false);
    }, 300);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setIsSuggestionsVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isSuggestionsVisible) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
          form.setValue("industry", suggestions[highlightedIndex]);
        }
        setIsSuggestionsVisible(false);
      } else if (e.key === "Escape") {
        setIsSuggestionsVisible(false);
      }
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
    <div className="min-h-screen flex flex-col font-body">
      <header className="flex items-center justify-between p-4 border-b bg-card">
        <div className="flex items-center gap-3">
          <Logo className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight text-foreground">LeadGenius</h1>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => router.push('/dashboard')}>
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
            </Button>
            <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
            </Button>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 md:p-8 space-y-8">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Sparkles className="text-primary"/> AI-Powered Lead Generation
            </CardTitle>
            <CardDescription>
              Enter an industry and location to find new leads. Then, enrich and score them with AI.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSearch)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="industry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Industry</FormLabel>
                        <div className="relative" ref={suggestionsRef}>
                           <FormControl>
                            <Input
                              {...field}
                              placeholder="e.g., 'Restaurants'"
                              autoComplete="off"
                              onFocus={() => {
                                if(field.value) fetchSuggestions(field.value)
                                setIsSuggestionsVisible(true)
                              }}
                              onChange={(e) => {
                                field.onChange(e);
                                fetchSuggestions(e.target.value);
                                setIsSuggestionsVisible(true);
                              }}
                              onKeyDown={handleKeyDown}
                            />
                          </FormControl>
                          {isFetchingSuggestions && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />}
                          <div className={cn("autocomplete-suggestions", isSuggestionsVisible && suggestions.length > 0 && "open")}>
                            {suggestions.map((suggestion, index) => (
                              <div
                                key={suggestion}
                                className={cn(
                                  "cursor-pointer p-2 hover:bg-accent",
                                  index === highlightedIndex && "bg-accent"
                                )}
                                onMouseDown={() => {
                                  form.setValue("industry", suggestion);
                                  setIsSuggestionsVisible(false);
                                }}
                              >
                                {suggestion}
                              </div>
                            ))}
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 'San Francisco, CA'" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                 <FormField
                    control={form.control}
                    name="scoringPrompt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lead Scoring Prompt</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe how to score the leads..."
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                <Button type="submit" disabled={isSearching || isBulkProcessing} className="w-full sm:w-auto">
                  {isSearching ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="mr-2 h-4 w-4" />
                  )}
                  {isSearching ? "Searching..." : "Search for Leads"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        <LeadTable
          leads={leads}
          isLoading={isSearching}
          onEnrich={handleEnrich}
          onScore={handleScore}
        />

        {leads.length > 0 && !isSearching && (
          <Card>
            <CardContent className="p-6">
                <div className="flex justify-end space-x-4">
                    <Button onClick={handleEnrichAll} disabled={isBulkProcessing}>
                        {isBulkProcessing && bulkAction === 'Enriching' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                        Enrich All
                    </Button>
                    <Button onClick={handleScoreAll} disabled={isBulkProcessing}>
                        {isBulkProcessing && bulkAction === 'Scoring' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Gem className="mr-2 h-4 w-4" />}
                        Score All
                    </Button>
                    <Button onClick={handleExport} disabled={isBulkProcessing || leads.length === 0}>
                        <FileDown className="mr-2 h-4 w-4" />
                        Export to CSV
                    </Button>
                    <Button onClick={handleSaveToFirestore} disabled={isBulkProcessing || leads.length === 0}>
                        <Save className="mr-2 h-4 w-4" />
                        Save Potential Leads
                    </Button>
                </div>
                 {isBulkProcessing && bulkProgress !== null && (
                    <div className="mt-4 space-y-2">
                        <div className="text-sm font-medium text-center">{bulkAction}... {Math.round(bulkProgress)}%</div>
                        <Progress value={bulkProgress} className="w-full" />
                    </div>
                )}
            </CardContent>
          </Card>
        )}

      </main>
      <footer className="text-center p-4 text-sm text-muted-foreground border-t">
        <p>&copy; {new Date().getFullYear()} LeadGenius. All rights reserved.</p>
      </footer>
    </div>
  );
}
