// get request for getting blogposts, and creating a new one.
import { prisma } from "../../../prisma/client";
import {jwtMiddleware} from "@/pages/api/middleware";  // Import the JWT middleware


async function handler(req, res) {
    if (req.method === "GET") {
        // get all blogposts
        const {tags, description, title, templateTitle, page=1, limit=10 } = req.query;
        const currentPage = parseInt(page)
        const pageSize = parseInt(limit)
        if (!tags && !description && !title && !templateTitle) { //FIX THE TEMPATLE TITLE SEARCHHHHHH
            const b = await prisma.blogPost.findMany({
                skip: (currentPage - 1) * pageSize,// calculate the number of items to skip and which item to actually start from on the page
                take: pageSize,// the number of items to return in a page (the items to get)
                where: {
                    hidden: false,  // Only show visible blogs
                },
                orderBy: {
                    upvote: 'desc',  // Order by the most upvotes
                },
                include: {
                    author: true,
                    templates: true,  // Include the related templates
                }
            });
            console.log(tags, description, title, templateTitle)
            return res.status(200).json(b);
        }


        const blogs = await prisma.blogPost.findMany({
            skip: (currentPage - 1) * pageSize,// calculate the number of items to skip and which item to actually start from on the page
            take: pageSize,// the number of items to return in a page (the items to get)
            where: {
                hidden: false, // only show blogs that are NOT HIDDEN - NOT FLAGGED
                ...(tags && { tags: { contains: tags} }),  // Filter by tags if provided
                ...(description && { description: { contains: description} }),  // Filter by desc if provided
                ...(title && { title: { contains: title} }),  // Filter by title (partial match)
                ...(templateTitle && {
                    templates: {
                        some: { title: { contains: templateTitle} },
                     // filter by template title if provided
                    },
                }),
            },
            orderBy: {
                upvote: 'desc',  //order by upvotes, regardless of filters
            },
            include: {
                author: true,
                templates: true,  // =include auhtor
            },
        });
        console.log(tags, description, title, templateTitle)
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
                        templates: templateIds && templateIds.length > 0
                        ? {
                            connect: templateIds.map(id => ({ id: parseInt(id) })),  // Link the templates to the blog post
                        }
                        : undefined,  // No templates to connect if templateIds is not provided
                        }, 
                    include: {
                        author: true,
                        templates: true,
                        }
                });

                if (!created_blog) {
                    return res.status(403).json({ error: "Something went wrong creating the blog" });
                }

                return res.status(200).json(created_blog);

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
