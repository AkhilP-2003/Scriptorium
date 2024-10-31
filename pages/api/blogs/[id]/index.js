// get/delete/update this blog with this id
import { prisma } from "../../../../prisma/client";
import {jwtMiddleware} from "@/pages/api/middleware";  // Import the JWT middleware


async function handler(req, res) {
    if (req.method === "GET") {
        // get a specific blog by id
        const {id} = req.query;

        if (!id) {
            return res.status(400).json({error: "Please provide blog to select"});
        }
        const currId = parseInt(id);
        // here also rate blogs by upvote/downvote


        const blog = await prisma.blogPost.findUnique({
            where: {
                ...(id && { id: currId }),  // Filter by ID
                hidden: false, // don't report the hidden ones.
            },
            include: {
                author: true,  // Include author information in the result
                comments: {
                    include: {
                        author: true, // Include comment author
                        content: true,
                        upvote: true,
                        downvote: true,
                    }
                },
                templates:true,
                title: true,
                description:true,
                tags: true,
                upvote: true,
                downvote: true
            },
        })

        if (!blog) {
            return res.status(404).json({ error: "Blog post not found because it doesn't exist or is hidden" });
        }  

        return res.status(200).json(blog);

    } else if (req.method === "POST" || req.method === "PUT") {
        // this is edit this blog with this id.

        return jwtMiddleware(async (req, res) => {
            const {id} = req.query; // id of blog to change.
            const {title, description, tags, templates} = req.body; // fields to change.
            const {user} = req; // to check for auth.


            // a user can only edit this blog if they are the author.

            if (!id) {
                return res.status(400).json({error: "Please provide blog to edit."});
            }
            // check whether or not the current blog id's author is this person
            // if (!authorId || !title || !description || !tags) {
            //     return res.status(400).json({error: "Please provide fields for new edit"});
            // }

            const currId = parseInt(id);
            const existingPost = await prisma.blogPost.findUnique({
                where: { id: currId },
              });

            if (!existingPost) {
                return res.status(400).json({error: "Blog to edit does not exist"});
            }

            if (user.role === "USER" || user.role === "ADMIN") {
                if (parseInt(user.id) !== parseInt(existingPost.authorId)) {
                    return res.status(400).json({error: "You do not have permission to edit this blog"});
                }

                if (existingPost.hidden === true) {
                    // can't edit, because flagged.
                    return res.status(400).json({error: "You do not have permission to edit this blog because it is flagged"});
                }
    
                // update the blog post
                // make sure if the blog is not hidden, then u can edit. if so, u cant.
                const updatedBlog = await prisma.blogPost.update({
                    where: { id: currId },
                    data: {
                        title: title || existingPost.title,
                        description: description || existingPost.description,
                        tags: tags || existingPost.tags,
                        templates: {
                            set: templates ? templates.map((templateId) => ({ id: templateId })) : [], // Update templates
                        },
                    },
                });
            } else {
                return res.status(400).json({error: "You do not have permission to edit this blog"});
            }
    

        
            return res.status(200).json(updatedBlog);

        }, ["ADMIN", "USER"])(req, res);

    } else if (req.method === "DELETE") {

        return jwtMiddleware(async (req, res) => {
            // want to delete the blog with this id.
            const { id } = req.query;
            const {user} = req;
            if (!id) {
                return res.status(400).json({error: "Please provide blog to delete."});
            }
            const currId = parseInt(id);

            const existingBlog = await prisma.blogPost.findUnique({
                where: {id: currId},

            });

            if (!existingBlog) {
                return res.status(400).json({error: "Blog does not exist"});
            }
            
            if (parseInt(user.id) !== parseInt(existingBlog.authorId)) {
                return res.status(400).json({error: "You do not have permission to delete this blog"});
            }

            try{ 
                await prisma.$transaction ( function (prisma){
                    // Delete the blogpost by id, making sure the user.id (current user's id)
                    // is equal to the blogposts author id.
    
                    //  delete the comments on deletion of this blogpost too.
                    prisma.comment.deleteMany({
                        where: { blogId: currId },
                    });

                    // Delete abuse reports related to the blog post
                    prisma.abuseReport.deleteMany({
                        where: {
                            OR: [
                                { blogId: currId }, // Abuse reports on the blog itself
                                { comment: { blogId: currId } }, // Abuse reports on comments attached to the blog
                            ],
                        },
                    });
                    
                    const deletedPost = prisma.blogPost.delete({
                        where: { id: currId },
                    });
            
                    return res.status(200).json({
                    message: `Blogpost deleted successfully`,
                    deletedPost,
                    });
                }); 
            } catch(error){
                console.error(error);
                return res.status(500).json({error: "Something went wrong in deletion of this blog"})
            }

            
        
        }, ["ADMIN", "USER"])(req, res);

    } else {
        return res.status(400).json({error: "Invalid Method"})
    }


}

export default handler;


