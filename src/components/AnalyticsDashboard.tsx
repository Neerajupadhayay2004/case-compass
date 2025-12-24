import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from "recharts";
import { 
  TrendingUp, 
  Users, 
  FileCheck, 
  Clock, 
  Award,
  Target,
  Zap,
  AlertTriangle,
  Activity,
  BarChart3
} from "lucide-react";

interface CaseStats {
  total: number;
  byType: { name: string; cases: number }[];
  byStatus: { name: string; count: number }[];
  byPriority: { high: number; medium: number; low: number };
}

interface Agent {
  name: string;
  status: string;
  avatar_color: string;
}

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--destructive))",
  "hsl(var(--warning))",
  "hsl(var(--success))",
  "hsl(var(--accent))",
];

// Mock resolution data (would come from case_history in production)
const resolutionData = [
  { month: "Jan", rate: 85 },
  { month: "Feb", rate: 88 },
  { month: "Mar", rate: 82 },
  { month: "Apr", rate: 91 },
  { month: "May", rate: 94 },
  { month: "Jun", rate: 96 },
];

const weeklyTrend = [
  { day: "Mon", cases: 12 },
  { day: "Tue", cases: 18 },
  { day: "Wed", cases: 15 },
  { day: "Thu", cases: 22 },
  { day: "Fri", cases: 28 },
  { day: "Sat", cases: 8 },
  { day: "Sun", cases: 5 },
];

