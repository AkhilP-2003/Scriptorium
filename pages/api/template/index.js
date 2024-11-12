import prisma from "../../../utils/db"

// handle the logic related to viewing and searching for templates (for both visitors and users)

export default async function handler(req, res) {

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowedd"})
  }

  try {


    // artifically create the page and limit for pagination (can make changes to it later) and also extract the filters if provided
    const { title, tags, page = 1, limit = 10 } = req.query;

    const currentPage = parseInt(page)
    const pageSize = parseInt(limit)

    // initialize a dict that we're later gonna update if there are filters that the user wants to go thru via the query
    let filterHolder ={}

    // check if a title(s) filter is provided
    if (title) {

      // add the title filter to the filter holder
      filterHolder.title = {
        contains: title,
      }
    }

    // check if a tag(s) filter was provided
    if (tags) {

      // add it to the filter holder
      filterHolder.tags = {
        contains: tags,
      }
    }

    // run a search and get all the templates based on what filters they provided from the query
    const templates = await prisma.template.findMany({                            // note findMany handles the edge case where a filter is invalid 
      where: filterHolder,                                                        // (it returns an empty array meaning no templayes matched the filter)
      skip: (currentPage - 1) * pageSize,                   // calculate the number of items to skip and which item to actually start from on the page
      take: pageSize                                        // the number of items to return in a page (the items to get)
    })
    
    return res.status(200).json({templates, currentPage, pageSize})

    // handle the case if we couldnt get the templates for any reason whatsoever
  } catch (error) {
    console.error("Somethign went wrong in getting the templates")
    return res.status(500).json( {error: "Somethign went wrong in getting the templates"})
  }

}