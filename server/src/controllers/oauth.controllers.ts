import { Request, Response } from "express";
import { simpleGoogleCallback, simpleGoogleLink } from "simply-auth";

import { userAdapter } from "../utils/userAdapter.js";

const clientId = process.env.GOOGLE_CLIENT_ID!;
const redirectUri = process.env.GOOGLE_REDIRECT_URI!;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
const accessSecret = process.env.ACCESS_TOKEN_SECRET!;
const refreshSecret = process.env.REFRESH_TOKEN_SECRET!;

export const googleLink = async (_req: Request, res: Response) => {
  try {
    const response = simpleGoogleLink(clientId, redirectUri);
    res.redirect(response);
  } catch (error) {
    console.error("Error in googleLink:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const googleCallback = async (req: Request, res: Response) => {
  try {
    const { code } = req.query;
    console.log(code);
    const response = await simpleGoogleCallback(
      code as string,
      clientId,
      redirectUri,
      clientSecret,
      {
        accessSecret,
        refreshSecret,
        accessExpiry: "15d",
        refreshExpiry: "30d",
      },
      userAdapter
    );

    if (!response.user) {
      return res.status(401).json({ error: "Google authentication failed" });
    }
    res.cookie("refreshToken", response.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 30 * 1000,
    });
    return res.json({ response });
  } catch (error) {
    console.log("Error in googleCallback:", error);
    return res.status(500).json({ errorMsg: "Internal server error", error });
  }
};
