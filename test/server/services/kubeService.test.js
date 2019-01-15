const sinon = require('sinon')
const { expect } = require('chai')
const kubeService = require('../../../src/services/kubeService')
const client = require('../../../src/utils/client')

describe('kubeService', () => {
    describe('getJobs', () => {
        let sandbox
        let getJobsStub
        let getPodsStub

        beforeEach(() => {
            sandbox = sinon.sandbox.create()
            getJobsStub = sandbox.stub()
            getPodsStub = sandbox.stub()
            sandbox.stub(client, 'batch').value({
                jobs: {
                    get: getJobsStub
                }
            })
            sandbox.stub(client, 'api').value({
                pods: {
                    get: getPodsStub
                }
            })
        })

        afterEach(() => {
            sandbox.restore()
        })

        it('returns empty array when no jobs exist', async () => {
            let jobs = getMock([])
            getJobsStub.returns(Promise.resolve(jobs))

            let result = await kubeService.getJobs()

            expect(result).empty

        })

        it('returns job details with no pods', async () => {
            let jobs = getMock([{
                status: {
                    active: 0,
                    startTime: 'then',
                    completionTime: 'now',
                    succeeded: 1
                },
                metadata: {
                    name: 'Job1'
                },
                spec: {
                    template: {
                        spec: {
                            containers: [{
                                image: 'docker-image'
                            }]
                        }
                    }
                }
            }])
            getJobsStub.returns(Promise.resolve(jobs))

            let job = (await kubeService.getJobs())[0]

            expect(job.name).eq('Job1')
            expect(job.startTime).eq('then')
            expect(job.completionTime).eq('now')
            expect(job.image).eq('docker-image')
            expect(job.status).eq('Completed')
        })

        it('returns job details with for job with one active pod', async () => {
            let jobs = getMock([{
                status: {
                    active: 1,
                    startTime: 'then',
                    completionTime: 'now'
                },
                metadata: {
                    name: 'Job1'
                },
                spec: {
                    template: {
                        spec: {
                            containers: [{
                                image: 'docker-image'
                            }]
                        }
                    }
                }
            }])
            getJobsStub.returns(Promise.resolve(jobs))

            let pods = getMock([
                {
                    metadata: {
                        labels: {
                            'job-name': 'Job1'
                        }
                    },
                    status: {
                        phase: 'Pending',
                        conditions: [{
                            message: 'Pod is pending'
                        }]
                    }
                }
            ])
            getPodsStub.returns(Promise.resolve(pods))

            let job = (await kubeService.getJobs())[0]

            expect(job.name).eq('Job1')
            expect(job.startTime).eq('then')
            expect(job.completionTime).eq('now')
            expect(job.image).eq('docker-image')
            expect(job.status).eq('Pending')
        })
    })

    describe('getJobInfo', () => {
        let sandbox
        let jobsStub
        let getStub

        beforeEach(() => {
            sandbox = sinon.sandbox.create()
            jobsStub = sandbox.stub()
            getStub = sandbox.stub()

            sandbox.stub(client, 'batch').value({
                jobs: jobsStub
            })

            jobsStub.returns({ 
                get: getStub
            })
        })

        afterEach(() => {
            sandbox.restore()
        })

        it('invokes jobs.get by job name', async () => {
            let jobName = 'Job1'
            getStub.returns(Promise.resolve({ body: { metadata: { name: jobName } } } ) )

            let job = await kubeService.getJobInfo(jobName)

            expect(job.body.metadata.name).eq(jobName)
            expect(jobsStub.getCall(0).args[0]).eq(jobName)
            expect(getStub.calledOnce).true
        })
    })

    xdescribe('getLogs', () => {
        let sandbox
        let clientStub
        let podsStub
        let getPodsStub
        let getLogsStub

        beforeEach(() => {
            sandbox = sinon.sandbox.create()
            getPodsStub = sandbox.stub()
            podsStub = sandbox.stub()
            getLogsStub = sandbox.stub()
            
            podsStub.value({ get: getPodsStub })
            podsStub.returns({
                log: {
                    get: getLogsStub
                }
            })

            clientStub = sandbox.stub(client, 'api').value(podsStub)
        })

        afterEach(() => {
            sandbox.restore()
        })

        it('retrieves all pod logs by job name', async () => {
            let jobName = 'Job1'
            getPodsStub.returns(getMock([
                {
                    metadata: {
                        labels: {
                            'job-name': jobName
                        }
                    },
                }
            ]))

            let logs = await kubeService.getLogs(jobName)

            expect(podsStub.getCall(0).args[0]).eq(jobName)
            expect(getPodsStub.calledOnce).true

        })

    })


    describe('createJob', () => {
        let sandbox
        let postStub

        beforeEach(() => {
            sandbox = sinon.sandbox.create()
            postStub = sandbox.stub()
            sandbox.stub(client, 'batch').value({
                jobs: {
                    post: postStub
                }
            })
        })

        afterEach(() => {
            sandbox.restore()
        })

        it('should invoke client post API with proper job spec', async () => {
            let spec = {
                jobName: 'Job1',
                gitProject: 'https://mygitrepo.git',
                imageName: 'docker_image_name'
            }
            
            await kubeService.createJob(spec)

            expect(postStub.calledOnce).true

            let postArg = postStub.getCall(0).args[0]
            expect(postArg.body.metadata.name).eq(spec.jobName.toLowerCase())            
            expect(postArg.body.spec.template.spec.containers[0].image).eq(spec.imageName)
            expect(postArg.body.spec.template.spec.containers[0].args[1]).contains('https://$GITTOKEN@mygitrepo.git')
        })
    })

    const getMock = (items) => {
        return {
            body: {
                items: items
            }
        }
    }
})
