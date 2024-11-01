import prisma from "../../../utils/db"

// handle the logic related to viewing and searching for templates (for both visitors and users)

export default async function handler(req, res) {

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowedd"})
  }

  try {


    // artifically create the page and limit for pagination (can make changes to it later)
    const { filterBy, page = 1, limit = 10 } = req.query

    const currentPage = parseInt(page)
    const pageSize = parseInt(limit)

    let templates

    // if the user/visitor provides what they want to filter by
    if (filterBy) {

      // run a search and get all the templates based on what filters they provided from the query
      templates = await prisma.template.findMany({    // note findMany handles the edge case where filterBY is invalid 
                                                      // (it returns an empty array meaning no templayes matched the filter)
        where: {

          OR: [
    
            { title: { contains: filterBy, mode: "insensitive" } },     //mode is insensitive to ignore case sensitive wording provided by the user/vistr
            { tags: { contains: filterBy, mode: "insensitive" } },

          ],

        },
        skip: (currentPage - 1) * pageSize,         // calculate the number of items to skip and which item to actually start from on the page
        take: pageSize                             // the number of items to return in a page (the items to get)
      })

    } else {

      // get all of the templates availible
      templates = await prisma.template.findMany({
        skip: (currentPage - 1) * pageSize,    // calculate the number of items to skip and which item to actually start from on the page         
        take: pageSize                         // the number of items to return in a page (the items to get)
      })
    }

    // return the templates that are either filtered or not
    return res.status(200).json({
      templates,
      currentPage,
      pageSize
    });

    // handle the case if we couldnt get the templates for any reason whatsoever
  } catch (error) {
    console.error("Somethign went wrong in getting the templates")
    return res.status(500).json( {error: "Somethign went wrong in getting the templates"})
  }

}
