<script setup>
import { useStore, menuStore } from '../store';

const store = useStore();
const menu = menuStore();

</script>

<template>
  <div class="cabecalho">
    <div class="centralizado titulo" >
      <button @click="menu.toggle()" class="botaoMenu">☰ </button>
      <img src="../assets/alho.svg" alt="">
      <h2 class="tituloCabecalho">Sistema Alho do Campo</h2>
    </div>
    <div class="funcionario coluna">
      <p>{{ store.estado.funcionario.nome }}</p>
      <p>{{ store.estado.funcionario.cpf }}</p>
    </div>
  </div>
</template>

<style>

@media (max-width: 768px){
h2 {
  font-size: 18pt;
}
.tituloCabecalho{
  margin-top: 0.8vh;
}
.funcionario{
  font-size: 10pt !important;
}
.botaoMenu{
  padding-left: 3vw !important;
  padding-right: 3vw !important;
  margin-right: 1vw !important;
}
}
.botaoMenu{
  background: none;
  border: none;
  margin-left: -3.5vw;
  margin-right: 1.5vw;
  font-size: 24pt;
  background: rgba(255, 255, 255, 0.068);
  padding-left: 1vw;
  padding-right: 1vw;

}
.cabecalho{
  color: white;
  background: linear-gradient(to bottom right, #000000, #414242);
  height: 10%;
  font-size: 20pt;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
img{
  width: 55px;
  padding-right: 10px;
}
.funcionario{
  font-size: 14pt;
  margin-right: 2vw;
}
.titulo{
  margin-left: 4vw;
}
</style>