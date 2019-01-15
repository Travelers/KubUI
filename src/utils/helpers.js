const readFileAsync = require('util').promisify(require('fs').readFile)
const { EOL } = require('os')
const path = require('path')

const templates = {}

const getTemplate = async (name) => {    
    if (!templates[name])
        templates[name] = await readFileAsync(path.join(__dirname, '..', 'templates', name), 'utf-8')
        

    return JSON.parse(templates[name])
}

const getPodsForJob = (jobName, pods) => {
    return pods.filter((pod) => {
        return pod.metadata.labels['job-name'] === jobName
    }) || []
}

const getProjectName = (url) => {
    let parts = url.split('/')
    let project = parts[parts.length - 1]
    
    return project.endsWith('.git') ? project.split('.git')[0] : project
}

const tokenizeGitRepo = (url) => {
    let [proto,host] = url.split("://")
    return `${proto}://$GITTOKEN@${host}`
}

const buildJobSpec = (template, jobSpec) => {
    let jobName = jobSpec.jobName.toLowerCase()
    let metadata = template.metadata
    let container = template.spec.template.spec.containers[0]
    
    metadata.name = jobName
    metadata.namespace = process.env.NAMESPACE || 'default'

    container.name = jobName
    container.image = jobSpec.imageName
    let env = container.env.find((ev) => {
        return ev.name === "GITTOKEN"
    })

    if (env)
        env.valueFrom.secretKeyRef.name = process.env.GIT_TOKEN_NAME || ''
    
    container.resources.requests["nvidia.com/gpu"] = jobSpec.requiredGPU
    container.resources.limits["nvidia.com/gpu"] = jobSpec.requiredGPU
    template.spec.template.spec.volumes.push({
        hostPath: {
            path: `/tmp/${jobName}`
        },
        name: "code"
    })
    
    container.args = buildContainerArgs(jobSpec, jobName)
    
    return template
}

const DEFAULT_BLACKLIST_REGEX = new RegExp('[;|&\'"]')
const blackListRegexes = {
    jobName: DEFAULT_BLACKLIST_REGEX,
    gitProject: DEFAULT_BLACKLIST_REGEX,
    inputDirectory: DEFAULT_BLACKLIST_REGEX,
    outputDirectory: DEFAULT_BLACKLIST_REGEX,
    runCommand: DEFAULT_BLACKLIST_REGEX,
    modelDirectory: DEFAULT_BLACKLIST_REGEX,
}

const validateJobSpec = (jobSpec) => {
    let errors = []
    Object.keys(jobSpec).forEach(key => {
        if (!(key in blackListRegexes))
            return
            
        if (blackListRegexes[key].test(jobSpec[key]))
            errors.push({
                key,
                message: `${key} contains one or more invalid characters.`
            })
    })
    return {
        isValid: errors.length === 0,
        errors
    }
}

const buildContainerArgs = (jobSpec, jobName) => {
    let projectName = getProjectName(jobSpec.gitProject)
    let outputDir = `/data/${projectName}/${jobName}/${jobSpec.outputDirectory}`
    let modelDir = jobSpec.modelDirectory
    let commandArgs = {
        checkout:       `git -c http.sslVerify=false clone ${tokenizeGitRepo(jobSpec.gitProject)} || { echo "git clone command failed."; exit 1; }`,
        createDataDir:  `mkdir -p ./${projectName}/data || { echo "mkdir (data) command failed."; exit 1; }`,
        copyDataIn:     `cp -r /data/${jobSpec.inputDirectory} ./${projectName}/data || { echo "copy input data command failed."; exit 1; }`,
        changeDir:      `cd ${projectName} || { echo "cd command failed."; exit 1; }`,
        run:            `sh ./${jobSpec.runCommand} || { echo "sh command failed."; exit 1; }`,
        createOutputDir:`mkdir -p ${outputDir} || { echo "mkdir (output) command failed."; exit 1; }`,        
        copyDataOut:    `if [ -d ${jobSpec.modelDirectory} ]; then cp -r ${jobSpec.modelDirectory} ${outputDir} || { echo "copy output data command failed."; exit 1; }; fi`,
        // postScript:     'sleep 120; exit 0;',
        postScript:     'exit 0;'
    }
    
    let steps = ["checkout", "createDataDir", "copyDataIn", "changeDir", "run"]
    if (jobSpec.outputDirectory) {
        steps.push("createOutputDir")
        steps.push("copyDataOut")
    }
    steps.push("postScript")
    let command = steps.map(step => commandArgs[step]).join(';')
    return ['-c'].concat(command)
}

const mapLogEntries = (logs) => {
    let logEntries = []
    if (!logs)
        return []
    logs.forEach(log => {
        if (!log) return
        if (log.message) {
            logEntries.push(log.message)
            return 
        }
        log.split(EOL).forEach(line => {
            logEntries.push(line)
        })
    })
    return logEntries
}

const getContainerStatus = (pod) => {
    if (!pod) {
        return {
            message: 'No pods exist for current job.'
        }
    }
    
    return {
        status: pod.status.phase,
        message: getStatusMessage(pod)
    }
}

const getStatusMessage = (pod) => {
    if (pod.status.phase === "Pending") {
        return pod.status.conditions && pod.status.conditions[0].message
    }

    let containers = pod.status.containerStatuses    
    let state = containers && containers[0].state.terminated || containers[0].state.running || containers[0].state.waiting
    return state.message || state.reason || pod.status.phase
}

module.exports = { 
    getPodsForJob, 
    buildJobSpec, 
    getTemplate, 
    mapLogEntries, 
    getContainerStatus,
    validateJobSpec
}