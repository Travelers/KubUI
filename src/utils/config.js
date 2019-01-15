const config = require('kubernetes-client').config;

const getKubeConfig = () => {

    if (process.env.KUBE_CLUSTER_CONFIG_PATH) {
        return config.fromKubeconfig(process.env.KUBE_CLUSTER_CONFIG_PATH)
    } else {
        const clusterName = process.env.KUBE_CLUSTER_NAME
        const clusterServer = process.env.KUBE_CLUSTER_SERVER
        const clusterCertAuthorityData = process.env.KUBE_CLUSTER_CERTIFICATE_AUTHORITY_DATA
        const contextName = process.env.KUBE_CONTEXT_NAME
        const userName = process.env.KUBE_CLUSTER_USER_NAME
        const clientCertData = process.env.KUBE_CLUSTER_CLIENT_CERTIFICATE_DATA
        const clientKeyData = process.env.KUBE_CLUSTER_CLIENT_KEY_DATA

        return config.fromKubeconfig({
            apiVersion: 'v1',
            clusters: [{
                name: clusterName,
                cluster: {
                    server: clusterServer,
                    'certificate-authority-data': clusterCertAuthorityData
                }
            }],
            contexts: [{
                name: contextName,
                context: {
                    cluster: clusterName,
                    user: userName
                }
            }],
            'current-context': contextName,
            kind: 'Config',
            users: [{
                name: userName,
                user: {
                    'client-certificate-data': clientCertData,
                    'client-key-data': clientKeyData
                }
            }]
        })
    }
}

module.exports = { getKubeConfig }