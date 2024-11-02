import { prisma } from "../../../prisma/client";
import {jwtMiddleware} from "@/pages/api/middleware";  // Import the JWT middleware

export default async function handler(req, res){
    //GET allowed only for admin
    if (req.method !== 'GET'){
        return res.status(405).json({ message: 'Method not allowed' });
    }

    return jwtMiddleware(async (req, res) => {
        //
        const {page = 1, limit = 10} = req.query;
        const {user} = req;


        const currentPage = parseInt(page)
        const pageSize = parseInt(limit)

        if (!user) {
            return res.status(403).json({ error: "User is not authenticated." });
        }

        try { 
        const blogs = await prisma.blogPost.findMany({
            include: {
                abuseReports: {
                    where: {
                        status: 'OPEN' //ONLY COUNT OPEN REPORTS
                    }
                }
            },
            orderBy: {
                abuseReports: {
                    _count: 'desc', // Sort by the count of abuse reports
                },
            },
            skip: (currentPage - 1) * pageSize,
            take: pageSize       
        });

        const comments = await prisma.comment.findMany({
            include: {
                abuseReports: {
                    where: {
                        status: 'OPEN' //ONLY COUNT OPEN REPORTS
                    }
                }
            },
            orderBy: {
                abuseReports: {
                    _count: 'desc', // Sort by the count of abuse reports
                },
            },
            skip: (currentPage - 1) * pageSize,
            take: pageSize       
        });


        return res.status(200).json({blogs, comments});
    } catch (error){
        console.error(error);
        return res.status(500).json({error: "An error occured while fetching abuse reports"});
    }
    },["ADMIN"])(req, res);
    
    
}