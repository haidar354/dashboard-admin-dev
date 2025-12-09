export interface DashboardData {
  current_principal_event: PrincipalEvent | null
  incoming_letter_count: number
  outgoing_letter_count: number
  event_count: number
  guest_visit_count: number
  event: number[]
  guest: number[]
  incoming_letter: IncomingLetterStats
  outgoing_letter: OutgoingLetterStats
}

export interface PrincipalEvent {
  id: string
  school_id: string
  title: string
  description: string | null
  location: string
  start_at: string // ISO datetime format: "2025-05-28 10:00:00"
  end_at: string // ISO datetime format: "2025-05-29 15:00:00"
  type: string
  created_by_id: string
  updated_by_id: string
  created_at: string // ISO datetime with timezone
  updated_at: string
  start_date: string // "YYYY-MM-DD"
  end_date: string // "YYYY-MM-DD"
  start_time: string // "HH:mm"
  end_time: string // "HH:mm"
}

export interface IncomingLetterStats {
  total: number
  accumulation: number[] // Length: 12 (monthly)
  new_count: number
  processed_count: number
  finished_count: number
}

export interface OutgoingLetterStats {
  total: number
  accumulation: number[] // Length: 12 (monthly)
  draf_count: number
  pending_count: number
  rejected_count: number
  approved_count: number
}
