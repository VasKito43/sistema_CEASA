<script setup>
import { ref } from 'vue';

const nome = ref("")
const valor      = ref("")
const quantidade = ref("")
const local      = ref(null)
const erro = ref(null)

const cadastrar = async () => {
    const produto = {
        nome: nome.value.toUpperCase(),
        quantidade: quantidade.value,
        valor: Number(valor.value),
        local: local.value

    };

    try {
        const resposta = await fetch("https://backendvue.onrender.com/produto", {
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
        valor.value      = ""
        quantidade.value = ""
        local.value      = null

    }
}

</script>


<template>
    <div class="containerRV">
        <h2 class="tituloCadastro">Cadastro de Produtos</h2>

        <input type="text" v-model="nome" placeholder="Nome" class="inputCadastro"> 
        <input type="number" v-model="quantidade" placeholder="Quantidade" class="inputCadastro">
        <input
         type="number"
         v-model="valor"
         step="0.01"
         placeholder="Valor (R$)"
         class="inputCadastro"
       >
       <select v-model="local" class="inputCadastro selectBP inputFormBP">
         <option :value="null">LOCAL</option>
         <option value="CAMPO MOURÃO">CAMPO MOURÃO</option>
         <option value="MARINGÁ">MARINGÁ</option>
       </select>
        <button @click="cadastrar" class="botaoCasdastro">Cadastrar</button>

        <div v-if="erro" class="erro">{{ erro }}</div>
    </div>
    <div class="containerBP"></div>

</template>