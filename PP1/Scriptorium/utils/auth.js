import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const BCRYPT_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS);
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const JWT_ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN;

export async function hashPassword(password) { //for signup
    return await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
}

export async function comparePassword(pass1, hashPass) { // for login
    return await bcrypt.compare(pass1, hashPass);
}

export function generateAccessToken(payload) { // after certain expiration time
    return jwt.sign(payload, JWT_ACCESS_SECRET, 
        {expiresIn:JWT_ACCESS_EXPIRES_IN});

}

export function generateRefreshToken(payload) { //usually at login
    return jwt.sign(payload, JWT_REFRESH_SECRET, 
        {expiresIn:JWT_REFRESH_EXPIRES_IN});
}

export function verifyAccessToken(token) {
    if (!token?.startsWith("Bearer ")) {
        return null;
    }
    token = token.split(" ")[1]; // get the access token
    // verify access token
    try {
        return jwt.verify(token, JWT_ACCESS_SECRET);
    } catch(error) {
        return null;
    }
}


export function verifyRefreshToken(token) { // if not expired, 
    // we can use this to not log in again, until the expiration.
    // verify refresh token
    try {
        return jwt.verify(token, JWT_REFRESH_SECRET);
    } catch(error) {
        return null;
    }
}
