<script setup>
import { ref } from 'vue';

const nome = ref("")

const quantidade = ref("")
const erro = ref(null)

const cadastrar = async () => {
    const produto = {
        nome: nome.value.toUpperCase(),
        quantidade: quantidade.value

    };

    try {
        const resposta = await fetch("http://127.0.0.1:3000/produto", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(produto)
        });
        if (resposta.ok) {
            alert("Produto adicionado com sucesso!")
        } else {
            alert("Erro ao resgistrar produto")
        }
    } catch (erro) {
        console.error(erro);
        alert("Erro ao registrar produto")
    } finally {
        nome.value = ""

        quantidade.value = ""

    }
}

</script>


<template>
    <div class="containerRV">
        <h2 class="tituloCadastro">Cadastro de Produtos</h2>

        <input type="text" v-model="nome" placeholder="Nome" class="inputCadastro"> 
        <input type="number" v-model="quantidade" placeholder="Quantidade" class="inputCadastro">
        <button @click="cadastrar" class="botaoCasdastro">Cadastrar</button>

        <div v-if="erro" class="erro">{{ erro }}</div>
    </div>
    <div class="containerBP"></div>

</template>