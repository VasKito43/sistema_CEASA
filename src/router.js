// router.js
import { createRouter, createWebHistory } from 'vue-router';
import Home from './components/Home.vue';
import Login from './components/Login.vue';
import NotFound from './components/NotFound.vue';

const routes = [
    { path: '/', component: Login },
    { path: '/home', component: Home },
    { path: '/:pathMatch(.*)*', component: NotFound } // Rota para páginas não encontradas
];

const router = createRouter({
    history: createWebHistory(), // Usa o modo de histórico do navegador
    routes
});

export default router;
