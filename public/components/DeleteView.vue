<template>
  <transition name="modal">
    <div class="modal-mask">
      <div class="modal-wrapper">
        <div class="modal-container">

          <div class="modal-header">
            <slot name="header">              
              <label>Confirm Delete?</label>
            </slot>
          </div>

          <div class="modal-body">
            <slot name="body">
              <div class="description">Are you sure you want to delete {{jobName}}?<br>
                <button class='button-secondary' @click="close">Cancel</button>
                <button class='button-primary' @click="deleteJob">Confirm</button>
              </div>
            </slot>
          </div>

          <div class="modal-footer">
            <slot name="footer">
              <div v-if="errors.length">            
                <ul class="error-list">
                    <li v-for="error in errors" :key="error">{{ error }}</li>
                </ul>                
             </div>
            </slot>
          </div>

        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      jobName: null,
      errors: []
    };
  },
  mounted() {
    document.addEventListener("keyup", this.esc);
  },
  beforeDestroy() {
    document.removeEventListener("keyup", this.esc);
  },
  methods: {
    esc(e) {
      if (e.keyCode === 27) this.close();
    },
    close() {
      this.$router.go(-1);
    },
    deleteJob() {
      this.errors.length = 0;
      return axios
        .delete("/api/jobs/" + this.jobName)
        .then(response => {
          this.$router.push({ name: "listView" });
        })
        .catch(error => {
          this.errors.push(this.handleError(error));
        });
    }
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      vm.jobName = to.params.jobName;
    });
  }
};
</script>

<style scoped>
/* @import url('https://fonts.googleapis.com/css?family=Roboto'); */
body {
  font-family: "Roboto", arial, sans-serif;
}
.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: table;
  transition: opacity 0.3s ease;
}

.modal-wrapper {
  display: table-cell;
  vertical-align: middle;
}

.modal-container {
  width: 500px;
  margin: 0px auto;
  padding: 20px 30px;
  background-color: #fff;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  transition: all 0.3s ease;
}

/* .modal-header h3 {
  margin-top: 0;
  color: #42b983;
}

.modal-body {
  margin: 20px 0;
} */

.modal-header {
  text-align: center;
  color: #003557;
  font-weight: 700;
  padding: 0 0 24px 0;
  border-bottom: 1px solid #ececed;
}
.modal-body {
  font-weight: 400;
  color: #74777a;
}
.modal-body label {
  color: #003557;
  font-weight: 700;
}

.modal-footer {
  font-weight: 400;
  color: #74777a;
  text-align: center;
}

ul,
menu,
dir {
  list-style-type: none;
}

.modal-default-button {
  float: right;
}

.description {
  text-align: center;
  padding: 1em;
}
.m20 {
  display: block;
  margin-top: 1em;
}

/*
 * The following styles are auto-applied to elements with
 * transition="modal" when their visibility is toggled
 * by Vue.js.
 *
 * You can easily play with the modal transition by editing
 * these styles.
 */

.modal-enter {
  opacity: 0;
}

.modal-leave-active {
  opacity: 0;
}

.modal-enter .modal-container,
.modal-leave-active .modal-container {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}

label {
  color: #74777a;

  font-size: 0.84375rem;
  letter-spacing: 0.125rem;
  text-transform: uppercase;
}

.button-primary {
  background: #017cbf;
  border-radius: 100px;
  font-size: 14px;
  color: #ffffff;
  letter-spacing: 0;
  display: inline-block;
  margin: 40px 10px 20px 10px;
  padding: 5px 15px;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.125rem;
}
.action-container {
  text-align: center;
}
.action-container button {
  font-family: "Roboto", Arial, Helvetica, sans-serif;
  font-weight: 500;
  color: #017cbf;
  text-transform: uppercase;
}
</style>