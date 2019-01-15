<template>
<div>
    <div class="nav-header">
        <div class="nav-header__content grid">
            <div class="logo-container">
                <a class="nav-header__icon--umbrella" href="/">
                    &nbsp;
                </a>
                <a class="logo">KubUI</a>
            </div>
        </div>
    </div>
    <div class="main-layout">
        <div class="sidebar">
          <sidebar-component />
        </div>
       <div class="content">
            <div class="notificationPane">
                notification
            </div>
            <div class="content__container">
                <router-view />
            </div>
        </div>
    </div>
</div>
</template>

<script>
import axios from "axios";
import Sidebar from "./Sidebar.vue";
import Base from "./Base.vue";
import Vue from "vue";

Vue.mixin(Base)

export default {
  components: {
    "sidebar-component": Sidebar
  }
};
</script>

<style>
/********** HEADER **********/
.nav-header {
  height: 70px;
  border-bottom: 1px solid #003557;
  left: 0px;
}
.nav-header__content {
  height: 100%;
  justify-content: space-between;
}
.nav-header .nav-header__content .logo-container {
  display: flex;
  flex-direction: row;
  align-items: center;
}
.nav-header .nav-header__content .logo-container .nav-header__icon--umbrella {
  width: 44px;
  height: 27px;
  background-size: 44px 27px;
  display: block;
}
.nav-header .nav-header__content .logo-container a.logo {
  color: #46494d;
  border-bottom: none;
  padding-left: 16px;
  border-left: 1px solid #74777a;
  font-family: Neue Haas Unica Pro Regular Normal;
  font-size: 1.25em;
}
/********** END HEADER **********/

.main-layout {
  height: 100%;
}
.main-layout .sidebar {
  background-color: #003557;
  color: white;
  width: 194px;
  float: left;
  height: 100vmin;
  bottom: 0px;
}
.main-layout .notificationPane {
  background-color: #f6f6f6;
  height: 42px;
  padding: 10px 24px;
}
.content {
  margin-left: 194px;
  width: auto;
}
.container {
  -webkit-box-flex: 1;
  -ms-flex: 1 1 100%;
  flex: 1 1 100%;
  margin: 0;
  padding: 24px;
  width: 100%;
}
</style>
