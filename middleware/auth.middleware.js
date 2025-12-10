const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET;

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ error: 'Không tìm thấy Token (Unauthorized)' });
        }
        const token = authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Token không đúng định dạng (Malformed)' });
        }

        const decodedPayload = jwt.verify(token, SECRET_KEY);
        req.user = decodedPayload;
        next();

    } catch (err) {
        return res.status(401).json({ error: 'Token không hợp lệ hoặc đã hết hạn' });
    }
};

module.exports = authMiddleware;