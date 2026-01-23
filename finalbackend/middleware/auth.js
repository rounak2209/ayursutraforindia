import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export const auth = (req, res, next) => {
  const h = req.headers.authorization;
  if (!h || !h.startsWith('Bearer ')) return res.status(401).json({ message: 'No token' });
  const token = h.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // contains id and role
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// role middleware: pass single role or array
export const permit = (roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'No user' });
  const allowed = Array.isArray(roles) ? roles : [roles];
  if (!allowed.includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' });
  next();
};
