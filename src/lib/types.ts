import type { CarModel } from '../data/carData'

export interface ReportRow {
  id: string
  created_at: string
  car_model: CarModel
  variant: string
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
  software_version: string | null
  status: 'pending' | 'verified' | 'flagged' | 'removed'
}

export interface ReportSubmission {
  reg_number?: string
  owner_name?: string
  contact_number?: string
  car_model: CarModel
  variant: string
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
  software_version?: string
  turnstile_token: string
}
