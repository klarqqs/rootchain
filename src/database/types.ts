/**
 * Supabase database schema types.
 *
 * Core relational schema: supabase/migrations/002_rootchain_core_schema.sql
 * Auth profiles (legacy UI): supabase/migrations/001_app_profiles.sql
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
          user_id: string;
          project_id: string;
          amount: number;
          transaction_hash: string | null;
          status: "pending" | "confirmed" | "failed";
          wallet_address: string | null;
          prepared_xdr: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["investments"]["Row"], "id" | "created_at">;
        Update: Partial<
          Omit<Database["public"]["Tables"]["investments"]["Row"], "id" | "user_id" | "created_at">
        >;
      };
      marketplace_transactions: {
        Row: {
          id: string;
          user_id: string;
          project_id: string;
          investment_id: string | null;
          amount: number;
          status: "pending" | "confirmed" | "failed";
          wallet_address: string | null;
          prepared_xdr: string | null;
          stellar_tx_hash: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["marketplace_transactions"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<
          Omit<
            Database["public"]["Tables"]["marketplace_transactions"]["Row"],
            "id" | "user_id" | "created_at"
          >
        >;
      };
      /** Stellar-ledger position snapshots (optional legacy table). */
      ledger_investments: {
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
        Insert: Omit<Database["public"]["Tables"]["ledger_investments"]["Row"], "id" | "opened_at">;
        Update: Partial<Database["public"]["Tables"]["ledger_investments"]["Insert"]>;
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
      /** Canonical profile — see supabase/migrations/002_rootchain_core_schema.sql */
      profiles: {
        Row: {
          id: string;
          user_id: string;
          role: "farmer" | "investor";
          wallet_address: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["profiles"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<
          Omit<Database["public"]["Tables"]["profiles"]["Row"], "id" | "user_id" | "created_at">
        >;
      };
      farmers: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          location: string;
          verification_status: "pending" | "verified";
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["farmers"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<
          Omit<Database["public"]["Tables"]["farmers"]["Row"], "id" | "user_id" | "created_at">
        >;
      };
      projects: {
        Row: {
          id: string;
          farmer_id: string;
          title: string;
          description: string;
          target_amount: number;
          raised_amount: number;
          start_date: string;
          end_date: string;
          status: "draft" | "active" | "funded" | "closed" | "cancelled";
          crop_type: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["projects"]["Row"],
          "id" | "raised_amount" | "created_at" | "updated_at"
        > & { raised_amount?: number };
        Update: Partial<
          Omit<Database["public"]["Tables"]["projects"]["Row"], "id" | "farmer_id" | "created_at">
        >;
      };
    };
  };
}

export type FarmerProfile = Database["public"]["Tables"]["farmer_profiles"]["Row"];
/** @deprecated Prefer `ProjectInvestment` — ledger positions stored in `ledger_investments`. */
export type Investment = Database["public"]["Tables"]["ledger_investments"]["Row"];
export type UserRow = Database["public"]["Tables"]["users"]["Row"];
export type TxMetadata = Database["public"]["Tables"]["transaction_metadata"]["Row"];
export type AppProfileRow = Database["public"]["Tables"]["app_profiles"]["Row"];
export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type FarmerRow = Database["public"]["Tables"]["farmers"]["Row"];
export type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];
export type ProjectInvestment = Database["public"]["Tables"]["investments"]["Row"];
export type MarketplaceTransactionRow = Database["public"]["Tables"]["marketplace_transactions"]["Row"];
export type LedgerInvestment = Database["public"]["Tables"]["ledger_investments"]["Row"];
