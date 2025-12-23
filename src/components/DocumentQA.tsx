import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useTheme } from "@/contexts/ThemeContext";
import { MessageSquare, Loader2, FileText, BookOpen, Hash, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Document {
  id: string;
  title: string;
  file_url: string;
}

interface QAResult {
  answer: string;
  page_number: number | null;
  section: string | null;
  confidence: number | null;
  source: string;
}

interface DocumentQAProps {
  documents: Document[];
}

export function DocumentQA({ documents }: DocumentQAProps) {
  const { t } = useTheme();
  const [selectedDoc, setSelectedDoc] = useState<string>("");
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<QAResult | null>(null);
  const [history, setHistory] = useState<{ question: string; answer: QAResult }[]>([]);

  const handleAskQuestion = async () => {
    if (!selectedDoc || !question.trim()) {
      toast.error("Please select a document and enter a question");
      return;
    }

    const doc = documents.find(d => d.id === selectedDoc);
    if (!doc) return;

    setIsLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("document-qa", {
        body: { url: doc.file_url, question },
      });

      if (error) throw error;

      const qaResult: QAResult = {
        answer: data.answer || "No answer found",
        page_number: data.page_number,
        section: data.section,
        confidence: data.confidence,
        source: data.source,
      };

      setResult(qaResult);
      setHistory(prev => [...prev, { question, answer: qaResult }]);
      setQuestion("");
    } catch (error) {
      console.error("QA error:", error);
      toast.error("Failed to get answer. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card variant="glass" className="w-full animate-slide-up">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          {t("askDocuments")}
          <Badge variant="glass" className="ml-2">
            <Sparkles className="h-3 w-3 mr-1" />
            AI Powered
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Document Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            Select Document
          </label>
          <Select value={selectedDoc} onValueChange={setSelectedDoc}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a document to ask questions about..." />
            </SelectTrigger>
            <SelectContent>
              {documents.map(doc => (
                <SelectItem key={doc.id} value={doc.id}>
                  {doc.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Question Input */}
        <div className="flex gap-2">
          <Input
            placeholder="Ask a question about the document..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAskQuestion()}
            disabled={!selectedDoc || isLoading}
          />
          <Button
            variant="gradient"
            onClick={handleAskQuestion}
            disabled={isLoading || !selectedDoc || !question.trim()}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>

        {/* Current Result */}
        {result && (
          <Card variant="elevated" className="p-4 animate-fade-in">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <BookOpen className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm">{result.answer}</p>
                </div>
              </div>
              
              {/* References */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                {result.page_number && (
                  <Badge variant="outline" className="gap-1">
                    <Hash className="h-3 w-3" />
                    Page {result.page_number}
                  </Badge>
                )}
                {result.section && (
                  <Badge variant="outline" className="gap-1">
                    <BookOpen className="h-3 w-3" />
                    Section {result.section}
                  </Badge>
                )}
                {result.confidence && (
                  <Badge 
                    variant={result.confidence > 0.7 ? "success" : "warning"}
                    className="gap-1"
                  >
                    {Math.round(result.confidence * 100)}% confidence
                  </Badge>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin">
            <h4 className="text-sm font-medium text-muted-foreground">Previous Questions</h4>
            {history.slice().reverse().slice(0, 5).map((item, index) => (
              <div 
                key={index} 
                className="p-3 rounded-lg bg-secondary/30 text-sm animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <p className="font-medium text-primary mb-1">Q: {item.question}</p>
                <p className="text-muted-foreground line-clamp-2">A: {item.answer.answer}</p>
                {item.answer.page_number && (
                  <p className="text-xs text-muted-foreground mt-1">
                    📄 Page {item.answer.page_number}
                    {item.answer.section && ` • Section ${item.answer.section}`}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {documents.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Upload documents first to ask questions</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
