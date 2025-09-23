CREATE SCHEMA IF NOT EXISTS system;

-- Feed processing jobs and status
CREATE TABLE system.feed_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feed_id UUID NOT NULL REFERENCES content.feeds(id) ON DELETE CASCADE,
  job_type TEXT CHECK (job_type IN ('fetch_feed', 'process_articles', 'generate_summaries')) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'running', 'completed', 'failed')) DEFAULT 'pending',
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  priority INTEGER DEFAULT 5, -- 1 (highest) to 10 (lowest)
  metadata JSONB, -- Additional job-specific data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI processing queue
CREATE TABLE system.ai_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES content.articles(id) ON DELETE CASCADE,
  job_type TEXT CHECK (job_type IN ('summarize', 'classify', 'extract_entities', 'generate_recommendations')) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'running', 'completed', 'failed')) DEFAULT 'pending',
  ai_provider TEXT NOT NULL,
  ai_model TEXT NOT NULL,
  priority INTEGER DEFAULT 5, -- 1 (highest) to 10 (lowest)
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  input_data JSONB, -- Input parameters for the AI job
  output_data JSONB, -- Results from AI processing
  cost_estimate DECIMAL(10,4), -- Estimated cost in credits/tokens
  actual_cost DECIMAL(10,4), -- Actual cost incurred
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System configuration and settings
CREATE TABLE system.settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  is_encrypted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System health and monitoring metrics
CREATE TABLE system.metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  metric_type TEXT CHECK (metric_type IN ('counter', 'gauge', 'histogram')) NOT NULL,
  value DECIMAL NOT NULL,
  tags JSONB, -- Additional metadata/dimensions
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_feed_jobs_feed_id ON system.feed_jobs(feed_id);
CREATE INDEX idx_feed_jobs_type ON system.feed_jobs(job_type);
CREATE INDEX idx_feed_jobs_status ON system.feed_jobs(status);
CREATE INDEX idx_feed_jobs_priority ON system.feed_jobs(priority ASC);
CREATE INDEX idx_feed_jobs_created_at ON system.feed_jobs(created_at DESC);
CREATE INDEX idx_feed_jobs_queue ON system.feed_jobs(status, priority ASC, created_at ASC) WHERE status IN ('pending', 'failed');

CREATE INDEX idx_ai_jobs_article_id ON system.ai_jobs(article_id);
CREATE INDEX idx_ai_jobs_type ON system.ai_jobs(job_type);
CREATE INDEX idx_ai_jobs_status ON system.ai_jobs(status);
CREATE INDEX idx_ai_jobs_provider ON system.ai_jobs(ai_provider);
CREATE INDEX idx_ai_jobs_priority ON system.ai_jobs(priority ASC);
CREATE INDEX idx_ai_jobs_created_at ON system.ai_jobs(created_at DESC);
CREATE INDEX idx_ai_jobs_queue ON system.ai_jobs(status, priority ASC, created_at ASC) WHERE status IN ('pending', 'failed');

CREATE INDEX idx_settings_key ON system.settings(key);

CREATE INDEX idx_metrics_name ON system.metrics(metric_name);
CREATE INDEX idx_metrics_type ON system.metrics(metric_type);
CREATE INDEX idx_metrics_recorded_at ON system.metrics(recorded_at DESC);
CREATE INDEX idx_metrics_name_time ON system.metrics(metric_name, recorded_at DESC);

-- Partitioning for metrics table by month (optional, for high-volume scenarios)
-- This can be implemented later if needed for performance

-- Triggers for updated_at
CREATE TRIGGER update_feed_jobs_updated_at
  BEFORE UPDATE ON system.feed_jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_jobs_updated_at
  BEFORE UPDATE ON system.ai_jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON system.settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to clean up old completed jobs (can be called by a scheduled task)
CREATE OR REPLACE FUNCTION system.cleanup_old_jobs(days_to_keep INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Clean up completed feed jobs older than specified days
  DELETE FROM system.feed_jobs
  WHERE status = 'completed'
    AND completed_at < NOW() - INTERVAL '1 day' * days_to_keep;

  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  -- Clean up completed AI jobs older than specified days
  DELETE FROM system.ai_jobs
  WHERE status = 'completed'
    AND completed_at < NOW() - INTERVAL '1 day' * days_to_keep;

  GET DIAGNOSTICS deleted_count = deleted_count + ROW_COUNT;

  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get job queue statistics
CREATE OR REPLACE FUNCTION system.get_job_queue_stats()
RETURNS TABLE(
  job_type TEXT,
  pending_count BIGINT,
  running_count BIGINT,
  failed_count BIGINT,
  avg_processing_time INTERVAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    'feed_jobs'::TEXT as job_type,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
    COUNT(*) FILTER (WHERE status = 'running') as running_count,
    COUNT(*) FILTER (WHERE status = 'failed') as failed_count,
    AVG(completed_at - started_at) FILTER (WHERE status = 'completed') as avg_processing_time
  FROM system.feed_jobs
  WHERE created_at > NOW() - INTERVAL '24 hours'

  UNION ALL

  SELECT
    'ai_jobs'::TEXT as job_type,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
    COUNT(*) FILTER (WHERE status = 'running') as running_count,
    COUNT(*) FILTER (WHERE status = 'failed') as failed_count,
    AVG(completed_at - started_at) FILTER (WHERE status = 'completed') as avg_processing_time
  FROM system.ai_jobs
  WHERE created_at > NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;
