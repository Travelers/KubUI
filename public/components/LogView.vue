<template>
    <div>
      <div>
        <h3>Job Name: {{jobName}}</h3>
      </div>
      <div v-if="errors.length > 0">
         <ul class="error-list">
            <li v-for="error in errors" :key="error">{{ error }}</li>
          </ul>                
      </div>
      <div v-for="(log, index) in logs" :key="index">
        {{log}}
      </div>
    </div>        
</template>

<script>
import axios from "axios";

export default {
    data() {
    return {
      logs: [],
      errors: [],
      jobName: null
    };
  },
  methods: {
    loadLogData(routeParams) {
      this.jobName = routeParams.jobName;

      axios
        .get(`/api/jobs/logs/${this.jobName}`)
        .then(response => {
          if (!response.data) return;
          this.logs = response.data;
        })
        .catch(error => {
          this.errors.push(this.handleError(error));
        });
    }
  },
  beforeRouteUpdate(to, from, next) {
    this.loadLogData(to.params);
    next();
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      vm.loadLogData(to.params);
    });
  }
};
</script>

<style>
</style>
