import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
    console.log('Cookies: ', req.cookies); // Debug: log cookies
    const token = req.cookies.jwt;
    console.log('Token: ', token); // Debug: log token
  
    if (!token) {
        return res.status(401).send('Access Denied: No Token Provided!');
    }
    try {
        const verified = jwt.verify(token, 'secret_ecom');
        req.user = verified.user; // Ensure the user object contains the ID
        console.log('Verified User: ', req.user); // Debug: log the verified user
        next();
    } catch (err) {
        res.status(400).send('Invalid Token');
    }
};
