const adminMiddleware = (req, res, next) => {
    try {
        if (req.user && req.user.vai_tro === 'ADMIN') {
            next();
        } else {
            return res.status(403).json({ error: 'Truy cập bị cấm. Yêu cầu quyền Admin.' });
        }

    } catch (err) {
        console.error('Lỗi nghiêm trọng tại adminMiddleware:', err);
        return res.status(500).json({ error: 'Lỗi máy chủ khi xác thực vai trò Admin' });
    }
};

module.exports = adminMiddleware;