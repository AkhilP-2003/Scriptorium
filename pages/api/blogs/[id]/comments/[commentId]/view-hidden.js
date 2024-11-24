import prisma from "../../../../../../utils/db"
import { jwtMiddleware } from "../../../../middleware"

const handler = async (req, res) => {

  const { commentId } = req.query // extract comment ID from the URL

  // check if comment ID is not given in the url
  if (!commentId) {
    return res.status(400).json({ error: "Comment ID is required" })
  }

  // make sure this is a get request
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {

    // get the hidden comment that the author wants to view

    const hiddenComment = await prisma.comment.findUnique({
      where: { id: parseInt(commentId) },
      include: { abuseReports: true }            // Include abuse reports to notify the author
    })

    // xheck if the comment exists
    if (!hiddenComment) {
      return res.status(404).json({ error: "Comment not found" })
    }

    // ensure that the logged-in user is the author of the comment
    if (hiddenComment.authorId !== req.user.id) {
      return res.status(403).json({ error: "You are not authorized to view this comment" })
    }

    // return the hidden comment with a notification message
    return res.status(200).json({
      message: "This comment has been flagged as inappropriate by an administrator.",
      comment: hiddenComment
    })

  } catch (error) {
    console.error("Error in viewing hidden comment", error);
    return res.status(400).json({ error: "Something went wrong in viewing the hidden comment" })
  }
}

// Wrap the GET request handler in jwtMiddleware to ensure only authenticated users can view their own hidden comments
export default jwtMiddleware(handler, ["USER", "ADMIN"])