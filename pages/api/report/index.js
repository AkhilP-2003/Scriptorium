import { prisma } from "../../../prisma/client";
import {jwtMiddleware} from "@/pages/api/middleware";  // Import the JWT middleware

export default async function reportContent(req, res){
    if (req.method !== 'POST'){
        return res.status(405).json({ message: 'Method not allowed' });
    }

    return jwtMiddleware(async (req, res) => {
        const {blogId, commentId} = req.query;
        const {description} = req.body;
        const {user} = req;


        console.log(blogId)
        // if (!user) {
        //     return res.status(403).json({ error: "User is not authenticated." });
        // }

        //request should only contain one of the options
        if (blogId && commentId){
            return res.status(400).json("Report can only be for a blog or comment, but not both")
        }

    // Validate input
        if (!description || (!blogId && !commentId)) {
            return res.status(400).json({ message: 'Please provide all fields!' });
        }

        try { 
        const report = await prisma.abuseReport.create({
            data: {
                authorId: user.id,
                description: description,
                blogId: blogId ? Number(blogId) : null, //prisma relation should automically map blogId to blog, check if it works
                commentId: commentId ? Number(commentId) :null

            }
        });
        return res.status(200).json({report});
    } catch (error){
        console.error(error);
        return res.status(500).json({error: "An error occured while creating the abuse report"});
    }
    },["ADMIN", "USER"])(req, res);
    
    
}