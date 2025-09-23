CREATE SCHEMA IF NOT EXISTS content;

-- RSS feeds that users can subscribe to
CREATE TABLE content.feeds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  website_url TEXT,
  language TEXT,
  category TEXT,
  image_url TEXT,
  last_fetched_at TIMESTAMP WITH TIME ZONE,
  fetch_status TEXT CHECK (fetch_status IN ('active', 'error', 'paused')) DEFAULT 'active',
  fetch_error TEXT,
  refresh_interval INTEGER DEFAULT 60, -- minutes
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Individual articles from RSS feeds
CREATE TABLE content.articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feed_id UUID NOT NULL REFERENCES content.feeds(id) ON DELETE CASCADE,
  external_id TEXT, -- Original article ID from RSS (guid/id)
  title TEXT NOT NULL,
  content TEXT,
  summary TEXT,
  author TEXT,
  url TEXT UNIQUE,
  published_at TIMESTAMP WITH TIME ZONE,
  scraped_content TEXT,
  word_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_feeds_url ON content.feeds(url);
CREATE INDEX idx_feeds_fetch_status ON content.feeds(fetch_status);
CREATE INDEX idx_feeds_last_fetched ON content.feeds(last_fetched_at);
CREATE INDEX idx_feeds_is_active ON content.feeds(is_active);

CREATE INDEX idx_articles_feed_id ON content.articles(feed_id);
CREATE INDEX idx_articles_external_id ON content.articles(external_id);
CREATE INDEX idx_articles_url ON content.articles(url);
CREATE INDEX idx_articles_published_at ON content.articles(published_at DESC);
CREATE INDEX idx_articles_created_at ON content.articles(created_at DESC);
CREATE INDEX idx_articles_title_search ON content.articles USING GIN(to_tsvector('english', title));
CREATE INDEX idx_articles_content_search ON content.articles USING GIN(to_tsvector('english', content));

-- Composite indexes for common queries
CREATE INDEX idx_articles_feed_published ON content.articles(feed_id, published_at DESC);
CREATE UNIQUE INDEX idx_articles_feed_external ON content.articles(feed_id, external_id) WHERE external_id IS NOT NULL;

-- Triggers for updated_at
CREATE TRIGGER update_feeds_updated_at
  BEFORE UPDATE ON content.feeds
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON content.articles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
