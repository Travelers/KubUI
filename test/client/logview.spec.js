import Vue from 'vue'
import LogView from '../../public/components/LogView.vue'
import { expect } from 'chai'
import axios from 'axios'
import sinon from 'sinon'

describe('LogView', () => {    
    describe('data', () => {
        it('exposes a data function', () => {
            expect(typeof LogView.data).to.eq('function')
        })
    })

    describe('loadLogData', () => {
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
          const Constructor = Vue.extend(LogView)
          vm = new Constructor()
          vm.$router = []
      })

      it('calls api to get log data by job name', async () => {
        const routeParams = {
          jobName: 'Job1'
        }
        const logEntries = ["log1", "log2"]

        axiosStub.returns(Promise.resolve({ data: logEntries }))
        await vm.loadLogData(routeParams)
        
        expect(axiosStub.calledOnce).true
        expect(axiosStub.getCall(0).args[0]).eq(`/api/jobs/logs/${vm.jobName}`)
        expect(vm.logs).deep.eq(logEntries)
      })
    })
})