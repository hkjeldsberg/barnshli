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
    PostgrestVersion: "14.4"
  }
  barnshli: {
    Tables: {
      children: {
        Row: {
          created_at: string
          date_of_birth: string
          id: string
          name: string
          parent_id: string
          sex: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date_of_birth: string
          id?: string
          name: string
          parent_id: string
          sex: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date_of_birth?: string
          id?: string
          name?: string
          parent_id?: string
          sex?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "children_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      growth_records: {
        Row: {
          child_id: string
          created_at: string
          height_cm: number | null
          id: string
          recorded_at: string
          weight_kg: number | null
        }
        Insert: {
          child_id: string
          created_at?: string
          height_cm?: number | null
          id?: string
          recorded_at: string
          weight_kg?: number | null
        }
        Update: {
          child_id?: string
          created_at?: string
          height_cm?: number | null
          id?: string
          recorded_at?: string
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "growth_records_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      milestones: {
        Row: {
          achieved_at: string | null
          age_band: string | null
          child_id: string
          completed: boolean
          created_at: string
          id: string
          is_custom: boolean
          title: string
        }
        Insert: {
          achieved_at?: string | null
          age_band?: string | null
          child_id: string
          completed?: boolean
          created_at?: string
          id?: string
          is_custom?: boolean
          title: string
        }
        Update: {
          achieved_at?: string | null
          age_band?: string | null
          child_id?: string
          completed?: boolean
          created_at?: string
          id?: string
          is_custom?: boolean
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "milestones_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name: string
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      word_entries: {
        Row: {
          base_word: string
          child_id: string
          created_at: string
          first_heard_at: string
          id: string
        }
        Insert: {
          base_word: string
          child_id: string
          created_at?: string
          first_heard_at?: string
          id?: string
        }
        Update: {
          base_word?: string
          child_id?: string
          created_at?: string
          first_heard_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "word_entries_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      word_variants: {
        Row: {
          created_at: string
          id: string
          recorded_at: string
          variant: string
          word_entry_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          recorded_at?: string
          variant: string
          word_entry_id: string
        }
        Update: {
          created_at?: string
          id?: string
          recorded_at?: string
          variant?: string
          word_entry_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "word_variants_word_entry_id_fkey"
            columns: ["word_entry_id"]
            isOneToOne: false
            referencedRelation: "word_entries"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

// Barnshli schema helpers — used throughout lib/db/*
export type Tables<T extends keyof Database["barnshli"]["Tables"]> =
  Database["barnshli"]["Tables"][T]["Row"]

export type InsertTables<T extends keyof Database["barnshli"]["Tables"]> =
  Database["barnshli"]["Tables"][T]["Insert"]

export type UpdateTables<T extends keyof Database["barnshli"]["Tables"]> =
  Database["barnshli"]["Tables"][T]["Update"]

// Aliases matching Supabase-generated naming convention
export type TablesInsert<T extends keyof Database["barnshli"]["Tables"]> =
  InsertTables<T>

export type TablesUpdate<T extends keyof Database["barnshli"]["Tables"]> =
  UpdateTables<T>

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
  barnshli: {
    Enums: {},
  },
} as const
