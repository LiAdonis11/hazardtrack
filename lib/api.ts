

import { API_URL } from './config'
import { Platform } from 'react-native'

// Debug: Log the API URL being used
console.log('Platform:', Platform.OS)
console.log('API_URL:', API_URL)

// Enhanced error handling and debugging
const handleApiError = (error: any, endpoint: string) => {
  console.error(`API Error in ${endpoint}:`, error)
  
  if (error instanceof TypeError && error.message.includes('Network')) {
    return {
      status: 'error',
      message: 'Network error. Please check your connection and try again.'
    }
  }
  
  return {
    status: 'error',
    message: error.message || 'Something went wrong. Please try again.'
  }
}

export const apiRegister = async (data: {
  fullname: string,
  email: string,
  phone: string,
  password: string,
  address?: string
}) => {
  try {
    const registerData = { ...data, role: 'resident' };
    console.log('Registering with:', { ...registerData, password: '***' })
    console.log('API URL:', `${API_URL}/register.php`)

    const res = await fetch(`${API_URL}/register.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(registerData),
    })
    
    console.log('Register response status:', res.status)
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`)
    }
    
    const responseData = await res.json()
    console.log('Register response:', responseData)
    return responseData
    
  } catch (error) {
    return handleApiError(error, 'register')
  }
}

export const apiLogin = async (data: { email: string, password: string }) => {
  try {
    console.log('Logging in with:', { email: data.email, password: '***' })

    const res = await fetch(`${API_URL}/login.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        email: data.email,
        password: data.password
      }),
    })

    console.log('Login response status:', res.status)

    const responseData = await res.json()
    console.log('Login response:', responseData)

    if (!res.ok) {
      // Return the API error message instead of throwing
      return responseData
    }

    return responseData

  } catch (error) {
    return handleApiError(error, 'login')
  }
}



export const apiGetCategories = async () => {
  try {
    console.log('Fetching categories from:', `${API_URL}/get_categories.php`)
    
    const res = await fetch(`${API_URL}/get_categories.php`)
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`)
    }
    
    return await res.json()
  } catch (error) {
    return handleApiError(error, 'getCategories')
  }
}

export const apiSubmitReport = async (data: {
  token: string,
  category_id: number,
  title: string,
  description: string,
  image: string | null, // base64 string
  is_unsure?: boolean,
  location_address?: string,
  latitude?: number,
  longitude?: number,
  phone?: string
}) => {
  try {
    console.log('Submitting report:', {
      token: data.token ? '***' : 'missing',
      category_id: data.category_id,
      title: data.title,
      hasImage: !!data.image
    })

    const requestData = {
      token: data.token,
      category_id: data.category_id,
      title: data.title,
      description: data.description,
      image: data.image, // base64 string
      is_unsure: data.is_unsure,
      location_address: data.location_address,
      latitude: data.latitude,
      longitude: data.longitude,
      phone: data.phone
    }

    const res = await fetch(`${API_URL}/report_hazard.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${data.token}`
      },
      body: JSON.stringify(requestData),
    })

    if (!res.ok) {
      const errorText = await res.text()
      console.error('submitReport error response:', errorText)
      throw new Error(`HTTP error! status: ${res.status}`)
    }

    return await res.json()
  } catch (error) {
    return handleApiError(error, 'submitReport')
  }
}
export const apiGetReports = async (token: string) => {
  try {
    console.log('Fetching reports with token:', token ? '***' : 'missing')
    console.log('API URL for getReports:', `${API_URL}/get_reports.php`)

    const res = await fetch(`${API_URL}/get_reports.php`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    })

    console.log('getReports response status:', res.status)

    if (res.status === 401) {
      // Token expired or invalid - clear stored token and return auth error
      const { removeUserToken, removeUserData } = await import('./storage')
      await removeUserToken()
      await removeUserData()
      return {
        status: 'error',
        message: 'Session expired. Please login again.',
        auth_required: true
      }
    }

    if (!res.ok) {
      const errorText = await res.text()
      console.error('getReports error response:', errorText)
      throw new Error(`HTTP error! status: ${res.status}`)
    }

    const responseData = await res.json()
    console.log('getReports response:', responseData)
    return responseData
  } catch (error) {
    return handleApiError(error, 'getReports')
  }
}

