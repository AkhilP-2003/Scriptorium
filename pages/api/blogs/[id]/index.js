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
            },
            include: {
                author: true,  // Include author information in the result
                comments: {
                    include: {
                        author: true, // Include comment author
                    }
                },
                templates:true,
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
            const {title, description, tags, templateIdsToAdd, templateIdsToRemove }= req.body; // fields to change.
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


            if (user.role !== "USER" && user.role !== "ADMIN") {
                return res.status(400).json({error: "You do not have permission to edit this blog"});
            }
            if (parseInt(user.id) !== parseInt(existingPost.authorId)) {
                return res.status(400).json({error: "You are now the owner so you do not have permission to edit this blog"});
            }

            if (existingPost.hidden === true) {
                // can't edit, because flagged, even if u r the author.
                return res.status(400).json({error: "You do not have permission to edit this blog because it is flagged"});
            }

            // prepare the data for updating
            const dataToUpdate = {
                title: title || existingPost.title,
                description: description || existingPost.description,
                tags: tags || existingPost.tags,
            };

            // handle adding/removing templates if provided
            if (templateIdsToAdd || templateIdsToRemove) {
                dataToUpdate.templates = {
                    ...(templateIdsToAdd && templateIdsToAdd.length > 0
                        ? { connect: templateIdsToAdd.map(id => ({ id: parseInt(id) })) } // Add templates
                        : {}),
                    ...(templateIdsToRemove && templateIdsToRemove.length > 0
                        ? { disconnect: templateIdsToRemove.map(id => ({ id: parseInt(id) })) } // Remove templates
                        : {}),
                };
            }

            try { // update the blog post
                const updatedBlog = await prisma.blogPost.update({
                    where: { id: currId },
                    data: dataToUpdate,
                    include: {
                        author: true,
                        templates: true, // incldue connected templates
                    }
                });

                if (!updatedBlog) {
                    return res.status(400).json({error: "Something went wrong in edting the blogpost"});
                }

                return res.status(200).json(updatedBlog);

            } catch(error) {
                console.log(error);
                return res.status(500).json({error: "something went wrong trying to update the blog"})
            }
        

            // const updatedBlog = await prisma.blogPost.update({
            //     where: { id: currId },
            //     data: {
            //         title: title || existingPost.title,
            //         description: description || existingPost.description,
            //         tags: tags || existingPost.tags,
            //         templates: {
            //             connect: templateIdsToAdd ? templateIdsToAdd.map(id => ({ id: parseInt(id) })) : [],  // Add templates
            //             disconnect: templateIdsToRemove ? templateIdsToRemove.map(id => ({ id: parseInt(id) })) : []  // Remove templates
            //         },
            //     },
            // });
        

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
                await prisma.$transaction ( async function (prisma){
                    // Delete the blogpost by id, making sure the user.id (current user's id)
                    // is equal to the blogposts author id.
    
                    //  delete the comments on deletion of this blogpost too.
                    await prisma.comment.deleteMany({
                        where: { blogId: currId },
                    });

                    // Delete abuse reports related to the blog post
                    await prisma.abuseReport.deleteMany({
                        where: {
                            OR: [
                                { blogId: currId }, // Abuse reports on the blog itself
                                { comment: { blogId: currId } }, // Abuse reports on comments attached to the blog
                            ],
                        },
                    });
                    // check that the deletion is deletion from user's blogpost
                    
                    const deletedPost = await prisma.blogPost.delete({
                        where: { id: currId },
                    });
                    
                    if (!deletedPost) {
                        return res.status(400).json({error: "something went wrong with deletion"})
                    }
                    return res.status(200).json({
                    message: `Blogpost ${currId} deleted successfully`
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


