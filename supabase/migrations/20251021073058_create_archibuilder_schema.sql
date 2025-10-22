-- ArchiBuilder v2.0 Database Schema
-- Creates complete schema for enterprise architecture modeling with TOGAF, eTOM, and SID frameworks

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Canvases table (multi-layer drill-down support)
CREATE TABLE IF NOT EXISTS canvases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  parent_canvas_id uuid REFERENCES canvases(id) ON DELETE SET NULL,
  name text NOT NULL DEFAULT 'Untitled Canvas',
  layer_level integer DEFAULT 0,
  layer_type text DEFAULT 'enterprise',
  viewport jsonb DEFAULT '{"x": 0, "y": 0, "zoom": 1}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Nodes table
CREATE TABLE IF NOT EXISTS nodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  canvas_id uuid REFERENCES canvases(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'capability',
  label text NOT NULL DEFAULT 'New Node',
  description text DEFAULT '',
  position_x float NOT NULL DEFAULT 0,
  position_y float NOT NULL DEFAULT 0,
  width float NOT NULL DEFAULT 200,
  height float NOT NULL DEFAULT 80,
  shape text DEFAULT 'rectangle',
  color text DEFAULT '#3b82f6',
  icon text,
  togaf_phase text,
  etom_area text,
  sid_entities text[] DEFAULT ARRAY[]::text[],
  owner text DEFAULT '',
  status text DEFAULT 'proposed',
  tags text[] DEFAULT ARRAY[]::text[],
  domain text DEFAULT '',
  child_canvas_id uuid REFERENCES canvases(id) ON DELETE SET NULL,
  properties jsonb DEFAULT '{}'::jsonb,
  z_index integer DEFAULT 1,
  is_container boolean DEFAULT false,
  parent_node_id uuid REFERENCES nodes(id) ON DELETE SET NULL,
  locked boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Edges table
CREATE TABLE IF NOT EXISTS edges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  canvas_id uuid REFERENCES canvases(id) ON DELETE CASCADE,
  source_node_id uuid REFERENCES nodes(id) ON DELETE CASCADE,
  target_node_id uuid REFERENCES nodes(id) ON DELETE CASCADE,
  relationship_type text DEFAULT 'depends-on',
  label text DEFAULT '',
  edge_type text DEFAULT 'straight',
  animated boolean DEFAULT false,
  stroke_width float DEFAULT 2,
  stroke_color text DEFAULT '#64748b',
  stroke_dasharray text,
  properties jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Versions table
CREATE TABLE IF NOT EXISTS versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  canvas_id uuid REFERENCES canvases(id) ON DELETE CASCADE,
  version_number integer NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  snapshot jsonb NOT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  canvas_id uuid REFERENCES canvases(id) ON DELETE CASCADE,
  node_id uuid REFERENCES nodes(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  position_x float,
  position_y float,
  resolved boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Validation issues table
CREATE TABLE IF NOT EXISTS validation_issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  canvas_id uuid REFERENCES canvases(id) ON DELETE CASCADE,
  node_id uuid REFERENCES nodes(id) ON DELETE CASCADE,
  edge_id uuid REFERENCES edges(id) ON DELETE CASCADE,
  issue_type text NOT NULL DEFAULT 'warning',
  category text NOT NULL,
  message text NOT NULL,
  resolved boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_canvases_project ON canvases(project_id);
CREATE INDEX IF NOT EXISTS idx_canvases_parent ON canvases(parent_canvas_id);
CREATE INDEX IF NOT EXISTS idx_nodes_canvas ON nodes(canvas_id);
CREATE INDEX IF NOT EXISTS idx_nodes_child_canvas ON nodes(child_canvas_id);
CREATE INDEX IF NOT EXISTS idx_nodes_parent ON nodes(parent_node_id);
CREATE INDEX IF NOT EXISTS idx_edges_canvas ON edges(canvas_id);
CREATE INDEX IF NOT EXISTS idx_edges_source ON edges(source_node_id);
CREATE INDEX IF NOT EXISTS idx_edges_target ON edges(target_node_id);
CREATE INDEX IF NOT EXISTS idx_versions_canvas ON versions(canvas_id);
CREATE INDEX IF NOT EXISTS idx_comments_canvas ON comments(canvas_id);
CREATE INDEX IF NOT EXISTS idx_validation_canvas ON validation_issues(canvas_id);

-- GIN indexes for JSONB and arrays
CREATE INDEX IF NOT EXISTS idx_nodes_properties ON nodes USING gin(properties);
CREATE INDEX IF NOT EXISTS idx_nodes_tags ON nodes USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_nodes_sid ON nodes USING gin(sid_entities);

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvases ENABLE ROW LEVEL SECURITY;
ALTER TABLE nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE validation_issues ENABLE ROW LEVEL SECURITY;

-- RLS Policies for projects
CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can create projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

-- RLS Policies for canvases
CREATE POLICY "Users can view canvases in own projects"
  ON canvases FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = canvases.project_id
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create canvases in own projects"
  ON canvases FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = canvases.project_id
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update canvases in own projects"
  ON canvases FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = canvases.project_id
      AND projects.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = canvases.project_id
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete canvases in own projects"
  ON canvases FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = canvases.project_id
      AND projects.owner_id = auth.uid()
    )
  );

