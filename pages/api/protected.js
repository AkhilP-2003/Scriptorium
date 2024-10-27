import {prisma} from "@/prisma/client";
import { verifyAccessToken, verifyRefreshToken } from "../../utils/auth";
import { jwtMiddleware } from "./middleware";

async function handler(req, res) {
    if (req.method === "GET") {
        // At this point, the token has been verified and req.user is populated

        return res.status(200).json({ message: `Hello, ${req.user.userName}` });
    } else {
        return res.status(400).json({ error: "Method not allowed" });
    }

}

export default jwtMiddleware(handler);