export function AnalyticsDashboard() {
  const [stats, setStats] = useState<CaseStats | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        // Fetch cases data
        const { data: cases, error: casesError } = await supabase
          .from("cases")
          .select("claim_type, status, priority, claim_amount");

        if (casesError) throw casesError;

        // Fetch agents data
        const { data: agentsData, error: agentsError } = await supabase
          .from("agents")
          .select("name, status, avatar_color");

        if (agentsError) throw agentsError;

        // Process case statistics
        const typeCount: Record<string, number> = {};
        const statusCount: Record<string, number> = {};
        let highPriority = 0, mediumPriority = 0, lowPriority = 0;

        cases?.forEach((c) => {
          typeCount[c.claim_type] = (typeCount[c.claim_type] || 0) + 1;
          statusCount[c.status] = (statusCount[c.status] || 0) + 1;
          if (c.priority === "high") highPriority++;
          else if (c.priority === "medium") mediumPriority++;
          else lowPriority++;
        });

        setStats({
          total: cases?.length || 0,
          byType: Object.entries(typeCount).map(([name, cases]) => ({ name, cases })),
          byStatus: Object.entries(statusCount).map(([name, count]) => ({ name, count })),
          byPriority: { high: highPriority, medium: mediumPriority, low: lowPriority },
        });

        setAgents(agentsData || []);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  const avgResolutionRate = Math.round(
    resolutionData.reduce((sum, d) => sum + d.rate, 0) / resolutionData.length
  );

  const onlineAgents = agents.filter(a => a.status === "online").length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} variant="glass">
              <CardContent className="p-3 sm:p-4">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} variant="glass">
              <CardContent className="p-4">
                <Skeleton className="h-48 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Quick Stats - Fully Responsive */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card variant="glass" className="animate-slide-up overflow-hidden" style={{ animationDelay: "0ms" }}>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs text-muted-foreground font-medium uppercase tracking-wide">Total Cases</p>
                <p className="text-xl sm:text-3xl font-display font-bold mt-1">{stats?.total || 0}</p>
              </div>
              <div className="p-2 sm:p-2.5 rounded-xl bg-primary/20 shrink-0">
                <FileCheck className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-2 sm:mt-3">
              <TrendingUp className="h-3 w-3 text-success" />
              <p className="text-[10px] sm:text-xs text-success font-medium">Live from database</p>
            </div>
          </CardContent>
        </Card>

        <Card variant="glass" className="animate-slide-up overflow-hidden" style={{ animationDelay: "50ms" }}>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs text-muted-foreground font-medium uppercase tracking-wide">Resolution</p>
                <p className="text-xl sm:text-3xl font-display font-bold mt-1">{avgResolutionRate}%</p>
              </div>
              <div className="p-2 sm:p-2.5 rounded-xl bg-success/20 shrink-0">
                <Target className="h-4 w-4 sm:h-5 sm:w-5 text-success" />
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-2 sm:mt-3">
              <TrendingUp className="h-3 w-3 text-success" />
              <p className="text-[10px] sm:text-xs text-success font-medium">+5.2% this month</p>
            </div>
          </CardContent>
        </Card>

        <Card variant="glass" className="animate-slide-up overflow-hidden" style={{ animationDelay: "100ms" }}>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs text-muted-foreground font-medium uppercase tracking-wide">High Priority</p>
                <p className="text-xl sm:text-3xl font-display font-bold mt-1">{stats?.byPriority.high || 0}</p>
              </div>
              <div className="p-2 sm:p-2.5 rounded-xl bg-destructive/20 shrink-0">
                <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-destructive" />
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-2 sm:mt-3">
              <Activity className="h-3 w-3 text-destructive" />
              <p className="text-[10px] sm:text-xs text-destructive font-medium">Needs attention</p>
            </div>
          </CardContent>
        </Card>

        <Card variant="glass" className="animate-slide-up overflow-hidden" style={{ animationDelay: "150ms" }}>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs text-muted-foreground font-medium uppercase tracking-wide">Team Online</p>
                <p className="text-xl sm:text-3xl font-display font-bold mt-1">{onlineAgents}<span className="text-sm sm:text-lg text-muted-foreground">/{agents.length}</span></p>
              </div>
              <div className="p-2 sm:p-2.5 rounded-xl bg-accent/20 shrink-0">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-2 sm:mt-3">
              <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
              <p className="text-[10px] sm:text-xs text-muted-foreground font-medium">Active now</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row - Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Cases by Type - Pie Chart */}
        <Card variant="glass" className="animate-slide-up" style={{ animationDelay: "200ms" }}>
          <CardHeader className="pb-2 px-4 pt-4">
            <CardTitle className="text-xs sm:text-sm font-display font-semibold flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/20">
                <Zap className="h-3.5 w-3.5 text-primary" />
              </div>
              Cases by Type
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="h-40 sm:h-48">
              {stats?.byType && stats.byType.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.byType}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={55}
                      paddingAngle={4}
                      dataKey="cases"
                    >
                      {stats.byType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px"
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                  No case data
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {stats?.byType.map((item, index) => (
                <Badge 
                  key={item.name} 
                  variant="outline" 
                  className="text-[10px] sm:text-xs font-medium px-2 py-0.5"
                  style={{ borderColor: COLORS[index % COLORS.length], color: COLORS[index % COLORS.length] }}
                >
                  {item.name}: {item.cases}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Resolution Rate Trend */}
        <Card variant="glass" className="animate-slide-up" style={{ animationDelay: "250ms" }}>
          <CardHeader className="pb-2 px-4 pt-4">
            <CardTitle className="text-xs sm:text-sm font-display font-semibold flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-success/20">
                <TrendingUp className="h-3.5 w-3.5 text-success" />
              </div>
              Resolution Trend
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="h-40 sm:h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={resolutionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} 
                    axisLine={false}
                    tickLine={false}
                    domain={[75, 100]}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px"
                    }}
                    formatter={(value) => [`${value}%`, "Rate"]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="rate" 
                    stroke="hsl(var(--success))" 
                    strokeWidth={2}
                    fill="hsl(var(--success) / 0.15)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Volume - Bar Chart */}
        <Card variant="glass" className="animate-slide-up md:col-span-2 lg:col-span-1" style={{ animationDelay: "300ms" }}>
          <CardHeader className="pb-2 px-4 pt-4">
            <CardTitle className="text-xs sm:text-sm font-display font-semibold flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-warning/20">
                <BarChart3 className="h-3.5 w-3.5 text-warning" />
              </div>
              Weekly Volume
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="h-40 sm:h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis 
                    dataKey="day" 
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px"
                    }}
                  />
                  <Bar 
                    dataKey="cases" 
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Performance + Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Team Performance - Takes 2 columns on large screens */}
        <Card variant="glass" className="animate-slide-up lg:col-span-2" style={{ animationDelay: "350ms" }}>
          <CardHeader className="pb-3 px-4 pt-4">
            <CardTitle className="text-xs sm:text-sm font-display font-semibold flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-warning/20">
                  <Award className="h-3.5 w-3.5 text-warning" />
                </div>
                Team Performance
              </div>
              <Badge variant="success" className="text-[10px] sm:text-xs">
                {onlineAgents} Online
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <ScrollArea className="w-full">
              <div className="min-w-[300px]">
                <table className="w-full text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-3 font-semibold text-muted-foreground uppercase text-[10px] sm:text-xs tracking-wide">Agent</th>
                      <th className="text-center py-2 sm:py-3 px-2 sm:px-3 font-semibold text-muted-foreground uppercase text-[10px] sm:text-xs tracking-wide">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agents.length === 0 ? (
                      <tr>
                        <td colSpan={2} className="py-6 text-center text-muted-foreground">
                          No agents found
                        </td>
                      </tr>
                    ) : (
                      agents.map((agent, index) => (
                        <tr 
                          key={index} 
                          className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                        >
                          <td className="py-2 sm:py-3 px-2 sm:px-3">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <div 
                                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                                style={{ backgroundColor: agent.avatar_color }}
                              >
                                {agent.name.charAt(0)}
                              </div>
                              <span className="font-medium truncate">{agent.name}</span>
                            </div>
                          </td>
                          <td className="text-center py-2 sm:py-3 px-2 sm:px-3">
                            <Badge 
                              variant={agent.status === "online" ? "success" : agent.status === "away" ? "warning" : "secondary"}
                              className="text-[10px] sm:text-xs capitalize"
                            >
                              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                agent.status === "online" ? "bg-success-foreground" : 
                                agent.status === "away" ? "bg-warning-foreground" : "bg-muted-foreground"
                              }`} />
                              {agent.status}
                            </Badge>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Case Status Distribution */}
        <Card variant="glass" className="animate-slide-up" style={{ animationDelay: "400ms" }}>
          <CardHeader className="pb-3 px-4 pt-4">
            <CardTitle className="text-xs sm:text-sm font-display font-semibold flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-info/20">
                <Clock className="h-3.5 w-3.5 text-info" />
              </div>
              Case Status
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-3">
            {stats?.byStatus && stats.byStatus.length > 0 ? (
              stats.byStatus.map((status, index) => (
                <div key={status.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="capitalize font-medium">{status.name.replace('_', ' ')}</span>
                    <span className="text-muted-foreground">{status.count}</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${(status.count / (stats.total || 1)) * 100}%`,
                        backgroundColor: COLORS[index % COLORS.length]
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-muted-foreground text-sm">
                No status data
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