export const apiGetAllReports = async (token: string, params?: any) => {
  try {
    console.log('Fetching all reports with token:', token ? '***' : 'missing')
    const query = new URLSearchParams(params).toString();
    const url = query ? `${API_URL}/get_all_reports.php?${query}` : `${API_URL}/get_all_reports.php`;
    console.log('API URL for getAllReports:', url)

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })

    console.log('getAllReports response status:', res.status)

    if (res.status === 401) {
      // Token expired or invalid - clear stored token and return auth error
      const { removeUserToken, removeUserData } = await import('./storage')
      await removeUserToken()
      await removeUserData()
      return {
        status: 'error',
        message: 'Session expired. Please login again.',
        auth_required: true
      }
    }

    if (!res.ok) {
      const errorText = await res.text()
      console.error('getAllReports error response:', errorText)
      throw new Error(`HTTP error! status: ${res.status}`)
    }

    const responseData = await res.json()
    console.log('getAllReports response:', responseData)
    return responseData
  } catch (error) {
    return handleApiError(error, 'getAllReports')
  }
}

export const apiGetUsers = async (token: string, role: string) => {
  try {
    console.log(`Fetching users with role: ${role}`)

    const res = await fetch(`${API_URL}/get_users.php?role=${role}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    })

    console.log('getUsers response status:', res.status)

    if (res.status === 401) {
      const { removeUserToken, removeUserData } = await import('./storage')
      await removeUserToken()
      await removeUserData()
      return {
        status: 'error',
        message: 'Session expired. Please login again.',
        auth_required: true
      }
    }

    if (!res.ok) {
      const errorText = await res.text()
      console.error('getUsers error response:', errorText)
      throw new Error(`HTTP error! status: ${res.status}`)
    }

    const responseData = await res.json()
    console.log('getUsers response:', responseData)
    return responseData
  } catch (error) {
    return handleApiError(error, 'getUsers')
  }
}

export const apiGetDashboardStats = async (token: string) => {
  try {
    console.log('Fetching dashboard stats with token:', token ? '***' : 'missing')
    console.log('API URL for getDashboardStats:', `${API_URL}/get_dashboard_stats.php`)

    const res = await fetch(`${API_URL}/get_dashboard_stats.php`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    })

    console.log('getDashboardStats response status:', res.status)

    if (res.status === 401) {
      // Token expired or invalid - clear stored token and return auth error
      const { removeUserToken, removeUserData } = await import('./storage')
      await removeUserToken()
      await removeUserData()
      return {
        status: 'error',
        message: 'Session expired. Please login again.',
        auth_required: true
      }
    }

    if (!res.ok) {
      const errorText = await res.text()
      console.error('getDashboardStats error response:', errorText)
      throw new Error(`HTTP error! status: ${res.status}`)
    }

    const responseData = await res.json()
    console.log('getDashboardStats response:', responseData)
    return responseData
  } catch (error) {
    return handleApiError(error, 'getDashboardStats')
  }
}

// Utility function to test API connectivity
export const testApiConnection = async () => {
  try {
    const res = await fetch(`${API_URL}/test.php`)
    const data = await res.json()
    console.log('API connection test:', data)
    return data
  } catch (error) {
    console.error('API connection failed:', error)
    return { status: 'error', message: 'Cannot connect to API' }
  }
}

export const getPhotoNotes = async (reportId: number, token: string) => {
  try {
    console.log('Fetching photo notes for report:', reportId)
    console.log('API URL:', `${API_URL}/get_photo_notes.php?report_id=${reportId}`)

    const res = await fetch(`${API_URL}/get_photo_notes.php?report_id=${reportId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })

    console.log('getPhotoNotes response status:', res.status)

    if (res.status === 401) {
      // Token expired or invalid - clear stored token and return auth error
      const { removeUserToken, removeUserData } = await import('./storage')
      await removeUserToken()
      await removeUserData()
      return {
        status: 'error',
        message: 'Session expired. Please login again.',
        auth_required: true
      }
    }

    if (!res.ok) {
      const errorText = await res.text()
      console.error('getPhotoNotes error response:', errorText)
      throw new Error(`HTTP error! status: ${res.status}`)
    }

    const responseData = await res.json()
    console.log('getPhotoNotes response:', responseData)
    return responseData
  } catch (error) {
    return handleApiError(error, 'getPhotoNotes')
  }
}

// BFP Mobile App API Functions

