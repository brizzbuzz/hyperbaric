CREATE SCHEMA IF NOT EXISTS "user";

-- User subscriptions to feeds
CREATE TABLE "user".feed_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES auth.user(id) ON DELETE CASCADE,
  feed_id UUID NOT NULL REFERENCES content.feeds(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT TRUE,
  notification_enabled BOOLEAN DEFAULT FALSE,
  custom_name TEXT,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User reading history
CREATE TABLE "user".reading_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES auth.user(id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES content.articles(id) ON DELETE CASCADE,
  read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_duration INTEGER, -- seconds spent reading
  scroll_percentage DECIMAL(5,2), -- percentage of article scrolled
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User bookmarks/saved articles
CREATE TABLE "user".bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES auth.user(id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES content.articles(id) ON DELETE CASCADE,
  custom_tags TEXT[], -- user's custom tags
  notes TEXT, -- user's notes on the article
  bookmarked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User preferences for content and AI features
CREATE TABLE "user".preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES auth.user(id) ON DELETE CASCADE,
  preference_type TEXT CHECK (preference_type IN ('ai_summary', 'content_filter', 'notification', 'display')) NOT NULL,
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_feed_subscriptions_user_id ON "user".feed_subscriptions(user_id);
CREATE INDEX idx_feed_subscriptions_feed_id ON "user".feed_subscriptions(feed_id);
CREATE INDEX idx_feed_subscriptions_is_active ON "user".feed_subscriptions(is_active);
CREATE UNIQUE INDEX idx_feed_subscriptions_unique ON "user".feed_subscriptions(user_id, feed_id);

CREATE INDEX idx_reading_history_user_id ON "user".reading_history(user_id);
CREATE INDEX idx_reading_history_article_id ON "user".reading_history(article_id);
CREATE INDEX idx_reading_history_read_at ON "user".reading_history(read_at DESC);
CREATE INDEX idx_reading_history_user_recent ON "user".reading_history(user_id, read_at DESC);
CREATE UNIQUE INDEX idx_reading_history_unique ON "user".reading_history(user_id, article_id);

CREATE INDEX idx_bookmarks_user_id ON "user".bookmarks(user_id);
CREATE INDEX idx_bookmarks_article_id ON "user".bookmarks(article_id);
CREATE INDEX idx_bookmarks_bookmarked_at ON "user".bookmarks(bookmarked_at DESC);
CREATE INDEX idx_bookmarks_tags ON "user".bookmarks USING GIN(custom_tags);
CREATE INDEX idx_bookmarks_user_recent ON "user".bookmarks(user_id, bookmarked_at DESC);
CREATE UNIQUE INDEX idx_bookmarks_unique ON "user".bookmarks(user_id, article_id);

CREATE INDEX idx_preferences_user_id ON "user".preferences(user_id);
CREATE INDEX idx_preferences_type ON "user".preferences(preference_type);
CREATE INDEX idx_preferences_key ON "user".preferences(key);
CREATE INDEX idx_preferences_type_key ON "user".preferences(preference_type, key);
CREATE UNIQUE INDEX idx_preferences_unique ON "user".preferences(user_id, preference_type, key);

-- Triggers for updated_at
CREATE TRIGGER update_feed_subscriptions_updated_at
  BEFORE UPDATE ON "user".feed_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reading_history_updated_at
  BEFORE UPDATE ON "user".reading_history
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookmarks_updated_at
  BEFORE UPDATE ON "user".bookmarks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_preferences_updated_at
  BEFORE UPDATE ON "user".preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
