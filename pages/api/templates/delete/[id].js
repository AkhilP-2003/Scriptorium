import prisma from "../../../../utils/db"
import { jwtMiddleware } from "../../middleware"

//DELETE request logic for deleting a template 
const handler = async (req, res) => {

  // check if the delete method is the one thats being called
  if (req.method !== "DELETE") {
    return res.status(405).json({error: "Method not allowed"})
  }
  
  // getting the id of the template via the query
  const { id } = req.query

  // check if the id is not filled in
  if (!id) {
    return res.status(400).json({error: "Template ID is required"})
  }

  // get the template associated with the id 
  existingTemplate = await prisma.template.findUNique({ where: { id: parseInt(id)} })

  // check if the template is not found
  if (!template){
    return res.status(403).json({ error: "Template not found"})
  } else if (template.ownerId !== req.user.id) {                                 // check if the wrong user is accessing the template
    return res.status(403).json({ error: "Unauthorized to delete template"})
  }

  try {

    // find the template associated with the id given and delete it 
    await prisma.template.delete({ where: { id: parseInt(id) } })
    return res.status(200).json({ msg: "Your template has been deleted"})

    // handle any errors that may occur
  } catch (error) {
    console.error("Something went wrong in trying to delete your template", error)
    return res.status(500).json( {error: "Could not delete your template"})
  }

}

export default jwtMiddleware(handler) // checks if the user is authenticated