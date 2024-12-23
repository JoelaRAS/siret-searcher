import axios from 'axios';

class TokenService {
  constructor() {
    this.token = null;
  }

  async getValidToken() {
    return this.refreshToken();
  }

  async refreshToken() {
    try {
      const response = await axios.post('/api/token');
      this.token = response.data.access_token;

      console.log('Nouveau token généré:', this.token);
      
      return this.token;
    } catch (error) {
      console.error('Erreur lors du rafraîchissement du token:', error);
      throw error;
    }
  }
}

export const tokenService = new TokenService();