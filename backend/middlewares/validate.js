const validate = (requestType) => {
    return (req, res, next) => {
        const { error } = requestType.validate(req.body); //distructuring an object,
        if (error) {
           return res.status(400).json({
           message: "lỗi khi thêm sản phầm",
           error: error.details[0].message,
           });
        }
        next();
    }
}
module.exports = validate;