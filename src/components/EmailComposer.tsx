
"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateEmailCopy } from "@/ai/flows/generate-email-copy";
import type { Lead } from "@/types";

interface EmailComposerProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EmailComposer({ lead, isOpen, onClose }: EmailComposerProps) {
  const [emailGoal, setEmailGoal] = useState("Introduce our services and ask for a brief chat.");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (lead) {
      setSubject(`Following up with ${lead.companyName}`);
      setBody(`Hi ${lead.ownerFirstName || 'there'},\n\n...`);
    }
  }, [lead]);

  if (!lead) return null;

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const leadDetails = JSON.stringify({
        name: lead.name,
        company: lead.companyName,
        industry: lead.industry,
        ownerName: `${lead.ownerFirstName} ${lead.ownerLastName}`,
      });

      const result = await generateEmailCopy({
        leadDetails,
        emailGoal,
      });

      setSubject(result.subject);
      setBody(result.body);

      toast({
        title: "Email Generated",
        description: "The email copy has been created by AI.",
      });
    } catch (error) {
      console.error("Email Generation Error:", error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "Could not generate email copy.",
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleSendEmail = () => {
    if (!lead.ownerEmail) {
      toast({
        variant: "destructive",
        title: "No Email Address",
        description: "This lead does not have an email address.",
      });
      return;
    }
    const mailtoLink = `mailto:${lead.ownerEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Compose Email to {lead.companyName}</DialogTitle>
          <DialogDescription>
            Generate a personalized email using AI, then send it using your default email client.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="email-goal">Email Objective</Label>
            <Textarea
              id="email-goal"
              value={emailGoal}
              onChange={(e) => setEmailGoal(e.target.value)}
              placeholder="e.g., Follow up on our last conversation"
            />
             <Button onClick={handleGenerate} disabled={isGenerating} size="sm" className="w-fit">
              {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              {isGenerating ? "Generating..." : "Generate Email"}
            </Button>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="body">Body</Label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="min-h-[250px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="button" onClick={handleSendEmail}>
            <Send className="mr-2 h-4 w-4" />
            Open in Email Client
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