export const apiUpdateReportStatus = async (data: {
  token: string,
  report_id: number,
  status: string,
  admin_notes?: string
}) => {
  try {
    console.log('Updating report status:', { report_id: data.report_id, status: data.status })

    const res = await fetch(`${API_URL}/update_report_status.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${data.token}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        report_id: data.report_id,
        status: data.status,
        admin_notes: data.admin_notes || ''
      }),
    })

    console.log('updateReportStatus response status:', res.status)

    if (res.status === 401) {
      const { removeUserToken, removeUserData } = await import('./storage')
      await removeUserToken()
      await removeUserData()
      return {
        status: 'error',
        message: 'Session expired. Please login again.',
        auth_required: true
      }
    }

    if (!res.ok) {
      const errorText = await res.text()
      console.error('updateReportStatus error response:', errorText)
      throw new Error(`HTTP error! status: ${res.status}`)
    }

    const responseData = await res.json()
    console.log('updateReportStatus response:', responseData)
    return responseData
  } catch (error) {
    return handleApiError(error, 'updateReportStatus')
  }
}

export const apiUpdateReportDetails = async (data: {
  token: string,
  report_id: number,
  status?: string,
  admin_notes?: string
}) => {
  try {
    console.log('Updating report details:', { report_id: data.report_id, status: data.status })

    // Build request body with only defined and non-empty fields
    const requestBody: any = {
      report_id: data.report_id
    }
    if (data.status !== undefined && data.status !== null) {
      requestBody.status = data.status
    }
    if (data.admin_notes !== undefined && data.admin_notes !== null && data.admin_notes.trim() !== '') {
      requestBody.admin_notes = data.admin_notes
    }

    // If no fields to update, return success without calling API
    if (Object.keys(requestBody).length === 1) {
      console.log('No fields to update, skipping API call')
      return {
        status: 'success',
        message: 'No changes to update'
      }
    }

    const res = await fetch(`${API_URL}/update_report_details.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${data.token}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestBody),
    })

    console.log('updateReportDetails response status:', res.status)

    if (res.status === 401) {
      const { removeUserToken, removeUserData } = await import('./storage')
      await removeUserToken()
      await removeUserData()
      return {
        status: 'error',
        message: 'Session expired. Please login again.',
        auth_required: true
      }
    }

    if (!res.ok) {
      const errorText = await res.text()
      console.error('updateReportDetails error response:', errorText)

      // If 404 with "no changes made" message, treat as success
      if (res.status === 404) {
        try {
          const errorData = JSON.parse(errorText)
          if (errorData.message === "Report not found or no changes made") {
            console.log('No changes made, treating as success')
            return {
              status: 'success',
              message: 'No changes to update'
            }
          }
        } catch (e) {
          // Not JSON, continue with error
        }
      }

      throw new Error(`HTTP error! status: ${res.status}`)
    }

    const responseData = await res.json()
    console.log('updateReportDetails response:', responseData)
    return responseData
  } catch (error) {
    return handleApiError(error, 'updateReportDetails')
  }
}

export const apiUpdateReportPriority = async (data: {
  token: string,
  report_id: number,
  priority: 'low' | 'medium' | 'high' | 'emergency'
}) => {
  try {
    console.log('Updating report priority:', { report_id: data.report_id, priority: data.priority });

    const res = await fetch(`${API_URL}/update_report_priority.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${data.token}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        report_id: data.report_id,
        priority: data.priority,
      }),
    });

    console.log('updateReportPriority response status:', res.status);

    if (res.status === 401) {
      const { removeUserToken, removeUserData } = await import('./storage');
      await removeUserToken();
      await removeUserData();
      return {
        status: 'error',
        message: 'Session expired. Please login again.',
        auth_required: true
      };
    }

    if (!res.ok) {
      const errorText = await res.text();
      console.error('updateReportPriority error response:', errorText);
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    return handleApiError(error, 'updateReportPriority');
  }
};

export const apiAssignInspector = async (data: {
  token: string,
  report_id: number,
  inspector_id: number,
  team_type: 'fire_team' | 'rescue_team' | 'inspection_team',
  priority?: 'low' | 'medium' | 'high' | 'emergency',
  notes?: string
}) => {
  try {
    console.log('Assigning inspector:', { report_id: data.report_id, team_type: data.team_type, inspector_id: data.inspector_id })

    const res = await fetch(`${API_URL}/assign_inspector.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${data.token}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        report_id: data.report_id,
        inspector_id: data.inspector_id,
        team_type: data.team_type,
        priority: data.priority || 'medium',
        notes: data.notes || ''
      }),
    })

    console.log('assignInspector response status:', res.status)

    if (res.status === 401) {
      const { removeUserToken, removeUserData } = await import('./storage')
      await removeUserToken()
      await removeUserData()
      return {
        status: 'error',
        message: 'Session expired. Please login again.',
        auth_required: true
      }
    }

    if (!res.ok) {
      const errorText = await res.text()
      console.error('assignInspector error response:', errorText)
      throw new Error(`HTTP error! status: ${res.status}`)
    }

    return await res.json()
  } catch (error) {
    return handleApiError(error, 'assignInspector')
  }
}

