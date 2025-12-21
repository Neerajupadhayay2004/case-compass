import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { 
  Plus, 
  Search, 
  Filter, 
  Eye,
  Edit,
  MoreHorizontal,
  Calendar,
  DollarSign,
  MapPin,
  User,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface Case {
  id: string;
  claim_type: string;
  state: string;
  claim_amount: number;
  policy_number: string;
  customer_name: string;
  date_of_incident: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
}

export default function Cases() {
  const [cases, setCases] = useState<Case[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCases(data || []);
    } catch (error) {
      console.error('Error fetching cases:', error);
      toast.error('Failed to load cases');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: "success" | "warning" | "info" | "destructive" | "secondary"; icon: typeof CheckCircle }> = {
      open: { variant: "info", icon: AlertCircle },
      in_review: { variant: "warning", icon: Clock },
      pending: { variant: "secondary", icon: Clock },
      approved: { variant: "success", icon: CheckCircle },
      denied: { variant: "destructive", icon: XCircle },
    };
    const config = statusMap[status] || statusMap.open;
    return (
      <Badge variant={config.variant} className="gap-1">
        <config.icon className="h-3 w-3" />
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const colorMap: Record<string, string> = {
      high: "bg-destructive/20 text-destructive border-destructive/30",
      medium: "bg-warning/20 text-warning border-warning/30",
      low: "bg-muted text-muted-foreground border-border",
    };
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-medium border ${colorMap[priority] || colorMap.medium}`}>
        {priority}
      </span>
    );
  };

  const getClaimTypeBadge = (type: string) => {
    const colorMap: Record<string, "info" | "destructive" | "warning" | "success" | "secondary"> = {
      Flood: "info",
      Fire: "destructive",
      Theft: "warning",
      Auto: "secondary",
      Medical: "success",
    };
    return <Badge variant={colorMap[type] || "secondary"}>{type}</Badge>;
  };

  const filteredCases = cases.filter(c => 
    c.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.policy_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.claim_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Active Cases</h1>
            <p className="text-muted-foreground">Manage and track all insurance claims</p>
          </div>
          <Button variant="gradient" className="gap-2">
            <Plus className="h-4 w-4" />
            New Case
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by customer, policy, or type..." 
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

        {/* Cases Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Card key={i} variant="glass" className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-32 bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredCases.map((caseItem, index) => (
              <Card 
                key={caseItem.id} 
                variant="elevated" 
                className="hover:shadow-glow transition-all cursor-pointer animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {getClaimTypeBadge(caseItem.claim_type)}
                        {getPriorityBadge(caseItem.priority)}
                      </div>
                      <CardTitle className="text-base">{caseItem.customer_name}</CardTitle>
                      <p className="text-xs text-muted-foreground font-mono">{caseItem.policy_number}</p>
                    </div>
                    {getStatusBadge(caseItem.status)}
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {caseItem.state}
                    </div>
                    <div className="flex items-center gap-2 text-accent font-medium">
                      <DollarSign className="h-4 w-4" />
                      ${caseItem.claim_amount.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground col-span-2">
                      <Calendar className="h-4 w-4" />
                      Incident: {format(new Date(caseItem.date_of_incident), 'MMM d, yyyy')}
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground line-clamp-2">{caseItem.description}</p>
                  
                  <div className="flex items-center gap-2 pt-2 border-t border-border">
                    <Button variant="ghost" size="sm" className="flex-1 gap-1">
                      <Eye className="h-3 w-3" />
                      View
                    </Button>
                    <Button variant="ghost" size="sm" className="flex-1 gap-1">
                      <Edit className="h-3 w-3" />
                      Edit
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && filteredCases.length === 0 && (
          <Card variant="glass" className="p-12 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No cases found</h3>
            <p className="text-muted-foreground">Try adjusting your search or create a new case</p>
          </Card>
        )}
      </div>
    </Layout>
  );
}
