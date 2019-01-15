<template>
  <div class="sidebar__content">
      <div v-for="(navItem, index) in navItems" :key="index">
          <div class="sidebar__heading" v-on:click="toggleActive(index)">
              <span v-bind:class="{ active: navItem.active, dropdown__caret: navItem.subNavItems}" />
              <router-link class="side-links " :to="{ path: navItem.href }">
                  <h5 class="side__heading">{{ navItem.name }}</h5>
              </router-link>
          </div>
          <div v-if="navItem.active" class="sidebar__panel">
              <template v-for="subNavItem in navItem.subNavItems">
                  <div class="router-link" @click="nav(subNavItem.href)" :key="subNavItem.name">{{ subNavItem.name }}</div>
              </template>
            
          </div>
      </div>
  </div>
</template>

<script>
var defaultNavItems

export default {
  data() {
    return {
      navItems: [{
        name: 'Jobs',
        active: true,
        subNavItems: [{
            name: 'View',
            href: '/jobs/list'
          }, {
            name: 'Create',
            href: '/jobs/create'
          }
        ]
      }]
    };
  },
  methods: {
    toggleActive(index) {
      var item = this.navItems[index];
      item.active = !item.active;
    }, 
    nav(path) {
      this.$router.push({ path: path, hash: new Date().getTime().toString() })
    }
  }
};
</script>

<style>

.router-link {
  cursor:pointer;
}
.sidebar .sidebar__content {
  position: relative;
  height: 100vh;

  overflow-y: scroll;
  -webkit-overflow-scrolling: touch;
  overflow-x: hidden;
}
.sidebar .sidebar__content a {
  color: white;
  font-weight: 100%;
}

.sidebar .sidebar__content .sidebar__heading {
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  padding: 10px 1.5rem 10px 1rem;
  cursor: pointer;
}

.sidebar .sidebar__content .sidebar__heading:hover {
  transition: 0.2s;
  background: #017cbf;
}

.sidebar .sidebar__content .sidebar__heading .dropdown__caret {
  transition: all 0.15s;
}

.sidebar .sidebar__content .sidebar__heading .dropdown__caret:before {
  /* background: url(../images/icon-chevron.svg) left center no-repeat;
    background-size: 44px 27px; */
  content: ">";
}

.sidebar .sidebar__content .sidebar__heading .dropdown__caret.active {
  transform: rotate(90deg);
}

.sidebar .sidebar__content .sidebar__heading .side__heading {
  padding: 0 0.5rem;
  display: inline-block;
}

.sidebar .sidebar__content .sidebar__panel {
  padding-left: 2.5rem;
}

.sidebar .sidebar__content .navigational-links .title {
  padding-left: 2.5rem;
}

.title p{
    margin: 0 0 16px 0;
}
.sidebar__panel{
  margin: 0.5em 0 0 0;
}
.title {
    font-size: 14px!important;
    font-weight: 500;
    line-height: .5!important;
    padding-left: 6px;
}

</style>
