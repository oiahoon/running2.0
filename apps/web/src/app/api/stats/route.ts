// Statistics API routes for Running Page 2.0
import { NextRequest, NextResponse } from 'next/server';
import { activityRepository } from '@/lib/database/repositories/ActivityRepository';
import { ActivityFilters } from '@/lib/database/models/Activity';

// GET /api/stats - Get activity statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : undefined;
    const month = searchParams.get('month') ? parseInt(searchParams.get('month')!) : undefined;
    const type = searchParams.get('type')?.split(',');
    
    // Build filters
    const filters: ActivityFilters = {};
    
    if (year) {
      filters.startDate = new Date(year, month ? month - 1 : 0, 1);
      filters.endDate = month 
        ? new Date(year, month, 0, 23, 59, 59) // Last day of month
        : new Date(year, 11, 31, 23, 59, 59); // Last day of year
    }
    
    if (type?.length) {
      filters.type = type as any;
    }
    
    // Get summary statistics
    const summary = await activityRepository.getActivitySummary(filters);
    
    // Get comparison data (previous period)
    let comparison = null;
    if (year) {
      const prevFilters: ActivityFilters = {
        ...filters,
        startDate: month 
          ? new Date(year, month - 2, 1) // Previous month
          : new Date(year - 1, 0, 1), // Previous year
        endDate: month
          ? new Date(year, month - 1, 0, 23, 59, 59) // Last day of previous month
          : new Date(year - 1, 11, 31, 23, 59, 59), // Last day of previous year
      };
      
      const prevSummary = await activityRepository.getActivitySummary(prevFilters);
      
      comparison = {
        previousPeriod: prevSummary,
        percentageChange: {
          distance: prevSummary.totalDistance > 0 
            ? ((summary.totalDistance - prevSummary.totalDistance) / prevSummary.totalDistance) * 100 
            : 0,
          time: prevSummary.totalTime > 0 
            ? ((summary.totalTime - prevSummary.totalTime) / prevSummary.totalTime) * 100 
            : 0,
          activities: prevSummary.totalActivities > 0 
            ? ((summary.totalActivities - prevSummary.totalActivities) / prevSummary.totalActivities) * 100 
            : 0,
        },
      };
    }
    
    // Get monthly data for charts
    const monthlyData = await activityRepository.getMonthlyData(year);
    
    // Get activity types distribution
    const activityTypes = await activityRepository.getActivityTypesDistribution();
    
    return NextResponse.json({
      period: {
        start: filters.startDate?.toISOString(),
        end: filters.endDate?.toISOString(),
        label: year 
          ? (month ? `${year}-${month.toString().padStart(2, '0')}` : year.toString())
          : 'All Time',
      },
      summary,
      comparison,
      monthlyData,
      activityTypes,
    });
    
  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
