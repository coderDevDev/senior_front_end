/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosError } from 'axios';

// Define fingerprint positions
export type FingerPosition =
  | 'right_thumb'
  | 'right_index'
  | 'right_middle'
  | 'right_ring'
  | 'right_little'
  | 'left_thumb'
  | 'left_index'
  | 'left_middle'
  | 'left_ring'
  | 'left_little';

// Define data interface for registration
export interface FingerprintRegistrationData {
  userId: string;
  templateData: string;
  imageData?: string;
  fingerPosition: FingerPosition;
  quality: number;
  format: string;
}

// Define response interface
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Fingerprint service class
export class FingerprintService {
  private readonly baseUrl: string;
  private readonly timeout: number;

  constructor() {
    this.baseUrl = process.env.VITE_API_BASE_URL || 'http://localhost:3000';
    this.timeout = 20000; // 20 seconds timeout
  }

  /**
   * Register a fingerprint in the system
   */
  async registerFingerprint(
    data: FingerprintRegistrationData
  ): Promise<ApiResponse<{ id: string }>> {
    try {
      // Validate the input
      this.validateRegistrationData(data);

      // Log registration attempt (excluding actual template data for security)
      console.log('Registering fingerprint:', {
        userId: data.userId,
        fingerPosition: data.fingerPosition,
        quality: data.quality,
        format: data.format,
        templateLength: data.templateData?.length,
        hasImage: !!data.imageData
      });

      // Make the API call
      const response = await axios({
        method: 'POST',
        url: `${this.baseUrl}/api/v1/fingerprints/register`,
        data: {
          user_id: data.userId,
          template_data: data.templateData,
          finger_position: data.fingerPosition,
          quality_score: data.quality,
          format: data.format,
          // Only send image data if provided and it's a registration (not for verification)
          image_data: data.imageData
        },
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.getAuthToken()}`
        },
        timeout: this.timeout
      });

      // Log success (without sensitive data)
      console.log('Fingerprint registration successful:', response.status);

      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Fingerprint registered successfully'
      };
    } catch (err) {
      return this.handleError(err, 'Failed to register fingerprint');
    }
  }

  /**
   * Verify a fingerprint against a user's registered prints
   */
  async verifyFingerprint(
    userId: string,
    templateData: string
  ): Promise<ApiResponse<{ matched: boolean; score?: number }>> {
    try {
      console.log('Verifying fingerprint for user:', userId);

      const response = await axios({
        method: 'POST',
        url: `${this.baseUrl}/api/v1/fingerprints/verify`,
        data: {
          user_id: userId,
          template_data: templateData
        },
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.getAuthToken()}`
        },
        timeout: this.timeout
      });

      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Fingerprint verification completed'
      };
    } catch (err) {
      return this.handleError(err, 'Failed to verify fingerprint');
    }
  }

  /**
   * Get all registered fingerprints for a user
   */
  async getUserFingerprints(userId: string): Promise<
    ApiResponse<
      Array<{
        id: string;
        fingerPosition: FingerPosition;
        quality: number;
        createdAt: string;
      }>
    >
  > {
    try {
      const response = await axios({
        method: 'GET',
        url: `${this.baseUrl}/api/v1/fingerprints/user/${userId}`,
        headers: {
          Authorization: `Bearer ${this.getAuthToken()}`
        },
        timeout: this.timeout
      });

      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Fingerprints retrieved successfully'
      };
    } catch (err) {
      return this.handleError(err, 'Failed to retrieve user fingerprints');
    }
  }

  /**
   * Delete a registered fingerprint
   */
  async deleteFingerprint(fingerprintId: string): Promise<ApiResponse<null>> {
    try {
      const response = await axios({
        method: 'DELETE',
        url: `${this.baseUrl}/api/v1/fingerprints/${fingerprintId}`,
        headers: {
          Authorization: `Bearer ${this.getAuthToken()}`
        },
        timeout: this.timeout
      });

      return {
        success: true,
        message: response.data.message || 'Fingerprint deleted successfully'
      };
    } catch (err) {
      return this.handleError(err, 'Failed to delete fingerprint');
    }
  }

  // Private helper methods

  /**
   * Get the authentication token from storage
   */
  private getAuthToken(): string {
    return localStorage.getItem('auth_token') || '';
  }

  /**
   * Validate registration data before sending to API
   */
  private validateRegistrationData(data: FingerprintRegistrationData): void {
    if (!data.userId) {
      throw new Error('User ID is required');
    }

    if (!data.templateData) {
      throw new Error('Template data is required');
    }

    // Ensure the template data looks like base64
    if (!data.templateData.match(/^[A-Za-z0-9+/=]+$/)) {
      throw new Error('Template data must be a valid base64 string');
    }

    // Check minimum quality
    if (data.quality < 40) {
      throw new Error('Fingerprint quality is too low for registration');
    }

    // Validate finger position
    const validPositions: FingerPosition[] = [
      'right_thumb',
      'right_index',
      'right_middle',
      'right_ring',
      'right_little',
      'left_thumb',
      'left_index',
      'left_middle',
      'left_ring',
      'left_little'
    ];

    if (!validPositions.includes(data.fingerPosition)) {
      throw new Error('Invalid finger position');
    }
  }

  /**
   * Handle API errors consistently
   */
  private handleError(
    err: unknown,
    defaultMessage: string
  ): ApiResponse<never> {
    console.error('Fingerprint service error:', err);

    // Format the error for response
    if (axios.isAxiosError(err)) {
      const axiosError = err as AxiosError<any>;

      // Get specific API error if available
      if (axiosError.response?.data) {
        const errorData = axiosError.response.data;
        return {
          success: false,
          error:
            errorData.error ||
            errorData.message ||
            `Server error: ${axiosError.response.status} ${axiosError.response.statusText}`,
          message: defaultMessage
        };
      }

      // Network or timeout errors
      if (axiosError.code === 'ECONNABORTED') {
        return {
          success: false,
          error: 'Request timed out. Server may be experiencing high load.',
          message: defaultMessage
        };
      }

      if (!axiosError.response) {
        return {
          success: false,
          error: 'Network error. Please check your connection.',
          message: defaultMessage
        };
      }

      // Generic HTTP error
      return {
        success: false,
        error: `Server error: ${axiosError.response.status} ${axiosError.response.statusText}`,
        message: defaultMessage
      };
    } else if (err instanceof Error) {
      // Standard JS Error
      return {
        success: false,
        error: err.message,
        message: defaultMessage
      };
    }

    // Unknown error type
    return {
      success: false,
      error: 'An unexpected error occurred',
      message: defaultMessage
    };
  }
}

// Create and export a singleton instance
export const fingerprintService = new FingerprintService();
