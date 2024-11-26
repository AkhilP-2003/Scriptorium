import prisma from "../../../../../../utils/db"
import { jwtMiddleware } from "../../../../middleware"

const handler = async (req, res) => {

  const { commentId } = req.query

  // check if the comment id is not provided 
  if (!commentId) {
    return res.status(400).json({ error: "You must provide the comment ID"})
  }

  // check to make sure its a put request 
  if (req.method === "PUT") {

    // check if the user is authorized
    if (!req.user || !req.user.id || req.user.role !== "ADMIN") {
      return res.status(401).json({ error: "Unauthorized! Only admins can hide comments." });
    }

    try {

      // find the comment the admin wants to hide
      const suspectComment = await prisma.comment.findUnique({

        where: { id: parseInt(commentId) },
        include: { abuseReports: true}            // tells Prisma to retrieve all the abuseReports associated with the hiden comment

      })

      //check if the comment even exists
      if (!suspectComment) {
        return res.status(404).json( { error: "Error, flagged comment not found"})
      }

      // update the flagged comment to be hidden
      const flaggedComment = await prisma.comment.update({

        where: {
          id: parseInt(commentId),                      // get the comment that admin wants to hide
        },

        data: {
          hidden: true
        }

      })

      // close the abuse reports related to the flagge comment
      await prisma.abuseReport.updateMany({

        where: {
          commentId: parseInt(commentId),
          status: "OPEN"                   /// checks if abuse report is open
        },

        data: {
          status: "RESOLVED"
        }

      })

      // hiden the comment and return the hidden comment
      return res.status(200).json({ message: `Comment ${commentId} hidden successfully`, flaggedComment})

      //handle any errors
    } catch (error) {
      console.error("Error in hiding the flagged comment", error)
      return res.status(400).json({ error: "Somethign went wrong in hiding the flagged comment"})
    }

    // if we reach this point its not a put request
  } else {

    return res.status(405).json({ error: "Method not allowed"})

  }

}

export default jwtMiddleware(handler, ["ADMIN"]) // ensure only an ADMIn can hide a comment