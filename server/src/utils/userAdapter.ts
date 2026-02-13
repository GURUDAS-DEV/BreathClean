import User from "../Schema/user.schema.js";

interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  verified_email?: boolean;
  locale?: string;
}

export const userAdapter = {
  async findByEmail(email: string) {
    return await User.findOne({ email });
  },
  async createUser(userInfo: GoogleUserInfo & { authProvider: string }) {
    return await User.create({
      googleId: userInfo.id,
      email: userInfo.email,
      name: userInfo.name,
      givenName: userInfo.given_name ?? "",
      familyName: userInfo.family_name ?? "",
      picture: userInfo.picture ?? "",
      emailVerified: userInfo.verified_email ?? false,
      locale: userInfo.locale ?? "",
    });
  },
};
