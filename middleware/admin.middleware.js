const adminMiddleware = async(req, res, next) => {
    try {
        if(req.user && req.user.vai_tro === "ADMIN") {
            next()
        } else {
            return res.status(403).json({error: "Truy cập bị cấm. Yêu cầu quyền ADMIN"});
        }
    } catch(err) {
        console.error("Lỗi nghiêm trọng tại adminMiddleware: ", err);
        res.status(500).json({error: "Lỗi máy chủ khi truy cập quyền ADMIN"});
    }
};

module.exports = adminMiddleware;