export const apiAddPhotoNote = async (data: {
  token: string,
  photo_note: {
    id: string,
    reportId: number,
    type: 'photo' | 'note',
    content: string,
    timestamp: string,
    location?: {
      latitude: number,
      longitude: number
    },
    metadata?: {
      fileName?: string,
      fileSize?: number,
      mimeType?: string
    }
  }
}) => {
  try {
    console.log('Adding photo/note:', { reportId: data.photo_note.reportId, type: data.photo_note.type })

    const res = await fetch(`${API_URL}/add_photo_note.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${data.token}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify(data),
    })

    console.log('addPhotoNote response status:', res.status)

    if (res.status === 401) {
      const { removeUserToken, removeUserData } = await import('./storage')
      await removeUserToken()
      await removeUserData()
      return {
        status: 'error',
        message: 'Session expired. Please login again.',
        auth_required: true
      }
    }

    if (!res.ok) {
      const errorText = await res.text()
      console.error('addPhotoNote error response:', errorText)
      throw new Error(`HTTP error! status: ${res.status}`)
    }

    const responseData = await res.json()
    console.log('addPhotoNote response:', responseData)
    return responseData
  } catch (error) {
    return handleApiError(error, 'addPhotoNote')
  }
}

export const apiGetInspectorAssignments = async (token: string) => {
  try {
    console.log('Fetching inspector assignments')

    const res = await fetch(`${API_URL}/get_inspector_assignments.php`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    })

    console.log('getInspectorAssignments response status:', res.status)

    if (res.status === 401) {
      const { removeUserToken, removeUserData } = await import('./storage')
      await removeUserToken()
      await removeUserData()
      return {
        status: 'error',
        message: 'Session expired. Please login again.',
        auth_required: true
      }
    }

    if (!res.ok) {
      const errorText = await res.text()
      console.error('getInspectorAssignments error response:', errorText)
      throw new Error(`HTTP error! status: ${res.status}`)
    }

    const responseData = await res.json()
    console.log('getInspectorAssignments response:', responseData)
    return responseData
  } catch (error) {
    return handleApiError(error, 'getInspectorAssignments')
  }
}

export const apiSavePushToken = async (token: string, pushToken: string) => {
  try {
    console.log('Saving push token:', pushToken);

    const res = await fetch(`${API_URL}/save_push_token.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        push_token: pushToken,
      }),
    });

    console.log('savePushToken response status:', res.status);

    if (!res.ok) {
      const errorText = await res.text();
      console.error('savePushToken error response:', errorText);
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    return handleApiError(error, 'savePushToken');
  }
};

export const apiGetNotifications = async (token: string) => {
  try {
    const res = await fetch(`${API_URL}/get_notifications.php`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    return handleApiError(error, 'getNotifications');
  }
};

export const apiMarkNotificationRead = async (token: string, notificationId: number) => {
  try {
    const res = await fetch(`${API_URL}/mark_notification_read.php`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ notification_id: notificationId }),
    });

    if (!res.ok) {
      // If endpoint doesn't exist or bad request, return success to avoid breaking the app
      if (res.status === 404 || res.status === 400) {
        return { status: "success" };
      }
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error('API Error in markNotificationRead:', error);
    // Return mock success to prevent app crashes
    return { status: "success" };
  }
};


