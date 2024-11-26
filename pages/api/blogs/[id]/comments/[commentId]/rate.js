import { prisma } from "../../../../../../prisma/client"
import { jwtMiddleware } from "../../../../middleware"


const handler = async (req, res) => {

  const { commentId } = req.query

  //check if the comment Id is provided from the url
  if (!commentId) {
    return res.status(400).json({ error: "Error, no comment ID"})
  }

  // ensure that this is a post request
  if (req.method === "POST"){

    // check if the user is unauthorized
    if (!req.user || !req.user.id) {

      return res.status(401).json({ error: "Unauthorized! Please login or create an an account to rate a comment"})

    }

    try {

      // get the "vote action" from the request body
      const { voteAction } = req.body

      // check if the vote action is provided
      if (!voteAction) {

        return res.status(400).json({ error: "Error, please specify an action"} )

        // check if they specified either upvote or downvote action
      } else if (voteAction !== "upvote" && voteAction !== "downvote"){

        return res.status(400).json({ error: "Error, please specify either 'upvote' or 'downvote'"})

      }

      // get the comment that the user wants to vote on
      const votingComment = await prisma.comment.findUnique({

        where: { id: parseInt(commentId) }

      })

      // check if the comment exists 
      if (!votingComment) {

        return res.status(404).json( {error: "Please provide an exisiting comment" })

      }

      // add the vote action to the comment and edit the vote count of the comment
      const votedComment = await prisma.comment.update({

        // find the comment in our db
        where: { id: parseInt(commentId) },
        
        data: {

          upvote: voteAction === "upvote" ? votingComment.upvote + 1 : votingComment.upvote,            // update the value for votes
          downvote: voteAction === "downvote" ? votingComment.downvote + 1 : votingComment.downvote

        }

      })

      // return the new comment with the vote action applied
      return res.status(200).json({ message: `Comment ${voteAction}d successfully`, votedComment })

      // handle if any errors occurs
    } catch (error) {

      console.error("Error, couldn't rate the comment", error)
      return res.status(400).json({ error: "Something went wrong is ratign the comment"})

    }

  } else {

    // if we reached this point, it isnt a post request
    return res.status(405).json({ error: "Method not allowed"})
  }

}

export default jwtMiddleware(handler, ["USER", "ADMIN"])  // esnures authenticated users can upvote/downote a comment