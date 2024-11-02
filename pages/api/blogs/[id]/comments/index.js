import prisma from "../../../../../utils/db";
import { jwtMiddleware } from "../../../middleware";

// POST request logic for creating a new comment as an authenticated user and GET request logic for getting all the comments related to a blog post
const handler = async (req, res) => {

  const { id } = req.query // extract blog post ID from the URL

  // check if the blog ID is provided in the url
  if (!id) {
    return res.status(400).json({ error: "Blog post ID is required" })
  }

  if (req.method === "POST") {

    // check if the user is authenicated by seeing if req.user acctually exists and has an id 
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Unauthorized! Please login to comment" });
    }

    try {

      // get the text that the user wants to write in the comment
      const { content } = req.body

      // check if the user provides no content for the comment
      if (!content) {
        return res.status(400).json({ error: "Please provide content in your comment" })
      }

      // create a new comment and update the fields with the user's info in our db
      const newComment = await prisma.comment.create({

        data: {

          content,
          blogId: parseInt(id),                         // linking the comment to the specific blog post
          authorId: req.user.id,                      // the user ID is verified via JWT auth
          upvote: 0,
          downvote: 0,
          hidden: false

        }

      })

      // return the newly created comment
      return res.status(201).json({ message: "You made a comment!", newComment })

      // handle if something goes wrong for whatever reason
    } catch (error) {

      console.error("Error in creating your comment", error)                // log the error to see what actually went wrong

      return res.status(500).json({ error: "Something went wrong in creating your comment" })

    }

  } else if (req.method === "GET") {

    // manually set the page and limit #'s for pagination (can change it later)
    const { page = 1, limit = 10 } = req.query

    const currentPage = parseInt(page)
    const pageSize = parseInt(limit)

    try {

      // get the list of comments belonging to this blog post
      const comments = await prisma.comment.findMany({

        where: {

          blogId: parseInt(id),                     // get the comments related to this specific blog post that the user/visitor is looking at
          hidden: false                           // only show visible comments

        },

        skip: (currentPage - 1) * pageSize,                 // calculate the number of items to skip for pagination
        take: pageSize,                                   // limit the number of items per page

        orderBy: {
          upvote: "desc",                                   // order the comments based on upvotes
        },

        include: {
          author: true,                                     
        }

      })

      // returnt he list of comments
      return res.status(200).json({ comments, currentPage, pageSize })

      // handle if something goes worng in get requests
    } catch (error) {

      console.error("Error in getting all the comments", error)

      return res.status(500).json({ error: "Something went wrong in getting all the comments belonging to this blog post" })

    }

    // if we reach here then its not a get or a user authorizied post request
  } else {

    return res.status(405).json({ error: "Method not allowed" })

  }
}

// only wrap the POST request handler in jwtMiddleware
const handlerWithAuth = (req, res) => {
  if (req.method === "POST") {
    return jwtMiddleware(handler, ["USER", "ADMIN"])(req, res)  // uses currying here: jwtMiddleware returns a function that then takes in req and res as params (in other words, middleware checks if the user is authenticated and authorized, then returs a new function which takes in the req and res parameters to further continue with the request and makes sure only POST requests require authentication)
  }
  return handler(req, res)
}

export default handlerWithAuth