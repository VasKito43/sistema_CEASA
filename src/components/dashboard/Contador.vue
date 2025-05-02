<script setup>
import { ref } from 'vue'

const valor = ref(0)

function somar(){
    valor.value++
}

function subtrair(){
    valor.value--
}

</script>

<template>
    <div class="contador centralizado">
        <h2 class="valorContador">{{ valor }}</h2>
        <div>
            <button class="botaoContador" @click="subtrair">-</button>
            <button class="botaoContador" @click="somar">+</button>

        </div>
    </div>
</template>

<style>
@media (max-width: 768px){
.botaoContador{
    min-width: 15vw;
}
}
</style>