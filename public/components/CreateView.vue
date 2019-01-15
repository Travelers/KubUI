<template>
    <div id="create-view" class="create-form">
        <form id="app" @submit.prevent="createJob" action="jobs">
            <div v-if="errors.length">
                <b>Please correct the following error(s):</b>
                <ul class="error-list">
                    <li v-for="error in errors" :key="error">{{ error }}</li>
                </ul>                
            </div>
            <p>
            <div class="field">
                <label for="jobName" class="required">
                    <span>Job name:</span>
                </label>
                <div class="control">
                    <input class="short-text" type="text" id="jobName" name="jobName" v-model="spec.jobName">
                </div>
            </div>
            <div class="field">
                <label for="imageName" class="required">
                    <span>Docker image:</span>
                </label>
                <div class="control">
                    <input class="long-text" type="text" id="imageName" name="imageName" v-model="spec.imageName">
                </div>
            </div>
            <!-- <div class="field">
                <label for="requiredCPU">
                    <span>Required Number of CPUs:</span>
                </label>
                <div class="control">
                    <select name="requiredCPU" v-model="spec.requiredCPU">
                        <option value="">- Select -</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="4">4</option>
                    </select>
                </div>
            </div> -->
            <div class="field">                
                <label for="requiredGPU" class="required">
                    <span>Required number of GPUs:</span>
                </label>
                
                <div class="control">
                    <select name="requiredGPU" v-model="spec.requiredGPU">
                        <option value="">- Select -</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <!-- <option value="4">4</option> -->
                    </select>
                </div>
            </div>
            <!-- <div class="field">
                <label for="requiredMemory">
                    <span>Required memory:</span>
                </label>
                <div class="control">
                    <input class="short-text" type="text" id="requiredMemory" name="requiredMemory" v-model="spec.requiredMemory">
                </div>
            </div> -->
            <div class="field">
                <label for="gitProject" class="required">
                    <span>Git project:</span>
                </label>
                
                <div class="control">
                    <input class="long-text" type="text" id="gitProject" name="gitProject" v-model="spec.gitProject"> 
                </div>
            </div>
            <div class="field">
                <label for="runCommand" class="required">
                    <span>Script to run:</span>
                </label>

                <div class="control">
                    <input class="short-text" type="text" id="runCommand" name="runCommand" v-model="spec.runCommand" placeholder="eg: run.sh"> 
                </div>
            </div>
            <div class="field">
                <label for="inputDirectory" class="required">
                    <span>Input directory:</span>
                </label>

                <div class="control">
                    <input class="short-text" type="text" id="inputDirectory" name="inputDirectory" v-model="spec.inputDirectory" placeholder="eg: MNIST/data">
                </div>
            </div>
            <div class="field">
                <label for="modelDirectory">
                    <span>Model Directory:</span>
                </label>

                <div class="control">
                    <input class="short-text" type="text" id="modelDirectory" name="modelDirectory" v-model="spec.modelDirectory" placeholder="eg: model">
                </div>
            </div>
            <div class="field">
                <label for="outputDirectory" v-bind:class="{'required': !this.isEmpty(spec.modelDirectory)}">
                    <span>Output directory:</span>
                </label>

                <div class="control">
                    <input class="short-text" type="text" id="outputDirectory" name="outputDirectory" v-model="spec.outputDirectory" placeholder="eg: out"> 
                </div>
            </div>
            <div>                
                <input class="button-primary" type="submit" value="Submit">  
            </div>
        </form>
    </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      spec: {
        jobName: null,
        imageName: null,
        // requiredCPU: 1,
        requiredGPU: 1,
        // requiredMemory: null,
        gitProject: null,
        runCommand: null,
        inputDirectory: null,
        modelDirectory: null,
        outputDirectory: null
      },
      errors: [],
      optional: ['modelDirectory'],
      conditional: {
          outputDirectory: 'modelDirectory'
      }
    };
  },
  methods: {
    createJob() {
      if (!this.validateData()) return;

      axios
        .post("/api/jobs", this.spec, {
          "Content-Type": "application/json"
        })
        .then(response => {
          this.$router.push({ name: "listView" });
        })
        .catch(error => {
          this.errors.push(this.handleError(error));
        });
    },
    validateData() {
      Object.keys(this.spec).forEach(key => {
        if (this.optional.includes(key) || (this.conditional[key] && this.isEmpty(this.spec[this.conditional[key]]))) 
            return;

        if (this.isEmpty(this.spec[key])) {
          this.errors.push(`'${key}' is required.`);
        }
      });

      return !this.errors.length;
    },
    isEmpty(model) {
        return !model || (typeof(model.trim) === 'function' && !model.trim());
    }
  },
  watch: {
    spec: {
      handler(newVal, oldVal) {
          this.errors.length = 0;
      },
      deep: true
    }
  }
};
</script>

<style>
input,
select {
  border-style: solid;
  border-color: #c0c0c0;
  border-width: 1px;
  border-radius: 3px;
}

.short-text {
  width: 25%;
  min-width: 20em;
}

.long-text {
  width: 45%;
  min-width: 20em;
}
.field {
  font-size: 0.8rem;
}

.control {
  margin-bottom: 10px;
}

.create-form {
  margin-left: 10px;
  width: 50%;
  float: left;
}
</style>
