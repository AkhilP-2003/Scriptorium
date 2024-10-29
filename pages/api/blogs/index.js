// get request for getting blogposts, and creating a new one.
import {prisma} from "@/prisma/client";

async function handler(req, res) {
    if (req.method === "GET") {
        // get all blogposts
        const {tags, description, title, templates } = req.query;

        if (!tags || !description || !title || !templates) {
            await prisma.blogpost.findMany({
            });
        }
        // maybe filter by tags, description etc here. 
        const blogs = await prisma.blogpost.findUnique({
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
            const {title, description, tags, templateId} = req.body;
            const {user} = req;

            if (!user) {
                return res.status(403).json({ error: "User is not authenticated." });
            }

            if (!title || !description || !tags || !templateId) {
                return res.status(400).json({error: "Missing required fields"});
            }
            
            try {
                // create a blog for this user. 
                const created_blog = await prisma.blogpost.create({
                data: {
                    title,
                    description,
                    tags,
                    authorId: user.id,
                    templateId: templateId ? templateId : null,
                },
                include: {
                    author: true,
                    templates: true,
                    }
                });

                return res.status(200).json({created_blog});

            } catch(error) {
                return res.status(500).json({error: "an error occured while creating blog for this user"});
            }
        })(req, res);

    } else {
        return res.status(400).json({error: "Method not allowed"});
    }
}

export default handler;
