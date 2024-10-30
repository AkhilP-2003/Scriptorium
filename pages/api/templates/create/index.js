import prisma from "../../../../utils/db"
import { jwtMiddleware } from "../../middleware"

// POST request logic for creating a new template as an authanticated user
const handler = async (req, res) => {


  // check if the method being 
  if (req.method !== "POST"){
    return res.status(405).json({error: "Method not allowed"})
  }

    // extracting the fields from the json obj from the body of the request
  const { title, explanation, tags, codeId} = req.body

  // check if all the required fields are provided
  if (!title || !explanation || !tags || !codeId) {
    return res.status(400).json({error: "Missing required fields"})
  }

  try {

    // create a new template with the required fields in our db
    const newTemplate = await prisma.template.create({
      date: {
        title,
        explanation,
        tags,
        codeId,
        ownderId: req.user.id    // the user ID is verified via JWt auth
      }
    })

    // return the new template thats been created
    return res.status(201).json(newTemplate)

  // handle the case where something goes wrong while trying to create a template
  } catch (error) {
    console.error("Something went wrong in creating a new template", error)
    return res.status(500).json({error: "Failed to create a new template"})
  }
}

export default jwtMiddleware(handler) // checks if the user is authenticated


// NOTE TO PAGINATE THE LIST OF TEMPLATES LATER