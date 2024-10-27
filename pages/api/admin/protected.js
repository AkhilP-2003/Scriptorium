import {prisma} from "@/prisma/client";
import { verifyAccessToken, verifyRefreshToken } from "../../utils/auth";
import { jwtMiddleware } from "../middleware";

async function handler(req, res) {
    if (req.method === "GET") {
        // This route is only accessible by users with the ADMIN role
        return res.status(200).json({ message:`'Welcome, Admin ${req.user.userName}!` });
    } else {
        return res.status(400).json({ error: "Method not allowed" });
    }

}

export default jwtMiddleware(handler, ["ADMIN"]);