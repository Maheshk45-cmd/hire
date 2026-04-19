import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  try {
    const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({ error: "Unauthorized. Token missing." });
    }

    const secret = process.env.JWT_SECRET || "default_fallback_secret_123";
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    
    next();
  } catch (error) {
    res.status(401).json({ error: "Unauthorized. Invalid Token." });
  }
};
