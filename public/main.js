import Vue from 'vue'
import router from './router/router'
import App from '../public/components/App.vue'

import indexHtml from '../public/index.html'
import css from '../public/css/'
import ttf from '../public/fonts/Neue Haas Unica Pro.ttf'

new Vue({
    el: '#app',
    router,
    components: {
        'application-root': App
    }
})