-- RLS Policies for nodes
CREATE POLICY "Users can view nodes in own canvases"
  ON nodes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM canvases c
      JOIN projects p ON p.id = c.project_id
      WHERE c.id = nodes.canvas_id
      AND p.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create nodes in own canvases"
  ON nodes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM canvases c
      JOIN projects p ON p.id = c.project_id
      WHERE c.id = nodes.canvas_id
      AND p.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update nodes in own canvases"
  ON nodes FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM canvases c
      JOIN projects p ON p.id = c.project_id
      WHERE c.id = nodes.canvas_id
      AND p.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM canvases c
      JOIN projects p ON p.id = c.project_id
      WHERE c.id = nodes.canvas_id
      AND p.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete nodes in own canvases"
  ON nodes FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM canvases c
      JOIN projects p ON p.id = c.project_id
      WHERE c.id = nodes.canvas_id
      AND p.owner_id = auth.uid()
    )
  );

-- RLS Policies for edges
CREATE POLICY "Users can view edges in own canvases"
  ON edges FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM canvases c
      JOIN projects p ON p.id = c.project_id
      WHERE c.id = edges.canvas_id
      AND p.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create edges in own canvases"
  ON edges FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM canvases c
      JOIN projects p ON p.id = c.project_id
      WHERE c.id = edges.canvas_id
      AND p.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update edges in own canvases"
  ON edges FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM canvases c
      JOIN projects p ON p.id = c.project_id
      WHERE c.id = edges.canvas_id
      AND p.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM canvases c
      JOIN projects p ON p.id = c.project_id
      WHERE c.id = edges.canvas_id
      AND p.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete edges in own canvases"
  ON edges FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM canvases c
      JOIN projects p ON p.id = c.project_id
      WHERE c.id = edges.canvas_id
      AND p.owner_id = auth.uid()
    )
  );

-- Similar policies for versions, comments, and validation_issues
CREATE POLICY "Users can view versions in own canvases"
  ON versions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM canvases c
      JOIN projects p ON p.id = c.project_id
      WHERE c.id = versions.canvas_id
      AND p.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create versions in own canvases"
  ON versions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM canvases c
      JOIN projects p ON p.id = c.project_id
      WHERE c.id = versions.canvas_id
      AND p.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can view comments in own canvases"
  ON comments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM canvases c
      JOIN projects p ON p.id = c.project_id
      WHERE c.id = comments.canvas_id
      AND p.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create comments in own canvases"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM canvases c
      JOIN projects p ON p.id = c.project_id
      WHERE c.id = comments.canvas_id
      AND p.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own comments"
  ON comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view validation issues in own canvases"
  ON validation_issues FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM canvases c
      JOIN projects p ON p.id = c.project_id
      WHERE c.id = validation_issues.canvas_id
      AND p.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create validation issues in own canvases"
  ON validation_issues FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM canvases c
      JOIN projects p ON p.id = c.project_id
      WHERE c.id = validation_issues.canvas_id
      AND p.owner_id = auth.uid()
    )
  );
