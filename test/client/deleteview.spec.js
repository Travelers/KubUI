import Vue from 'vue'
import DeleteView from '../../public/components/DeleteView.vue'
import { expect } from 'chai'
import axios from 'axios'
import sinon from 'sinon'

describe('DeleteView', () => {
    describe('data', () => {
        it('exposes a data function', () => {
            expect(typeof DeleteView.data).to.eq('function')
        })
    })

    describe('deleteJobData', () => {
        let vm
        let sandbox
        let axiosStub

        before(() => {
            sandbox = sinon.sandbox.create()
            axiosStub = sandbox.stub(axios, 'delete')
        })

        after(() => {
            sandbox.restore()
        })
        beforeEach(() => {
            const Constructor = Vue.extend(DeleteView)
            vm = new Constructor()
            vm.$router = []
        })

        it('calls api to delete job data by job name', async () => {
            vm.jobName = 'Job1'

            axiosStub.returns(Promise.resolve())
            await vm.deleteJob()

            expect(axiosStub.calledOnce).true
            expect(axiosStub.getCall(0).args[0]).eq(`/api/jobs/${vm.jobName}`)
            expect(vm.$router[0].name).eq('listView')
        })
    })
})