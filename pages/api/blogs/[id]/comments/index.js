import prisma from "../../../../../utils/db";
import { jwtMiddleware } from "../../../middleware";

// POST request logic for creating a new comment (or a reply) as an authenticated user
// GET request logic for getting all the comments related to a blog post
const handler = async (req, res) => {
  const { id } = req.query; // extract blog post ID from the URL

  // check if the blog ID is provided in the url
  if (!id) {
    return res.status(400).json({ error: "Blog post ID is required" });
  }

  if (req.method === "POST") {
    // check if the user is authenticated by seeing if req.user actually exists and has an id
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Unauthorized! Please login to comment" });
    }

    try {
      // get the text that the user wants to write in the comment, and the parent comment ID if it's a reply
      const { content, parentId } = req.body;

      // check if the user provides no content for the comment
      if (!content) {
        return res.status(400).json({ error: "Please provide content in your comment" });
      }

      if (parentId) {
        // Optional: validate parentId (if a reply is being created)
        const parentComment = await prisma.comment.findUnique({
          where: { id: parentId },
        });

        if (!parentComment) {
          return res.status(400).json({ error: "Parent comment not found" });
        }
      }

      // create a new comment and update the fields with the user's info in our db
      const newComment = await prisma.comment.create({
        data: {
          content,
          blogId: parseInt(id), // linking the comment to the specific blog post
          authorId: req.user.id, // the user ID is verified via JWT auth
          parentId: parentId ? parseInt(parentId) : null, // if the comment is a reply, link it to the parent comment otherwise parentId is null
          upvote: 0,
          downvote: 0,
          hidden: false,
        },
      });

      // return the newly created comment
      return res.status(201).json({ message: "You made a comment!", newComment });
    } catch (error) {
      console.error("Error in creating your comment", error);
      return res.status(500).json({ error: "Something went wrong in creating your comment" });
    }
  } else if (req.method === "GET") {
    // manually set the page and limit #'s for pagination (can change it later)
    const { page = 1, limit = 10 } = req.query;

    const currentPage = parseInt(page);
    const pageSize = parseInt(limit);

    try {
      // get the list of comments belonging to this blog post
      const comments = await prisma.comment.findMany({
        where: {
          blogId: parseInt(id), // get the comments related to this specific blog post
          parentId: null, // only get top-level comments (not replies)
          hidden: false, // only get visible comments
        },
        skip: (currentPage - 1) * pageSize, // calculate the number of items to skip for pagination
        take: pageSize, // limit the number of items per page
        orderBy: {
          upvote: "desc", // order the comments based on upvotes
        },
        include: {
          author: true,
          replies: {
            include: {
              author: true,
            },
            orderBy: {
              createdAt: "asc", // show replies in ascending order by time (we can change this order if preferred)
            },
          },
        },
      });

      // return the list of comments
      return res.status(200).json({ comments, currentPage, pageSize });
    } catch (error) {
      console.error("Error in getting all the comments", error);
      return res.status(500).json({
        error: "Something went wrong in getting all the comments belonging to this blog post",
      });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
};

// only wrap the POST request handler in jwtMiddleware
const handlerWithAuth = (req, res) => {
  // make sure if its a post request, the user is authenticated and authorized
  if (req.method === "POST") {
    return jwtMiddleware(handler, ["USER", "ADMIN"])(req, res); // uses currying here (i.e,, jwtMiddleware returns a function that then takes in req and res as params
  }
  return handler(req, res);
};

export default handlerWithAuth;
