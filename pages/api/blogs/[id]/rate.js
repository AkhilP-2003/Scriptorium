import { prisma } from "../../../../prisma/client";
import {jwtMiddleware} from "@/pages/api/middleware";  // Import the JWT middleware

// this is the endpoint to upvote/downvote a blog with given id in query.


async function handler(req, res) {
    if (req.method === "POST") {

        return jwtMiddleware(async (req, res) => {
        const { id } = req.query;
        const { voteType } = req.body;  // voteType can be 'upvote' or 'downvote'
        const { user } = req; 


        if (!id || !voteType || (voteType !== 'upvote' && voteType !== 'downvote')) {
            return res.status(400).json({ error: "Blog ID and valid vote type are required." });
        }
    
        const blogPostId = parseInt(id);

        try {
            if (user.role !== "USER" && user.role !== "ADMIN") {
                return res.status(400).json({ error: "Invalid Credentials" });
            }
            // handle voting on blog posts
            const blogPost = await prisma.blogPost.findUnique({
                where: { id: blogPostId },
            });
    
            if (!blogPost) {
                return res.status(404).json({ error: "Blog post not found." });
            }
    
            // update the vote count for the blog post based on the voteType
            const updatedBlogPost = await prisma.blogPost.update({
                where: { id: blogPostId },
                data: {
                    upvote: voteType === 'upvote' ? blogPost.upvote + 1 : blogPost.upvote,
                    downvote: voteType === 'downvote' ? blogPost.downvote + 1 : blogPost.downvote,
                },
            });
    
            return res.status(200).json({ message: `Blog post ${voteType} registered successfully.`, updatedBlogPost });
    
        } catch (error) {
            console.error(error);
            return res.status(400).json({ error: "An error occurred while registering the vote." });
        }

        }, ["USER", "ADMIN"])(req, res);
        

    } else {
        return res.status(400).json({error: "method not allowed"})
    }


}

export default handler;