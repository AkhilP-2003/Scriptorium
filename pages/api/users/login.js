import { prisma } from "@/prisma/client";
import { comparePassword, generateRefreshToken, generateAccessToken } from "@/utils/auth";

export default async function handler(req, res) {
    if (req.method === "POST") {
        const {userName, password} = req.body;
        
        if (!userName || !password) {
            return res.status(401).json({error: "Please provide all fields"});
        }
        const existingUser = await prisma.user.findUnique({
            where: {
              userName,
            },
          });
        
        if (!existingUser || !(await comparePassword(password, existingUser.password))) {
            return res.status(401).json({error: "Invalid credentials"});
        }
        // if everything is valid, then generate new refresh + access token
        const accessToken = generateAccessToken({id: existingUser.id, userName: existingUser.userName, role: existingUser.role});
        const refreshToken = generateRefreshToken({id: existingUser.id, userName: existingUser.userName,role: existingUser.role});
        
        return res.status(200).json({
            "accessToken": accessToken, "refreshToken": refreshToken
        });

    } else {
        return res.status(401).json({error: "Invalid method"});
    }
}