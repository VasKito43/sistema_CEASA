<script setup>
import { useRouter } from "vue-router";
const router = useRouter();
const voltar = () => {
    router.push("/");
}
</script>

<template>

    <div class="conteinerNF centralizado coluna">
        <h2 class="textoNF">404</h2><br><br><br>

        <h2 class="textoNF">Pagina Não Encontrada</h2><br><br>

        <button @click="voltar">Retorne ao Login</button>
    </div>

</template>

<style>
.conteinerNF{
    background: linear-gradient(to bottom right, #163f5a, #145730);
    width: 100vw;
    height: 100vh;
    text-align: center;
}
.textoNF{
    color: white;
    font-size: 40pt;
}
</style>