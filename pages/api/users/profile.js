// get request for getting blogposts, and creating a new one.
import { prisma } from "../../../prisma/client";
import {jwtMiddleware} from "@/pages/api/middleware";  // Import the JWT middleware

async function handler(req, res) {
    if (req.method === "GET") {
        return jwtMiddleware(async (req, res) => {

            const {user} = req;
    
            const currId = parseInt(user.id);

            const loggedInUser = await prisma.user.findUnique({
                where: {
                    id: currId,
                }
            });

            if (!loggedInUser) {
                return res.status(200).json([]);
            }

            return res.status(200).json(loggedInUser);

        
        }, ["ADMIN", "USER"])(req, res);

    } else {
        return res.status(400).json({error: "method not allowed"});
    }
}

export default handler;