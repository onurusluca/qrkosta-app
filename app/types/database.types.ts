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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      menu_categories: {
        Row: {
          category_type: string | null
          created_at: string | null
          description: Json | null
          id: string
          image_url: string | null
          is_visible: boolean | null
          menu_id: string
          name: Json
          shop_id: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          category_type?: string | null
          created_at?: string | null
          description?: Json | null
          id?: string
          image_url?: string | null
          is_visible?: boolean | null
          menu_id: string
          name: Json
          shop_id: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          category_type?: string | null
          created_at?: string | null
          description?: Json | null
          id?: string
          image_url?: string | null
          is_visible?: boolean | null
          menu_id?: string
          name?: Json
          shop_id?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_categories_menu_id_fkey"
            columns: ["menu_id"]
            isOneToOne: false
            referencedRelation: "menus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_categories_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_item_variants: {
        Row: {
          created_at: string | null
          description: Json | null
          id: string
          menu_item_id: string
          name: Json
          price: number
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          description?: Json | null
          id?: string
          menu_item_id: string
          name: Json
          price: number
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          description?: Json | null
          id?: string
          menu_item_id?: string
          name?: Json
          price?: number
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_item_variants_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_items: {
        Row: {
          allergens: string[] | null
          category_id: string
          created_at: string | null
          description: Json | null
          dietary_info: Json | null
          discount_label: Json | null
          discount_price: number | null
          id: string
          is_available: boolean | null
          is_popular: boolean | null
          is_recommended: boolean | null
          is_todays_special: boolean | null
          name: Json
          photo_urls: string[] | null
          preparation_type: string | null
          price: number
          shop_id: string
          sort_order: number | null
          spice_level: number | null
          updated_at: string | null
        }
        Insert: {
          allergens?: string[] | null
          category_id: string
          created_at?: string | null
          description?: Json | null
          dietary_info?: Json | null
          discount_label?: Json | null
          discount_price?: number | null
          id?: string
          is_available?: boolean | null
          is_popular?: boolean | null
          is_recommended?: boolean | null
          is_todays_special?: boolean | null
          name: Json
          photo_urls?: string[] | null
          preparation_type?: string | null
          price: number
          shop_id: string
          sort_order?: number | null
          spice_level?: number | null
          updated_at?: string | null
        }
        Update: {
          allergens?: string[] | null
          category_id?: string
          created_at?: string | null
          description?: Json | null
          dietary_info?: Json | null
          discount_label?: Json | null
          discount_price?: number | null
          id?: string
          is_available?: boolean | null
          is_popular?: boolean | null
          is_recommended?: boolean | null
          is_todays_special?: boolean | null
          name?: Json
          photo_urls?: string[] | null
          preparation_type?: string | null
          price?: number
          shop_id?: string
          sort_order?: number | null
          spice_level?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "menu_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_items_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      menus: {
        Row: {
          active_date_range: Json | null
          active_days: string[] | null
          active_hours: Json | null
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          shop_id: string
          sort_order: number | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          active_date_range?: Json | null
          active_days?: string[] | null
          active_hours?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          shop_id: string
          sort_order?: number | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          active_date_range?: Json | null
          active_days?: string[] | null
          active_hours?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          shop_id?: string
          sort_order?: number | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menus_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          menu_item_id: string | null
          notes: string | null
          order_id: string
          quantity: number
          status: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          menu_item_id?: string | null
          notes?: string | null
          order_id: string
          quantity: number
          status?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          menu_item_id?: string | null
          notes?: string | null
          order_id?: string
          quantity?: number
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          session_id: string
          shop_id: string
          status: string | null
          table_id: string
          total_amount: number | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          session_id: string
          shop_id: string
          status?: string | null
          table_id: string
          total_amount?: number | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          session_id?: string
          shop_id?: string
          status?: string | null
          table_id?: string
          total_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "table_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "tables"
            referencedColumns: ["id"]
          },
        ]
      }
      shops: {
        Row: {
          address: Json | null
          bio_options: Json | null
          brand_color: string | null
          created_at: string | null
          email: string | null
          google_maps_url: string | null
          gurunavi_url: string | null
          hotpepper_url: string | null
          id: string
          instagram_url: string | null
          is_active: boolean | null
          languages: string[] | null
          line_url: string | null
          logo_url: string | null
          name: string
          operating_hours: Json | null
          owner_id: string
          phone: string | null
          qr_code_settings: Json | null
          qr_code_settings_table: Json | null
          settings: Json | null
          shop_type: string | null
          short_id: string | null
          slug: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_status: string | null
          subscription_tier: string | null
          tabelog_url: string | null
          theme_settings: Json | null
          trial_ends_at: string | null
          twitter_url: string | null
          updated_at: string | null
          website_url: string | null
          wifi_info: Json | null
        }
        Insert: {
          address?: Json | null
          bio_options?: Json | null
          brand_color?: string | null
          created_at?: string | null
          email?: string | null
          google_maps_url?: string | null
          gurunavi_url?: string | null
          hotpepper_url?: string | null
          id?: string
          instagram_url?: string | null
          is_active?: boolean | null
          languages?: string[] | null
          line_url?: string | null
          logo_url?: string | null
          name: string
          operating_hours?: Json | null
          owner_id: string
          phone?: string | null
          qr_code_settings?: Json | null
          qr_code_settings_table?: Json | null
          settings?: Json | null
          shop_type?: string | null
          short_id?: string | null
          slug: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          tabelog_url?: string | null
          theme_settings?: Json | null
          trial_ends_at?: string | null
          twitter_url?: string | null
          updated_at?: string | null
          website_url?: string | null
          wifi_info?: Json | null
        }
        Update: {
          address?: Json | null
          bio_options?: Json | null
          brand_color?: string | null
          created_at?: string | null
          email?: string | null
          google_maps_url?: string | null
          gurunavi_url?: string | null
          hotpepper_url?: string | null
          id?: string
          instagram_url?: string | null
          is_active?: boolean | null
          languages?: string[] | null
          line_url?: string | null
          logo_url?: string | null
          name?: string
          operating_hours?: Json | null
          owner_id?: string
          phone?: string | null
          qr_code_settings?: Json | null
          qr_code_settings_table?: Json | null
          settings?: Json | null
          shop_type?: string | null
          short_id?: string | null
          slug?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          tabelog_url?: string | null
          theme_settings?: Json | null
          trial_ends_at?: string | null
          twitter_url?: string | null
          updated_at?: string | null
          website_url?: string | null
          wifi_info?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "shops_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_accounts: {
        Row: {
          auth_user_id: string | null
          created_at: string | null
          display_name: string | null
          id: string
          is_active: boolean | null
          last_login_at: string | null
          login_qr_url: string | null
          notes: string | null
          password_hash: string | null
          role: string
          shop_id: string
          updated_at: string | null
          username: string
        }
        Insert: {
          auth_user_id?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          login_qr_url?: string | null
          notes?: string | null
          password_hash?: string | null
          role: string
          shop_id: string
          updated_at?: string | null
          username: string
        }
        Update: {
          auth_user_id?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          login_qr_url?: string | null
          notes?: string | null
          password_hash?: string | null
          role?: string
          shop_id?: string
          updated_at?: string | null
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_accounts_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      support_ticket_replies: {
        Row: {
          attachment_urls: string[] | null
          author_id: string | null
          author_type: string
          body: string
          created_at: string | null
          id: string
          ticket_id: string
        }
        Insert: {
          attachment_urls?: string[] | null
          author_id?: string | null
          author_type: string
          body: string
          created_at?: string | null
          id?: string
          ticket_id: string
        }
        Update: {
          attachment_urls?: string[] | null
          author_id?: string | null
          author_type?: string
          body?: string
          created_at?: string | null
          id?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_ticket_replies_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_ticket_replies_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          attachment_urls: string[] | null
          body: string
          created_at: string | null
          id: string
          issue_type: string
          status: string
          subject: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          attachment_urls?: string[] | null
          body: string
          created_at?: string | null
          id?: string
          issue_type: string
          status?: string
          subject: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          attachment_urls?: string[] | null
          body?: string
          created_at?: string | null
          id?: string
          issue_type?: string
          status?: string
          subject?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      table_sessions: {
        Row: {
          completed_at: string | null
          created_at: string | null
          customer_count: number | null
          fingerprint_hash: string | null
          id: string
          last_order_at: string | null
          shop_id: string
          started_at: string | null
          status: string | null
          table_id: string
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          customer_count?: number | null
          fingerprint_hash?: string | null
          id?: string
          last_order_at?: string | null
          shop_id: string
          started_at?: string | null
          status?: string | null
          table_id: string
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          customer_count?: number | null
          fingerprint_hash?: string | null
          id?: string
          last_order_at?: string | null
          shop_id?: string
          started_at?: string | null
          status?: string | null
          table_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "table_sessions_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "table_sessions_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "tables"
            referencedColumns: ["id"]
          },
        ]
      }
      tables: {
        Row: {
          capacity: number | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          qr_display_text: string | null
          shop_id: string
          short_id: string
          sort_order: number | null
          table_number: string
          updated_at: string | null
        }
        Insert: {
          capacity?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          qr_display_text?: string | null
          shop_id: string
          short_id: string
          sort_order?: number | null
          table_number: string
          updated_at?: string | null
        }
        Update: {
          capacity?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          qr_display_text?: string | null
          shop_id?: string
          short_id?: string
          sort_order?: number | null
          table_number?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tables_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          created_at: string | null
          first_name: string | null
          id: string
          last_name: string | null
          onboarding_completed: boolean | null
          phone: string | null
          preferred_language: string | null
          role: string | null
          selected_shop_id: string | null
          timezone: string | null
          tutorial_steps: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          onboarding_completed?: boolean | null
          phone?: string | null
          preferred_language?: string | null
          role?: string | null
          selected_shop_id?: string | null
          timezone?: string | null
          tutorial_steps?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          onboarding_completed?: boolean | null
          phone?: string | null
          preferred_language?: string | null
          role?: string | null
          selected_shop_id?: string | null
          timezone?: string | null
          tutorial_steps?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_selected_shop"
            columns: ["selected_shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      visits: {
        Row: {
          created_at: string
          id: string
          identifier: string
          path: string
          shop_id: string | null
          table_id: string | null
          utm_source: string | null
          visit_type: string
          visitor_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          identifier: string
          path: string
          shop_id?: string | null
          table_id?: string | null
          utm_source?: string | null
          visit_type: string
          visitor_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          identifier?: string
          path?: string
          shop_id?: string | null
          table_id?: string | null
          utm_source?: string | null
          visit_type?: string
          visitor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "visits_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "tables"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_order_total: { Args: { order_uuid: string }; Returns: number }
      check_rate_limit: {
        Args: { p_session_id: string; p_shop_id: string; p_table_id: string }
        Returns: boolean
      }
      get_or_create_session: {
        Args: {
          p_fingerprint_hash?: string
          p_shop_id: string
          p_table_id: string
        }
        Returns: string
      }
      is_staff_for_shop: { Args: { p_shop_id: string }; Returns: boolean }
      is_support_user: { Args: never; Returns: boolean }
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
    Enums: {},
  },
} as const
