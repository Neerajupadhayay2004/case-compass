import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { MetricsBar } from "@/components/MetricsBar";
import { CaseContextPanel } from "@/components/CaseContextPanel";
import { KnowledgeSuggestions } from "@/components/KnowledgeSuggestions";
import { DocumentViewer } from "@/components/DocumentViewer";
import { AskQuestion } from "@/components/AskQuestion";
import { TeamActivity } from "@/components/TeamActivity";
import { Scene3D } from "@/components/Scene3D";
import { getKnowledgeSuggestions, CaseContext, KnowledgeResult } from "@/lib/gemini";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, Sparkles, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const sampleCase: CaseContext = {
  claimType: "Flood",
  state: "Florida",
  claimAmount: "$127,500",
  policyNumber: "FL-2024-88291",
  customerName: "Michael Rodriguez",
  dateOfIncident: "September 28, 2024",
  description: "Residential property damage due to Hurricane Helene. Primary structure shows significant water intrusion affecting ground floor and basement. Contents damage includes furniture, appliances, and personal belongings. Customer requesting emergency living expenses coverage.",
};

export default function Index() {
  const [suggestions, setSuggestions] = useState<KnowledgeResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeResult | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSuggestions = async () => {
      setIsLoading(true);
      const results = await getKnowledgeSuggestions(sampleCase);
      setSuggestions(results);
      setIsLoading(false);
    };

    const timer = setTimeout(fetchSuggestions, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Layout>
      {/* 3D Background */}
      <Scene3D />
      
      {/* Quick Actions Banner */}
      <Card className="mb-6 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-primary/20 overflow-hidden relative">
        <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent animate-pulse">
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">AI Knowledge Assistant</h3>
              <p className="text-sm text-muted-foreground">Get instant answers with real-time collaboration</p>
            </div>
          </div>
          <Button variant="gradient" onClick={() => navigate("/chat")} className="gap-2 w-full sm:w-auto">
            <MessageSquare className="h-4 w-4" />
            Open AI Chat
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
      
      <MetricsBar />
      
      {/* Desktop Layout */}
      <div className="hidden xl:grid grid-cols-12 gap-6 mt-6">
        <div className="col-span-3 space-y-6">
          <CaseContextPanel caseData={sampleCase} />
          <TeamActivity />
        </div>
        <div className="col-span-4">
          <KnowledgeSuggestions
            suggestions={suggestions}
            isLoading={isLoading}
            onSelectArticle={setSelectedArticle}
          />
        </div>
        <div className="col-span-5 space-y-6">
          <DocumentViewer
            article={selectedArticle}
            onClose={() => setSelectedArticle(null)}
          />
          <AskQuestion caseContext={sampleCase} />
        </div>
      </div>

      {/* Tablet Layout */}
      <div className="hidden md:grid xl:hidden grid-cols-2 gap-6 mt-6">
        <div className="space-y-6">
          <CaseContextPanel caseData={sampleCase} />
          <TeamActivity />
          <AskQuestion caseContext={sampleCase} />
        </div>
        <div className="space-y-6">
          <KnowledgeSuggestions
            suggestions={suggestions}
            isLoading={isLoading}
            onSelectArticle={setSelectedArticle}
          />
          {selectedArticle && (
            <DocumentViewer
              article={selectedArticle}
              onClose={() => setSelectedArticle(null)}
            />
          )}
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden space-y-4 mt-4">
        <CaseContextPanel caseData={sampleCase} />
        <TeamActivity />
        <KnowledgeSuggestions
          suggestions={suggestions}
          isLoading={isLoading}
          onSelectArticle={setSelectedArticle}
        />
        {selectedArticle && (
          <DocumentViewer
            article={selectedArticle}
            onClose={() => setSelectedArticle(null)}
          />
        )}
        <AskQuestion caseContext={sampleCase} />
      </div>
    </Layout>
  );
}
