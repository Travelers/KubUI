
const basic = (options) => {
    return (req, res, next) => {
        let b64auth = (req.headers.authorization || '').split(' ')[1] || ''
        let [userId, password] = Buffer.from(b64auth, 'base64').toString().split(':')
        if (!userId || !password || userId !== options.userId || password !== options.password) {
            res.set('WWW-Authenticate', `Basic realm="${options.realm}"`)
            res.status(401).send('Authentication required.')
            return
        }
        next()
    }
}

module.exports = { basic }