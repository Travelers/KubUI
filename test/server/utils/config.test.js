const { expect } = require('chai')
const sinon = require('sinon')
const config = require('../../../src/utils/config')
const kubeClientConfig = require('kubernetes-client').config;

describe('config', () => {
    let sandbox

    beforeEach(() => {
        sandbox = sinon.sandbox.create()
    })

    afterEach(() => {
        sandbox.restore()
    })

    describe('getKubeConfig', () => {
        let kubeConfigStub
        
        beforeEach(() => {
            kubeConfigStub = sandbox.stub(kubeClientConfig, 'fromKubeconfig')
        })

        afterEach(() => {
            delete process.env.KUBE_CLUSTER_CONFIG_PATH
            delete process.env.KUBE_CLUSTER_NAME
            delete process.env.KUBE_CLUSTER_SERVER
            delete process.env.KUBE_CLUSTER_CERTIFICATE_AUTHORITY_DATA
            delete process.env.KUBE_CONTEXT_NAME
            delete process.env.KUBE_CLUSTER_USER_NAME
            delete process.env.KUBE_CLUSTER_CLIENT_CERTIFICATE_DATA
            delete process.env.KUBE_CLUSTER_CLIENT_KEY_DATA
        })

        it('is instantiated with file path when file env var is set', () => {
            const CONFIG_PATH = '/some/path'
            process.env.KUBE_CLUSTER_CONFIG_PATH = CONFIG_PATH

            config.getKubeConfig()

            expect(kubeConfigStub.calledOnce).true
            expect(kubeConfigStub.getCall(0).args[0]).eq(CONFIG_PATH)
        })

        it('is instantiated with config object when file env var is not set', () => {
            process.env.KUBE_CLUSTER_NAME = 'cluster-name'
            process.env.KUBE_CLUSTER_SERVER = 'server'
            process.env.KUBE_CLUSTER_CERTIFICATE_AUTHORITY_DATA = 'cert-auth-data'
            process.env.KUBE_CONTEXT_NAME = 'context-name'
            process.env.KUBE_CLUSTER_USER_NAME = 'cluster-username'
            process.env.KUBE_CLUSTER_CLIENT_CERTIFICATE_DATA = 'cluster-client-cert-data'
            process.env.KUBE_CLUSTER_CLIENT_KEY_DATA = 'client-key-data'

            delete process.env.KUBE_CLUSTER_CONFIG_PATH

            config.getKubeConfig()

            const arg = kubeConfigStub.getCall(0).args[0]
            expect(arg.apiVersion).eq('v1')
            expect(arg.clusters[0].name).eq('cluster-name')
            expect(arg.clusters[0].cluster.server).eq('server')
            expect(arg.clusters[0].cluster['certificate-authority-data']).eq('cert-auth-data')

            expect(arg.contexts[0].name).eq('context-name')
            expect(arg.contexts[0].context.cluster).eq('cluster-name')
            expect(arg.contexts[0].context.user).eq('cluster-username')
            expect(arg.kind).eq('Config')
            expect(arg.users[0].name).eq('cluster-username')
            expect(arg.users[0].user['client-certificate-data']).eq('cluster-client-cert-data')
            expect(arg.users[0].user['client-key-data']).eq('client-key-data')
        })
    })
})