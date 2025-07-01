export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      client_requests: {
        Row: {
          assigned_technician_id: string | null
          city: string
          client_name: string
          client_phone: string
          created_at: string | null
          description: string | null
          id: string
          service_type: string
          status: Database["public"]["Enums"]["mission_status"] | null
          updated_at: string | null
          urgent: boolean | null
        }
        Insert: {
          assigned_technician_id?: string | null
          city: string
          client_name: string
          client_phone: string
          created_at?: string | null
          description?: string | null
          id?: string
          service_type: string
          status?: Database["public"]["Enums"]["mission_status"] | null
          updated_at?: string | null
          urgent?: boolean | null
        }
        Update: {
          assigned_technician_id?: string | null
          city?: string
          client_name?: string
          client_phone?: string
          created_at?: string | null
          description?: string | null
          id?: string
          service_type?: string
          status?: Database["public"]["Enums"]["mission_status"] | null
          updated_at?: string | null
          urgent?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "client_requests_assigned_technician_id_fkey"
            columns: ["assigned_technician_id"]
            isOneToOne: false
            referencedRelation: "technicians"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_automatic: boolean | null
          request_id: string | null
          sender_id: string | null
          sender_type: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_automatic?: boolean | null
          request_id?: string | null
          sender_id?: string | null
          sender_type: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_automatic?: boolean | null
          request_id?: string | null
          sender_id?: string | null
          sender_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "client_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          operator: Database["public"]["Enums"]["payment_operator"]
          phone_number: string
          receipt_url: string | null
          request_id: string | null
          screenshot_url: string | null
          status: Database["public"]["Enums"]["payment_status"] | null
          validated_at: string | null
          validated_by: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          operator: Database["public"]["Enums"]["payment_operator"]
          phone_number: string
          receipt_url?: string | null
          request_id?: string | null
          screenshot_url?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          validated_at?: string | null
          validated_by?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          operator?: Database["public"]["Enums"]["payment_operator"]
          phone_number?: string
          receipt_url?: string | null
          request_id?: string | null
          screenshot_url?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          validated_at?: string | null
          validated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "client_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          client_name: string | null
          comment: string | null
          created_at: string | null
          id: string
          rating: number | null
          request_id: string | null
          technician_id: string | null
        }
        Insert: {
          client_name?: string | null
          comment?: string | null
          created_at?: string | null
          id?: string
          rating?: number | null
          request_id?: string | null
          technician_id?: string | null
        }
        Update: {
          client_name?: string | null
          comment?: string | null
          created_at?: string | null
          id?: string
          rating?: number | null
          request_id?: string | null
          technician_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "client_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "technicians"
            referencedColumns: ["id"]
          },
        ]
      }
      technicians: {
        Row: {
          bio: string | null
          city: string
          contract_signed: boolean | null
          created_at: string | null
          id: string
          identity_document: string | null
          is_validated: boolean | null
          name: string
          phone: string
          profession: string
          profile_picture: string | null
          rating: number | null
          status: Database["public"]["Enums"]["technician_status"] | null
          total_missions: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          bio?: string | null
          city: string
          contract_signed?: boolean | null
          created_at?: string | null
          id?: string
          identity_document?: string | null
          is_validated?: boolean | null
          name: string
          phone: string
          profession: string
          profile_picture?: string | null
          rating?: number | null
          status?: Database["public"]["Enums"]["technician_status"] | null
          total_missions?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          bio?: string | null
          city?: string
          contract_signed?: boolean | null
          created_at?: string | null
          id?: string
          identity_document?: string | null
          is_validated?: boolean | null
          name?: string
          phone?: string
          profession?: string
          profile_picture?: string | null
          rating?: number | null
          status?: Database["public"]["Enums"]["technician_status"] | null
          total_missions?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          created_at: string | null
          first_name: string | null
          id: string
          is_online: boolean | null
          last_name: string | null
          last_seen: string | null
          phone: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          first_name?: string | null
          id: string
          is_online?: boolean | null
          last_name?: string | null
          last_seen?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          first_name?: string | null
          id?: string
          is_online?: boolean | null
          last_name?: string | null
          last_seen?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      mission_status:
        | "pending"
        | "assigned"
        | "in_progress"
        | "completed"
        | "cancelled"
      payment_operator: "orange_money" | "mtn_money"
      payment_status: "pending" | "validated" | "rejected"
      technician_status: "pending" | "validated" | "rejected" | "suspended"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      mission_status: [
        "pending",
        "assigned",
        "in_progress",
        "completed",
        "cancelled",
      ],
      payment_operator: ["orange_money", "mtn_money"],
      payment_status: ["pending", "validated", "rejected"],
      technician_status: ["pending", "validated", "rejected", "suspended"],
    },
  },
} as const
