<script setup>
import { ref } from 'vue'

const imagem = ref(null)

async function geraImagem() {
    imagem.value = null
    const objeto = ref(null)
    const resposta = await fetch(
        `https://dog.ceo/api/breeds/image/random`
    )
    objeto.value =  await resposta.json()
    imagem.value = objeto.value.message
}

geraImagem()

</script>

<template>
    <div class="centralizado coluna">
        <h2>Cachorro Aleatorio</h2>
        <button @click="geraImagem" :disabled="!imagem">Gerar Cachorro</button>
        <p v-if="!imagem">Loading...</p>
        <img v-else :src="imagem" alt="cachorro" class="imgCachorro">

    </div>
</template>

<style>
@media (max-width: 768px){
.imgCachorro{
    min-width: 70vw;
}
}
</style>
