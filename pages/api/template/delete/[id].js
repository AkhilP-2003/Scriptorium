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
  const existingTemplate = await prisma.template.findUnique({ where: { id: parseInt(id)} })

  //get the associated code with this template
  const associatedCode = await prisma.code.findUnique({where: {associatedTemplateId: parseInt(id)}}); 

  // check if the template is not found
  if (!existingTemplate){
    return res.status(403).json({ error: "Template not found"})
  } else if (existingTemplate.ownerId !== req.user.id) {                                 // check if the wrong user is accessing the template
    return res.status(403).json({ error: "Unauthorized to delete template"})
  } else if (!associatedCode){
    return res.status(403).json({error: "Could not find associated code with this template"});
  }

  try {

    // check if the template being deleted is a parent template to other forked templates
    const forkedTemplates = await prisma.template.findMany({
      where: { parentTemplateId: parseInt(id)}
    })

    // get the total num of templates that have forked the parent template
    const numForked = forkedTemplates.length

    // update forked templates to remove their dependency (i.e th e isForked and parenttemplateid attr are adjusted) on the deleted template
    if (numForked > 0) {
      await prisma.template.updateMany({
        where: { parentTemplateId: parseInt(id) },
        data: {
          parentTemplateId: null,
          isForked: false,
        },
      })
    }

    // find the template associated with the id given and delete it 
    await prisma.code.delete({where: { id: associatedCode.id}});
    await prisma.template.delete({ where: { id: parseInt(id) } })
    return res.status(200).json({ msg: "Your template and its code has been deleted!"})

    // handle any errors that may occur
  } catch (error) {
    console.error("Something went wrong in trying to delete your template", error)
    return res.status(400).json( {error: "Could not delete your template"})
  }

}

export default jwtMiddleware(handler, ["USER", "ADMIN"]) // checks if the user is authenticated