export const apiGetUserProfile = async (token: string) => {
  try {
    console.log('Fetching user profile')

    const res = await fetch(`${API_URL}/get_user_profile.php`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    })

    console.log('getUserProfile response status:', res.status)

    if (res.status === 401) {
      const { removeUserToken, removeUserData } = await import('./storage')
      await removeUserToken()
      await removeUserData()
      return {
        status: 'error',
        message: 'Session expired. Please login again.',
        auth_required: true
      }
    }

    if (!res.ok) {
      const errorText = await res.text()
      console.error('getUserProfile error response:', errorText)
      throw new Error(`HTTP error! status: ${res.status}`)
    }

    const responseData = await res.json()
    console.log('getUserProfile response:', responseData)
    return responseData
  } catch (error) {
    return handleApiError(error, 'getUserProfile')
  }
}

export const apiChangePassword = async (token: string, current_password: string, new_password: string) => {
  try {
    const res = await fetch(`${API_URL}/change_password.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify({ token, current_password, new_password })
    })

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
    return await res.json()
  } catch (error) {
    return handleApiError(error, 'changePassword')
  }
}

export const apiDeleteAccount = async (token: string, password: string) => {
  try {
    const res = await fetch(`${API_URL}/delete_account.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify({ password })
    })

    console.log('deleteAccount response status:', res.status)

    const responseData = await res.json()
    console.log('deleteAccount response:', responseData)

    if (res.status === 401) {
      // Token expired or invalid - clear stored token and return auth error
      const { removeUserToken, removeUserData } = await import('./storage')
      await removeUserToken()
      await removeUserData()
      return {
        status: 'error',
        message: 'Session expired. Please login again.',
        auth_required: true
      }
    }

    if (!res.ok) {
      // Return the API error message instead of throwing
      return responseData
    }

    return responseData
  } catch (error) {
    return handleApiError(error, 'deleteAccount')
  }
}

export const apiForgotPassword = async (email: string) => {
  try {
    console.log('Requesting password reset for:', email)

    const res = await fetch(`${API_URL}/forgot_password.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ email }),
    })

    console.log('forgotPassword response status:', res.status)

    const responseData = await res.json()
    console.log('forgotPassword response:', responseData)

    if (!res.ok) {
      return responseData
    }

    return responseData
  } catch (error) {
    return handleApiError(error, 'forgotPassword')
  }
}

export const apiResetPassword = async (data: { email: string, reset_code: string, new_password: string }) => {
  try {
    console.log('Resetting password for:', data.email)

    const res = await fetch(`${API_URL}/reset_password.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(data),
    })

    console.log('resetPassword response status:', res.status)

    const responseData = await res.json()
    console.log('resetPassword response:', responseData)

    if (!res.ok) {
      return responseData
    }

    return responseData
  } catch (error) {
    return handleApiError(error, 'resetPassword')
  }
}

export const apiUpdateUserProfile = async (token: string, data: {
  fullname: string,
  email: string,
  phone: string,
  address: string
}) => {
  try {
    console.log('Updating user profile')

    const res = await fetch(`${API_URL}/update_user_profile.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify(data),
    })

    console.log('updateUserProfile response status:', res.status)

    if (res.status === 401) {
      const { removeUserToken, removeUserData } = await import('./storage')
      await removeUserToken()
      await removeUserData()
      return {
        status: 'error',
        message: 'Session expired. Please login again.',
        auth_required: true
      }
    }

    if (!res.ok) {
      const errorText = await res.text()
      console.error('updateUserProfile error response:', errorText)
      throw new Error(`HTTP error! status: ${res.status}`)
    }

    const responseData = await res.json()
    console.log('updateUserProfile response:', responseData)
    return responseData
  } catch (error) {
    return handleApiError(error, 'updateUserProfile')
  }
}

export const apiGetNearbyReports = async (token: string, lat: number, lng: number, radius: number) => {
  try {
    console.log('Fetching nearby reports')

    const res = await fetch(`${API_URL}/get_nearby_reports.php?lat=${lat}&lng=${lng}&radius=${radius}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      },
    })

    console.log('getNearbyReports response status:', res.status)

    if (!res.ok) {
      const errorText = await res.text()
      console.error('getNearbyReports error response:', errorText)
      throw new Error(`HTTP error! status: ${res.status}`)
    }

    const responseData = await res.json()
    console.log('getNearbyReports response:', responseData)
    return responseData
  } catch (error) {
    return handleApiError(error, 'getNearbyReports')
  }
}
