import { createApp } from 'vue';
import { createPinia } from "pinia";
import App from './App.vue';
import router from './router';
import VueTheMask from 'vue-the-mask';
import "./style.css";

const pinia = createPinia();
const app = createApp(App);

app.use(pinia);
app.use(VueTheMask);
app.use(router);
app.mount('#app');
