import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useTheme } from "@/contexts/ThemeContext";
import { Search, Loader2, FileText, Sparkles, Brain, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface SearchResult {
  id: string;
  relevance_score: number;
  explanation: string;
}

interface Document {
  id: string;
  title: string;
  description: string;
  category: string;
  file_url: string;
}

export function DocumentSearch() {
  const { t } = useTheme();
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<(SearchResult & Document)[]>([]);
  const [summary, setSummary] = useState("");

  const handleSearch = async () => {
    if (!query.trim()) return;
    setIsSearching(true);
    setResults([]);
    setSummary("");

    try {
      // First fetch all documents
      const { data: documents, error: docError } = await supabase
        .from("documents")
        .select("id, title, description, category, file_url");

      if (docError) throw docError;
      if (!documents || documents.length === 0) {
        toast.info("No documents available to search");
        setIsSearching(false);
        return;
      }

      // Call AI search function
      const { data, error } = await supabase.functions.invoke("document-search", {
        body: { query, documents },
      });

      if (error) throw error;

      const searchResults = data.results || [];
      setSummary(data.summary || "");

      // Map results with document data
      const enrichedResults = searchResults
        .map((result: SearchResult) => {
          const doc = documents.find((d) => d.id === result.id);
          return doc ? { ...result, ...doc } : null;
        })
        .filter(Boolean);

      setResults(enrichedResults);

      if (enrichedResults.length === 0) {
        toast.info("No matching documents found");
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Search failed. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const getRelevanceColor = (score: number) => {
    if (score >= 0.8) return "bg-success/20 text-success";
    if (score >= 0.5) return "bg-warning/20 text-warning";
    return "bg-muted text-muted-foreground";
  };

  return (
    <Card variant="glass" className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          {t("semanticSearch")}
          <Badge variant="glass" className="ml-2">
            <Sparkles className="h-3 w-3 mr-1" />
            AI Powered
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("searchDocuments")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-9"
            />
          </div>
          <Button variant="gradient" onClick={handleSearch} disabled={isSearching || !query.trim()}>
            {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </div>

        {summary && (
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 animate-fade-in">
            <p className="text-sm">{summary}</p>
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">
              {t("searchResults")} ({results.length})
            </h4>
            {results.map((result, index) => (
              <Card
                key={result.id}
                variant="elevated"
                className="p-4 hover:shadow-glow transition-all cursor-pointer animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-secondary/50">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h5 className="font-medium truncate">{result.title}</h5>
                      <Badge variant="outline" className="text-xs capitalize">
                        {result.category}
                      </Badge>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getRelevanceColor(result.relevance_score)}`}>
                        {Math.round(result.relevance_score * 100)}% {t("relevance")}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{result.explanation}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 gap-1 p-0 h-auto text-primary"
                      asChild
                    >
                      <a href={result.file_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3" />
                        {t("view")} Document
                      </a>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {!isSearching && results.length === 0 && query && (
          <div className="text-center py-8 text-muted-foreground">
            <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>{t("noResults")}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
