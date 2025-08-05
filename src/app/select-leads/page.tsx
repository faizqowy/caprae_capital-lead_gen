
"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLeads } from "@/hooks/useLeads.tsx";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { saveLeadsToFirestore } from "@/services/firestore";
import { Loader2, Save, Star, Wand2 } from "lucide-react";
import { Logo } from "@/components/Logo";
import type { Lead } from "@/types";
import { useAuth } from "@/hooks/useAuth";

export default function SelectLeadsPage() {
  const { leads } = useLeads();
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!leads || leads.length === 0) {
      router.replace('/');
    }
  }, [leads, router]);

  const sortedLeads = useMemo(() => {
    return [...leads].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  }, [leads]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allLeadIds = new Set(sortedLeads.map((lead) => lead.id));
      setSelectedLeads(allLeadIds);
    } else {
      setSelectedLeads(new Set());
    }
  };

  const handleSelectLead = (leadId: string, checked: boolean) => {
    const newSelectedLeads = new Set(selectedLeads);
    if (checked) {
      newSelectedLeads.add(leadId);
    } else {
      newSelectedLeads.delete(leadId);
    }
    setSelectedLeads(newSelectedLeads);
  };

  const handleSmartSelect = () => {
    const top5 = sortedLeads.slice(0, 5).map(l => l.id);
    setSelectedLeads(new Set(top5));
     toast({
      title: "Smart Select Applied",
      description: "The top 5 highest-scoring leads have been selected.",
    });
  };

  const handleSave = async () => {
    if (!user) {
        toast({
            variant: "destructive",
            title: "Not Authenticated",
            description: "You must be logged in to save leads.",
        });
        return;
    }
    if (selectedLeads.size === 0) {
      toast({
        variant: "destructive",
        title: "No leads selected",
        description: "Please select at least one lead to save.",
      });
      return;
    }
    setIsSaving(true);
    
    const leadsToSave = sortedLeads.filter(l => selectedLeads.has(l.id));
    const top5Leads = sortedLeads.slice(0, 5);

    const result = await saveLeadsToFirestore(user.uid, leadsToSave, top5Leads);

    if (result.success) {
      toast({
        title: "Leads Saved!",
        description: `${leadsToSave.length} leads have been saved to Firestore.`,
      });
      router.push('/dashboard');
    } else {
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: result.error || "An unknown error occurred.",
      });
    }

    setIsSaving(false);
  };
  
  const isAllSelected = selectedLeads.size === sortedLeads.length && sortedLeads.length > 0;

  if (leads.length === 0) {
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
      </header>
       <main className="flex-1 p-4 sm:p-6 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle>Select Leads to Save</CardTitle>
            <CardDescription>
              Choose the leads you want to save to your Firestore database. Use "Smart Select" to automatically pick the top 5.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead padding="checkbox">
                      <Checkbox
                        checked={isAllSelected}
                        onCheckedChange={(checked) => handleSelectAll(Boolean(checked))}
                        aria-label="Select all"
                      />
                    </TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Website</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedLeads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedLeads.has(lead.id)}
                          onCheckedChange={(checked) => handleSelectLead(lead.id, Boolean(checked))}
                          aria-label={`Select ${lead.companyName}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{lead.companyName}</TableCell>
                      <TableCell>
                        <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          {lead.website || "N/A"}
                        </a>
                      </TableCell>
                      <TableCell className="text-right flex justify-end items-center gap-2">
                        {lead.score ?? "N/A"} {lead.score && <Star className="h-4 w-4 text-yellow-400" />}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <CardFooter className="justify-end gap-4">
             <Button variant="outline" onClick={handleSmartSelect} disabled={isSaving}>
                <Wand2 className="mr-2 h-4 w-4" />
                Smart Select
             </Button>
            <Button onClick={handleSave} disabled={isSaving || selectedLeads.size === 0}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Selected ({selectedLeads.size})
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
