import { supabase } from './supabaseClient'
import type { ReportRow, ReportSubmission } from './types'
import type { CarModel } from '../data/carData'

export interface IssueFrequencyRow {
  car_model: CarModel
  issue: string
  severity: 'major' | 'minor'
  occurrences: number
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
 * /submit-report and supabase/migrations/0001_init.sql).
 */
export async function submitReport(payload: ReportSubmission): Promise<{ id: string; duplicate_suspected: boolean }> {
  const { data, error } = await supabase.functions.invoke('submit-report', {
    body: payload,
  })
  if (error) throw error
  if (data?.error) throw new Error(data.error)
  return data
}
