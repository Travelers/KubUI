
import Vue from 'vue'
import ListView from '../../public/components/ListView.vue'
import { expect } from 'chai'
import axios from 'axios'
import sinon from 'sinon'

describe('ListView', () => {
    let vm
    let sandbox
    let axiosStub

    before(() => {
        sandbox = sinon.sandbox.create()
        axiosStub = sandbox.stub(axios, 'get')

        const Constructor = Vue.extend(ListView)
        vm = new Constructor()
    })

    after(() => {
        sandbox.restore()
    })

    describe('data', () => {
        it('exposes a data function', () => {
            expect(typeof ListView.data).to.eq('function')
        })
    })

    describe('setJobs', async () => {
        it('sets jobs to one job when one job is returned', (done) => {
            let jobsResponse = [
                { "name": "job1", "startTime": "2018-06-19T17:42:00Z", "completionTime": "2018-06-21T17:42:36Z", "image": "docker/keras:0.3", "status": "Completed" },
                { "name": "job2", "startTime": "2018-06-20T17:15:01Z", "completionTime": "2018-06-22T18:15:01Z", "image": "my-image", "status": "Failed" },
                { "name": "job3", "startTime": "2018-06-20T17:15:00Z", "image": "my-image-2", "status": "Pending" }
            ]

            axiosStub.returns(Promise.resolve({ data: jobsResponse }))

            vm.fetchJobs()
                .then(() => {
                    let job = vm.jobs[0]
                    expect(job.name).eq('job2')
                    expect(job.startTime).eq('6/20/2018 1:15:01 PM')
                    expect(job.completionTime).eq('6/22/2018 2:15:01 PM')
                    expect(job.image).eq('my-image')
                    expect(job.status).eq('Failed')
                   
                    job = vm.jobs[1]
                    expect(job.name).eq('job3')
                    expect(job.startTime).eq('6/20/2018 1:15:00 PM')
                    expect(job.completionTime).eq('')
                    expect(job.image).eq('my-image-2')
                    expect(job.status).eq('Pending')
                   
                    job = vm.jobs[2]
                    expect(job.name).eq('job1')
                    expect(job.startTime).eq('6/19/2018 1:42:00 PM')
                    expect(job.completionTime).eq('6/21/2018 1:42:36 PM')
                    expect(job.image).eq('docker/keras:0.3')
                    expect(job.status).eq('Completed')

                    done()
                })
        })
    })
})