class TokenService {
    constructor() {
        this.accessTokenKey = 'accessToken';
        this.refreshTokenKey = 'refreshToken';
    }

    getAccessToken() {
        return localStorage.getItem(this.accessTokenKey);
    }

    getRefreshToken() {
        return localStorage.getItem(this.refreshTokenKey);
    }

    setTokens({ accessToken, refreshToken }) {
        localStorage.setItem(this.accessTokenKey, accessToken);
        localStorage.setItem(this.refreshTokenKey, refreshToken);
    }

    clearTokens() {
        localStorage.removeItem(this.accessTokenKey);
        localStorage.removeItem(this.refreshTokenKey);
    }
}

export const tokenService = new TokenService();