
-- Create storage bucket for opportunity attachments
INSERT INTO storage.buckets (id, name, public) VALUES ('opportunity-files', 'opportunity-files', true);

-- Create file metadata table
CREATE TABLE public.opportunity_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  opportunity_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL DEFAULT 0,
  mime_type TEXT NOT NULL DEFAULT '',
  comment TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS policies (public access, no auth)
ALTER TABLE public.opportunity_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to opportunity_files" ON public.opportunity_files FOR ALL USING (true) WITH CHECK (true);

-- Storage RLS policies
CREATE POLICY "Allow public upload to opportunity-files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'opportunity-files');
CREATE POLICY "Allow public read from opportunity-files" ON storage.objects FOR SELECT USING (bucket_id = 'opportunity-files');
CREATE POLICY "Allow public delete from opportunity-files" ON storage.objects FOR DELETE USING (bucket_id = 'opportunity-files');
