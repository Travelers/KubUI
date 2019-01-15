require('dotenv').load()
const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const middleware = require('./middleware')
const app = express()
const port = process.env.PORT || 3000

if (!process.env.DISABLE_AUTH || process.env.DISABLE_AUTH === "0") {
    console.log('Enabling authentication.')
    app.use(middleware.auth.basic({
        userId: process.env.USER_ID,
        password: process.env.PASSWORD,
        realm: process.env.REALM
    }))
}

app.use(express.static(path.join(__dirname, '../dist')))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }));

require('./routes/jobs')(app)

app.use('/health', (req, res, next) => {
    res.status(200).send({ status: 'Running' })
})

app.listen(port)

console.log('Listening on port ' + port)