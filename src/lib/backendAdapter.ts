/**
 * Backend Adapter – Abstracts data access between Supabase and Express/SQLite API.
 *
 * Set VITE_BACKEND="sqlite" in .env (or at build time) to use the Express API.
 * Default: "supabase" (Lovable Cloud).
 */
import { supabase } from "@/integrations/supabase/client";

export type BackendType = "supabase" | "sqlite";

export function getBackendType(): BackendType {
  const val = (import.meta.env.VITE_BACKEND || "supabase") as string;
  return val === "sqlite" ? "sqlite" : "supabase";
}

const API_BASE = import.meta.env.VITE_API_URL || "/api";

// ===== Generic REST helpers for SQLite backend =====

async function apiFetch<T>(path: string, options?: RequestInit): Promise<{ data: T | null; error: any }> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    if (res.status === 204) return { data: null, error: null };
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      return { data: null, error: err };
    }
    const data = await res.json();
    return { data, error: null };
  } catch (e: any) {
    return { data: null, error: { message: e.message } };
  }
}

// ===== Opportunities =====

export async function fetchAllOpportunities() {
  if (getBackendType() === "sqlite") {
    return apiFetch<any[]>("/opportunities");
  }
  const { data, error } = await (supabase as any)
    .from("opportunities")
    .select("*")
    .order("created_at", { ascending: false });
  return { data: data ?? [], error };
}

export async function upsertOpportunityRow(row: Record<string, any>) {
  if (getBackendType() === "sqlite") {
    return apiFetch<any>(`/opportunities/${row.id}`, {
      method: "PUT",
      body: JSON.stringify(row),
    });
  }
  const { error } = await (supabase as any)
    .from("opportunities")
    .upsert(row, { onConflict: "id" });
  return { data: row, error };
}

export async function deleteOpportunityRow(id: string) {
  if (getBackendType() === "sqlite") {
    return apiFetch<null>(`/opportunities/${id}`, { method: "DELETE" });
  }
  const { error } = await (supabase as any)
    .from("opportunities")
    .delete()
    .eq("id", id);
  return { data: null, error };
}

// ===== AI Assessments =====

export async function fetchAiAssessments(opportunityId: string, basis?: string) {
  if (getBackendType() === "sqlite") {
    const params = new URLSearchParams({ opportunity_id: opportunityId });
    if (basis) params.set("basis", basis);
    return apiFetch<any[]>(`/ai-assessments?${params}`);
  }
  let q = (supabase as any)
    .from("ai_assessments")
    .select("*")
    .eq("opportunity_id", opportunityId);
  if (basis) q = q.eq("basis", basis);
  const { data, error } = await q.order("created_at", { ascending: false });
  return { data: data ?? [], error };
}

export async function upsertAiAssessment(row: Record<string, any>) {
  if (getBackendType() === "sqlite") {
    const id = row.id || crypto.randomUUID();
    return apiFetch<any>(`/ai-assessments/${id}`, {
      method: "PUT",
      body: JSON.stringify({ ...row, id }),
    });
  }
  const { error } = await (supabase as any)
    .from("ai_assessments")
    .upsert(row, { onConflict: "id" });
  return { data: row, error };
}

// ===== Opportunity Files =====

export async function fetchOpportunityFiles(opportunityId: string) {
  if (getBackendType() === "sqlite") {
    return apiFetch<any[]>(`/opportunity-files?opportunity_id=${opportunityId}`);
  }
  const { data, error } = await (supabase as any)
    .from("opportunity_files")
    .select("*")
    .eq("opportunity_id", opportunityId)
    .order("created_at", { ascending: false });
  return { data: data ?? [], error };
}

export async function uploadOpportunityFile(
  opportunityId: string,
  file: File,
  comment: string = ""
) {
  if (getBackendType() === "sqlite") {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("opportunity_id", opportunityId);
    formData.append("comment", comment);
    try {
      const res = await fetch(`${API_BASE}/opportunity-files`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) return { data: null, error: await res.json() };
      return { data: await res.json(), error: null };
    } catch (e: any) {
      return { data: null, error: { message: e.message } };
    }
  }
  // Supabase storage upload
  const filePath = `${opportunityId}/${crypto.randomUUID()}-${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from("opportunity-files")
    .upload(filePath, file);
  if (uploadError) return { data: null, error: uploadError };

  const { error } = await (supabase as any)
    .from("opportunity_files")
    .insert({
      opportunity_id: opportunityId,
      file_name: file.name,
      file_path: filePath,
      file_size: file.size,
      mime_type: file.type,
      comment,
    });
  return { data: { file_path: filePath }, error };
}

export async function deleteOpportunityFile(id: string) {
  if (getBackendType() === "sqlite") {
    return apiFetch<null>(`/opportunity-files/${id}`, { method: "DELETE" });
  }
  const { error } = await (supabase as any)
    .from("opportunity_files")
    .delete()
    .eq("id", id);
  return { data: null, error };
}

export function getFileUrl(filePath: string): string {
  if (getBackendType() === "sqlite") {
    return `${API_BASE}/uploads/${filePath}`;
  }
  const { data } = supabase.storage.from("opportunity-files").getPublicUrl(filePath);
  return data.publicUrl;
}
