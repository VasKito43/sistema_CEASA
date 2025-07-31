<script setup>
import { ref } from 'vue';

const nome = ref("")
const email = ref("")
const celular = ref("")
const erro = ref(null)

const cadastrar = async () => {
    const usuario = {
        nome: nome.value,
        email: email.value,
        celular: celular.value.replace(/\D/g, '')
    };

    try {
        const resposta = await fetch("https://backendvue.onrender.com/usuarios", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(usuario)
        });
        if (resposta.ok) {
            alert("Usuario adicionado com sucesso!")
        } else {
            alert("Erro ao resgistrar usuario")
        }
    } catch (erro) {
        console.error(erro);
        alert("Erro ao registrar usuario")
    } finally {
        nome.value = ""
        email.value = ""
        celular.value = ""
    }
}

</script>


<template>
    <div class="containerRV">
        <h2 class="tituloCadastro">Cadastro de Pessoas</h2>

        <input type="text" v-model="nome" placeholder="Nome" class="inputCadastro">
        <input type="tel" v-model="celular" placeholder="Celular" v-mask="'(##) #####-####'" class="inputCadastro">
        <input type="email" v-model="email" placeholder="Email" class="inputCadastro">
        <button @click="cadastrar" class="botaoCasdastro">Cadastrar</button>

        <div v-if="erro" class="erro">{{ erro }}</div>
    </div>
    <div class="containerBP"></div>
</template>
<style>
.tituloCadastro {
    color: rgb(68, 68, 68);
}


@media (max-width: 768px) {
    .tituloCadastro {
        margin-top: 2vh;
        margin-bottom: 5vh;
    }

    .inputCadastro {
        width: 80vw;
        height: 5vh;
    }
    .botaoCasdastro{
        width: 80vw;
        margin-top: 5vh;
    }
}
</style>