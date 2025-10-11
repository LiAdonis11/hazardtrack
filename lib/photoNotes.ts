import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { getUserToken } from './storage';
import { API_URL } from './config';

export interface PhotoNote {
  id: string;
  reportId: number;
  type: 'photo' | 'note';
  content: string; // base64 for photos, text for notes
  timestamp: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  metadata?: {
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
  };
}

export interface PhotoNoteResult {
  success: boolean;
  data?: PhotoNote;
  error?: string;
}

// Request camera permissions
export const requestCameraPermissions = async (): Promise<boolean> => {
  try {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting camera permissions:', error);
    return false;
  }
};

// Request media library permissions
export const requestMediaLibraryPermissions = async (): Promise<boolean> => {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting media library permissions:', error);
    return false;
  }
};

// Capture photo using camera
export const capturePhoto = async (reportId: number): Promise<PhotoNoteResult> => {
  try {
    const hasPermission = await requestCameraPermissions();
    if (!hasPermission) {
      return {
        success: false,
        error: 'Camera permission denied'
      };
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      base64: true,
    });

    if (result.canceled) {
      return {
        success: false,
        error: 'Photo capture cancelled'
      };
    }

    const photo = result.assets[0];
    const photoNote: PhotoNote = {
      id: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      reportId,
      type: 'photo',
      content: photo.base64 || '',
      timestamp: new Date().toISOString(),
      location: photo.exif?.GPSLatitude && photo.exif?.GPSLongitude ? {
        latitude: photo.exif.GPSLatitude,
        longitude: photo.exif.GPSLongitude
      } : undefined,
      metadata: {
        fileName: photo.fileName || `photo_${Date.now()}.jpg`,
        fileSize: photo.fileSize,
        mimeType: photo.mimeType || 'image/jpeg'
      }
    };

    // Upload to server
    const uploadResult = await uploadPhotoNote(photoNote);
    if (uploadResult.success) {
      return {
        success: true,
        data: photoNote
      };
    } else {
      return {
        success: false,
        error: uploadResult.error || 'Failed to upload photo'
      };
    }

  } catch (error) {
    console.error('Error capturing photo:', error);
    return {
      success: false,
      error: 'Failed to capture photo'
    };
  }
};

// Select photo from gallery
export const selectPhotoFromGallery = async (reportId: number): Promise<PhotoNoteResult> => {
  try {
    const hasPermission = await requestMediaLibraryPermissions();
    if (!hasPermission) {
      return {
        success: false,
        error: 'Media library permission denied'
      };
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      base64: true,
    });

    if (result.canceled) {
      return {
        success: false,
        error: 'Photo selection cancelled'
      };
    }

    const photo = result.assets[0];
    const photoNote: PhotoNote = {
      id: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      reportId,
      type: 'photo',
      content: photo.base64 || '',
      timestamp: new Date().toISOString(),
      metadata: {
        fileName: photo.fileName || `photo_${Date.now()}.jpg`,
        fileSize: photo.fileSize,
        mimeType: photo.mimeType || 'image/jpeg'
      }
    };

    // Upload to server
    const uploadResult = await uploadPhotoNote(photoNote);
    if (uploadResult.success) {
      return {
        success: true,
        data: photoNote
      };
    } else {
      return {
        success: false,
        error: uploadResult.error || 'Failed to upload photo'
      };
    }

  } catch (error) {
    console.error('Error selecting photo:', error);
    return {
      success: false,
      error: 'Failed to select photo'
    };
  }
};

// Add text note
export const addTextNote = async (reportId: number, noteText: string): Promise<PhotoNoteResult> => {
  try {
    if (!noteText.trim()) {
      return {
        success: false,
        error: 'Note text cannot be empty'
      };
    }

    const photoNote: PhotoNote = {
      id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      reportId,
      type: 'note',
      content: noteText.trim(),
      timestamp: new Date().toISOString()
    };

    // Upload to server
    const uploadResult = await uploadPhotoNote(photoNote);
    if (uploadResult.success) {
      return {
        success: true,
        data: photoNote
      };
    } else {
      return {
        success: false,
        error: uploadResult.error || 'Failed to save note'
      };
    }

  } catch (error) {
    console.error('Error adding note:', error);
    return {
      success: false,
      error: 'Failed to add note'
    };
  }
};

export const addPhotoNote = async (reportId: number, type: 'photo' | 'note', content: string): Promise<PhotoNoteResult> => {
  try {
    if (!content.trim()) {
      return {
        success: false,
        error: 'Content cannot be empty'
      };
    }

    const photoNote: PhotoNote = {
      id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      reportId,
      type,
      content: content.trim(),
      timestamp: new Date().toISOString()
    };

    // Upload to server
    const uploadResult = await uploadPhotoNote(photoNote);
    if (uploadResult.success) {
      return { success: true, data: photoNote };
    } else {
      return { success: false, error: uploadResult.error || `Failed to save ${type}` };
    }

  } catch (error) {
    console.error(`Error adding ${type}:`, error);
    return { success: false, error: `Failed to add ${type}` };
  }
};

// Upload photo/note to server
const uploadPhotoNote = async (photoNote: PhotoNote): Promise<{ success: boolean; error?: string }> => {
  try {
    const token = await getUserToken();
    if (!token) {
      return {
        success: false,
        error: 'Authentication required'
      };
    }

    const response = await fetch(`${API_URL}/add_photo_note.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        photo_note: photoNote
      })
    });

    if (response.ok) {
      const result = await response.json();
      if (result.status === 'success') {
        return { success: true };
      } else {
        return {
          success: false,
          error: result.message || 'Failed to upload'
        };
      }
    } else {
      return {
        success: false,
        error: 'Server error'
      };
    }

  } catch (error) {
    console.error('Error uploading photo/note:', error);
    return {
      success: false,
      error: 'Network error'
    };
  }
};

// Get photo/notes for a report
export const getPhotoNotes = async (reportId: number): Promise<{ success: boolean; data?: PhotoNote[]; error?: string }> => {
  try {
    const token = await getUserToken();
    console.log('getPhotoNotes: Using token:', token); // Debug log for token
    if (!token) {
      return {
        success: false,
        error: 'Authentication required'
      };
    }

    const response = await fetch(`${API_URL}/get_photo_notes.php?report_id=${reportId}&token=${token}`, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const result = await response.json();
      if (result.status === 'success') {
        return {
          success: true,
          data: result.photo_notes || []
        };
      } else {
        return {
          success: false,
          error: result.message || 'Failed to fetch photo/notes'
        };
      }
    } else {
      const errorBody = await response.text();
      console.error('Server error response:', errorBody);
      return {
        success: false,
        error: 'Server error'
      };
    }

  } catch (error) {
    console.error('Error fetching photo/notes:', error);
    return {
      success: false,
      error: 'Network error'
    };
  }
};

// Delete photo/note
export const deletePhotoNote = async (photoNoteId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const token = await getUserToken();
    if (!token) {
      return {
        success: false,
        error: 'Authentication required'
      };
    }

    const response = await fetch(`${API_URL}/delete_photo_note.php`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        photo_note_id: photoNoteId
      })
    });

    if (response.ok) {
      const result = await response.json();
      if (result.status === 'success') {
        return { success: true };
      } else {
        return {
          success: false,
          error: result.message || 'Failed to delete'
        };
      }
    } else {
      return {
        success: false,
        error: 'Server error'
      };
    }

  } catch (error) {
    console.error('Error deleting photo/note:', error);
    return {
      success: false,
      error: 'Network error'
    };
  }
};
