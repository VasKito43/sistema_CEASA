<script setup>
import { ref, computed } from 'vue'

const entrada = ref([])
const erro = ref(null)
const loading = ref(true)

// filtros
const filtroTexto = ref("")      // nome de usuário ou produto
const filtroData   = ref("")     // data de entrada (YYYY-MM-DD)

// formata ISO para pt-BR
const formatDate = iso => new Date(iso).toLocaleDateString('pt-BR', {
  day: '2-digit', month: '2-digit', year: 'numeric'
})

// computa lista filtrada e ordenada
const entradaFiltradoOrdenado = computed(() => {
  const txt = filtroTexto.value.toLowerCase()
  const dt  = filtroData.value

  const filtrado = entrada.value.filter(item => {
    const nomeUsuario = item.usuario_nome.toLowerCase()
    const nomeProduto = item.produto_nome.toLowerCase()
    // obtém data local no formato YYYY-MM-DD para comparar
    const itemDate = new Date(item.data)
      .toLocaleDateString('en-CA')

    const textoMatch = !txt || nomeUsuario.includes(txt) || nomeProduto.includes(txt)
    const dataMatch  = !dt || itemDate === dt

    return textoMatch && dataMatch
  })

  return filtrado
    .slice()
    .sort((a, b) => new Date(b.data) - new Date(a.data))
})

// busca API
const recebeEntrada = async () => {
  try {
    const resp = await fetch('"https://backendvue.onrender.com/recebeEntradas')
    if (!resp.ok) throw new Error(`Erro HTTP ${resp.status}`)
    entrada.value = await resp.json()
  } catch (e) {
    erro.value = e.message
  } finally {
    loading.value = false
  }
}

recebeEntrada()
</script>

<template>
  <h2>Registros de Entrada</h2>

  <div class="containerRV">
    <div v-if="loading" class="loading">Carregando...</div>
    <div v-else-if="erro" class="erro">{{ erro }}</div>
    <div v-else>
      <ul class="ulEstoque">
        <li v-for="item in entradaFiltradoOrdenado" :key="item.id" class="itemEntrada">
          <h5 class="campo">Usuário: <span>{{ item.usuario_nome }}</span></h5>
          <h5 class="campo">Produto: <span>{{ item.produto_nome }}</span></h5>
          <h5 class="campo">Quantidade: <span>{{ item.quantidade }}</span></h5>
          <h5 class="campo">Data: <span>{{ formatDate(item.data) }}</span></h5>
        </li>
      </ul>
    </div>
  </div>

  <div class="containerBP">
    <div class="form2">
      <h4>Buscar por nome:</h4>
      <input type="text" v-model="filtroTexto" placeholder="Nome de usuário ou produto" class="inputFormEstoque" />
    </div>
    <div class="form2">
      <h4>Filtrar por data:</h4>
      <input type="date" v-model="filtroData" class="inputFormEstoque" />
    </div>
  </div>
</template>

<style>
@media (max-width: 768px) {
  .inputFormEstoque {
    width: 50vw;
  }
  .nomeFormEstoque {
    margin-left: 16.5vw;
  }
  .itemEntrada {
    min-width: 76vw;
  }
}

/* Estilização geral do item */
.itemEntrada {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  width: 30vw;
  margin: 1vh 1vw;
  padding: 1.5vh 1vw;
  background: #1f1f1f;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  border: 1px solid #333;
}

/* Lista sem marcadores */
.ulEstoque {
  display: flex;
  flex-wrap: wrap;
  list-style: none;
  padding: 0;
}

/* Títulos de campo */
h5.campo {
  font-size: 1rem;
  font-weight: 500;
  color: #e0e0e0;
  margin: 0.3em 0;
}

/* Valor dentro do span */
h5.campo span {
  font-weight: 600;
  color: #fff;
}

.loading,
.erro {
  font-size: 1.2em;
  color: #f0f0f0;
  text-align: center;
  margin: 2vh 0;
}

.form2 {
  margin: 1em 0;
}
</style>
