import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Users, Circle } from "lucide-react";

interface Agent {
  id: string;
  name: string;
  email: string;
  avatar_color: string;
  status: string;
}

interface CollaboratorPresenceProps {
  caseId: string;
}

export function CollaboratorPresence({ caseId }: CollaboratorPresenceProps) {
  const [activeAgents, setActiveAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCollaborators = async () => {
      setIsLoading(true);
      
      // Get active collaborators for this case
      const { data: collaborators } = await supabase
        .from("case_collaborators")
        .select(`
          agent_id,
          agents (id, name, email, avatar_color, status)
        `)
        .eq("case_id", caseId)
        .eq("is_active", true);

      if (collaborators) {
        const agents = collaborators
          .map((c: any) => c.agents)
          .filter(Boolean) as Agent[];
        setActiveAgents(agents);
      }
      setIsLoading(false);
    };

    fetchCollaborators();

    // Subscribe to realtime changes
    const channel = supabase
      .channel(`case-${caseId}-collaborators`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "case_collaborators",
          filter: `case_id=eq.${caseId}`,
        },
        () => {
          fetchCollaborators();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [caseId]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-secondary animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2">
        {activeAgents.slice(0, 4).map((agent) => (
          <Tooltip key={agent.id}>
            <TooltipTrigger>
              <Avatar className="w-7 h-7 border-2 border-background ring-2 ring-primary/20 hover:ring-primary/50 transition-all">
                <AvatarFallback
                  style={{ backgroundColor: agent.avatar_color }}
                  className="text-white text-xs font-medium"
                >
                  {agent.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>
              <div className="flex items-center gap-2">
                <Circle
                  className={`h-2 w-2 fill-current ${
                    agent.status === "online"
                      ? "text-success"
                      : agent.status === "away"
                      ? "text-warning"
                      : "text-muted-foreground"
                  }`}
                />
                <span>{agent.name}</span>
              </div>
            </TooltipContent>
          </Tooltip>
        ))}
        {activeAgents.length > 4 && (
          <Avatar className="w-7 h-7 border-2 border-background">
            <AvatarFallback className="text-xs bg-secondary">
              +{activeAgents.length - 4}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
      {activeAgents.length > 0 && (
        <Badge variant="glass" className="text-xs">
          <Users className="h-3 w-3 mr-1" />
          {activeAgents.length} active
        </Badge>
      )}
    </div>
  );
}
