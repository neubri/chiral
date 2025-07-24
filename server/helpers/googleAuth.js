const { OAuth2Client } = require("google-auth-library");

class GoogleAuthHelper {
  constructor() {
    this.client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  async verifyIdToken(token) {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();

      return {
        googleId: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        emailVerified: payload.email_verified,
      };
    } catch (error) {
      throw {
        name: "Bad Request",
        message: "Invalid Google token",
        details: error.message,
      };
    }
  }
}

module.exports = new GoogleAuthHelper();
