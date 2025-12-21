import { useState, useEffect, useRef } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { askQuestion } from "@/lib/gemini";
import { useToast } from "@/hooks/use-toast";
import {
  MessageSquare,
  Send,
  Loader2,
  Plus,
  Trash2,
  Bot,
  User,
  Sparkles,
  Clock,
  ChevronRight,
  Lightbulb,
} from "lucide-react";
import { format } from "date-fns";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

const suggestedQuestions = [
  "What are flood insurance coverage limits?",
  "How to process a denied claim?",
  "What documents are required for claims?",
  "Explain state-specific regulations",
];

export default function Chat() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation);
    }
  }, [activeConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchConversations = async () => {
    setIsLoadingConversations(true);
    const { data, error } = await supabase
      .from("chat_conversations")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) {
      toast({ title: "Error", description: "Failed to load conversations", variant: "destructive" });
    } else {
      setConversations(data || []);
      if (data && data.length > 0 && !activeConversation) {
        setActiveConversation(data[0].id);
      }
    }
    setIsLoadingConversations(false);
  };

  const fetchMessages = async (conversationId: string) => {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) {
      toast({ title: "Error", description: "Failed to load messages", variant: "destructive" });
    } else {
      setMessages(
        (data || []).map((msg) => ({
          ...msg,
          role: msg.role as "user" | "assistant",
        }))
      );
    }
  };

  const createNewConversation = async () => {
    const { data, error } = await supabase
      .from("chat_conversations")
      .insert({ title: "New Conversation" })
      .select()
      .single();

    if (error) {
      toast({ title: "Error", description: "Failed to create conversation", variant: "destructive" });
    } else if (data) {
      setConversations([data, ...conversations]);
      setActiveConversation(data.id);
      setMessages([]);
      toast({ title: "Success", description: "New conversation created" });
    }
  };

  const deleteConversation = async (id: string) => {
    const { error } = await supabase.from("chat_conversations").delete().eq("id", id);

    if (error) {
      toast({ title: "Error", description: "Failed to delete conversation", variant: "destructive" });
    } else {
      setConversations(conversations.filter((c) => c.id !== id));
      if (activeConversation === id) {
        const remaining = conversations.filter((c) => c.id !== id);
        setActiveConversation(remaining.length > 0 ? remaining[0].id : null);
      }
      toast({ title: "Success", description: "Conversation deleted" });
    }
  };

  const sendMessage = async (messageText?: string) => {
    const text = messageText || input;
    if (!text.trim() || isLoading) return;

    if (!activeConversation) {
      // Create a new conversation first
      const { data: newConv, error: convError } = await supabase
        .from("chat_conversations")
        .insert({ title: text.slice(0, 50) })
        .select()
        .single();

      if (convError || !newConv) {
        toast({ title: "Error", description: "Failed to create conversation", variant: "destructive" });
        return;
      }

      setConversations([newConv, ...conversations]);
      setActiveConversation(newConv.id);

      // Continue with the new conversation ID
      await processMessage(text, newConv.id);
    } else {
      await processMessage(text, activeConversation);
    }
  };

  const processMessage = async (text: string, conversationId: string) => {
    setInput("");
    setIsLoading(true);

    // Add user message
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Save user message to DB
    await supabase.from("chat_messages").insert({
      conversation_id: conversationId,
      role: "user",
      content: text,
    });

    try {
      // Get AI response
      const response = await askQuestion(text, {
        claimType: "General",
        state: "N/A",
        claimAmount: "N/A",
        customerName: "Agent",
        policyNumber: "N/A",
        dateOfIncident: "N/A",
        description: "General AI inquiry",
      });

      // Add assistant message
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: response,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // Save assistant message to DB
      await supabase.from("chat_messages").insert({
        conversation_id: conversationId,
        role: "assistant",
        content: response,
      });

      // Update conversation title if it's the first message
      if (messages.length === 0) {
        await supabase
          .from("chat_conversations")
          .update({ title: text.slice(0, 50) })
          .eq("id", conversationId);

        setConversations((prev) =>
          prev.map((c) => (c.id === conversationId ? { ...c, title: text.slice(0, 50) } : c))
        );
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to get AI response", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex h-[calc(100vh-80px)] gap-6 animate-fade-in">
        {/* Conversations Sidebar */}
        <Card className="w-80 shrink-0 hidden lg:flex flex-col">
          <CardHeader className="pb-3 border-b border-border">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Conversations
              </CardTitle>
              <Button variant="gradient" size="sm" onClick={createNewConversation}>
                <Plus className="h-4 w-4 mr-1" />
                New
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-2 overflow-hidden">
            <ScrollArea className="h-full">
              {isLoadingConversations ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : conversations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No conversations yet</p>
                  <p className="text-sm">Start a new conversation</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {conversations.map((conv, index) => (
                    <div
                      key={conv.id}
                      className={`group flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-secondary ${
                        activeConversation === conv.id
                          ? "bg-primary/10 border border-primary/30"
                          : ""
                      }`}
                      onClick={() => setActiveConversation(conv.id)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{conv.title}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(conv.updated_at), "MMM d, h:mm a")}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteConversation(conv.id);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="flex-1 flex flex-col">
          <CardHeader className="pb-3 border-b border-border shrink-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                AI Knowledge Assistant
              </CardTitle>
              <Badge variant="glass" className="animate-pulse">
                <span className="w-2 h-2 bg-success rounded-full mr-2" />
                Online
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 animate-fade-in">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-6 animate-float">
                    <Bot className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">How can I help you today?</h3>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    Ask me about insurance policies, regulations, claims processing, or any
                    knowledge base topics.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                    {suggestedQuestions.map((q, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        size="sm"
                        className="text-xs hover:bg-primary/10 hover:border-primary transition-all duration-200"
                        onClick={() => sendMessage(q)}
                      >
                        <Lightbulb className="h-3 w-3 mr-1.5 text-warning" />
                        {q}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg, index) => (
                    <div
                      key={msg.id}
                      className={`flex gap-3 animate-fade-in ${
                        msg.role === "user" ? "justify-end" : "justify-start"
                      }`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      {msg.role === "assistant" && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
                          <Bot className="h-4 w-4 text-primary-foreground" />
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary border border-border"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">
                          {msg.content}
                        </p>
                        <p
                          className={`text-xs mt-2 ${
                            msg.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
                          }`}
                        >
                          {format(new Date(msg.created_at), "h:mm a")}
                        </p>
                      </div>
                      {msg.role === "user" && (
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                          <User className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-3 animate-fade-in">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                        <Bot className="h-4 w-4 text-primary-foreground" />
                      </div>
                      <div className="bg-secondary border border-border rounded-2xl px-4 py-3">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                          <span
                            className="w-2 h-2 bg-primary rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          />
                          <span
                            className="w-2 h-2 bg-primary rounded-full animate-bounce"
                            style={{ animationDelay: "0.4s" }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t border-border bg-card shrink-0">
              <div className="flex gap-2">
                <Input
                  placeholder="Type your message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  className="flex-1 bg-secondary/50"
                  disabled={isLoading}
                />
                <Button
                  variant="gradient"
                  onClick={() => sendMessage()}
                  disabled={isLoading || !input.trim()}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
