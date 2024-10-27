import {prisma} from "@/prisma/client";
import { verifyAccessToken, verifyRefreshToken } from "../../utils/auth";

export default function handler(req, res) {
    if (req.method === "GET") {
        
        const auth = verifyAccessToken(req.headers.authorization);
        if (!auth) {
            res.status(400).json({error: "Not authorized"});
        } else {
            // authorized for this page.
            return res.status(200).json({message: `hello ${auth.userName}`})
        }



    } else {
        return res.status(400).json({error: "Method not allowed"});
    }

}