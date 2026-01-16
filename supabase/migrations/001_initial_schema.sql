-- ============================================
-- InfVoices 数据库初始化脚本
-- 请在 Supabase SQL Editor 中执行此脚本
-- ============================================

-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 枚举类型
-- ============================================

-- 项目状态
CREATE TYPE project_status AS ENUM ('draft', 'running', 'completed', 'paused');

-- 调研运行状态
CREATE TYPE survey_run_status AS ENUM ('pending', 'running', 'completed', 'failed', 'cancelled');

-- 问题类型
CREATE TYPE question_type AS ENUM (
  'single_choice',
  'multiple_choice',
  'scale',
  'open_text',
  'image_compare',
  'concept_test'
);

-- ============================================
-- 核心表
-- ============================================

-- 调研项目表
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status project_status DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 人群配置表
CREATE TABLE audience_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  preset_name VARCHAR(100),
  dimensions JSONB NOT NULL DEFAULT '{}',
  weights JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(project_id)
);

-- 问卷表
CREATE TABLE surveys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  questions JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(project_id)
);

-- 调研运行记录表
CREATE TABLE survey_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  sample_size INTEGER NOT NULL,
  sampling_mode VARCHAR(50) NOT NULL,
  status survey_run_status DEFAULT 'pending',
  progress INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 角色回答表
CREATE TABLE responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  run_id UUID NOT NULL REFERENCES survey_runs(id) ON DELETE CASCADE,
  persona JSONB NOT NULL,
  answers JSONB NOT NULL DEFAULT '[]',
  raw_llm_response TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 上传文件表
CREATE TABLE uploaded_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_type VARCHAR(100),
  file_size INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 索引
-- ============================================

-- 项目相关索引
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);

-- 人群配置索引
CREATE INDEX idx_audience_configs_project_id ON audience_configs(project_id);

-- 问卷索引
CREATE INDEX idx_surveys_project_id ON surveys(project_id);

-- 调研运行索引
CREATE INDEX idx_survey_runs_project_id ON survey_runs(project_id);
CREATE INDEX idx_survey_runs_status ON survey_runs(status);

-- 回答索引
CREATE INDEX idx_responses_run_id ON responses(run_id);

-- 文件索引
CREATE INDEX idx_uploaded_files_project_id ON uploaded_files(project_id);

-- ============================================
-- 触发器：自动更新 updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_surveys_updated_at
  BEFORE UPDATE ON surveys
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Row Level Security (RLS)
-- 由于是团队内部使用，简单开放所有权限
-- ============================================

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE audience_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploaded_files ENABLE ROW LEVEL SECURITY;

-- 允许匿名用户完全访问（团队内部使用）
CREATE POLICY "Allow all access to projects" ON projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to audience_configs" ON audience_configs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to surveys" ON surveys FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to survey_runs" ON survey_runs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to responses" ON responses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to uploaded_files" ON uploaded_files FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- 存储桶配置（用于上传图片）
-- ============================================

-- 创建存储桶
INSERT INTO storage.buckets (id, name, public)
VALUES ('survey-files', 'survey-files', true)
ON CONFLICT (id) DO NOTHING;

-- 允许公开读取
CREATE POLICY "Allow public read on survey-files"
ON storage.objects FOR SELECT
USING (bucket_id = 'survey-files');

-- 允许匿名上传
CREATE POLICY "Allow anonymous upload to survey-files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'survey-files');

-- 允许删除自己上传的文件
CREATE POLICY "Allow delete on survey-files"
ON storage.objects FOR DELETE
USING (bucket_id = 'survey-files');

-- ============================================
-- 完成提示
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ InfVoices 数据库初始化完成！';
  RAISE NOTICE '已创建表: projects, audience_configs, surveys, survey_runs, responses, uploaded_files';
  RAISE NOTICE '已创建存储桶: survey-files';
END $$;
