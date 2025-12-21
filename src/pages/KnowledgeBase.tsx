import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  BookOpen,
  FileText,
  Scale,
  ClipboardList,
  Star,
  ExternalLink,
  TrendingUp,
  Clock,
  Users
} from "lucide-react";

const knowledgeCategories = [
  { id: "all", label: "All", count: 156 },
  { id: "regulation", label: "Regulations", count: 42, icon: Scale },
  { id: "policy", label: "Policies", count: 38, icon: FileText },
  { id: "procedure", label: "Procedures", count: 51, icon: ClipboardList },
  { id: "legal", label: "Legal", count: 25, icon: BookOpen },
];

const popularArticles = [
  {
    id: 1,
    title: "Florida Hurricane Claims Processing Guidelines 2024",
    category: "procedure",
    views: 1240,
    updated: "2 days ago",
    rating: 4.8,
  },
  {
    id: 2,
    title: "NFIP Flood Insurance Coverage Limits",
    category: "regulation",
    views: 987,
    updated: "1 week ago",
    rating: 4.9,
  },
  {
    id: 3,
    title: "Auto Insurance Liability State Requirements",
    category: "legal",
    views: 856,
    updated: "3 days ago",
    rating: 4.7,
  },
  {
    id: 4,
    title: "Claims Documentation Best Practices",
    category: "policy",
    views: 734,
    updated: "5 days ago",
    rating: 4.6,
  },
  {
    id: 5,
    title: "Emergency Living Expenses (ALE) Guidelines",
    category: "procedure",
    views: 621,
    updated: "1 day ago",
    rating: 4.8,
  },
];

const recentUpdates = [
  { title: "Hurricane Response Protocol v4.2", type: "Updated", time: "2 hours ago" },
  { title: "California Fire Coverage Amendments", type: "New", time: "5 hours ago" },
  { title: "HIPAA Compliance Checklist", type: "Updated", time: "1 day ago" },
  { title: "Theft Claims Investigation Guide", type: "New", time: "2 days ago" },
];

export default function KnowledgeBase() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const getCategoryBadge = (category: string) => {
    const colorMap: Record<string, "info" | "success" | "warning" | "secondary"> = {
      regulation: "info",
      policy: "success",
      procedure: "warning",
      legal: "secondary",
    };
    return <Badge variant={colorMap[category] || "secondary"} className="capitalize">{category}</Badge>;
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold">Knowledge Base</h1>
          <p className="text-muted-foreground">Browse and search regulatory documents and procedures</p>
        </div>

        {/* Search */}
        <div className="relative max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Search knowledge base..." 
            className="pl-12 h-12 text-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card variant="glass">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">156</p>
                <p className="text-xs text-muted-foreground">Total Articles</p>
              </div>
            </CardContent>
          </Card>
          <Card variant="glass">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <TrendingUp className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">24</p>
                <p className="text-xs text-muted-foreground">Updated This Week</p>
              </div>
            </CardContent>
          </Card>
          <Card variant="glass">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <Users className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">892</p>
                <p className="text-xs text-muted-foreground">Views Today</p>
              </div>
            </CardContent>
          </Card>
          <Card variant="glass">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <Star className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">4.8</p>
                <p className="text-xs text-muted-foreground">Avg. Rating</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Category Tabs */}
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="w-full justify-start h-auto p-1 flex-wrap gap-1">
                {knowledgeCategories.map(cat => (
                  <TabsTrigger 
                    key={cat.id} 
                    value={cat.id}
                    className="gap-2"
                    onClick={() => setActiveCategory(cat.id)}
                  >
                    {cat.icon && <cat.icon className="h-4 w-4" />}
                    {cat.label}
                    <Badge variant="secondary" className="text-[10px] h-5">{cat.count}</Badge>
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="all" className="mt-4 space-y-4">
                <h3 className="font-semibold">Popular Articles</h3>
                {popularArticles.map((article, index) => (
                  <Card 
                    key={article.id} 
                    variant="elevated" 
                    className="hover:shadow-glow cursor-pointer transition-all animate-slide-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {getCategoryBadge(article.category)}
                            <div className="flex items-center gap-1 text-warning">
                              <Star className="h-3 w-3 fill-current" />
                              <span className="text-xs">{article.rating}</span>
                            </div>
                          </div>
                          <h4 className="font-medium hover:text-primary transition-colors">
                            {article.title}
                          </h4>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {article.views} views
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {article.updated}
                            </span>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              {knowledgeCategories.slice(1).map(cat => (
                <TabsContent key={cat.id} value={cat.id} className="mt-4">
                  <div className="text-center py-8">
                    <cat.icon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">{cat.label}</h3>
                    <p className="text-muted-foreground">{cat.count} articles available</p>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Updates */}
            <Card variant="elevated">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  Recent Updates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentUpdates.map((update, index) => (
                  <div key={index} className="flex items-start gap-3 pb-3 border-b border-border last:border-0 last:pb-0">
                    <Badge 
                      variant={update.type === "New" ? "success" : "info"} 
                      className="text-[10px] shrink-0"
                    >
                      {update.type}
                    </Badge>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{update.title}</p>
                      <p className="text-xs text-muted-foreground">{update.time}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card variant="glass">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="ghost" className="w-full justify-start gap-2 h-9">
                  <Scale className="h-4 w-4" />
                  State Regulations
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-2 h-9">
                  <FileText className="h-4 w-4" />
                  Policy Templates
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-2 h-9">
                  <ClipboardList className="h-4 w-4" />
                  Checklists
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-2 h-9">
                  <BookOpen className="h-4 w-4" />
                  Training Materials
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
