<script setup>
import { inject } from 'vue';

const state = inject("state")
</script>

<template>
    <h2>Realizar Venda</h2>
  
  <div class="containerRV">
    <select v-model="state.cliente" class="selectCliente">
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
      <button @click="state.deletaProduto(index)" class="deletaRV botaoCadastro centra">X</button>
    </div>

    <button @click="state.adicionaProdutoPedido" class="botaoADP botaoCasdastro">Adicionar Produto </button> <br><br>

    
</div>

<div class="containerRV2">
    <p class="total">Total: R$ {{ state.total }}</p>
    <button @click="state.fecharPedido" class="botaoCasdastro botaoRV">Fechar Pedido</button>
  </div>
</template>

<style>

</style>