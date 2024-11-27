import prisma from "../../../utils/db";

// get request logic for viewing a selected template

export default async function handler(req, res) {

    // only allow GET requests to this endpoint
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" })
    }
  
    try {
      const { id } = req.query
  
      // fetch the template from the database using Prisma
      const template = await prisma.template.findUnique({
        where: {
          id: parseInt(id),  // parse id to an integer
        },
        include: {
          owner: {
            select: {
              id: true,
              userName: true
            }
          },
          code: true,
          blogPosts: {
            select: {
              id: true,
              title: true,
              author: {
                select: {
                  userName: true
                }
              },
            }
          }
        }
      })
      
      // check if the template was found
      if (!template) {
        return res.status(404).json({ error: "Template not found" })
      }
  
      return res.status(200).json({
        template: {
          id: template.id || null,
          title: template.title || "",
          explanation: template.explanation || "",
          tags: template.tags || "",
          owner: {
            id: template.owner?.id || null,
            userName: template.owner?.userName || "",
          },
          code: template.code
          ? {
              id: template.code.id || null,
              code: template.code.code || "",
              language: template.code.language || "",
              input: template.code.input || "",
              output: template.code.output || "",
              error: template.code.error || ""
            }
          : null,
          blogPosts: template.blogPosts || [],
          parentTemplateId: template.parentTemplateId || null,
          parentOwnerName: template.parentOwnerName || null
        }
      })
    } catch (error) {
      console.error("Error fetching template:", error)
      return res.status(400).json({ error: "Internal Server Error" })
    }
  }