<script setup>
import { ref, onMounted, computed } from 'vue'
import { useStore } from '../../store'

const store = useStore()

const produtos = ref([])
const erro = ref(null)
const loading = ref(true)
const produtoSelecionado = ref(null)
const quantidade = ref('')

const sortedProdutos = computed(() =>
  produtos.value.slice().sort((a, b) =>
    a.nome.localeCompare(b.nome, 'pt', { sensitivity: 'base' })
  )
)

async function fetchProdutos() {
  try {
    const res = await fetch('"https://backendvue.onrender.com/produtos')
    if (!res.ok) throw new Error('Erro ao buscar produtos')
    produtos.value = await res.json()
  } catch (e) {
    erro.value = e.message
  } finally {
    loading.value = false
  }
}

onMounted(fetchProdutos)

const cadastrar = async () => {
  if (!produtoSelecionado.value) {
    alert('Selecione um produto')
    return
  }

  const entrada = {
    produtoId: produtoSelecionado.value.id,
    quantidade: Number(quantidade.value),
    usuarioId: store.estado.funcionario.id
  }

  try {
    const res = await fetch('"https://backendvue.onrender.com/realizarEntrada', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entrada)
    })

    if (res.ok) {
      alert('Entrada realizada com sucesso!')
    } else {
      alert('Erro ao realizar entrada')
    }
  } catch (e) {
    console.error(e)
    alert('Erro ao realizar entrada')
  } finally {
    produtoSelecionado.value = null
    quantidade.value = ''
  }
}


</script>

<template>
  <h2>Entrada de Produto</h2>

  <div class="containerRV">
    <select v-model="produtoSelecionado" class="selectProduto">
      <option :value="null">Selecione um produto</option>
      <option
        v-for="item in sortedProdutos"
        :key="item.id"
        :value="item"
      >
        {{ item.nome }}
      </option>
    </select>

    <label class="labelRV labelEnt">Quantidade</label>
    <input
      v-model.number="quantidade"
      @input="quantidade = Math.max(1, Math.floor(quantidade))"
      type="number"
      min="1"
      step="1"
      class="inputQuantidade inputQuant"
    />
    <div v-if="erro" class="erro">{{ erro }}</div>
    <div v-else-if="loading">Carregando produtos...</div>
  </div>

  <div class="containerRV2">
    <p></p>
    <button @click="cadastrar" class="botaoCadastro botaoRV">
      Enviar
    </button>
  </div>
</template>
