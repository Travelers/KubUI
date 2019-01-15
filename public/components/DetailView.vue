<template>
    <div id="log-view">
        <div>
            <h3>Job Name: {{jobName}}</h3>
        </div>
        <div v-if="errors.length">            
            <ul class="error-list">
                <li v-for="error in errors" :key="error">{{ error }}</li>
            </ul>                
        </div>
        <div>
            <pre>{{jobInfo}}</pre>
        </div>
    </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      jobName: null,
      jobInfo: null,
      errors: []
    };
  },
  methods: {
    loadJobData(routeParams) {
      this.jobName = routeParams.jobName;
      axios
        .get(`/api/jobs/${this.jobName}`)
        .then(response => {
          if (!response.data) return;
          this.jobInfo = JSON.stringify(response.data, null, "  ");
        })
        .catch(error => {
          this.errors.push(this.handleError(error));
        });
    }
  },
  beforeRouteUpdate(to, from, next) {
    this.loadJobData(to.params);
    next();
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      vm.loadJobData(to.params);
    });
  }
};
</script>

<style>
#log-view {
  overflow: auto;
}
</style>
