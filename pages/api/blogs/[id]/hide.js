// this is for hiding a blog wit hthe given id -> only admin auth.
import { prisma } from "../../../../prisma/client";
import {jwtMiddleware} from "@/pages/api/middleware";  // Import the JWT middleware


async function handler(req, res) {
    if (req.method === "POST") {

        return jwtMiddleware(async (req, res) => {
            const {id} = req.query;
            const {user} = req;

            if (!id) {
                return res.status(400).json({error: "Please provide blog to select"});
            }
            const currId = parseInt(id);

            if (!user) {
                return res.status(400).json({error: "user not found"});
            }
            
            if (user.role !== "ADMIN") {
                return res.status(400).json({error: "Invalid credentials for this request"});
            }

            try {
                // here, role is admin. they can hide the blogpost.
                const hiddenPost = await prisma.blogPost.update({ 
                    where: {
                        id: currId,
                    },
                    data: {
                        hidden: true, // set hidden to true for this blog
                    }
                });

                // if the blog post is not found, return error
                if (!hiddenPost) {
                    return res.status(404).json({ error: "Blog post not found." });
                // DON'T FORGET THE MARK THE RELATED ABUSE REPORT'S ASSOCIATED WITH THIS BLOG AS CLOSED.
                
                }
                return res.status(200).json({ message: "Blog post hidden successfully.", hiddenPost });
            } catch(error) {
                console.error(error);
                return res.status(500).json({ error: "somethign went wrong trying to hide the blog post by the admin." });
            }



        },["ADMIN"])(req, res);

    } else {
        return res.status(400).json({ error: "Method not allowed"});
    }

}

export default handler;