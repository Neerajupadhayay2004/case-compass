import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CollaboratorPresence } from "@/components/CollaboratorPresence";
import { supabase } from "@/integrations/supabase/client";
import { useTheme } from "@/contexts/ThemeContext";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  MapPin,
  User,
  FileText,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Edit,
  Save,
  Loader2,
  Send,
  Brain,
  History,
  Users,
} from "lucide-react";

interface Case {
  id: string;
  customer_name: string;
  policy_number: string;
  claim_type: string;
  state: string;
  claim_amount: number;
  date_of_incident: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
}

interface CaseHistory {
  id: string;
  action: string;
  details: string;
  performed_by: string;
  created_at: string;
}

export default function CaseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTheme();
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [history, setHistory] = useState<CaseHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isAskingAI, setIsAskingAI] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Case>>({});

  useEffect(() => {
    if (id) {
      fetchCaseData();
      fetchCaseHistory();
    }
  }, [id]);

  const fetchCaseData = async () => {
    try {
      const { data, error } = await supabase
        .from("cases")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setCaseData(data);
      setEditForm(data);
    } catch (error) {
      console.error("Error fetching case:", error);
      toast.error("Failed to load case");
      navigate("/cases");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCaseHistory = async () => {
    try {
      const { data, error } = await supabase
        .from("case_history")
        .select("*")
        .eq("case_id", id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  const handleSave = async () => {
    if (!caseData) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("cases")
        .update({
          status: editForm.status,
          priority: editForm.priority,
          description: editForm.description,
        })
        .eq("id", caseData.id);

      if (error) throw error;

      await supabase.from("case_history").insert({
        case_id: caseData.id,
        action: "Case Updated",
        details: `Status: ${editForm.status}, Priority: ${editForm.priority}`,
        performed_by: "Sarah Johnson",
      });

      toast.success("Case updated successfully");
      setIsEditing(false);
      fetchCaseData();
      fetchCaseHistory();
    } catch (error) {
      console.error("Error updating case:", error);
      toast.error("Failed to update case");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAskAI = async () => {
    if (!aiQuestion.trim() || !caseData) return;
    setIsAskingAI(true);
    try {
      const { data, error } = await supabase.functions.invoke("chat", {
        body: {
          messages: [
            {
              role: "user",
              content: `Regarding case ${caseData.policy_number} (${caseData.claim_type} claim in ${caseData.state} for $${caseData.claim_amount}): ${aiQuestion}`,
            },
          ],
        },
      });

      if (error) throw error;
      setAiResponse(data.response || "I couldn't process that request. Please try again.");
    } catch (error) {
      console.error("Error asking AI:", error);
      setAiResponse("Sorry, I encountered an error. Please try again.");
    } finally {
      setIsAskingAI(false);
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
      <Badge variant={config.variant} className="gap-1 text-sm px-3 py-1">
        <config.icon className="h-4 w-4" />
        {status.replace("_", " ")}
      </Badge>
    );
  };

  const getPriorityColor = (priority: string) => {
    const colorMap: Record<string, string> = {
      high: "bg-destructive/20 text-destructive border-destructive/30",
      medium: "bg-warning/20 text-warning border-warning/30",
      low: "bg-muted text-muted-foreground border-border",
    };
    return colorMap[priority] || colorMap.medium;
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!caseData) {
    return (
      <Layout>
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Case not found</h2>
          <Button onClick={() => navigate("/cases")}>Back to Cases</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/cases")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl lg:text-2xl font-bold">{caseData.customer_name}</h1>
                {getStatusBadge(caseData.status)}
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(caseData.priority)}`}>
                  {caseData.priority} priority
                </span>
              </div>
              <p className="text-muted-foreground font-mono text-sm mt-1">{caseData.policy_number}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <CollaboratorPresence caseId={caseData.id} />
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button variant="gradient" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  Save
                </Button>
              </>
            ) : (
              <Button variant="gradient" onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Case
              </Button>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Case Info Card */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  {t("caseDetails")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">{t("claimAmount")}</p>
                    <p className="text-xl lg:text-2xl font-bold text-accent flex items-center gap-1">
                      <DollarSign className="h-5 w-5" />
                      {caseData.claim_amount.toLocaleString()}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Claim Type</p>
                    <Badge variant="info" className="text-sm">{caseData.claim_type}</Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">State</p>
                    <p className="font-medium flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      {caseData.state}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">{t("dateOfIncident")}</p>
                    <p className="font-medium flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {format(new Date(caseData.date_of_incident), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">{t("description")}</p>
                  {isEditing ? (
                    <Textarea
                      value={editForm.description || ""}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      rows={4}
                      className="resize-none"
                    />
                  ) : (
                    <p className="text-foreground leading-relaxed">{caseData.description}</p>
                  )}
                </div>

                {isEditing && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">{t("status")}</p>
                      <Select value={editForm.status} onValueChange={(v) => setEditForm({ ...editForm, status: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in_review">In Review</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="denied">Denied</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">{t("priority")}</p>
                      <Select value={editForm.priority} onValueChange={(v) => setEditForm({ ...editForm, priority: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Assistant */}
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  {t("askAI")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Ask about policies, regulations, or claim procedures..."
                    value={aiQuestion}
                    onChange={(e) => setAiQuestion(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAskAI()}
                    className="flex-1"
                  />
                  <Button variant="gradient" onClick={handleAskAI} disabled={isAskingAI || !aiQuestion.trim()}>
                    {isAskingAI ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
                {aiResponse && (
                  <div className="p-4 rounded-lg bg-secondary/50 border border-border animate-fade-in">
                    <p className="text-sm leading-relaxed">{aiResponse}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Timeline & Info */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card variant="elevated">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Created</span>
                  <span className="text-sm font-medium">{format(new Date(caseData.created_at), "MMM d, yyyy")}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Last Updated</span>
                  <span className="text-sm font-medium">{format(new Date(caseData.updated_at), "MMM d, yyyy HH:mm")}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Case Age</span>
                  <span className="text-sm font-medium">
                    {Math.floor((Date.now() - new Date(caseData.created_at).getTime()) / (1000 * 60 * 60 * 24))} days
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card variant="elevated">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <History className="h-4 w-4 text-primary" />
                  {t("timeline")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 max-h-[400px] overflow-y-auto scrollbar-thin">
                {history.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No history yet</p>
                ) : (
                  history.map((item, index) => (
                    <div key={item.id} className="relative pl-6 pb-4 border-l border-border last:pb-0">
                      <div className="absolute -left-1.5 top-1 w-3 h-3 rounded-full bg-primary" />
                      <div className="space-y-1">
                        <p className="font-medium text-sm">{item.action}</p>
                        {item.details && <p className="text-xs text-muted-foreground">{item.details}</p>}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <User className="h-3 w-3" />
                          {item.performed_by || "System"}
                          <span>•</span>
                          {format(new Date(item.created_at), "MMM d, HH:mm")}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Active Collaborators */}
            <Card variant="glass">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Users className="h-4 w-4 text-primary" />
                  {t("collaborators")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CollaboratorPresence caseId={caseData.id} showNames />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
