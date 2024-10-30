import { prisma } from "../../../prisma/client";
import { generateAccessToken,verifyRefreshToken } from "../../../utils/auth";

export default function handler(req, res) {
    if (req.method === "POST") {

        const {refreshToken} = req.body;
        if (!refreshToken) {
            return res.status(400).json({error: "Invalid credentials"});
        }
        const refresh = verifyRefreshToken(refreshToken);
        if (!refresh) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        // Generate a new access token using the payload from the refresh token
        const newAccessToken = generateAccessToken({id: refresh.id, userName: refresh.userName,  email: refresh.email, role: refresh.role });

        // Return the new access token in the response
        return res.status(200).json({
            "accessToken": newAccessToken,
        });
    } else {
        return res.status(400).json({ error: "Method Not Allowed" });
    }

}