// get request for getting blogposts.
import {prisma} from "@/prisma/client";

export default async function handler(req, res) {
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
                ...(tags && { tags: { contains: tags } }),  // Filter by ID if provided
                ...(description && { description: { contains: description } }),  // Filter by authorId if provided
                ...(title && { title: { contains: title } }),  // Filter by title (partial match)
                ...(templates && { templates: { contains: templates } }),
            },
            include: {
                author: true,
                templates: true  // Include author an template information in the result
            },
        });
        return res.status(200).json(blogs);

    } else {
        return res.status(400).json({error: "Method not allowed"});
    }
}

