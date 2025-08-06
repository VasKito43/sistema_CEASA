<script setup>
import { ref, onMounted, computed, watch } from 'vue'
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
const dataSelecionada = ref(new Date().toISOString().slice(0,10))
const multiVisible   = ref(false)
const multiEntries   = ref([])  // array de objetos { produtoId, quantidade, valor_custo, valor_venda, descricao }



const localFilter = ref(null)
const locais = ['CAMPO MOURÃO', 'MARINGÁ']
const filteredProdutos = computed(() =>
  sortedProdutos.value.filter(p =>
    !localFilter.value || p.local === localFilter.value
  ))


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
const selectedProdutoObj = computed(() =>
  produtos.value.find(p => p.id === produtoSelecionado.value)
)

// Fetch functions
async function fetchProdutos() {
  const res = await fetch('https://backendvue.onrender.com/produtos')
  if (!res.ok) throw new Error('Erro ao buscar produtos')
  produtos.value = await res.json()
}
async function fetchVendedores() {
  const res = await fetch('https://backendvue.onrender.com/vendedores')
  if (!res.ok) throw new Error('Erro ao buscar vendedores')
  vendedores.value = await res.json()
}
async function fetchClientes() {
  const res = await fetch('https://backendvue.onrender.com/clientes')
  if (!res.ok) throw new Error('Erro ao buscar clientes')
  clientes.value = await res.json()
}
async function fetchFormas() {
  const res = await fetch('https://backendvue.onrender.com/formas_pagamentos')
  if (!res.ok) throw new Error('Erro ao buscar formas de pagamento')
  formasPagamento.value = await res.json()
}

async function submitAll() {
  // 1) Validação geral de vendedor, cliente, forma e data
  if (
    vendedorSelecionado.value == null ||
    clienteSelecionado.value == null ||
    formaPagamentoSelecionada.value == null ||
    !dataSelecionada.value
  ) {
    alert('Preencha vendedor, cliente, forma de pagamento e data corretamente.')
    return
  }

  // 2) Validação de cada entrada antes de qualquer fetch
  for (const entry of multiEntries.value) {
    if (
      entry.produtoId == null ||
      entry.quantidade < 1 ||
      entry.valor_custo == null || isNaN(entry.valor_custo) ||
      entry.valor_venda == null || isNaN(entry.valor_venda)
    ) {
      alert('Preencha todos os campos de cada produto corretamente antes de enviar.')
      return
    }
  }

  // 3) Se chegou aqui, todas as entradas estão válidas → envia uma a uma
  for (const entry of multiEntries.value) {
    const payload = {
      usuarioId: store.estado.funcionario.id,
      produtoId: entry.produtoId,
      quantidade: Number(entry.quantidade),
      data: dataSelecionada.value,
      vendedorId: vendedorSelecionado.value,
      descricao: descricao.value, // descrição fixa
      valor_custo: parseFloat(entry.valor_custo),
      valor_venda: parseFloat(entry.valor_venda),
      id_cliente: clienteSelecionado.value,
      id_forma_pagamento: formaPagamentoSelecionada.value
    }

    try {
      const res = await fetch('https://backendvue.onrender.com/realizarSaida', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Falha ao registrar saída')
      }
    } catch (e) {
      console.error(e)
      alert('Erro ao realizar as saídas: ' + e.message)
      return
    }
  }

  // 4) Todas as saídas enviadas com sucesso
  alert('Saídas realizadas com sucesso!')
  multiEntries.value = []
  multiVisible.value = false
}


