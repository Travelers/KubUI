module.exports = middleware => {
    return async (req, res, next) => {
        try {
            await middleware(req, res, next)
        } catch (err) {
            res.status(err.statusCode || 500).send({
                message: err.message
            })
            next(err)
        }
    }
}