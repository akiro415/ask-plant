import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import './assets/main.css';
import './assets/tokens.css';
import './assets/admin.css';
import './assets/public.css';

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.mount('#app');
