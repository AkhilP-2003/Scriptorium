import { prisma } from "../../../prisma/client";
import {cookies} from "next/headers";

export default function handler(req, res) {
    if (req.method === "POST") {
        // Remove refreshTokens from database for this user, right?
        const authHeader = req.headers['cookie']; // get the session cookie from request header
        if (!authHeader) {
            return res.status(204).json({error: "no cookies"});
        }
        // Extract the JWT and refresh token from the cookies
        const cookies = authHeader.split(';').reduce((acc, cookie) => {
            const [key, value] = cookie.trim().split('=');
            acc[key] = value;
            return acc;
        }, {});

        const accessToken = cookies['accessToken'];
        const refreshToken = cookies['refreshToken'];

        if (!accessToken || !refreshToken) {
            return res.status(204).json({error: "No tokens found"});
        }

        try {
            //Clear the access token and refresh token cookies
            // res.setHeader('Set-Cookie', [
            //   'accessToken=; Max-Age=0; Path=/; HttpOnly; SameSite=Strict;',
            //   'refreshToken=; Max-Age=0; Path=/; HttpOnly; SameSite=Strict;'
            // ]);

            
      
            return res.status(200).json({ message: 'Successfully logged out' });

          } catch (error) {
            console.error('Error during logout:', error);
            return res.status(500).json({ error: 'Failed to logout' });
          }

    } else {
        return res.status(401).json({error: "Invalid method"});
    }
}