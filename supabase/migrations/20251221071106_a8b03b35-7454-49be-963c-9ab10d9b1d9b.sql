-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  is_read BOOLEAN NOT NULL DEFAULT false,
  link TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access on notifications" 
ON public.notifications 
FOR SELECT 
USING (true);

-- Allow public insert
CREATE POLICY "Allow public insert access on notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (true);

-- Allow public update (for marking as read)
CREATE POLICY "Allow public update access on notifications" 
ON public.notifications 
FOR UPDATE 
USING (true);

-- Allow public delete
CREATE POLICY "Allow public delete access on notifications" 
ON public.notifications 
FOR DELETE 
USING (true);

-- Create chat_conversations table
CREATE TABLE public.chat_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL DEFAULT 'New Conversation',
  case_id UUID REFERENCES public.cases(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;

-- Allow public access
CREATE POLICY "Allow public read access on chat_conversations" 
ON public.chat_conversations 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert access on chat_conversations" 
ON public.chat_conversations 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update access on chat_conversations" 
ON public.chat_conversations 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow public delete access on chat_conversations" 
ON public.chat_conversations 
FOR DELETE 
USING (true);

-- Create chat_messages table
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Allow public access
CREATE POLICY "Allow public read access on chat_messages" 
ON public.chat_messages 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert access on chat_messages" 
ON public.chat_messages 
FOR INSERT 
WITH CHECK (true);

-- Add trigger for updated_at on chat_conversations
CREATE TRIGGER update_chat_conversations_updated_at
BEFORE UPDATE ON public.chat_conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample notifications
INSERT INTO public.notifications (title, message, type, is_read) VALUES
('New Policy Update', 'Florida flood insurance regulations have been updated. Review the changes.', 'warning', false),
('Document Processed', 'The uploaded SOP document has been indexed and is now searchable.', 'success', false),
('Case Assignment', 'You have been assigned a new high-priority case: CLM-2024-1234', 'info', false),
('System Maintenance', 'Scheduled maintenance window tonight from 2-4 AM EST.', 'info', true);