const { expect } = require('chai')
const helpers = require('../../../src/utils/helpers')
const { EOL } = require('os')

describe('helpers', () => {
    describe('getPodsForJob', () => {
        it('returns empty array when no pods found', () => {
            let pods = helpers.getPodsForJob('foo', [])
            expect(pods).to.be.an('array').that.is.empty
        })

        it('returns array containing one pod matching job name', () => {
            let jobPods = helpers.getPodsForJob('job1', [{ metadata: { labels: { 'job-name': 'job1' }}}])
            expect(jobPods).to.be.an('array').to.have.lengthOf(1)
            expect(jobPods[0].metadata.labels['job-name']).to.eq('job1')
        })

        it('returns array containing multiple pods matching job name', () => {
            let pods = [
                {
                    metadata:
                    {
                        labels: {
                            'job-name': 'job1'
                        }
                    }
                }, {
                    metadata:
                    {
                        labels: {
                            'job-name': 'job2'
                        }
                    }
                }]
            let jobPods = helpers.getPodsForJob('job1', pods)
            expect(jobPods).to.be.an('array').to.have.lengthOf(1)
            expect(jobPods[0].metadata.labels['job-name']).to.eq('job1')
        })
    }),

    describe('buildJobSpec', () => {
        let template

        before(async () => {
            template = {
                metadata: {
                    name: null,
                    namespace: null
                },
                spec: { 
                    template: {
                        spec: {
                            containers: [{
                                name: null,
                                image: null,
                                env: [{
                                    name: 'GITTOKEN',
                                    valueFrom: {
                                        secretKeyRef: {
                                            name: ""
                                        }
                                    }
                                }],
                                resources:{
                                    requests: {
                                        "nvidia.com/gpu": null
                                    },
                                    limits: {
                                        "nvidia.com/gpu": null
                                    }
                                },
                                args: []
                            }],
                            volumes: []
                        }
                    }
                }

            }
        })

        after(() => {
            delete process.env.GIT_TOKEN_NAME
        })

        it('builds job spec', () => {
            let spec = {
                jobName: 'Foo',
                imageName: 'https://my-image',
                requiredCPU: '1',
                requiredGPU: '2',
                gitProject: 'https://github/my-org/my-git-repo.git',
                inputDirectory: 'input-data',
                modelDirectory: 'model',
                outputDirectory: 'output-data',
                runCommand: 'do.sh'
            }

            process.env.GIT_TOKEN_NAME = 'my-token-name'

            let jobSpec = helpers.buildJobSpec(template, spec)
            expect(jobSpec.metadata.name).eq(spec.jobName.toLowerCase())
            expect(jobSpec.metadata.namespace).eq('default')

            let container = jobSpec.spec.template.spec.containers[0]
            expect(container.name).eq(spec.jobName.toLowerCase())
            expect(container.image).eq(spec.imageName)
            expect(container.env[0].valueFrom.secretKeyRef.name).eq('my-token-name')
            expect(container.resources.requests["nvidia.com/gpu"]).eq(spec.requiredGPU)
            expect(container.resources.limits["nvidia.com/gpu"]).eq(spec.requiredGPU)
            expect(container.args).be.lengthOf(2)
            expect(container.args[0]).eq('-c')

            let expectedCommandArg = "\
git -c http.sslVerify=false \
clone https://$GITTOKEN@github/my-org/my-git-repo.git || { echo \"git clone command failed.\"; exit 1; };\
mkdir -p ./my-git-repo/data || { echo \"mkdir (data) command failed.\"; exit 1; };\
cp -r /data/input-data ./my-git-repo/data || { echo \"copy input data command failed.\"; exit 1; };\
cd my-git-repo || { echo \"cd command failed.\"; exit 1; };\
sh ./do.sh || { echo \"sh command failed.\"; exit 1; };\
mkdir -p /data/my-git-repo/foo/output-data || { echo \"mkdir (output) command failed.\"; exit 1; };\
if [ -d model ]; then cp -r model /data/my-git-repo/foo/output-data || { echo \"copy output data command failed.\"; exit 1; }; fi;\
exit 0;"
            
            expect(container.args[1]).eq(expectedCommandArg)
            expect(jobSpec.spec.template.spec.volumes).to.be.an('array').lengthOf(1)
            expect(jobSpec.spec.template.spec.volumes[0].name).eq('code')
            expect(jobSpec.spec.template.spec.volumes[0].hostPath.path).eq('/tmp/foo')
        })        
    })

    describe('mapLogEntries', () => {
        it('returns empty array when no logs exist', () => {
            let mappedLogs = helpers.mapLogEntries([])
            expect(mappedLogs).to.be.an('array').to.have.lengthOf(0)
        })

        it('returns array with one log when logs exist with no new lines', () => {
            let mappedLogs = helpers.mapLogEntries([
                "single log entry"
            ])

            expect(mappedLogs).to.be.an('array').to.have.lengthOf(1)
            expect(mappedLogs[0]).eq("single log entry")
        })

        it('returns array with 2 log entries when one log exists with a single newline', () => {
            let mappedLogs = helpers.mapLogEntries([
                `line 1${EOL}line 2`
            ])

            expect(mappedLogs).to.be.an('array').to.have.lengthOf(2)
            expect(mappedLogs[0]).eq("line 1")
            expect(mappedLogs[1]).eq("line 2")
        })

        it('returns empty array when no logs exist', () => {            
            expect(helpers.mapLogEntries(null)).to.be.an('array').to.have.lengthOf(0)            
        })

        it('ignores undefined logs', () => {
            let mappedLogs = helpers.mapLogEntries([undefined, "foo"])
            expect(mappedLogs).to.be.an('array').to.have.lengthOf(1)            
            expect(mappedLogs[0]).eq('foo')

        })

        it('when log is object appends message to output', () => {
            let mappedLogs = helpers.mapLogEntries([{
                status: "Failed",
                message: "an error occurred"
            }])
            expect(mappedLogs[0]).eq("an error occurred")
        })
    })

    describe('getContainerStatus', () => {
        it('when job is Pending returns Pending status object', () => {
            let pod = {
                status: {
                    phase: "Pending",
                    conditions: [
                        { 
                            reason: "Unschedulable",
                            message: "0/2 nodes are available: 2 Insufficient nvidia.com/gpu."
                        }
                    ]
                }
            }

            let podStatus = helpers.getContainerStatus(pod)
            expect(podStatus.status).eq('Pending')
            expect(podStatus.message).eq('0/2 nodes are available: 2 Insufficient nvidia.com/gpu.')
        })

        it('when job is Failed returns Failed status object', () => {
            let pod = {
                status: {
                    phase: "Failed",
                    containerStatuses: [{ 
                            state: {
                                terminated: {
                                    reason: "ContainerCannotRun",
                                    message: "OCI runtime create failed."
                                }
                            }
                        }
                    ]
                }
            }

            let podStatus = helpers.getContainerStatus(pod)
            expect(podStatus.status).eq('Failed')
            expect(podStatus.message).eq("OCI runtime create failed.")
        })

        it('when job is Completed returns Completed status object', () => {
            let pod = {
                status: {
                    phase: "Succeeded",
                    containerStatuses: [{ 
                            state: {
                                terminated: {
                                    reason: undefined,
                                    message: "Completed"
                                }
                            }
                        }
                    ]
                }
            }

            let podStatus = helpers.getContainerStatus(pod)
            expect(podStatus.status).eq("Succeeded")
            expect(podStatus.message).eq("Completed")
        })

        it('when job is Running returns Running status object', () => {
            let pod = {
                status: {
                    phase: "Running",
                    containerStatuses: [{ 
                            state: {
                                running: {
                                    startedAt: "2018-08-02T15:14:18Z"
                                }
                            }
                        }
                    ]
                }
            }

            let podStatus = helpers.getContainerStatus(pod)
            expect(podStatus.status).eq("Running")
            expect(podStatus.message).eq("Running")
        })
        
        it('when job is Waiting returns Waiting status object', () => {
            let pod = {
                status: {
                    phase: "Waiting",
                    containerStatuses: [{ 
                            state: {
                                waiting: {}
                            }
                        }
                    ]
                }
            }

            let podStatus = helpers.getContainerStatus(pod)
            expect(podStatus.status).eq("Waiting")
            expect(podStatus.message).eq("Waiting")
        })

        it('returns static text when pod does not exist', () => {
            expect(helpers.getContainerStatus(null).message).eq('No pods exist for current job.')
        })
    })

    describe('validateJobSpec', () => {
        it('rejects black-listed characters for job spec parameters', () => {
            const BLACKLISTED_CHARS = [';', '&', '|', '"', '&', '\'']
            let spec = {
                jobName: null,
                gitProject: null,
                inputDirectory: null,
                modelDirectory: null,
                outputDirectory: null,
                runCommand: null
            }
            
            BLACKLISTED_CHARS.forEach(char => {
                let specKeys = Object.keys(spec)
                specKeys.forEach(key => {
                    spec[key] = char
                })
                
                let result = helpers.validateJobSpec(spec)
    
                expect(result.isValid).false
                expect(result.errors.length).eq(specKeys.length)
                specKeys.forEach(key => {
                    let msg = result.errors.find(error => {
                        return error.message === `${key} contains one or more invalid characters.`
                    })
                    expect(msg).not.null
                })
            })
        })
    })
})
