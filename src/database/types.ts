/**
 * Supabase database schema types.
 *
 * These mirror the SQL tables created in your Supabase project.
 * Run the migration at the bottom of this file to create the tables.
 *
 * ─── SQL migration (run in Supabase SQL editor) ───────────────────────────────
 *
 * create table if not exists users (
 *   id           uuid primary key default gen_random_uuid(),
 *   stellar_address text unique not null,
 *   display_name text,
 *   avatar_color text,
 *   created_at   timestamptz default now()
 * );
 *
 * create table if not exists farmer_profiles (
 *   id           uuid primary key default gen_random_uuid(),
 *   name         text not null,
 *   handle       text unique not null,
 *   farm_name    text not null,
 *   location     text not null,
 *   region       text not null,
 *   bio          text,
 *   stellar_address text,
 *   verified     boolean default false,
 *   total_harvests integer default 0,
 *   total_funded  numeric default 0,
 *   active_listings integer default 0,
 *   specialties  text[],
 *   join_year    integer,
 *   avatar_color text,
 *   verification_tier text default 'community',
 *   harvest_success_rate numeric default 84,
 *   location_verified boolean default false,
 *   reputation_score numeric default 70,
 *   seasons_active numeric default 4,
 *   created_at   timestamptz default now()
 * );
 *
 * create table if not exists investments (
 *   id              uuid primary key default gen_random_uuid(),
 *   stellar_address text not null,
 *   stellar_tx_hash text unique,
 *   produce_id      text not null,
 *   produce_name    text not null,
 *   amount_usdc     numeric not null,
 *   amount_xlm      numeric,
 *   shares          numeric not null,
 *   expected_roi    numeric not null,
 *   risk_level      text not null,
 *   status          text default 'active',
 *   growth          integer default 0,
 *   opened_at       timestamptz default now(),
 *   closed_at       timestamptz,
 *   realized_roi    numeric
 * );
 *
 * create table if not exists transaction_metadata (
 *   id           uuid primary key default gen_random_uuid(),
 *   stellar_address text not null,
 *   stellar_tx_hash text unique not null,
 *   kind         text not null,
 *   amount_usdc  numeric,
 *   produce_id   text,
 *   memo         text,
 *   created_at   timestamptz default now()
 * );
 *
 * -- Row-level security (enable in Supabase dashboard → Authentication → Policies)
 * alter table users enable row level security;
 * alter table investments enable row level security;
 * alter table transaction_metadata enable row level security;
 *
 * create policy "Users can read own data" on users for select
 *   using (stellar_address = current_setting('request.jwt.claims', true)::json->>'sub');
 * ─────────────────────────────────────────────────────────────────────────────
 */

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          stellar_address: string;
          display_name: string | null;
          avatar_color: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["users"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["users"]["Insert"]>;
      };
      farmer_profiles: {
        Row: {
          id: string;
          name: string;
          handle: string;
          farm_name: string;
          location: string;
          region: string;
          bio: string | null;
          stellar_address: string | null;
          verified: boolean;
          total_harvests: number;
          total_funded: number;
          active_listings: number;
          specialties: string[] | null;
          join_year: number | null;
          avatar_color: string | null;
          verification_tier: string | null;
          harvest_success_rate: number | null;
          location_verified: boolean | null;
          reputation_score: number | null;
          seasons_active: number | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["farmer_profiles"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["farmer_profiles"]["Insert"]>;
      };
      investments: {
        Row: {
          id: string;
          stellar_address: string;
          stellar_tx_hash: string | null;
          produce_id: string;
          produce_name: string;
          amount_usdc: number;
          amount_xlm: number | null;
          shares: number;
          expected_roi: number;
          risk_level: string;
          status: string;
          growth: number;
          opened_at: string;
          closed_at: string | null;
          realized_roi: number | null;
        };
        Insert: Omit<Database["public"]["Tables"]["investments"]["Row"], "id" | "opened_at">;
        Update: Partial<Database["public"]["Tables"]["investments"]["Insert"]>;
      };
      transaction_metadata: {
        Row: {
          id: string;
          stellar_address: string;
          stellar_tx_hash: string;
          kind: string;
          amount_usdc: number | null;
          produce_id: string | null;
          memo: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["transaction_metadata"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["transaction_metadata"]["Insert"]>;
      };
      app_profiles: {
        Row: {
          id: string;
          role: "investor" | "farmer" | "admin";
          full_name: string;
          avatar_url: string | null;
          wallet_public_key: string | null;
          farmer_verification_status: "pending" | "submitted" | "verified" | "rejected";
          onboarding_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["app_profiles"]["Row"],
          "created_at" | "updated_at"
        >;
        Update: Partial<Omit<Database["public"]["Tables"]["app_profiles"]["Row"], "id" | "created_at">>;
      };
    };
  };
}

export type FarmerProfile = Database["public"]["Tables"]["farmer_profiles"]["Row"];
export type Investment = Database["public"]["Tables"]["investments"]["Row"];
export type UserRow = Database["public"]["Tables"]["users"]["Row"];
export type TxMetadata = Database["public"]["Tables"]["transaction_metadata"]["Row"];
export type AppProfileRow = Database["public"]["Tables"]["app_profiles"]["Row"];
