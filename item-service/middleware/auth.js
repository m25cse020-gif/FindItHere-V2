// --- ITEM-SERVICE/MIDDLEWARE/AUTH.JS ---
const axios = require('axios');

// Yeh naya 'auth' gatekeeper hai
// Yeh khud token check nahi karega, yeh Auth-Service se poochega
async function auth(req, res, next) {
  const token = req.header('x-auth-token');
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    // 1. Auth-Service (jo port 5001 par hai) ko call karein
    const response = await axios.get('http://auth-service:5001/api/auth/verify-token', {
      headers: { 'x-auth-token': token }
    });

    // 2. Agar token sahi hai, toh 'auth-service' user ki info bhejega
    req.user = response.data; // { id: '...', role: 'admin' }
    next();
  } catch (err) {
    // Agar 'auth-service' ne error bheja (jaise token invalid)
    res.status(401).json({ msg: 'Token is not valid' });
  }
}

// Admin middleware waise hi kaam karega
function admin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Access denied. Not an admin.' });
  }
  next();
}

module.exports = { auth, admin };