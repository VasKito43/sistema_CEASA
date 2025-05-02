<script setup>

import { ref } from 'vue'


const produtos = ref([])
const erro = ref(null)
const loading = ref(true)

const recebeproduto = async () => {
    try{
        const resposta = await fetch("http://127.0.0.1:3000/estoque");
        if (!resposta.ok) {
            throw new Error("Erro ao realizar busca")
        }
        const data = await resposta.json();
        produtos.value = data;    
    } catch (error) {
        erro.value = error.message
    } finally {
        loading.value = false
    }};

recebeproduto()

</script>

<template>
    <h2>Entrada de Produto</h2>
  
  <div class="containerRV">

    <select class="selectProduto">
        <option value="">Produto</option>
        <option v-for="produto in produtos" :value="produto" :key="produto.id">{{ produto.nome }} </option>
    </select> <br>

    <label class="labelRV">Quantidade{{}}</label>

    <input class="inputQuantidade" type="number" :min="1">
    
    <!-- <select v-model="state.cliente" class="selectCliente">
      <option value="" class="optionCliente">Cliente</option>
      <option v-for="cliente in state.usuarios" :value="cliente" class="optionCliente">{{ cliente.nome }}</option>
    </select> <br>

    <div v-for="(item, index) in state.produtos" :key="index" class="divProduto">
      <select v-model="state.produtos[index].produto" class="selectProduto">
        <option value="">Produto</option>
        <option v-for="produto in state.estoque" :value="produto" :key="produto.id">{{ produto.nome }} </option>
      </select>
      <input type="number"
             v-model="state.produtos[index].quantidade"
             :min="1"
             :max="state.produtos[index].produto && state.produtos[index].produto.quantidade !== undefined
             ? state.produtos[index].produto.quantidade 
             : 1"
              
              class="inputQuantidade"
              @keydown="state.bloquearDigitacao"
              />
             <label class="labelRV">{{ state.produtos[index].produto && state.produtos[index].produto.quantidade !== undefined
                                 ? `Quantidade (${state.produtos[index].produto.quantidade})`
                                 : 'Quantidade' }}</label>
      <button @click="state.deletaProduto(index)" class="deletaRV botaoCadastro centra">X</button> -->
    <!-- </div> -->

    <!-- <button @click="state.adicionaProdutoPedido" class="botaoADP botaoCasdastro">Adicionar Produto </button> <br><br> -->

    
</div>

<!-- <div class="containerRV2">
    <p class="total">Total: R$ {{ state.total }}</p>
    <button @click="state.fecharPedido" class="botaoCasdastro botaoRV">Fechar Pedido</button>
  </div> -->
</template>

<style>

</style>