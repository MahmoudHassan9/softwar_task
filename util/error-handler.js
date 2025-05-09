function errorHandler(err,req,res,next){
    if (err) {
        res.status(500).json({
            message: err.message || "An unexpected error occurred.",
            error: err
        });
    } else {
        next();
    }
}
module.exports= errorHandler;