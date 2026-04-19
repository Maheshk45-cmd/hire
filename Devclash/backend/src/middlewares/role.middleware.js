import User from "../models/user.model.js";

export const roleMiddleware = (allowedRoles) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized. Token verification required." });
    }

    try {
      // Fetch fresh data from DB to avoid stale JWT token roles
      const user = await User.findById(req.user.id);
      
      if (!user) {
        return res.status(404).json({ error: "Linked user account no longer exists." });
      }

      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({ 
          error: `Forbidden. Your role (${user.role}) is not authorized to perform this action.` 
        });
      }

      // Update the request with fresh data
      req.user.role = user.role;
      req.user.companyId = user.companyId;

      next();
    } catch (error) {
      res.status(500).json({ error: "Error validating permissions." });
    }
  };
};
