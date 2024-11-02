import prisma from "../../../../utils/db"
import { jwtMiddleware } from "../../middleware"

// POST request logic for creating a new template as an authanticated user
const handler = async (req, res) => {


  // check if the method being 
  if (req.method !== "POST"){
    return res.status(405).json({error: "Method not allowed"})
  }

    // extracting the fields from the json obj from the body of the request           //NOTE WE GOTTA WORK ON EXTRACTING THE ACTUAL CODE
  const { title, explanation, tags, codeId, parentTemplateId} = req.body

  // check if all the required fields are provide
  if (!title || !explanation || !tags || !codeId) {
    return res.status(400).json({error: "Missing required fields"})
  }

  try {

    // initially set it to false so that we can change it to true once we verify if the parent template actually exists =
    let isForked = false

    // check if the parent template id was provided 
    if (parentTemplateId) {

      // check if the parent template id provided actually exists, then we try to find it in our db
      const parentTemplateExist = await prisma.template.findUnique({
        where: { id: parentTemplateId}
      })

      // check if the parent template id provided doesnt correspond to an exisiting template in our db
      if (!parentTemplateExist){
        return res.status(404).json({ error: "Parent tempate not found, try again"})
      }

      // if we reached this point we know that the parent template id provided exists and thus corresponds to a template in our db that the user is trying to fork so we set it to true 
      isForked = true

    }


    // create a new template with the required fields in our db
    const newTemplate = await prisma.template.create({
      data: {
        title,
        explanation,
        tags,
        codeId,
        ownerId: req.user.id,    // the user ID is verified via JWt auth
        isForked,
        parentTemplateId: parentTemplateId || null     // checks if parentTemplateId has a truthy value 
      }
    })

    // return the new template thats been created
    return res.status(201).json({
      template: newTemplate,
      message: isForked ? "Template successfully forked from an existing template" : "Your new template is ready"  // the notif that its a forked version
    });
    
  // handle the case where something goes wrong while trying to create a template
  } catch (error) {
    console.error("Something went wrong in creating a new template", error)
    return res.status(500).json({error: "Failed to create a new template"})
  }
}

export default jwtMiddleware(handler, ["USER", "ADMIN"]) // checks if the user is authenticated