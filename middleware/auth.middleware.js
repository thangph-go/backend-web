const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.JWT_SECRET;

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if(!authHeader) {
            return res.status(401).json({error: "Không tìm thấy token"});
        }

        const token = authHeader.split(" ")[1];

        const decodePayLoad = jwt.verify(token, SECRET_KEY);

        req.user = decodePayLoad;
        next();
    } catch(err) {
        return res.status(401).json({ error: "Token không hợp lệ hoặc đã hết hạn"});
    }
};

module.exports = authMiddleware;