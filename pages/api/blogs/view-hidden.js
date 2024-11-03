// get request for getting blogposts, and creating a new one.
import { prisma } from "../../../prisma/client";
import {jwtMiddleware} from "@/pages/api/middleware";  // Import the JWT middleware

async function handler(req, res) {
    if (req.method === "GET") {
        return jwtMiddleware(async (req, res) => {

            const {user} = req;
    
            const currId = parseInt(user.id);

            const existingBlog = await prisma.blogPost.findMany({
                where: {
                    authorId: currId,
                    hidden: true,
                }, 

            });

            if (!existingBlog) {
                return res.status(200).json({error: "No hidden blogs for you"});
            }
            // If no hidden blogs found, return a relevant message
            if (existingBlog.length === 0) {
                return res.status(200).json({message: "No hidden blogs for you!"});
            }

            return res.status(200).json(existingBlog);

        
        }, ["ADMIN", "USER"])(req, res);

    } else {
        return res.status(400).json({error: "method not allowed"});
    }
}

export default handler;