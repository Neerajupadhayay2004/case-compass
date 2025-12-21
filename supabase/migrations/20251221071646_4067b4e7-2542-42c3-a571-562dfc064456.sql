-- Create agents table for collaboration
CREATE TABLE public.agents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  avatar_color TEXT NOT NULL DEFAULT '#3B82F6',
  status TEXT NOT NULL DEFAULT 'online',
  last_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

-- Allow public access for demo
CREATE POLICY "Allow public read access on agents" 
ON public.agents 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert access on agents" 
ON public.agents 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update access on agents" 
ON public.agents 
FOR UPDATE 
USING (true);

-- Create case_collaborators table for tracking who's working on what
CREATE TABLE public.case_collaborators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_activity TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  cursor_position JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(case_id, agent_id)
);

-- Enable RLS
ALTER TABLE public.case_collaborators ENABLE ROW LEVEL SECURITY;

-- Allow public access
CREATE POLICY "Allow public read access on case_collaborators" 
ON public.case_collaborators 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert access on case_collaborators" 
ON public.case_collaborators 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update access on case_collaborators" 
ON public.case_collaborators 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow public delete access on case_collaborators" 
ON public.case_collaborators 
FOR DELETE 
USING (true);

-- Enable realtime for collaboration tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.case_collaborators;
ALTER PUBLICATION supabase_realtime ADD TABLE public.cases;

-- Insert sample agents
INSERT INTO public.agents (name, email, avatar_color, status) VALUES
('Sarah Johnson', 'sarah.johnson@company.com', '#3B82F6', 'online'),
('Mike Chen', 'mike.chen@company.com', '#10B981', 'online'),
('Emily Davis', 'emily.davis@company.com', '#F59E0B', 'away'),
('James Wilson', 'james.wilson@company.com', '#EF4444', 'offline');