function addEntry() {
  multiEntries.value.push({
    produtoId: null,
    quantidade: 1,
    valor_custo: 0,
    valor_venda: 0,
    descricao: ''
  })
}
function removeEntry(idx) {
  multiEntries.value.splice(idx, 1)
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

// Preenche valor de custo automaticamente quando escolhe produto
watch(produtoSelecionado, novoId => {
  if (novoId != null) {
    const prod = produtos.value.find(p => p.id === novoId)
    valorCusto.value = prod ? prod.valor : null
  } else {
    valorCusto.value = null
  }
})
watch(multiEntries, entries => {
  entries.forEach(entry => {
    watch(() => entry.produtoId, id => {
      const prod = produtos.value.find(p => p.id === id)
      entry.valor_custo = prod ? prod.valor : 0
    })
  })
}, { deep: true })


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
    data: dataSelecionada.value,
    vendedorId: vendedorSelecionado.value,
    descricao: descricao.value,
    valor_custo: parseFloat(valorCusto.value),
    valor_venda: parseFloat(valorVenda.value),
    id_cliente: clienteSelecionado.value,
    id_forma_pagamento: formaPagamentoSelecionada.value
  }

  try {
    const res = await fetch('https://backendvue.onrender.com/realizarSaida', {
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
  
  <div class="containerRV metrics-container">
    <div v-if="loading">Carregando...</div>
    <div v-else-if="erro" class="erro">{{ erro }}</div>
    <div v-else>
      <div class="multi-controls">
        <button @click="multiVisible = true; addEntry()" class="botaoAdd">
          + Adicionar Produto
        </button>
        <button v-if="multiVisible && multiEntries.length" @click="submitAll()" class="botaoEnviarMulti">
          Enviar Todas
        </button>
      </div>
      <!-- select de local -->
      <div class="row">
        <label>Local</label>
        <select v-model="localFilter" class="select-search">
          <option :value="null">-- todos --</option>
          <option v-for="l in locais" :key="l" :value="l">{{ l }}</option>
        </select>
      </div>
      <div class="row">
        <label>Data da Saída</label>
        <input type="date" v-model="dataSelecionada" class="select-search" />
      </div>
      <!-- <div class="row">
        <label>Produto</label>
        <select v-model="produtoSelecionado" class="select-search">
          <option :value="null">-- selecione --</option>
          <option v-for="p in filteredProdutos" :key="p.id" :value="p.id">{{ p.nome }}</option>
        </select>
      </div> -->
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
      <!-- <div class="row">
        <label>
          Quantidade 
          <small>(Disponível: {{ selectedProdutoObj?.quantidade || 0 }})</small>
        </label>
        <input type="number" v-model.number="quantidade" min="1" />
      </div>
      <div class="row">
        <label>Valor de Custo (R$)</label>
        <input type="number" v-model="valorCusto" step="0.01" />
      </div>
      <div class="row">
        <label>Valor de Venda (R$)</label>
        <input type="number" v-model="valorVenda" step="0.01" />
      </div> -->
      <div v-if="multiVisible" class="multi-entries">
      <div v-for="(entry, idx) in multiEntries" :key="idx" class="entry-row">
        <div class="entry-field">
        <label>Produto</label>
        <select v-model="entry.produtoId">
          <option :value="null">-- selecione produto --</option>
          <option v-for="p in filteredProdutos" :key="p.id" :value="p.id">{{ p.nome }}</option>
        </select>
      </div>
      <div class="entry-field">
        <label>
          Quantidade
          <small>
            (Disponível:
             {{
               // encontra o produto no array "produtos"
               (produtos.find(p => p.id === entry.produtoId)?.quantidade || 0)
             }}
            )
          </small>
        </label>
        <input type="number" v-model.number="entry.quantidade" min="1" />
      </div>
      <div class="entry-field">
        <label>Valor de Custo (R$)</label>
        <input type="number" v-model="entry.valor_custo" step="0.01" />
      </div>
      <div class="entry-field">
        <label>Valor de Venda (R$)</label>
        <input type="number" v-model="entry.valor_venda" step="0.01" />
      </div>
        <button @click="removeEntry(idx)" class="botaoRemover">×</button>
      </div>
    </div>
      <div class="row">
        <label>Descrição (opcional)</label>
        <textarea v-model="descricao" class="desc"></textarea>
      </div>
    </div>
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
/* controles de múltiplas entradas */
.multi-controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}
.botaoAdd,
.botaoEnviarMulti,
.botaoRemover {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.botaoAdd { background: #28a745; color: #fff; }
.botaoEnviarMulti { background: #007bff; color: #fff; }
.botaoRemover {
  background: #dc3545;
  color: #fff;
  margin-left: 0.5rem;
}

/* entradas dinâmicas */
.multi-entries {
  border: 1px dashed #ccc;
  padding: 1rem;
  margin-bottom: 1.5rem;
}
.entry-row {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}
.entry-row select,
.entry-row input,
.entry-row textarea {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.entry-row textarea {
  resize: vertical;
}
.entry-row select,
.entry-row input,
.entry-row textarea {
  width: 100%;
}

.entry-field {
  display: flex;
  flex-direction: column;
  margin-bottom: 0.75rem;
}
.entry-field label {
  font-weight: bold;
  margin-bottom: 0.25rem;
}
.entry-field select,
.entry-field input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}
.metrics-container {
  background: #fff;
  padding: 2rem;
  border-radius: 8px 8px 0 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  width: 100%;
  min-height: 79vh;
}
@media (max-width: 768px) {
  .row {
    width: 80vw;
  }
}
</style>
