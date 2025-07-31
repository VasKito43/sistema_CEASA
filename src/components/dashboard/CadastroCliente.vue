<script setup>
import { ref } from 'vue';

const nome = ref("");
const erro = ref(null);

const cadastrar = async () => {
  const cliente = {
    nome: nome.value.toUpperCase()
  };

  try {
    const resposta = await fetch("https://backendvue.onrender.com/clientes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(cliente)
    });

    if (resposta.ok) {
      alert("Cliente cadastrado com sucesso!");
    } else {
      const dados = await resposta.json();
      alert("Erro ao cadastrar cliente: " + (dados.error || "Erro desconhecido"));
    }
  } catch (erro) {
    console.error(erro);
    alert("Erro ao cadastrar cliente");
  } finally {
    nome.value = "";
  }
};
</script>

<template>
  <div class="containerRV">
    <h2 class="tituloCadastro">Cadastro de Clientes</h2>

    <input
      type="text"
      v-model="nome"
      placeholder="Nome"
      class="inputCadastro"
    />

    <button @click="cadastrar" class="botaoCasdastro">Cadastrar</button>

    <div v-if="erro" class="erro">{{ erro }}</div>
  </div>
  <div class="containerBP"></div>
</template>
