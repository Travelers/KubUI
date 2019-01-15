<template>
    <div v-if="errors.length > 0">
         <ul class="error-list">
           <li v-for="error in errors" :key="error">{{ error }}</li>
         </ul>                
    </div>
    <table v-else class="dtable dtable__table--nowrap">
        <thead>
          <tr> 
              <th class="dtable__head" v-for="col in cols" :key="col.name">
                  {{ col | formatHeader }} 
              </th>
              <th class="dtable__head"></th>
              <th class="dtable__head"></th>
              <th class="dtable__head"></th>
          </tr>
        </thead>
        <tbody v-if="jobs === null || jobs.length === 0">
            <tr>
                <td>No jobs found.</td>
            </tr>
        </tbody>
        <tbody>
            <tr class="dtable__row" v-for="job in jobs" :key="job.name">
                <td class="dtable__cell" v-for="col in cols" :key="col.name">
                    {{job[col.name]}}
                </td>
                <td class="dtable__cell">
                  <span class="link" @click="viewDetail(job.name)">View</span>
                </td>
                <td class="dtable__cell">
                  <span class="link" @click="confirmDelete(job.name)">Delete</span>
                </td>
                <td class="dtable__cell">
                  <span class="link" @click="viewLogs(job.name)">Logs</span>
                </td>
            </tr>
        </tbody>
    </table>  
</template>

<script>
import axios from "axios";

export default {
    data() {
    return {
      jobs: [],
      errors: [],
      cols: [
        {
          name: "name"
        },
        {
          name: "startTime",
          header: "Start Time",
          format: this.formatDate
        },
        {
          name: "completionTime",
          header: "Completion Time",
          format: this.formatDate
        },
        {
          name: "image"
        }, 
        {
          name: "status"
        }
      ]
    };
  },
  methods: {
    formatDate(val) {
      var dt = new Date(val);
      return dt.toLocaleString("en-us").replace(",", "");
    },
    fetchJobs() {
      return axios
        .get(`/api/jobs?${new Date().getTime()}`)
        .then(response => {
          if (!response.data) return;
          
          let jobs = response.data.sort((a, b) => {
            return a.startTime && b.startTime && new Date(a.startTime) < new Date(b.startTime) ? 1 : -1;
          }).map(job => {
            this.cols.forEach(col => {
              job[col.name] = this.format(job, col);
            });
            return job;
          });

          this.jobs = jobs;
        })
        .catch(error => {
          this.errors.push(this.handleError(error));
        });
    },
    confirmDelete(jobName) {
      this.$router.push({ name: "deleteView", params: { jobName: jobName } });
    },
    viewLogs(jobName) {
      this.$router.push({ name: "logView", params: { jobName: jobName } });
    },
    viewDetail(jobName) {
      this.$router.push({ name: "detailView", params: { jobName: jobName } });
    }, 
    format(job, col) {
      var data = job[col.name];
      if (data === null || typeof data === "undefined") return "";

      if (col.format && typeof col.format === "function") {
        data = col.format(data);
      }

      return data;
    }
  }, 
  filters: {
    formatHeader(col) {
      return col.header ? col.header : col.name;
    }
  },
  beforeRouteUpdate(to, from, next) {
    this.errors.length = 0;
    this.fetchJobs();
    next();
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      vm.errors.length = 0;
      vm.fetchJobs();
    });
  }
};
</script>

<style scoped>
.listview {
  overflow: auto;
}
.link {
  cursor: pointer;
  color: blue;
  text-decoration: underline;
}
</style>
