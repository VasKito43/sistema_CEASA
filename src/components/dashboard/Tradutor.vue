<script setup>
import { ref } from 'vue'

const texto = ref('')
const textoTraduzido = ref('')
const lingua1 = ref('')
const lingua2 = ref('')

async function traduzir() {
    if (texto.value && lingua1.value && lingua2.value) {
        const resposta = await fetch(
            `https://api.mymemory.translated.net/get?q=${encodeURIComponent(texto.value)}&langpair=${lingua1.value}%7C${lingua2.value}`
        )
        const objeto = await resposta.json()
        textoTraduzido.value = objeto.responseData.translatedText
    } else {
        textoTraduzido.value = ''
    }
}
</script>

<template>
  <div class="containerTradutor centralizado">
    <div class="ContanerInput coluna">
      <select v-model="lingua1" @change="traduzir" class="opcoesTradutor">
        <option value="">Selecione uma opção</option>
        <option value="pt-br">Português-Br</option>
        <option value="en-us">Inglês</option>
        <option value="it">Italiano</option>
        <option value="ru">Russo</option>
        <option value="zh-cn">Mandarim</option>
      </select>
      <textarea 
        v-model="texto" 
        placeholder="Digite aqui" 
        @input="traduzir" 
        class="textoTradutor inputTradutor">
      </textarea>
    </div>

    <div class="ContanerInput coluna">
      <select v-model="lingua2" @change="traduzir" class="opcoesTradutor">
        <option value="">Selecione uma opção</option>
        <option value="pt-br">Português-Br</option>
        <option value="en-us">Inglês</option>
        <option value="it">Italiano</option>
        <option value="ru">Russo</option>
        <option value="zh-cn">Mandarim</option>
      </select>
      <textarea 
        readonly 
        class="textoTradutor resultadoTradutor">{{ textoTraduzido }}
      </textarea>
    </div>
  </div>
</template>

<style>
@media (max-width: 768px){
.containerTradutor{
  flex-direction: column;
}
.ContanerInput{
  margin-top: -2vh;
  min-width: 85vw;
}
.textoTradutor{
  height: 36vh;
}
}
</style>