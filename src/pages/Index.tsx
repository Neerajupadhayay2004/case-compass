import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { MetricsBar } from "@/components/MetricsBar";
import { CaseContextPanel } from "@/components/CaseContextPanel";
import { KnowledgeSuggestions } from "@/components/KnowledgeSuggestions";
import { DocumentViewer } from "@/components/DocumentViewer";
import { AskQuestion } from "@/components/AskQuestion";
import { getKnowledgeSuggestions, CaseContext, KnowledgeResult } from "@/lib/gemini";

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
      <MetricsBar />
      
      {/* Desktop Layout */}
      <div className="hidden xl:grid grid-cols-12 gap-6">
        <div className="col-span-3 space-y-6">
          <CaseContextPanel caseData={sampleCase} />
          <AskQuestion caseContext={sampleCase} />
        </div>
        <div className="col-span-4">
          <KnowledgeSuggestions
            suggestions={suggestions}
            isLoading={isLoading}
            onSelectArticle={setSelectedArticle}
          />
        </div>
        <div className="col-span-5">
          <DocumentViewer
            article={selectedArticle}
            onClose={() => setSelectedArticle(null)}
          />
        </div>
      </div>

      {/* Tablet Layout */}
      <div className="hidden md:grid xl:hidden grid-cols-2 gap-6">
        <div className="space-y-6">
          <CaseContextPanel caseData={sampleCase} />
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
      <div className="md:hidden space-y-4">
        <CaseContextPanel caseData={sampleCase} />
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
