<script setup>
import { ref, onMounted, computed } from 'vue'
import { useStore } from '../../store'

const produtos = ref([])
const vendedores = ref([])
const clientes = ref([])
const formasPagamento = ref([])
const erro = ref(null)
const loading = ref(true)
const store = useStore()

// Form state
const produtoSelecionado = ref(null)
const vendedorSelecionado = ref(null)
const clienteSelecionado = ref(null)
const formaPagamentoSelecionada = ref(null)
const quantidade = ref(1)
const descricao = ref('')
const valorCusto = ref(null)
const valorVenda = ref(null)

// Sorted lists
const sortedProdutos = computed(() =>
  produtos.value.slice().sort((a, b) => a.nome.localeCompare(b.nome, 'pt', { sensitivity: 'base' }))
)
const sortedVendedores = computed(() =>
  vendedores.value.slice().sort((a, b) => a.nome.localeCompare(b.nome, 'pt', { sensitivity: 'base' }))
)
const sortedClientes = computed(() =>
  clientes.value.slice().sort((a, b) => a.nome.localeCompare(b.nome, 'pt', { sensitivity: 'base' }))
)
const sortedFormas = computed(() =>
  formasPagamento.value.slice().sort((a, b) => a.nome.localeCompare(b.nome, 'pt', { sensitivity: 'base' }))
)

// Fetch functions
async function fetchProdutos() {
  const res = await fetch('http://127.0.0.1:3000/produtos')
  if (!res.ok) throw new Error('Erro ao buscar produtos')
  produtos.value = await res.json()
}
async function fetchVendedores() {
  const res = await fetch('http://127.0.0.1:3000/vendedores')
  if (!res.ok) throw new Error('Erro ao buscar vendedores')
  vendedores.value = await res.json()
}
async function fetchClientes() {
  const res = await fetch('http://127.0.0.1:3000/clientes')
  if (!res.ok) throw new Error('Erro ao buscar clientes')
  clientes.value = await res.json()
}
async function fetchFormas() {
  const res = await fetch('http://127.0.0.1:3000/formas_pagamentos')
  if (!res.ok) throw new Error('Erro ao buscar formas de pagamento')
  formasPagamento.value = await res.json()
}

onMounted(async () => {
  try {
    await Promise.all([
      fetchProdutos(),
      fetchVendedores(),
      fetchClientes(),
      fetchFormas()
    ])
  } catch (e) {
    erro.value = e.message
  } finally {
    loading.value = false
  }
})

const cadastrar = async () => {
  // Validação dos campos obrigatórios
  if (
    produtoSelecionado.value == null ||
    vendedorSelecionado.value == null ||
    clienteSelecionado.value == null ||
    formaPagamentoSelecionada.value == null ||
    quantidade.value < 1 ||
    valorCusto.value == null || isNaN(valorCusto.value) ||
    valorVenda.value == null || isNaN(valorVenda.value)
  ) {
    alert('Preencha todos os campos obrigatórios corretamente')
    return
  }

  const saida = {
    usuarioId: store.estado.funcionario.id,
    produtoId: produtoSelecionado.value,
    quantidade: Number(quantidade.value),
    data: new Date().toISOString().slice(0,10),
    vendedorId: vendedorSelecionado.value,
    descricao: descricao.value,
    valor_custo: parseFloat(valorCusto.value),
    valor_venda: parseFloat(valorVenda.value),
    id_cliente: clienteSelecionado.value,
    id_forma_pagamento: formaPagamentoSelecionada.value
  }

  try {
    const res = await fetch('http://127.0.0.1:3000/realizarSaida', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(saida)
    })

    if (res.ok) {
      alert('Saída realizada com sucesso!')
      // reset apenas em caso de sucesso
      produtoSelecionado.value = null
      vendedorSelecionado.value = null
      clienteSelecionado.value = null
      formaPagamentoSelecionada.value = null
      quantidade.value = 1
      descricao.value = ''
      valorCusto.value = null
      valorVenda.value = null
    } else {
      const errorJson = await res.json()
      alert('Erro: ' + (errorJson.error || 'Falha ao realizar saída'))
    }
  } catch (e) {
    console.error(e)
    alert('Erro ao realizar saída')
  }
}
</script>

<template>
  <h2>Saída de Produto</h2>

  <div class="containerRV">
    <div v-if="loading">Carregando...</div>
    <div v-else-if="erro" class="erro">{{ erro }}</div>
    <div v-else>
      <div class="row">
        <label>Produto</label>
        <select v-model="produtoSelecionado" class="select-search">
          <option :value="null">-- selecione --</option>
          <option v-for="p in sortedProdutos" :key="p.id" :value="p.id">{{ p.nome }}</option>
        </select>
      </div>
      <div class="row">
        <label>Vendedor</label>
        <select v-model="vendedorSelecionado" class="select-search">
          <option :value="null">-- selecione --</option>
          <option v-for="v in sortedVendedores" :key="v.id" :value="v.id">{{ v.nome }}</option>
        </select>
      </div>
      <div class="row">
        <label>Cliente</label>
        <select v-model="clienteSelecionado" class="select-search">
          <option :value="null">-- selecione --</option>
          <option v-for="c in sortedClientes" :key="c.id" :value="c.id">{{ c.nome }}</option>
        </select>
      </div>
      <div class="row">
        <label>Forma de Pagamento</label>
        <select v-model="formaPagamentoSelecionada" class="select-search">
          <option :value="null">-- selecione --</option>
          <option v-for="f in sortedFormas" :key="f.id" :value="f.id">{{ f.nome }}</option>
        </select>
      </div>
      <div class="row">
        <label>Quantidade</label>
        <input type="number" v-model.number="quantidade" min="1" />
      </div>
      <div class="row">
        <label>Valor de Custo (R$)</label>
        <input type="number" v-model="valorCusto" step="0.01" />
      </div>
      <div class="row">
        <label>Valor de Venda (R$)</label>
        <input type="number" v-model="valorVenda" step="0.01" />
      </div>
      <div class="row">
        <label>Descrição (opcional)</label>
        <textarea v-model="descricao" class="desc"></textarea>
      </div>
    </div>
  </div>

  <div class="containerRV2">
    <button @click="cadastrar" class="botaoCadastro botaoRV">Enviar</button>
  </div>
</template>

<style scoped>
.row {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
}
.row label {
  font-weight: bold;
  margin-bottom: 0.25rem;
}
.row select,
.row input,
.row textarea {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 100%;
  box-sizing: border-box;
}
.desc {
  height: 12vh;
  resize: vertical;
}

/* Estilo específico para select com busca */
.select-search {
  position: relative;
  padding: 0.5rem;
  border: 1px solid #007BFF;
  border-radius: 4px;
  background-color: #fff;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 4 5' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M2 0L0 2h4L2 0zM0 3l2 2 2-2H0z' fill='%23007BFF'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 0.65rem auto;
  appearance: none;
}
.select-search:focus {
  border-color: #0056b3;
  outline: none;
}

@media (max-width: 768px) {
  .row {
    width: 90vw;
  }
}
</style>
