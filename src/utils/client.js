const Client = require('kubernetes-client').Client;
const config = require('./config')

const api = new Client({
    config: config.getKubeConfig(),
    version: '1.9'
}).api;

const namespace = process.env.KUBE_NAMESPACE || 'default'

module.exports = {
    batch: api.batch.v1.namespaces(namespace),
    api: api.v1.namespaces(namespace)
}
