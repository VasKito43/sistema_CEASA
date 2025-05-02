<script setup>
import { useRouter } from "vue-router";
import { useStore } from "../store";
import { ref, onBeforeMount } from "vue";
import Cabecalho from "./Cabecalho.vue";
import Dashboard from "./Dashboard.vue";

const router = useRouter();
const store = useStore();
const autorizado = ref(false); 

const verificarLogin = () => {
  if (!store.estado.funcionario) {
    router.push("/");
  } else {
    autorizado.value = true; 
  }
};

onBeforeMount(verificarLogin);
</script>

<template>
  <div v-if="autorizado" class="pagina">
    <Cabecalho />
    <Dashboard />
  </div>
</template>
