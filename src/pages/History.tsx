import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { 
  Search, 
  History as HistoryIcon,
  MessageSquare,
  Clock,
  ChevronRight,
  Filter,
  Calendar
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface HistoryItem {
  id: string;
  case_id: string | null;
  query: string;
  response: string | null;
  created_at: string;
}

export default function History() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('knowledge_queries')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error('Error fetching history:', error);
      toast.error('Failed to load history');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredHistory = history.filter(item =>
    item.query.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group history by date
  const groupedHistory = filteredHistory.reduce((groups, item) => {
    const date = format(new Date(item.created_at), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(item);
    return groups;
  }, {} as Record<string, HistoryItem[]>);

  const formatDateHeader = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) {
      return 'Today';
    } else if (format(date, 'yyyy-MM-dd') === format(yesterday, 'yyyy-MM-dd')) {
      return 'Yesterday';
    }
    return format(date, 'MMMM d, yyyy');
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Query History</h1>
            <p className="text-muted-foreground">View all your AI knowledge queries</p>
          </div>
          <Badge variant="glass" className="self-start">
            <MessageSquare className="h-3 w-3 mr-1" />
            {history.length} queries
          </Badge>
        </div>

        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search queries..." 
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>

        {/* History List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <Card key={i} variant="glass" className="animate-pulse">
                <CardContent className="p-4">
                  <div className="h-16 bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : Object.keys(groupedHistory).length > 0 ? (
          <div className="space-y-6">
            {Object.entries(groupedHistory).map(([date, items]) => (
              <div key={date}>
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium text-muted-foreground">{formatDateHeader(date)}</h3>
                </div>
                <div className="space-y-3">
                  {items.map((item, index) => (
                    <Card 
                      key={item.id}
                      variant="elevated"
                      className="cursor-pointer hover:shadow-glow transition-all animate-slide-up"
                      style={{ animationDelay: `${index * 30}ms` }}
                      onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                            <MessageSquare className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`font-medium ${expandedId === item.id ? '' : 'line-clamp-2'}`}>
                              {item.query}
                            </p>
                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {format(new Date(item.created_at), 'h:mm a')}
                              {item.case_id && (
                                <Badge variant="outline" className="text-[10px]">Case linked</Badge>
                              )}
                            </div>
                            
                            {expandedId === item.id && item.response && (
                              <div className="mt-4 pt-4 border-t border-border animate-fade-in">
                                <p className="text-xs font-medium text-primary mb-2">AI Response</p>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                  {item.response}
                                </p>
                              </div>
                            )}
                          </div>
                          <ChevronRight className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform ${expandedId === item.id ? 'rotate-90' : ''}`} />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Card variant="glass" className="p-12 text-center">
            <HistoryIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No query history</h3>
            <p className="text-muted-foreground">Your AI queries will appear here</p>
          </Card>
        )}
      </div>
    </Layout>
  );
}
