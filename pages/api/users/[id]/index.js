// get/ POST - update my own account if current user is me.
import { prisma } from "../../../../prisma/client";
import { hashPassword } from "../../../../utils/auth";
import { jwtMiddleware } from "../../middleware";

async function handler(req, res) {


    if (req.method === "GET") {
        const {id} = req.query;
        if (!id) {
            return res.status(400).json({error: "User Id is not provided"});
        }

        const userId = parseInt(id);
        // can't see hidden blog posts no matter what. even is the user is me. hidden ones are only avaialbe in view-hdiden
        try {
            const existingUser = await prisma.user.findUnique({
                where: {
                    id: userId,
                },
                include: {
                    blogPosts: {where: {hidden: false}},
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
            const {firstName, lastName, userName, avatar, phoneNumber, email, role, password } = req.body;
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

                if (role) {
                    if (role !== "USER" && role !== "ADMIN") {
                        return res.status(400).json({error: "role accepts USER or ADMIN"});
                    }
                }
                if (firstName) {
                    if (firstName.trim === "") {
                        return res.status(400).json({error: "please intput a first name"});
                    }
                }

                if (lastName) {
                    if (lastName.trim === "") {
                        return res.status(400).json({error: "please intput a last name"});
                    }
                }

                // Check if the username or email already exists (if they are being updated)
                if (userName) {
                    if (userName.trim() === "") {
                        return res.status(400).json({ error: "Provide valid username" });
                    }
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
                    var validator = require("email-validator"); // email validator
                    if (!validator.validate(email)) {
                        return res.status(400).json({ error: "Provide valid email" });
                    }
                }

                if (phoneNumber) {
                    const existingNumer = await prisma.user.findUnique({
                        where: { phoneNumber }
                    });
                    if (existingNumer && existingNumer.id !== id_from_auth) {
                        return res.status(400).json({ error: "Phone Number is already in use" });
                    }

                    let phoneNumberToCheck = phoneNumber && isValidPhoneNumber(phoneNumber) ? phoneNumber : null;

                    if (phoneNumber && !isValidPhoneNumber(phoneNumber)) {
                        // is phone num exists and is not valid
                        return res.status(400).json({ error: 'Invalid phone number' });
                    }
                }

                if (password) {
                    if (password.length < 7 || password.length > 20) {
                        return res.status(400).json({ error: "Provide valid password" });
                    }
                    var hashedPassword = await hashPassword(password);
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
                        role: role || undefined,
                        password: hashedPassword || undefined
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

const isValidPhoneNumber = (phone) => {
    const phoneRegex = /^[0-9]{10}$/; // phone num
    return phoneRegex.test(phone);
};

export default handler;


