-- Create documents table for uploaded knowledge base documents
CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_url TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  status TEXT NOT NULL DEFAULT 'pending',
  uploaded_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create cases table for case management
CREATE TABLE public.cases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  claim_type TEXT NOT NULL,
  state TEXT NOT NULL,
  claim_amount DECIMAL(12,2) NOT NULL,
  policy_number TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  date_of_incident DATE NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  priority TEXT NOT NULL DEFAULT 'medium',
  assigned_to TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create case_history table for audit trail
CREATE TABLE public.case_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL,
  details TEXT,
  performed_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create knowledge_queries table to track AI queries
CREATE TABLE public.knowledge_queries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
  query TEXT NOT NULL,
  response TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (public access for demo)
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_queries ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (demo mode)
CREATE POLICY "Allow public read access on documents" ON public.documents FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on documents" ON public.documents FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on documents" ON public.documents FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on documents" ON public.documents FOR DELETE USING (true);

CREATE POLICY "Allow public read access on cases" ON public.cases FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on cases" ON public.cases FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on cases" ON public.cases FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on cases" ON public.cases FOR DELETE USING (true);

CREATE POLICY "Allow public read access on case_history" ON public.case_history FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on case_history" ON public.case_history FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access on knowledge_queries" ON public.knowledge_queries FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on knowledge_queries" ON public.knowledge_queries FOR INSERT WITH CHECK (true);

-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', true);

-- Create storage policies
CREATE POLICY "Allow public read access on documents bucket" ON storage.objects FOR SELECT USING (bucket_id = 'documents');
CREATE POLICY "Allow public upload to documents bucket" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'documents');
CREATE POLICY "Allow public update on documents bucket" ON storage.objects FOR UPDATE USING (bucket_id = 'documents');
CREATE POLICY "Allow public delete on documents bucket" ON storage.objects FOR DELETE USING (bucket_id = 'documents');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cases_updated_at
  BEFORE UPDATE ON public.cases
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample cases
INSERT INTO public.cases (claim_type, state, claim_amount, policy_number, customer_name, date_of_incident, description, status, priority) VALUES
('Flood', 'Florida', 127500.00, 'FL-2024-88291', 'Michael Rodriguez', '2024-09-28', 'Residential property damage due to Hurricane Helene. Primary structure shows significant water intrusion affecting ground floor and basement.', 'open', 'high'),
('Fire', 'California', 89000.00, 'CA-2024-55123', 'Jennifer Chen', '2024-10-15', 'Kitchen fire spread to living room. Smoke damage throughout first floor.', 'in_review', 'high'),
('Auto', 'Texas', 35000.00, 'TX-2024-77456', 'Robert Williams', '2024-11-02', 'Multi-vehicle collision on highway. Total loss claim for 2023 sedan.', 'open', 'medium'),
('Theft', 'New York', 15000.00, 'NY-2024-33789', 'Sarah Johnson', '2024-11-20', 'Break-in and theft of electronics and jewelry. Police report filed.', 'pending', 'low'),
('Medical', 'Ohio', 45000.00, 'OH-2024-99234', 'David Martinez', '2024-10-08', 'Emergency surgery and hospitalization coverage claim.', 'approved', 'medium');