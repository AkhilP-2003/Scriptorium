import prisma from "../../../../utils/db"
import { jwtMiddleware } from "../../middleware"
import { executeCode } from "../../../../utils/executeCode"

// PUT request logic for updating an already existing template (note that the user is going to be verified to do this)
const handler = async (req, res) => {

  console.log("Request received with method:", req.method);

  // check if the incorrect method is being used
  if (req.method !== "PUT") {
    console.log("Incorrect HTTP method");
    return res.status(405).json({error: "Method not allowed!"});
  }

  // extracting the fields from the json obj from the body of the request
  const { title, explanation, tags, code, language, input } = req.body;
  const { id } = req.query;

  console.log("Request body:", req.body);
  console.log("Request query params (id):", id);

  // check if the template id is not provided
  if (!id) {
    console.log("Template ID not provided");
    return res.status(400).json({error: "The template ID is required"});
  }

  try {
    // Find the existing template
    const existingTemplate = await prisma.template.findUnique({ where: { id: parseInt(id) } });
    const associatedCode = await prisma.code.findUnique({ where: { associatedTemplateId: parseInt(id) } });

    console.log("Existing template:", existingTemplate);
    console.log("Associated code:", associatedCode);

    // check if the existing template is found or if it's authorized
    if (!existingTemplate) {
      console.log("Template not found");
      return res.status(403).json({error: "Error! Template not found"});
    } else if (existingTemplate.ownerId !== req.user.id) {
      console.log("User unauthorized to edit template");
      return res.status(403).json({error: "Error! Unauthorized to edit template"});
    }

    // edit the current template
    const updateData = {
      ...(title && { title }),
      ...(explanation && { explanation }),
      ...(tags && { tags }),
      ...(associatedCode && { codeId: associatedCode.id })
    };

    console.log("Update data before updating:", updateData);

    // Check if code updates are provided, then add nested update for code
    if (code || language || input) {
      console.log("Updating code fields");

      let newCode = associatedCode?.code, 
          newLanguage = associatedCode?.language, 
          newInput = associatedCode?.input;

      if (code) {
        newCode = code;
      }
      if (language) {
        newLanguage = language;
      }
      if (input) {
        newInput = input;
      }

      console.log("New code:", newCode, "New language:", newLanguage, "New input:", newInput);

      const { output, error } = await executeCode(newCode, newLanguage, newInput.toString());
      updateData.code = {
        update: {
          ...(code && { code }),
          ...(language && { language }),
          ...(input && { input }),
          output,
          error,
        },
      };
    }

    console.log("Final update data:", updateData);

    // Perform the update
    const editedTemplate = await prisma.template.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    console.log("Successfully updated template:", editedTemplate);
    return res.status(200).json(editedTemplate);

  } catch (error) {
    console.error("Something went wrong while trying to edit the template", error);
    return res.status(400).json({error: "Error, couldn't edit the template", details: error.message});
  }
};

export default jwtMiddleware(handler, ["USER", "ADMIN"]); // checks if the user is authenticated
