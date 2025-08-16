// Detect if running on web or mobile and use appropriate URL
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined' && window.location) {
    // Running on web - use localhost or the same host
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    
    // If running on localhost/127.0.0.1, use localhost for API
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return `${protocol}//localhost:8000/api`;
    }
    
    // If running on a different host, try to use the same host with port 8000
    return `${protocol}//${hostname}:8000/api`;
  }
  
  // Running on mobile - use your server IP
  return 'http://192.168.53.151:8000/api';
};

const API_BASE_URL = getApiBaseUrl();

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Helper method for making requests
  async makeRequest(endpoint, options = {}) {
    try {
      const url = `${this.baseURL}${endpoint}`;
      console.log(`Making request to: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Register a new face
  async registerFace(name, imageUri) {
    try {
      console.log('Registering face:', { name, imageUri: imageUri.substring(0, 50) + '...' });
      console.log('Using API URL:', this.baseURL);

      // Create FormData - different handling for web vs mobile
      const formData = new FormData();
      formData.append('name', name);
      
      if (typeof window !== 'undefined' && window.location) {
        // Web environment - convert data URI to blob
        if (imageUri.startsWith('data:')) {
          const response = await fetch(imageUri);
          const blob = await response.blob();
          formData.append('file', blob, `${name}_face.jpg`);
        } else {
          // If it's a regular URL, fetch it first
          const response = await fetch(imageUri);
          const blob = await response.blob();
          formData.append('file', blob, `${name}_face.jpg`);
        }
      } else {
        // Mobile environment - use original approach
        formData.append('file', {
          uri: imageUri,
          type: 'image/jpeg',
          name: `${name}_face.jpg`,
        });
      }

      const url = `${this.baseURL}/register-face`;
      console.log(`Uploading to: ${url}`);

      // Different fetch options for web vs mobile
      const fetchOptions = {
        method: 'POST',
        body: formData,
      };

      // Only set Content-Type for mobile, let browser set it for web
      if (typeof window === 'undefined' || !window.location) {
        fetchOptions.headers = {
          'Content-Type': 'multipart/form-data',
        };
      }

      const response = await fetch(url, fetchOptions);

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { detail: errorText || `HTTP ${response.status}` };
        }
        
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Registration successful:', result);
      return result;
      
    } catch (error) {
      console.error('Face registration failed:', error);
      
      // Provide more specific error messages
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error(`Network error: Cannot connect to server at ${this.baseURL}. Please check if the server is running and accessible.`);
      }
      
      throw error;
    }
  }

  // Start attendance scanner
  async startScanner() {
    return this.makeRequest('/start-scanner', {
      method: 'POST',
    });
  }

  // Stop attendance scanner
  async stopScanner() {
    return this.makeRequest('/stop-scanner', {
      method: 'POST',
    });
  }

  // Get current scanner frame
  async getScannerFrame() {
    return this.makeRequest('/scanner-frame');
  }

  // Get scanner status
  async getScannerStatus() {
    return this.makeRequest('/scanner-status');
  }

  // Get attendance summary
  async getAttendanceSummary() {
    return this.makeRequest('/attendance-summary');
  }

  // Get registered faces
  async getRegisteredFaces() {
    return this.makeRequest('/registered-faces');
  }

  // Health check
  async healthCheck() {
    return this.makeRequest('/health');
  }
}

export default new ApiService();