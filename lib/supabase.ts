import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types für unsere Database
export type Task = {
  id: string
  creator_wallet: string
  token_mint: string
  token_amount: number
  token_symbol?: string
  token_decimals: number
  task_title: string
  task_description?: string
  submission_link?: string
  deadline: string
  status: 'active' | 'ended' | 'paid'
  winner_wallet?: string
  escrow_signature?: string
  created_at: string
  updated_at: string
}

export type TaskSubmission = {
  id: string
  task_id: string
  applicant_wallet: string
  twitter_profile: string
  submission_proof?: string
  status: string
  created_at: string
  updated_at: string
}