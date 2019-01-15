import Vue from 'vue'
import DetailView from '../../public/components/DetailView.vue'
import { expect } from 'chai'
import axios from 'axios'
import sinon from 'sinon'

describe('DetailView', () => {    
    describe('data', () => {
        it('exposes a data function', () => {
            expect(typeof DetailView.data).to.eq('function')
        })
    })

    describe('loadJobData', () => {
        let vm
        let sandbox
        let axiosStub

        before(() => {
            sandbox = sinon.sandbox.create()
            axiosStub = sandbox.stub(axios, 'get')
        })

        after(() => {
            sandbox.restore()

        })
        beforeEach(() => {
            const Constructor = Vue.extend(DetailView)
            vm = new Constructor()
        })

        it('calls api to retrieve job data by job name', async () => {
            const routeParams = {
                jobName: 'Job1'
            }

            const jobInfo = {
                data: {
                    jobName: 'Job1',
                    imageName: 'docker-image'
                }
            }

            axiosStub.returns(Promise.resolve(jobInfo))
            const job = await vm.loadJobData(routeParams)

            expect(axiosStub.getCall(0).args[0]).eq(`/api/jobs/${routeParams.jobName}`)
            expect(vm.jobInfo).contains(jobInfo.data.imageName)
        })
    })
})