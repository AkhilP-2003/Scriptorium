// get request for getting blogposts, and creating a new one.
import { prisma } from "../../../prisma/client";
import {jwtMiddleware} from "@/pages/api/middleware";  // Import the JWT middleware


async function handler(req, res) {
    if (req.method === "GET") {
        // get all blogposts
        const {tags, description, title, templates } = req.query;
        // maybe filter by tags, description etc here. 
        const blogs = await prisma.blogPost.findUnique({
            take: 6,
            skip: 1,
            where: {
                ...(tags && { tags: { contains: tags } }),  // Filter by tags if provided
                ...(description && { description: { contains: description } }),  // Filter by desc if provided
                ...(title && { title: { contains: title } }),  // Filter by title (partial match)
                ...(templates && { templates: { contains: templates } })
            },
            include: {
                author: true,
                templates: true  // Include author an template information in the result
            },
        });
        return res.status(200).json(blogs);

    } else if (req.method === "POST") {
        // create a blogpost for this user. MAYBE HAVE A CREATE BLOGPOST BUTTON
        // make sure they have proper auth beforehand with their id. - wrap middleware around this post request.
        return jwtMiddleware(async (req, res) => {
            const {title, description, tags, templateId=null} = req.body;
            const {user} = req;

            if (!user) {
                return res.status(403).json({ error: "User is not authenticated." });
            }

            if (!title || !description || !tags) {
                return res.status(400).json({error: "Missing required fields"});
            }
            
            try {
                // create a blog for this user. 
                // first find user's account.
                const existingUser = await prisma.user.findUnique({
                    where: {id: parseInt(user.id)}
                })

                if (!existingUser) {
                    return res.status(403).json({ error: "User is not authenticated to write a blog" });
                }

                const created_blog = await prisma.blogPost.create({
                    data: {
                        title,
                        description,
                        tags,
                        authorId: parseInt(user.id),
                        // author: existingUser,
                        templateId: templateId ? parseInt(templateId) : null,
                    },
                    include: {
                        author: true,
                        templates: true,
                        }
                });

                if (!created_blog) {
                    return res.status(403).json({ error: "Something went wrong creating the blog" });
                }

                return res.status(200).json({created_blog});

            } catch(error) {
                return res.status(500).json({error: `${error} an error occured while creating blog for this user`});
            }
        })(req, res);

    } else {
        return res.status(400).json({error: "Method not allowed"});
    }
}

export default handler;
