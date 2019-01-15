const client = require('../utils/client')
const helpers = require('../utils/helpers')

const getJobs = async () => {
    let jobs = await client.batch.jobs.get()
    let podInfoCalls = []
    jobs.body.items.forEach(job => {
        if (job.status.active) {
            podInfoCalls.push(getPodsByJobName(job.metadata.name))
        }
    })

    let podResults = await Promise.all(podInfoCalls)

    return jobs.body.items.map((job) => {
        return {
            name: job.metadata.name,
            startTime: job.status.startTime,
            completionTime: job.status.completionTime,
            image: job.spec.template.spec.containers["0"].image,
            status: job.status.succeeded ? "Completed"
                : job.status.failed ? "Failed" 
                : helpers.getContainerStatus(getPodResults(podResults, job)).status
        }
    })
}

const getPodResults = (podResults, job) => {    
    let results = podResults.find(pod => {
        if (pod)
            return pod[0].metadata.labels['job-name'] === job.metadata.name
    })
    return results && results[0]
}

const getJobInfo = async (jobName) => {    
    return await client.batch.jobs(jobName).get()    
}

const getPodsByJobName = async (jobName) => {
    const podList = await client.api.pods.get()
    
    return helpers.getPodsForJob(jobName, podList.body.items)
}

const getLogs = async (jobName) => {
    let logCalls = []
    let pods = await getPodsByJobName(jobName)
    pods.forEach(pod => logCalls.push(client.api.pods(pod.metadata.name).log.get()))

    return (await Promise.all(logCalls)).map((log, index) => {
        return log.body || helpers.getContainerStatus(pods[index])
    })
}

const deleteJob = async (jobName) => {
    let pods = await getPodsByJobName(jobName)

    pods.forEach(async (pod) => {
        // leave this loop synchronous (await) without Promise.all as it appears to cause issues with Delete otherwise.
        await client.api.pods(pod.metadata.name).delete()
    })
    
    return await client.batch.jobs(jobName).delete()
}

const createJob = async (jobSpec) => {
    return await client.batch.jobs.post({
        body: helpers.buildJobSpec(await helpers.getTemplate('job_template.json'), jobSpec)
    })        
}

module.exports = { 
    getJobs, 
    getJobInfo, 
    getLogs, 
    deleteJob, 
    createJob 
}