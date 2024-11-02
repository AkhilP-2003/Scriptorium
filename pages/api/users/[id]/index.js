// get/ POST - update my own account if current user is me.
import { prisma } from "../../../../prisma/client";
import { jwtMiddleware } from "../../middleware";

async function handler(req, res) {


    if (req.method === "GET") {
        const {id} = req.query;
        if (!id) {
            return res.status(400).json({error: "User Id is not provided"});
        }

        const userId = parseInt(id);

        try {
            const existingUser = await prisma.user.findUnique({
                where: {
                    id: userId,
                },
                include: {
                    blogPosts: true,
                    savedTemplates: true,
                }

            });

            if (!existingUser) {
                return res.status(400).json({error: "User is not found"});
            }
            return res.status(200).json(existingUser);

        } catch(error) {
            console.error(error);
            return res.status(500).json({error: "Something went wrong trying to get this user"});
        }


    } else if (req.method === "POST" || req.method === "PUT") {

        return jwtMiddleware(async (req, res) => {

            const {id} = req.query;
            const {firstName, lastName, userName, avatar, phoneNumber, email, role } = req.body;
            const {user} = req;
            if (!id) {
                return res.status(400).json({error: "User Id is not provided"});
            }

            const userId = parseInt(id);
            const id_from_auth = parseInt(user.id);
            const existingUser = await prisma.user.findUnique({
                where: {
                    id: userId,
                }

            });

            if (!existingUser) {
                return res.status(400).json({error: "User is not found"});
            }

            if (existingUser.id !== user.id)
                return res.status(400).json({error: `${id_from_auth} ${existingUser.id} You do not have permission to edit this user's profile`});

            if (user.role !== "USER" && user.role !== "ADMIN") {
                return res.status(400).json({error: "You do not have authorization to edit this user's profile"});
            }

            try {
                if (userName.trim() === "" || firstName.trim() === "" || lastName.trim() === "" || avatar.trim() === "" || email.trim() === "" || role.trim === "") {
                    return res.status(400).json({error: "Please make valid edits"});
                }

                if (role !== "USER" && role !== "ADMIN") {
                    return res.status(400).json({error: "role accepts USER or ADMIN"});
                }

                // Check if the username or email already exists (if they are being updated)
                if (userName) {
                    const existingUserName = await prisma.user.findUnique({
                        where: { userName }
                    });
                    if (existingUserName && existingUserName.id !== id_from_auth) {
                        return res.status(400).json({ error: "Username is already taken" });
                    }
                }

                if (email) {
                    const existingEmail = await prisma.user.findUnique({
                        where: { email }
                    });
                    if (existingEmail && existingEmail.id !== id_from_auth) {
                        return res.status(400).json({ error: "Email is already in use" });
                    }
                }

                if (phoneNumber) {
                    const existingNumer = await prisma.user.findUnique({
                        where: { phoneNumber }
                    });
                    if (existingNumer && existingNumer.id !== id_from_auth) {
                        return res.status(400).json({ error: "Phone Number is already in use" });
                    }
                }
                const updatedProfile = await prisma.user.update({
                    where: {
                        id: userId, // Ensures we are updating the correct user
                    },
                    data: {
                        firstName: firstName || undefined, // undefined tells prisma not to change the field is not provided.
                        lastName: lastName || undefined,
                        userName: userName || undefined,
                        avatar: avatar || undefined,
                        phoneNumber: phoneNumber || undefined,
                        email: email || undefined,
                        role: role || undefined
                    },
                });
                return res.status(200).json({ message: "Profile updated successfully", updatedProfile });

                
            } catch(error) {
                console.error(error);
                return res.status(500).json({error: "Something went wrong trying to get this user"});
            }

        }, ["USER", "ADMIN"])(req, res); // can only get accounts for these two authenticated user types.



    } else {
        // idk maybe add funcionality for user deleitng thieur account.-> later.
        return res.status(400).json({error: "Method not allowed"});
    }


}

export default handler;


