import type { BatteryPack, CarModel } from '../data/carData'

export interface ReportRow {
  id: string
  created_at: string
  car_model: CarModel
  variant: string
  battery_pack: BatteryPack | null
  purchase_year: number
  odo_km: number
  city: string
  service_center: string | null
  major_issues: string[]
  minor_issues: string[]
  hardware_rating: number
  software_rating: number
  service_rating: number
  overall_rating: number
  notes: string | null
  notes_public_opt_in: boolean
  software_version: string | null
  tyre_brand: string | null
  tyre_life_remaining_pct: number | null
  status: 'pending' | 'verified' | 'flagged' | 'removed'
}

export interface ReportSubmission {
  reg_number?: string
  owner_name?: string
  contact_number?: string
  car_model: CarModel
  variant: string
  battery_pack?: BatteryPack
  purchase_year: number
  odo_km: number
  city: string
  service_center?: string
  major_issues: string[]
  minor_issues: string[]
  hardware_rating: number
  software_rating: number
  service_rating: number
  overall_rating: number
  notes?: string
  notes_public_opt_in?: boolean
  software_version?: string
  tyre_brand?: string
  tyre_life_remaining_pct?: number
  turnstile_token: string
}

export interface CommunityTipRow {
  id: string
  created_at: string
  car_model: CarModel | null
  issue: string
  fix: string
}

export interface CommunityTipSubmission {
  car_model?: CarModel
  issue: string
  fix: string
  turnstile_token: string
}
