<script setup>
import { ref, onMounted, computed } from 'vue'
import { useStore } from '../../store'

const store = useStore()

const produtos = ref([])
const erro = ref(null)
const loading = ref(true)

const produtoSelecionado = ref(null)
const quantidade         = ref(1)
const valorUnitario      = ref('')   // <- novo

const sortedProdutos = computed(() =>
  produtos.value.slice().sort((a, b) =>
    a.nome.localeCompare(b.nome, 'pt', { sensitivity: 'base' })
  )
)

async function fetchProdutos() {
  try {
    const res = await fetch('http://127.0.0.1:3000/produtos')
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
  if (!valorUnitario.value || isNaN(Number(valorUnitario.value))) {
    alert('Informe um valor válido')
    return
  }

  const entrada = {
    produtoId: produtoSelecionado.value.id,
    quantidade: Number(quantidade.value),
    valor: Number(valorUnitario.value),        // <- novo
    usuarioId: store.estado.funcionario.id
  }

  try {
    const res = await fetch('http://127.0.0.1:3000/realizarEntrada', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entrada)
    })

    if (res.ok) {
      alert('Entrada realizada com sucesso!')
    } else {
      const err = await res.json().catch(()=>null)
      alert(err?.error || 'Erro ao realizar entrada')
    }
  } catch (e) {
    console.error(e)
    alert('Erro ao realizar entrada')
  } finally {
    produtoSelecionado.value = null
    quantidade.value = 1
    valorUnitario.value = ''
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
    </select><br>
    
    <label class="labelRV labelEnt entrada-ml">Quantidade</label>
    <input
      v-model.number="quantidade"
      @input="quantidade = Math.max(1, Math.floor(quantidade))"
      type="number"
      min="1"
      step="1"
      class="inputQuantidade inputQuant entrada-ml"
    /><br>

    <label class="labelRV labelEnt entrada-ml">Valor Unitário</label>
    <input
      v-model="valorUnitario"
      type="number"
      min="0"
      step="0.01"
      placeholder="R$ 0.00"
      class="  inputVUentrada"
    /><br>

    <div v-if="erro" class="erro">{{ erro }}</div>
    <div v-else-if="loading">Carregando produtos...</div>
  </div>

  <div class="containerRV2">
    <button @click="cadastrar" class="botaoCadastro botaoRV">
      Enviar
    </button>
  </div>
</template>

<style>

.entrada-ml{
margin-left: 2vw;
}
.inputVUentrada{
  margin-left: 1.4vw;
  width: 5vw;
}
</style>