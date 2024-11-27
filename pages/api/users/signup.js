import { prisma } from "../../../prisma/client";
import { hashPassword } from "../../../utils/auth";


export default async function handler(req, res) {
    if (req.method === "POST") {
        var validator = require("email-validator"); // email validator
        // signup logic: create access + refresh token, save user to db using bcrypt
        const {firstName, lastName, userName, avatar="", email, password, phoneNumber, role="USER"} = req.body;
        // default role us USER
        // validation checks
        if (!firstName || !lastName || !userName || !password || !email) {
            // i made phone number a default of empty string, not necessary to input
            return res.status(400).json({error: `Please provide all required fields`});
        }

        // incorrect password length
        if (password.length < 7 || password.length > 20) {
            return res.status(400).json({error: "Password length must be at least 7 but less than or equal to 20"});
        }
        // incorrect password email
        if (!validator.validate(email)) {
            return res.status(400).json({error: "Please provide a valid email"});
        }
        let phoneNumberToCheck = phoneNumber && isValidPhoneNumber(phoneNumber) ? phoneNumber : null;

        if (role !== "USER" && role !== "ADMIN") {
            return res.status(400).json({error: "role is USER or ADMIN"});
        }

        if (phoneNumber && !isValidPhoneNumber(phoneNumber)) {
            // is phone num exists and is not valid
            return res.status(400).json({ error: 'Invalid phone number' });
        }
        // check if user already exists in db
        const userExists = await prisma.user.findFirst({
            where: {
                OR: [
                    {userName: userName},
                    {email: email},
                    ...(phoneNumberToCheck ? [{ phoneNumber: phoneNumberToCheck }] : []) // Only check if phone is provided

                ]
            }
        });

        if (userExists) {
            return res.status(400).json({error:"Invalid credentials"});
        }

        const user = await prisma.user.create({
            data: {
                firstName, lastName, userName, avatar, email, phoneNumber: phoneNumberToCheck, role, password: await hashPassword(password)
            },
            select: {
                id: true, firstName: true, lastName: true, email: true, userName: true, role:true, phoneNumber:true
            }
        });

        return res.status(200).json({user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            userName: user.userName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role
        } });
    
    } else {
        // another method type
        return res.status(400).json({error: "Invalid Method"});
    }

}

const isValidPhoneNumber = (phone) => {
    const phoneRegex = /^[0-9]{10}$/; // phone num
    return phoneRegex.test(phone);
};
