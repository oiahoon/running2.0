// React hooks for data fetching
'use client';

import { useQuery } from '@tanstack/react-query';
import { ActivityFilters } from '@/lib/database/models/Activity';

// Hook for fetching activities
export function useActivities(
  filters: ActivityFilters = {},
  page = 1,
  limit = 20
) {
  return useQuery({
    queryKey: ['activities', filters, page, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      // Add pagination
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      
      // Add filters
      if (filters.type?.length) {
        params.append('type', filters.type.join(','));
      }
      if (filters.source?.length) {
        params.append('source', filters.source.join(','));
      }
      if (filters.startDate) {
        params.append('startDate', filters.startDate.toISOString());
      }
      if (filters.endDate) {
        params.append('endDate', filters.endDate.toISOString());
      }
      if (filters.minDistance) {
        params.append('minDistance', filters.minDistance.toString());
      }
      if (filters.maxDistance) {
        params.append('maxDistance', filters.maxDistance.toString());
      }
      if (filters.search) {
        params.append('search', filters.search);
      }
      
      const response = await fetch(`/api/activities?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch activities');
      }
      
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook for fetching activity statistics
export function useActivityStats(
  year?: number,
  month?: number,
  type?: string[]
) {
  return useQuery({
    queryKey: ['stats', year, month, type],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (year) {
        params.append('year', year.toString());
      }
      if (month) {
        params.append('month', month.toString());
      }
      if (type?.length) {
        params.append('type', type.join(','));
      }
      
      const response = await fetch(`/api/stats?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch statistics');
      }
      
      return response.json();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

// Hook for fetching recent activities
export function useRecentActivities(limit = 5) {
  return useQuery({
    queryKey: ['activities', 'recent', limit],
    queryFn: async () => {
      const response = await fetch(`/api/activities?limit=${limit}&page=1`);
      if (!response.ok) {
        throw new Error('Failed to fetch recent activities');
      }
      
      const data = await response.json();
      return data.activities;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}
