import Vue from 'vue'
import CreateView from '../../public/components/CreateView.vue'
import { expect } from 'chai'
import axios from 'axios'
import sinon from 'sinon'

describe('CreateView', () => {    
    describe('data', () => {
        it('exposes a data function', () => {
            expect(typeof CreateView.data).to.eq('function')
        })
    })

    describe('createJob', () => {
        let vm
        let sandbox
        let axiosStub

        before(() => {
            sandbox = sinon.sandbox.create()
            axiosStub = sandbox.stub(axios, 'post')
        })

        after(() => {
            sandbox.restore()

        })
        beforeEach(() => {
            const Constructor = Vue.extend(CreateView)
            vm = new Constructor()
            vm.$router = []
        })

        it('creates errors when required fields are empty', async () => {
            await vm.createJob()

            expect(vm.errors.length).eq(5)
            expect(vm.errors).to.include("'jobName' is required.")
            expect(vm.errors).to.include("'imageName' is required.")
            expect(vm.errors).to.include("'gitProject' is required.")
            expect(vm.errors).to.include("'runCommand' is required.")
            expect(vm.errors).to.include("'inputDirectory' is required.")
        })

        it('submits job spec when inputs are valid', async () => {
            vm.spec.jobName = 'job1'
            vm.spec.imageName = 'image-name'
            vm.spec.gitProject = 'http://git-project'
            vm.spec.runCommand = 'run.sh'
            vm.spec.inputDirectory = 'in_dir'

            axiosStub.returns(Promise.resolve())

            await vm.createJob()
            
            expect(axiosStub.calledOnce).true
            expect(axiosStub.getCall(0).args[0]).eq('/api/jobs')
            expect(axiosStub.getCall(0).args[1]).deep.equal(vm.spec)
            expect(vm.$router[0].name).eq('listView')
        })
    })
})