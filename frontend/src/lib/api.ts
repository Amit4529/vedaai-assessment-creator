import { Assignment, CreateAssignmentPayload, ApiResponse } from './types';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/$/, '');

async function request<T>(path: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Request failed', errors: data.errors };
    }
    return data;
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error' };
  }
}

export async function fetchAssignments(search?: string): Promise<ApiResponse<Assignment[]>> {
  const query = search ? `?search=${encodeURIComponent(search)}` : '';
  return request<Assignment[]>(`/api/assignments${query}`);
}

export async function fetchAssignment(id: string): Promise<ApiResponse<Assignment>> {
  return request<Assignment>(`/api/assignments/${id}`);
}

export async function createAssignment(data: CreateAssignmentPayload): Promise<ApiResponse<Assignment>> {
  return request<Assignment>('/api/assignments', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deleteAssignment(id: string): Promise<ApiResponse<{ message: string }>> {
  return request<{ message: string }>(`/api/assignments/${id}`, { method: 'DELETE' });
}

export async function regenerateAssignment(id: string): Promise<ApiResponse<Assignment>> {
  return request<Assignment>(`/api/assignments/${id}/regenerate`, { method: 'POST' });
}
