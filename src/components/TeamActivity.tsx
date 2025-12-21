import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, Circle, Activity, Clock } from "lucide-react";
import { format } from "date-fns";

interface Agent {
  id: string;
  name: string;
  email: string;
  avatar_color: string;
  status: string;
  last_seen: string;
}

export function TeamActivity() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAgents = async () => {
      setIsLoading(true);
      const { data } = await supabase
        .from("agents")
        .select("*")
        .order("last_seen", { ascending: false });

      if (data) {
        setAgents(data);
      }
      setIsLoading(false);
    };

    fetchAgents();

    // Subscribe to realtime presence updates
    const channel = supabase.channel("team-presence");
    
    channel
      .on("presence", { event: "sync" }, () => {
        fetchAgents();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const onlineCount = agents.filter((a) => a.status === "online").length;
  const awayCount = agents.filter((a) => a.status === "away").length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Team Activity
          </span>
          <div className="flex gap-2">
            <Badge variant="success" className="text-xs">
              <Circle className="h-2 w-2 fill-current mr-1" />
              {onlineCount} online
            </Badge>
            <Badge variant="warning" className="text-xs">
              <Circle className="h-2 w-2 fill-current mr-1" />
              {awayCount} away
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px]">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-secondary" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-24 bg-secondary rounded" />
                    <div className="h-3 w-32 bg-secondary rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {agents.map((agent, index) => (
                <div
                  key={agent.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="relative">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback
                        style={{ backgroundColor: agent.avatar_color }}
                        className="text-white font-medium"
                      >
                        {agent.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background ${
                        agent.status === "online"
                          ? "bg-success"
                          : agent.status === "away"
                          ? "bg-warning"
                          : "bg-muted-foreground"
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{agent.name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {agent.status === "online"
                        ? "Active now"
                        : `Last seen ${format(new Date(agent.last_seen), "h:mm a")}`}
                    </p>
                  </div>
                  <Badge
                    variant={
                      agent.status === "online"
                        ? "success"
                        : agent.status === "away"
                        ? "warning"
                        : "secondary"
                    }
                    className="text-[10px]"
                  >
                    {agent.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
