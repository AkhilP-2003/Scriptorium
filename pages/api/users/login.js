import { prisma } from "../../../prisma/client";
import { comparePassword, generateRefreshToken, generateAccessToken} from "../../../utils/auth";

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
        const accessToken = generateAccessToken({id: existingUser.id, userName: existingUser.userName, email: existingUser.email, role: existingUser.role});
        const refreshToken = generateRefreshToken({id: existingUser.id, userName: existingUser.userName, email: existingUser.email, role: existingUser.role});

        // Set tokens in cookies
        // Set HttpOnly cookies
        // res.setHeader("Set-Cookie", [
        //     `accessToken=${accessToken}; HttpOnly; Secure; Path=/; Max-Age=3600`,
        //     `refreshToken=${refreshToken}; HttpOnly; Secure; Path=/; Max-Age=604800`,
        // ]);

        // its going to be encryped so we can show this information.
        return res.status(200).json({
            "accessToken": accessToken, "refreshToken": refreshToken
        });

    } else {
        return res.status(401).json({error: "Invalid method"});
    }
}