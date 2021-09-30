import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import Vue from 'vue';
import VueI18n from 'vue-i18n';
import getLocale from './common/util';
import App from './App.vue';
import router from './router';
import en from './lang/en';
import pt from './lang/pt';
import id from './lang/id';
import es from './lang/es';

// 线上发布请更新配置
const firebaseConfig = {
  apiKey: 'AIzaSyCaABH0PclW7GDG00hUWP5TNLT9mWmLseo',
  authDomain: 'test-69262.firebaseapp.com',
  projectId: 'test-69262',
  storageBucket: 'test-69262.appspot.com',
  messagingSenderId: '752593710342',
  appId: '1:752593710342:web:ed3f695eb9aba186d88287',
  measurementId: 'G-HQQTPN6WHB',
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
Vue.prototype.analytics = analytics;

Vue.use(VueI18n);
Vue.config.productionTip = false;

const i18n = new VueI18n({
  locale: getLocale(),
  messages: {
    'en-US': en,
    'pt-BR': pt,
    id,
    es,
  },
});

new Vue({
  i18n,
  router,
  render: (h) => h(App),
}).$mount('#app');
