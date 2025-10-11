import { getUserToken } from './storage';

const API_URL = 'http://localhost:80/hazardTrackV2';

export interface Assignment {
  id: number;
  report_id: number;
  team_type: 'fire_team' | 'rescue_team' | 'inspection_team';
  assignment_status: 'assigned' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'emergency';
  notes?: string;
  assigned_at: string;
  updated_at: string;
  report: {
    title: string;
    description: string;
    category_name: string;
    status: string;
    latitude?: number;
    longitude?: number;
    created_at: string;
  };
  reporter: {
    name: string;
    phone?: string;
    email?: string;
  };
  assigned_by: string;
}

export interface AssignmentStatistics {
  total_assignments: number;
  pending_acceptance: number;
  accepted: number;
  in_progress: number;
  completed: number;
  emergency_count: number;
  high_priority_count: number;
}

export interface AssignmentResult {
  success: boolean;
  data?: Assignment | Assignment[];
  statistics?: AssignmentStatistics;
  error?: string;
}

// Get all assignments for current BFP personnel
export const apiGetInspectorAssignments = async (): Promise<AssignmentResult> => {
  try {
    const token = await getUserToken();
    if (!token) {
      return {
        success: false,
        error: 'Authentication required'
      };
    }

    const response = await fetch(`${API_URL}/api/get_inspector_assignments.php`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const result = await response.json();
      if (result.status === 'success') {
        return {
          success: true,
          data: result.assignments,
          statistics: result.statistics
        };
      } else {
        return {
          success: false,
          error: result.message || 'Failed to fetch assignments'
        };
      }
    } else {
      return {
        success: false,
        error: 'Server error'
      };
    }

  } catch (error) {
    console.error('Error fetching assignments:', error);
    return {
      success: false,
      error: 'Network error'
    };
  }
};

// Assign a report to a team
export const apiAssignInspector = async (
  reportId: number,
  teamType: 'fire_team' | 'rescue_team' | 'inspection_team',
  priority: 'low' | 'medium' | 'high' | 'emergency' = 'medium',
  notes?: string
): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    const token = await getUserToken();
    if (!token) {
      return {
        success: false,
        error: 'Authentication required'
      };
    }

    const response = await fetch(`${API_URL}/api/assign_inspector.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        report_id: reportId,
        team_type: teamType,
        priority,
        notes
      })
    });

    if (response.ok) {
      const result = await response.json();
      if (result.status === 'success') {
        return {
          success: true,
          data: result.assignment
        };
      } else {
        return {
          success: false,
          error: result.message || 'Failed to assign report'
        };
      }
    } else {
      return {
        success: false,
        error: 'Server error'
      };
    }

  } catch (error) {
    console.error('Error assigning inspector:', error);
    return {
      success: false,
      error: 'Network error'
    };
  }
};

// Update assignment status
export const apiUpdateAssignmentStatus = async (
  assignmentId: number,
  status: 'assigned' | 'accepted' | 'in_progress' | 'completed' | 'cancelled',
  notes?: string
): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    const token = await getUserToken();
    if (!token) {
      return {
        success: false,
        error: 'Authentication required'
      };
    }

    const response = await fetch(`${API_URL}/api/update_assignment_status.php`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        assignment_id: assignmentId,
        status,
        notes
      })
    });

    if (response.ok) {
      const result = await response.json();
      if (result.status === 'success') {
        return {
          success: true,
          data: result.assignment
        };
      } else {
        return {
          success: false,
          error: result.message || 'Failed to update assignment status'
        };
      }
    } else {
      return {
        success: false,
        error: 'Server error'
      };
    }

  } catch (error) {
    console.error('Error updating assignment status:', error);
    return {
      success: false,
      error: 'Network error'
    };
  }
};

// Get assignment statistics
export const apiGetAssignmentStats = async (): Promise<{ success: boolean; data?: AssignmentStatistics; error?: string }> => {
  try {
    const token = await getUserToken();
    if (!token) {
      return {
        success: false,
        error: 'Authentication required'
      };
    }

    const response = await fetch(`${API_URL}/api/get_inspector_assignments.php`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const result = await response.json();
      if (result.status === 'success') {
        return {
          success: true,
          data: result.statistics
        };
      } else {
        return {
          success: false,
          error: result.message || 'Failed to fetch statistics'
        };
      }
    } else {
      return {
        success: false,
        error: 'Server error'
      };
    }

  } catch (error) {
    console.error('Error fetching assignment statistics:', error);
    return {
      success: false,
      error: 'Network error'
    };
  }
};
