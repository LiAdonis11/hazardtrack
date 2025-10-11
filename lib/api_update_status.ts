import { API_URL } from './config'

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

export const apiUpdateReportStatus = async (token: string, reportId: number, status: string, adminNotes?: string) => {
  try {
    console.log('Updating report status:', { reportId, status, adminNotes })

    const res = await fetch(`${API_URL}/update_report_status.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        report_id: reportId,
        status: status,
        admin_notes: adminNotes || `Status updated to ${status} by admin`
      }),
    })

    console.log('Update status response status:', res.status)

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`)
    }

    const responseData = await res.json()
    console.log('Update status response:', responseData)
    return responseData

  } catch (error) {
    return handleApiError(error, 'updateReportStatus')
  }
}
