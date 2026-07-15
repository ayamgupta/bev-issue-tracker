import { supabase } from './supabaseClient'
import type { ReportRow, ReportSubmission } from './types'
import type { CarModel } from '../data/carData'

export interface IssueFrequencyRow {
  car_model: CarModel
  variant: string
  issue: string
  severity: 'major' | 'minor'
  occurrences: number
}

export interface SoftwareVersionRow {
  car_model: CarModel
  software_version: string
  occurrences: number
}

export interface TyreBrandRow {
  car_model: CarModel
  tyre_brand: string
  odo_range: string
  odo_range_order: number
  occurrences: number
  avg_life_remaining_pct: number | null
}

export interface PublicNoteRow {
  id: string
  car_model: CarModel
  city: string
  notes: string
  created_at: string
  theme: string
}

export interface SatisfactionRow {
  car_model: CarModel
  avg_hardware: number
  avg_software: number
  avg_service: number
  avg_overall: number
  report_count: number
}

export interface AnalyticsSummary {
  total_reports: number
  verified_reports: number
  unique_submitters: number
  cities_represented: number
}

export async function fetchIssueFrequency(): Promise<IssueFrequencyRow[]> {
  const { data, error } = await supabase
    .from('analytics_issue_frequency')
    .select('*')
    .order('occurrences', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function fetchSatisfaction(): Promise<SatisfactionRow[]> {
  const { data, error } = await supabase.from('analytics_satisfaction').select('*')
  if (error) throw error
  return data ?? []
}

export async function fetchSummary(): Promise<AnalyticsSummary | null> {
  const { data, error } = await supabase.from('analytics_summary').select('*').single()
  if (error) throw error
  return data
}

export async function fetchSoftwareVersions(): Promise<SoftwareVersionRow[]> {
  const { data, error } = await supabase
    .from('analytics_software_versions')
    .select('*')
    .order('occurrences', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function fetchTyreBrands(): Promise<TyreBrandRow[]> {
  const { data, error } = await supabase
    .from('analytics_tyre_brands')
    .select('*')
    .order('occurrences', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function fetchPublicNotes(): Promise<PublicNoteRow[]> {
  const { data, error } = await supabase
    .from('analytics_public_notes')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function fetchRecentReports(limit = 20): Promise<ReportRow[]> {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data ?? []
}

/**
 * All writes go through the `submit-report` Edge Function — the browser
 * never has a key capable of inserting rows directly (see supabase/functions
 * /submit-report and supabase/migrations/0001_init.sql). Re-submitting with
 * a registration number that matches an earlier report updates that report
 * in place instead of creating a new one (see the function for details).
 */
export async function submitReport(payload: ReportSubmission): Promise<{ id: string; updated?: boolean; duplicate_suspected?: boolean }> {
  const { data, error } = await supabase.functions.invoke('submit-report', {
    body: payload,
  })
  if (error) throw error
  if (data?.error) throw new Error(data.error)
  return data
}
