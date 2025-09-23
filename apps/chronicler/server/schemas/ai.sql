CREATE SCHEMA IF NOT EXISTS ai;

-- AI-generated article summaries
CREATE TABLE ai.article_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES content.articles(id) ON DELETE CASCADE,
  summary_type TEXT CHECK (summary_type IN ('brief', 'detailed', 'bullet_points')) NOT NULL,
  content TEXT NOT NULL,
  ai_provider TEXT NOT NULL,
  ai_model TEXT NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI-generated categories and tags
CREATE TABLE ai.article_classifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES content.articles(id) ON DELETE CASCADE,
  classification_type TEXT CHECK (classification_type IN ('category', 'tag', 'sentiment', 'topic')) NOT NULL,
  value TEXT NOT NULL,
  confidence_score DECIMAL(4,3) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  ai_provider TEXT NOT NULL,
  ai_model TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI-based article recommendations
CREATE TABLE ai.recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES auth.user(id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES content.articles(id) ON DELETE CASCADE,
  recommendation_type TEXT CHECK (recommendation_type IN ('similar_content', 'trending', 'personalized')) NOT NULL,
  score DECIMAL(5,4) CHECK (score >= 0 AND score <= 1),
  reasoning TEXT,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_article_summaries_article_id ON ai.article_summaries(article_id);
CREATE INDEX idx_article_summaries_type ON ai.article_summaries(summary_type);
CREATE INDEX idx_article_summaries_provider ON ai.article_summaries(ai_provider);
CREATE UNIQUE INDEX idx_article_summaries_unique ON ai.article_summaries(article_id, summary_type, ai_provider, ai_model);

CREATE INDEX idx_article_classifications_article_id ON ai.article_classifications(article_id);
CREATE INDEX idx_article_classifications_type ON ai.article_classifications(classification_type);
CREATE INDEX idx_article_classifications_value ON ai.article_classifications(value);
CREATE INDEX idx_article_classifications_confidence ON ai.article_classifications(confidence_score DESC);
CREATE INDEX idx_article_classifications_type_value ON ai.article_classifications(classification_type, value);

CREATE INDEX idx_recommendations_user_id ON ai.recommendations(user_id);
CREATE INDEX idx_recommendations_article_id ON ai.recommendations(article_id);
CREATE INDEX idx_recommendations_type ON ai.recommendations(recommendation_type);
CREATE INDEX idx_recommendations_score ON ai.recommendations(score DESC);
CREATE INDEX idx_recommendations_generated_at ON ai.recommendations(generated_at DESC);
CREATE INDEX idx_recommendations_expires_at ON ai.recommendations(expires_at);
CREATE INDEX idx_recommendations_user_score ON ai.recommendations(user_id, score DESC);
CREATE INDEX idx_recommendations_active ON ai.recommendations(user_id, expires_at) WHERE expires_at > NOW();

-- Triggers for updated_at
CREATE TRIGGER update_article_summaries_updated_at
  BEFORE UPDATE ON ai.article_summaries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_article_classifications_updated_at
  BEFORE UPDATE ON ai.article_classifications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_recommendations_updated_at
  BEFORE UPDATE ON ai.recommendations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
