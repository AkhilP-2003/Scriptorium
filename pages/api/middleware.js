import { verifyAccessToken } from "../../utils/auth";

export function jwtMiddleware(handler, roles = []) {
    return async (req, res) =>  {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(403).json({ error: "You do not have authorization" });
        }
        const token = authHeader;

        try {
            const payload = verifyAccessToken(token);

            if (!payload) {
                return res.status(403).json({ error: "Invalid or expired token" });
            }

            req.user = payload;

            if (roles.length > 0 && !roles.includes(req.user.role)) {
                return res.status(403).json({error: "Invalid authorization"});
            }
            // call handler now that everything is ok. 
            return handler(req, res);

        } catch(error) {
            return res.status(403).json({error: "Token authorization failed"});
        }
    }
}
