import { prisma } from "../../../prisma/client";
import { jwtMiddleware } from "@/pages/api/middleware";  // Import the JWT middleware

export default async function handler(req, res) {
    //ONLY ADMINS CAN DELETE ABUSE REPORTS
    const { method } = req;
    const { id } = req.body;

    if (!id) {
        return res.status(400).json({ message: 'Please provide all fields!' });
    }

    // Only allow DELETE requests
    if (method !== 'DELETE') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    return jwtMiddleware(async (req, res) => {
        const { user } = req;

        if (!user) {
            return res.status(403).json({ error: "User is not authenticated." });
        }

        try {
            // Validate the existence of the abuse report
            const abuseReport = await prisma.abuseReport.findUnique({
                where: { id: parseInt(id) },
            });

            if (!abuseReport) {
                return res.status(404).json({ error: "Abuse report not found." });
            }

            // Delete the abuse report
            await prisma.abuseReport.delete({
                where: { id: parseInt(id) },
            });

            return res.status(200).json({ message: "Abuse report deleted successfully." });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "An error occurred while deleting the abuse report." });
        }
    }, ["ADMIN"])(req, res);
}
