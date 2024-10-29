// get/delete/update this blog with this id
import { prisma } from "@/prisma/client";

async function handler(req, res) {
    if (req.method === "GET") {
        // get a specific blog by id
        const {id} = req.query;

        if (!id) {
            return res.status(400).json({error: "Please provide blog to select"});
        }

        const blog = await prisma.blogpost.findUnique({
            where: {
                ...(id && { id: parseInt(id) }),  // Filter by ID
            },
            include: {
                author: true,  // Include author information in the result
                comments: true,
                templates:true,
                title: true,
                description:true,
                tags: true,
                upvote: true,
                downvote: true
            },
        })
        return res.status(200).json(blog);

    } else if (req.method === "POST" || req.method === "PUT") {
        return jwtMiddleware(async (req, res) => {
            const {id} = req.query;
            const {title, description, tags, templates, authorId, comments} = req.body;
            const {user} = req;
            // a user can only edit this blog if they are the author.
            // what about making a comment?
            // my thinking is they can make a comment here. but they can't be a visitor.
            if (!id) {
                return res.status(400).json({error: "Please provide blog to edit."});
            }
            // check whether or not the current blog id's author is this person
            if (!authorId || !title || !description || !tags) {
                return res.status(400).json({error: "Please provide fields for new edit"});
            }

            const existingPost = await prisma.blogpost.findUnique({
                where: { id: id },
              });

            if (user.id !== parseInt(existingPost.authorId)) {
                return res.status(400).json({error: "You do not have permission to edit this blog"});
            }

            // Update the blog
            const updatedBlog = await prisma.book.update({
                where: { id: parseInt(id) },  // Find the book by ID
                data: {
                ...(title && { title }),  // Update title if provided
                ...(description && { description }),  // Update isbn if provided
                ...(tags && {tags}),  // Update publishedDate if provided
                }, // still need to finish
            });

        
            return res.status(200).json(updatedBlog);

        })(req, res);

    } else if (req.method === "DELETE") {

        return jwtMiddleware(async (req, res) => {
            

        })(req, res);

    } else {
        return res.status(400).json({error: "Invalid Method"})
    }


}

export default jwtMiddleware(handler, ["USER"]);


