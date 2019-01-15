const sinon = require('sinon')
const { expect } = require('chai')
const bodyParser = require('body-parser')
const supertest = require('supertest')
const express = require('express')
const jobRoute = require('../../../src/routes/jobs')
const kubeService = require('../../../src/services/kubeService')

describe('Jobs', () => {
    let request
    let app
    
    beforeEach(() => {
        app = createApp()
        jobRoute(app)
        request = supertest(app)
    })

    describe('GET', () => {
        let getJobsStub
        let getJobInfo 

        beforeEach(() => {
            sandbox = sinon.sandbox.create()
            getJobsStub = sandbox.stub(kubeService, 'getJobs')
            getJobInfo = sandbox.stub(kubeService, 'getJobInfo')
        })

        afterEach(() => {
            sandbox.restore()
        })

        it('invokes getJobs when called without a job name', async () => {
            let response = await request.get('/api/jobs')

            expect(response.statusCode).eq(200)
            expect(getJobsStub.calledOnce).true
        })

        it('invokes getJobInfo when called with a job name', async () => {
            let jobName = 'foo'
            let response = await request.get(`/api/jobs/${jobName}`)

            expect(response.statusCode).eq(200)
            expect(getJobInfo.calledOnce).true
            expect(getJobInfo.getCall(0).args[0]).eq(jobName)
        })
    })

    describe('POST', () => {
        beforeEach(() => {
            sandbox = sinon.sandbox.create()
            createJobStub = sandbox.stub(kubeService, 'createJob')
        })

        afterEach(() => {
            sandbox.restore()
        })

        it('invokes createJob with request body', async () => {
            let job = {
                jobName: 'foo'
            }
            let response = await request.post('/api/jobs').send(job)

            expect(response.statusCode).eq(200)
            expect(createJobStub.calledOnce).true
            expect(createJobStub.getCall(0).args[0].jobName).eq('foo')
        })

        it('returns error if input validation fails', async () => {
            let job = {
                jobName: ';',
                gitProject: '|'
            }

            let response = await request.post('/api/jobs').send(job)

            expect(response.statusCode).eq(400)
            expect(response.body.message).contains('jobName')
            expect(response.body.message).contains('gitProject')
        })
    })

    describe('DELETE', () => {
        beforeEach(() => {
            sandbox = sinon.sandbox.create()
            deleteJobStub = sandbox.stub(kubeService, 'deleteJob')
        })

        afterEach(() => {
            sandbox.restore()
        })

        it('invokes deleteJob with job name', async () => {
            let jobName = 'foo'
            let response = await request.delete(`/api/jobs/${jobName}`)

            expect(response.statusCode).eq(200)
            expect(deleteJobStub.calledOnce).true
            expect(deleteJobStub.getCall(0).args[0]).eq(jobName)
        })
    })

    describe('GET Logs', () => {
        beforeEach(() => {
            sandbox = sinon.sandbox.create()
            getLogsStub = sandbox.stub(kubeService, 'getLogs')
        })

        afterEach(() => {
            sandbox.restore()
        })

        it('invokes getLogs with job name', async () => {
            let jobName = 'foo'
            let logs = ['log1', 'log2', null, undefined]
            getLogsStub.returns(Promise.resolve(logs))
            let response = await request.get(`/api/jobs/logs/${jobName}`)

            expect(response.statusCode).eq(200)
            expect(getLogsStub.calledOnce).true
            expect(getLogsStub.getCall(0).args[0]).eq(jobName)
            expect(response.body).deep.eq(['log1', 'log2'])
        })
    })

    const createApp = () => {
        app = express()
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: false }));
        app.use(function (err, req, res, next) {
            res.status(err.status || 500)
            res.send({ "description": err.message, "errorCode": err.status })
        })
        return app
    }
})