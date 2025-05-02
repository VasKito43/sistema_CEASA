<script setup>
import { inject } from 'vue';

const state = inject("state")
const stateEncaminhar = inject("stateEncaminhar")

const verificador = () => {
    if (stateEncaminhar && stateEncaminhar.buscaPedido){
        state.produtos = stateEncaminhar.produtos
        state.pedidoId = stateEncaminhar.pedidoId
        stateEncaminhar.buscaPedido = false
    }
}

verificador()

</script>

<template>
    <h2>Realizar Pagamento</h2>
  
  <div class="containerRV">
    <select v-model="state.formaPagamento" class="selectCliente">
      <option value="" class="optionCliente">Forma de Pagamento</option>
      <option value="dinheiro" class="optionCliente">Dinheiro</option>
      <option value="pix" class="optionCliente">Pix</option>
      <option value="debito" class="optionCliente">Debito</option>
      <option value="credito" class="optionCliente">Credito</option>
      <option value="boleto" class="optionCliente">Boleto</option>
      <option value="cheque" class="optionCliente">Cheque</option>
      
    </select> <br>

    <div v-for="(item, index) in state.produtos" :key="index" class="divProduto">

        <div class="containerRP ">
            <div class=" quantidadeRP">
                Quantidade: 
                <input type="number"
             v-model="item.quantidade"
             :placeholder="item.produto && item.produto.quantidade !== undefined
                          ? `Quantidade (${item.produto.quantidade})`
                          : 'Quantidade'" 
             :min="1"
             :max="item.produto && item.produto.quantidade !== undefined
             ? item.produto.quantidade 
             : 1"
              class="inputRP" :value="item.quantidade"
              @keydown="state.bloquearDigitacao">
              
            </div>
            <div class="itensRP nomeRP centralizado">{{ item.produto.nome }}</div>
            <div class="itensRP valorRP centralizado"> Valor unitatio: R$ {{ item.produto.valor }}</div>
            <div @click="state.removeVenda(item.produto.id, item.quantidade, false); state.deletaProduto(index)" class="itensRP deletaRV botaoCadastro centralizado deletaRP">X</div>
            <div class="linha"></div>
        </div>
    </div>


    
</div>

<div class="containerRV2">
    <p class="total">Total: R$ {{ state.total }}</p>
    <div class="botoesRV">
      <button @click="state.cancelaPedido" class="botaoCasdastro botaoRV botaoRP botaoCP">Cancelar Pedido</button>
      <button @click="state.fecharRP" class="botaoCasdastro botaoRV botaoRP botaoF">Fechar</button>
      <button @click="state.atualizarPedido" class="botaoCasdastro botaoRV botaoRP">Finalizar Pagamento</button>
    </div>
  </div>
</template>

<style>

</style>