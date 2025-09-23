export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      coaching_plan: {
        Row: {
          created_at: string
          id: string
          objective: string
          person_id: string
          playbook: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          objective?: string
          person_id: string
          playbook?: string
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          objective?: string
          person_id?: string
          playbook?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "coaching_plan_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "person"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coaching_plan_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "v_person_overview"
            referencedColumns: ["id"]
          },
        ]
      }
      kpi: {
        Row: {
          direction: string
          id: string
          name: string
          unit: string
        }
        Insert: {
          direction: string
          id: string
          name: string
          unit: string
        }
        Update: {
          direction?: string
          id?: string
          name?: string
          unit?: string
        }
        Relationships: []
      }
      performance_event: {
        Row: {
          id: string
          kpi_id: string | null
          meta: Json | null
          person_id: string
          source: string
          ts: string
          value: number | null
        }
        Insert: {
          id?: string
          kpi_id?: string | null
          meta?: Json | null
          person_id: string
          source: string
          ts?: string
          value?: number | null
        }
        Update: {
          id?: string
          kpi_id?: string | null
          meta?: Json | null
          person_id?: string
          source?: string
          ts?: string
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "performance_event_kpi_id_fkey"
            columns: ["kpi_id"]
            isOneToOne: false
            referencedRelation: "kpi"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_event_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "person"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_event_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "v_person_overview"
            referencedColumns: ["id"]
          },
        ]
      }
      person: {
        Row: {
          created_at: string
          department: string | null
          email: string | null
          id: string
          name: string
          role: string | null
          start_date: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          department?: string | null
          email?: string | null
          id?: string
          name: string
          role?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          department?: string | null
          email?: string | null
          id?: string
          name?: string
          role?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      release_case: {
        Row: {
          evidence: Json
          id: string
          opened_at: string
          person_id: string
          reason: string
          risk_score: number
          status: string
          updated_at: string | null
        }
        Insert: {
          evidence: Json
          id?: string
          opened_at?: string
          person_id: string
          reason: string
          risk_score: number
          status?: string
          updated_at?: string | null
        }
        Update: {
          evidence?: Json
          id?: string
          opened_at?: string
          person_id?: string
          reason?: string
          risk_score?: number
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "release_case_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "person"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "release_case_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "v_person_overview"
            referencedColumns: ["id"]
          },
        ]
      }
      risk_score: {
        Row: {
          calculated_at: string
          id: string
          person_id: string
          score: number
        }
        Insert: {
          calculated_at?: string
          id?: string
          person_id: string
          score: number
        }
        Update: {
          calculated_at?: string
          id?: string
          person_id?: string
          score?: number
        }
        Relationships: [
          {
            foreignKeyName: "risk_score_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: true
            referencedRelation: "person"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "risk_score_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: true
            referencedRelation: "v_person_overview"
            referencedColumns: ["id"]
          },
        ]
      }
      signal: {
        Row: {
          created_at: string
          id: string
          level: string
          person_id: string
          reason: string
          score_delta: number | null
          ts: string
        }
        Insert: {
          created_at?: string
          id?: string
          level: string
          person_id: string
          reason: string
          score_delta?: number | null
          ts?: string
        }
        Update: {
          created_at?: string
          id?: string
          level?: string
          person_id?: string
          reason?: string
          score_delta?: number | null
          ts?: string
        }
        Relationships: [
          {
            foreignKeyName: "signal_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "person"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "signal_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "v_person_overview"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          created_at: string | null
          department: string | null
          email: string
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          email: string
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          department?: string | null
          email?: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      v_person_overview: {
        Row: {
          email: string | null
          id: string | null
          last_signal_ts: string | null
          name: string | null
          risk_score: number | null
          role: string | null
          status: string | null
        }
        Relationships: []
      }
      v_release_open: {
        Row: {
          email: string | null
          id: string | null
          name: string | null
          opened_at: string | null
          reason: string | null
          risk_score: number | null
          status: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_coaching_history: {
        Args: { target_person_id: string }
        Returns: {
          created_at: string
          id: string
          objective: string
          playbook: string
          status: string
        }[]
      }
      get_evidence: {
        Args: { target_person_id: string }
        Returns: {
          benchmark: number
          kpi: string
          source_link: string
          time_window: string
          value: number
        }[]
      }
      get_performance_evidence: {
        Args: { target_person_id: string }
        Returns: {
          benchmark: number
          kpi: string
          source_link: string
          time_window: string
          value: number
        }[]
      }
      get_person_details: {
        Args: { person_id: string }
        Returns: {
          created_at: string
          department: string
          email: string
          id: string
          name: string
          updated_at: string
        }[]
      }
      get_person_directory: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          department: string
          id: string
          name: string
        }[]
      }
      get_person_profile: {
        Args: { target_person_id: string }
        Returns: {
          created_at: string
          department: string
          email: string
          id: string
          name: string
          risk_score: number
        }[]
      }
      get_user_role: {
        Args: { user_id?: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role_access: {
        Args: { required_roles: Database["public"]["Enums"]["app_role"][] }
        Returns: boolean
      }
      insert_release_case: {
        Args:
          | {
              calculated_risk_score: number
              decision_reason: string
              evidence_data: Json
              target_person_id: string
            }
          | {
              decision: string
              evidence_json: Json
              person_id: string
              reason: string
              risk_score: number
            }
        Returns: string
      }
      release_safeguards: {
        Args: { target_person_id: string }
        Returns: {
          coach_ok: boolean
          data_ok: boolean
          messages: string[]
          tenure_ok: boolean
        }[]
      }
      update_release_case_status: {
        Args: { new_status: string; target_release_case_id: string }
        Returns: number
      }
    }
    Enums: {
      app_role: "admin" | "hr_manager" | "manager" | "employee"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "hr_manager", "manager", "employee"],
    },
  },
} as const
