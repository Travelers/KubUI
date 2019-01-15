const express = require('express')
const router = express.Router()
const kubeService = require('../services/kubeService')
const helpers = require('../utils/helpers')
const { handler } = require('../middleware')

module.exports = (app) => {
    app.use('/api/jobs', router)

    router.get('/:jobName?', handler(async (req, res) => {
        let jobName = req.params.jobName

        if (jobName) {
            res.json(await kubeService.getJobInfo(jobName))
        } else {
            res.json(await kubeService.getJobs())
        }
    }))

    router.post('/', handler(async (req, res) => {
        let jobSpec = req.body
        let validationResult = helpers.validateJobSpec(jobSpec)
        if (!validationResult.isValid)
            throw new ValidationError(validationResult.errors)

        res.json(await kubeService.createJob(jobSpec))
    }))

    router.delete('/:jobName', handler(async (req, res) => {
        res.json(await kubeService.deleteJob(req.params.jobName))
    }))

    router.get('/logs/:jobName', handler(async (req, res) => {
        let logs = await kubeService.getLogs(req.params.jobName)
        res.json(helpers.mapLogEntries(logs))
    }))
}

class ValidationError extends Error {
    constructor(errors) {
        super(errors.map(err => err.message).join('; '))
        this.statusCode = 400
        Error.captureStackTrace(this, ValidationError)
    }
}