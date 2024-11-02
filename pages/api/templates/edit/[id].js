import prisma from "../../../../utils/db"
import { jwtMiddleware } from "../../middleware"

// PUT request logic for updating an already existing template (note that the user is going to be verified to do this)
const handler = async (req, res) => {

  // check if the incorrect method is being used
  if (req.method !== "PUT") {
    return res.status(405).json({error: "Method not allowed!"})
  }

  // extracting the fields from the json obj from the body of the request
  const { title, explanation, tags, codId} = req.body  // in our case we are extracting the info that the authenticateduser wants to update the template with
  const { id } = req.query // from the url query param

  // check if the template id is not provided
  if (!id) {
    return res.status(400).json({error: "The template ID is required"})
  }

  const existingTemplate = await prisma.template.findUnique({ where: {id: parseInt(id)} })

  try {
    
    // check if the existing template is found or if its authorized
    if (!existingTemplate) {
      return res.status(403).json({error: "Error! Template not found"})
    } else if (existingTemplate.ownierId !== req.user.id){
      return res.status(403).json({error: "Error! Unauthorized to edit template"})
    }

    // edit the current template
    const editedTemplate = await prisma.template.update({

      where: { id: parseInt(id) },
      data: { title, explanation, tags, codeId }

    })

    return res.status(200).json(editedTemplate)

    // handle the case wherre theres an error in trying to edit the template
  } catch(error){
    console.error("Something went wrong while trying to edit the template", error)
    return res.status(500).json({error: "Error, couldn't edit the template"})
  }


}

export default jwtMiddleware(handler) // checks if the user is authenticated
