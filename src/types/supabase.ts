export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      chats: {
        Row: {
          created_at: string
          id: number
          chat_provider_id: string | null
          provider_name: string | null
          title: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          chat_provider_id?: string | null
          provider_name?: string | null
          title?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          chat_provider_id?: string | null
          provider_name?: string | null
          title?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          chat_provider_id: string | null
          content: string | null
          created_at: string
          id: number
          message_provider_id: string | null
          model: string | null
          parent_message_provider_id: string | null
          role: string | null
          tools: string[] | null
          user_id: string | null
        }
        Insert: {
          chat_provider_id?: string | null
          content?: string | null
          created_at?: string
          id?: number
          message_provider_id?: string | null
          model?: string | null
          parent_message_provider_id?: string | null
          role?: string | null
          tools?: string[] | null
          user_id?: string | null
        }
        Update: {
          chat_provider_id?: string | null
          content?: string | null
          created_at?: string
          id?: number
          message_provider_id?: string | null
          model?: string | null
          parent_message_provider_id?: string | null
          role?: string | null
          tools?: string[] | null
          user_id?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          metadata: Json | null
          body: string | null
          created_at: string
          id: number
          read_at: string | null
          title: string | null
          type: string | null
          user_id: string | null
        }
        Insert: {
          metadata?: Json | null
          body?: string | null
          created_at?: string
          id?: number
          read_at?: string | null
          title?: string | null
          type?: string | null
          user_id?: string | null
        }
        Update: {
          metadata?: Json | null
          body?: string | null
          created_at?: string
          id?: number
          read_at?: string | null
          title?: string | null
          type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      official_folders: {
        Row: {
          created_at: string
          id: number
          path: string | null
          tags: string[] | null
          type: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          path?: string | null
          tags?: string[] | null
          type?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          path?: string | null
          tags?: string[] | null
          type?: string | null
        }
        Relationships: []
      }
      organization_folders: {
        Row: {
          created_at: string
          id: number
          organization_id: string | null
          path: string | null
          tags: string[] | null
          type: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          organization_id?: string | null
          path?: string | null
          tags?: string[] | null
          type?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          organization_id?: string | null
          path?: string | null
          tags?: string[] | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_folders_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          name: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string | null
        }
        Relationships: []
      }
      prompt_templates: {
        Row: {
          content: string | null
          created_at: string
          folder_id: number | null
          id: number
          locale: string | null
          tags: string[] | null
          title: string | null
          type: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string
          folder_id?: number | null
          id?: number
          locale?: string | null
          tags?: string[] | null
          title?: string | null
          type?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string
          folder_id?: number | null
          id?: number
          locale?: string | null
          tags?: string[] | null
          title?: string | null
          type?: string | null
        }
        Relationships: []
      }
      user_folders: {
        Row: {
          created_at: string
          id: number
          path: string | null
          tags: string[] | null
          type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          path?: string | null
          tags?: string[] | null
          type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          path?: string | null
          tags?: string[] | null
          type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      users_metadata: {
        Row: {
          additional_email: string | null
          additional_organization: string | null
          created_at: string
          id: number
          name: string | null
          organization_id: string | null
          phone_number: string | null
          pinned_official_folder_ids: number[] | null
          pinned_organization_folder_ids: number[] | null
          preferences_metadata: Json | null
          user_id: string | null
        }
        Insert: {
          additional_email?: string | null
          additional_organization?: string | null
          created_at?: string
          id?: number
          name?: string | null
          organization_id?: string | null
          phone_number?: string | null
          pinned_official_folder_ids?: number[] | null
          pinned_organization_folder_ids?: number[] | null
          preferences_metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          additional_email?: string | null
          additional_organization?: string | null
          created_at?: string
          id?: number
          name?: string | null
          organization_id?: string | null
          phone_number?: string | null
          pinned_official_folder_ids?: number[] | null
          pinned_organization_folder_ids?: number[] | null
          preferences_metadata?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_metadata_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

