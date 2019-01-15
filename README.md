# KubUI (Kubernetes UI)

KubUI is a simple UI intended to simplify the process of launching AI/ML processes on a cluster of GPU nodes.

## How it works

A job primarily consists of a Docker image, a Github repository, and a reference to a training dataset.  These values, along with a reference to a command to start the training process, are submitted to Kubernetes via KubUI as a job specification, and Kubernetes handles the task of scheduling and running the job on one or more of its nodes.  

## How to use

### Job prerequisites
- Create and Deploy a Docker Image
    - Build your Docker image: `docker build -f Dockerfile -t <image_name> .`
    - Include the git client in your Docker image: `RUN apt-get install git-core`
    - Tag/version your image: `docker tag SOURCE_IMAGE[:TAG] TARGET_IMAGE[:TAG]`
        - ex: `docker tag keras:latest keras:0.3`
    - Push your image to Docker hub or your own internal Docker hub: `docker push <image_name>`

- Copy Training/Test Dataset(s)    
    - Copy your training dataset(s) to a NAS folder
        - ex: `/<NAS_root>/MNIST_Images/training.dat`

### Creating a Job
- **Job name** - unique job name
    - ex: `cnn-training`
- **Docker image** - path to the Docker image created above
    - ex: `keras:0.3`
- **Required number of GPUs**
- **Git project** - the GitHub project path
    - ex: `https://github.com/<org_name>/cnn-text-classification-tf.git`
        - Repo needs to be public for the container to access it.
- **Script to run** - bash shell script to initiate the process.
    - ex: `run.sh`
        - Example code in the run.sh script: `python train.py`
- **Input directory** - NAS folder containing your training/test dataset(s)
    - ex: `MNIST_Images` - based on the example above
- **Model directory** - local (container) folder containing models (Optional)
    - ex: `model`
- **Output directory** - NAS folder to write the output model to (required if **Model directory** is specified)
    - ex: `out`
    - Example of the final output path for the above job is: 
        - `/data/cnn-text-classification-tf/cnn-training/out`
       

*Github repo required project folder structure:*
```
    ├── /project_root/
    │   ├── /data/ <-- your code should read data files from this folder as data is copied here from the NAS before your code executes.
    │   │   ├── <data file(s)>
    │   ├── /model/ <-- if a Model directory is specified then your code should create this folder (if it doesn't exist in your Git project), and write your model(s) here.  This folder is then copied back to the NAS.
    │   │   ├── <model file(s)>
```
---
## How to install
- `npm install`

## How to run
- Configure the following:
    - Authentication
        - KubUI uses a primitive basic auth mechanism.  
            - To disable this, edit the .env file and set DISABLE_AUTH to 1.
            - To enable this, edit the .env file, set DISABLE_AUTH to 0, and enter a userId, password, and realm. 
    - Connecting to the Kubernetes cluster via  environment variables
        - KubUI uses [kubernetes-client](https://github.com/godaddy/kubernetes-client) which supports both a config file or a kubeconfig object from memory.
            - KUBE_CLUSTER_CONFIG_PATH <- path to a config file
    
            - KUBE_* environment variables (see .env file) <- configuration values, including server, user, and certificate values
        - GIT_TOKEN_NAME <- the name of a secretKeyRef of a Kubernetes secret used to access a private Git repository.
- `npm start`

## How to run the tests
- `npm test` <- run all unit tests
- `npm run test:ui` <- run only client-side tests
- `npm run test:server` <- run only server-side tests