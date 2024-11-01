// get request for getting blogposts, and creating a new one.
import { prisma } from "../../../prisma/client";
import {jwtMiddleware} from "@/pages/api/middleware";  // Import the JWT middleware


async function handler(req, res) {
    if (req.method === "GET") {
        // get all blogposts
        const {tags, description, title, templateTitle } = req.query;
        // maybe filter by tags, description etc here. 
        const blogs = await prisma.blogPost.findMany({
            take: 6,
            skip: 1,
            where: {
                hidden: false, // only show blogs that are NOT HIDDEN - NOT FLAGGED
                ...(tags && { tags: { contains: tags } }),  // Filter by tags if provided
                ...(description && { description: { contains: description } }),  // Filter by desc if provided
                ...(title && { title: { contains: title } }),  // Filter by title (partial match)
                ...(templateTitle && {
                    templates: {
                        title: { contains: templateTitle }  // filter by template title if provided
                    }
                })
            },
            orderBy: [
                {
                    _count: {
                        upvotes: 'desc',  // sort by most upvotes first
                    },
                },
                {
                    _count: {
                        downvotes: 'asc', // then sort by least downvotes
                    },
                },
            ],
            include: {
                author: true,
                templates: true,  // Include author an template information in the result
                upvotes: true,  // Assume you have an upvotes relationship set up
                downvotes: true, // Assume you have a downvotes relationship set up
            },
        });
        return res.status(200).json(blogs);

    } else if (req.method === "POST") {
        // create a blogpost for this user. MAYBE HAVE A CREATE BLOGPOST BUTTON
        // make sure they have proper auth beforehand with their id. - wrap middleware around this post request.
        return jwtMiddleware(async (req, res) => {
            const {title, description, tags, templateIds} = req.body;
            const {user} = req;

            if (!user) {
                return res.status(403).json({ error: "User is not authenticated." });
            }

            if (!title || !description || !tags || title.trim() === "" || description.trim() === "" || tags.trim() === "") {
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
                        templates: {
                            connect: templateIds.map(id => ({ id: parseInt(id) })),  // Link the templates to the blog post
                        },
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
                console.error(error);
                return res.status(500).json({error: `${error} an error occured while creating blog for this user`});
            }
        },["ADMIN", "USER"])(req, res);

    } else {
        return res.status(400).json({error: "Method not allowed"});
    }
}

export default handler;
