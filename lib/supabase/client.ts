import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          name: string;
          description: string;
          owner_id: string;
          created_at: string;
          updated_at: string;
          metadata: any;
        };
        Insert: Omit<Database['public']['Tables']['projects']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['projects']['Insert']>;
      };
      canvases: {
        Row: {
          id: string;
          project_id: string;
          parent_canvas_id: string | null;
          name: string;
          layer_level: number;
          layer_type: string;
          viewport: any;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['canvases']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['canvases']['Insert']>;
      };
      nodes: {
        Row: {
          id: string;
          canvas_id: string;
          type: string;
          label: string;
          description: string;
          position_x: number;
          position_y: number;
          width: number;
          height: number;
          shape: string;
          color: string;
          icon: string | null;
          togaf_phase: string | null;
          etom_area: string | null;
          sid_entities: string[];
          owner: string;
          status: string;
          tags: string[];
          domain: string;
          child_canvas_id: string | null;
          properties: any;
          z_index: number;
          is_container: boolean;
          parent_node_id: string | null;
          locked: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['nodes']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['nodes']['Insert']>;
      };
      edges: {
        Row: {
          id: string;
          canvas_id: string;
          source_node_id: string;
          target_node_id: string;
          relationship_type: string;
          label: string;
          edge_type: string;
          animated: boolean;
          stroke_width: number;
          stroke_color: string;
          stroke_dasharray: string | null;
          properties: any;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['edges']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['edges']['Insert']>;
      };
    };
  };
};
