

const asyncHandler = (fun) =>{
    return async(req, res, next) =>{
        try{
            await fun(req, res, next)

        }catch(error){
            console.error("detailed error: ", error)
            console.log("error details: ", {message: error.message, stack: error.stack})
            return res.status(500).json({
                message:'lỗi',
                error: process.env.NODE_ENV === 'development' ? error : undefined
            })
        }
    }

}
module.exports = asyncHandler;