import Vue from 'vue';
import VueI18n from 'vue-i18n';
import getLocale from './common/util';
import App from './App.vue';
import router from './router';
import en from './lang/en';
import pt from './lang/pt';
import id from './lang/id';
import es from './lang/es';

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
