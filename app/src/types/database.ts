// app/src/types/database.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      campaigns: {
        Row: {
          id: number;
          name: string;
          status: string;
          status_color: string;
          user_id: number | null;
          created_date: string;
          delivery_date: string;
          prospects_generated: number | null;
          target_volume: number;
          amount: number;
          form_questions: Json | null;
          prospect_files: Json | null;
          internal_status: string | null;
          sector: string | null;
          zone: string | null;
          admin_notes: string | null;
        };
        Insert: {
          id?: number;
          name: string;
          status: string;
          status_color: string;
          user_id?: number | null;
          created_date?: string;
          delivery_date: string;
          prospects_generated?: number | null;
          target_volume: number;
          amount: number;
          form_questions?: Json | null;
          prospect_files?: Json | null;
          internal_status?: string | null;
          sector?: string | null;
          zone?: string | null;
          admin_notes?: string | null;
        };
        Update: {
          id?: number;
          name?: string;
          status?: string;
          status_color?: string;
          user_id?: number | null;
          created_date?: string;
          delivery_date?: string;
          prospects_generated?: number | null;
          target_volume?: number;
          amount?: number;
          form_questions?: Json | null;
          prospect_files?: Json | null;
          internal_status?: string | null;
          sector?: string | null;
          zone?: string | null;
          admin_notes?: string | null;
        };
        Relationships: [];
      };
      user: {
        Row: {
          id: number;
          created_at: string;
          'Mot de passe': number | null;
          'Nom complet': string | null;
          'Email professionnel': string | null;
          Entreprise: string | null;
        };
        Insert: {
          id?: number;
          created_at?: string;
          'Mot de passe'?: number | null;
          'Nom complet'?: string | null;
          'Email professionnel'?: string | null;
          Entreprise?: string | null;
        };
        Update: {
          id?: number;
          created_at?: string;
          'Mot de passe'?: number | null;
          'Nom complet'?: string | null;
          'Email professionnel'?: string | null;
          Entreprise?: string | null;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

// Extraits génériques pour faciliter le typage
type DefaultSchema = Database['public'];

export type Tables<TableName extends keyof DefaultSchema['Tables']> =
  DefaultSchema['Tables'][TableName]['Row'];

export type TablesInsert<TableName extends keyof DefaultSchema['Tables']> =
  DefaultSchema['Tables'][TableName]['Insert'];

export type TablesUpdate<TableName extends keyof DefaultSchema['Tables']> =
  DefaultSchema['Tables'][TableName]['Update'];

export type Enums<EnumName extends keyof DefaultSchema['Enums']> =
  DefaultSchema['Enums'][EnumName];
