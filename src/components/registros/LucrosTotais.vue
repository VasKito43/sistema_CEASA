<template>
  <h2>Lucros Totais</h2>

  <div class="containerRV metrics-container">
    <div v-if="loading" class="loading">Carregando...</div>
    <div v-else-if="erro" class="erro">{{ erro }}</div>
    <div v-else>
      <!-- Filtros Superiores -->
      <div class="filter-row">
        <label class="filter-label">Vendedor</label>
        <select
          v-model="vendedorSelecionado"
          class="select-search"
          @change="fetchMetrics"
        >
          <option :value="null">-- selecione --</option>
          <option
            v-for="v in sortedVendedores"
            :key="v.id"
            :value="v.id"
          >{{ v.nome }}</option>
        </select>

        <label class="filter-label period-label">Período</label>
        <select
          v-model="periodType"
          @change="onPeriodChange"
          class="inputFormBP period-select"
        >
          <option value="month">Mês</option>
          <option value="year">Ano</option>
        </select>
        <input
          v-if="periodType === 'month'"
          v-model="periodValue"
          type="month"
          class="inputFormBP period-input"
          @change="fetchMetrics"
        />
        <input
          v-else
          v-model="periodValue"
          type="number"
          min="2000"
          max="2100"
          placeholder="Ano"
          class="inputFormBP period-input"
          @change="fetchMetrics"
        />
      </div>

      <!-- Cartões de Métricas -->
      <div class="metrics-cards">
        <div class="card">
          <h3>Total de Vendas</h3>
          <p class="card-value">R$ {{ totalVendas }}</p>
        </div>
        <div class="card">
          <h3>Lucro Total</h3>
          <p class="card-value">R$ {{ lucro }}</p>
        </div>
        <div class="card">
          <h3>N° de Vendas</h3>
          <p class="card-value">{{ numVendas }}</p>
        </div>
      </div>

      <!-- Filtros Inferiores -->
      <div class="filter-row bottom-filters">
        <div class="filter-section">
          <h4>Produto</h4>
          <select
            v-model="produtoSelecionado"
            class="select-search"
            @change="fetchMetrics"
          >
            <option :value="null">-- selecione --</option>
            <option
              v-for="p in sortedProdutos"
              :key="p.id"
              :value="p.id"
            >{{ p.nome }}</option>
          </select>
        </div>
        <div class="filter-section">
          <h4>Cliente</h4>
          <select
            v-model="clienteSelecionado"
            class="select-search"
            @change="fetchMetrics"
          >
            <option :value="null">-- selecione --</option>
            <option
              v-for="c in sortedClientes"
              :key="c.id"
              :value="c.id"
            >{{ c.nome }}</option>
          </select>
        </div>
        <div class="filter-section">
          <h4>Forma de Pagamento</h4>
          <select
            v-model="formaPagamentoSelecionada"
            class="select-search"
            @change="fetchMetrics"
          >
            <option :value="null">-- selecione --</option>
            <option
              v-for="f in sortedFormas"
              :key="f.id"
              :value="f.id"
            >{{ f.nome }}</option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

// filtros
const periodType = ref('month')
const periodValue = ref('')
const vendedorSelecionado = ref(null)
const produtoSelecionado = ref(null)
const clienteSelecionado = ref(null)
const formaPagamentoSelecionada = ref(null)

// dados métricos
const totalVendas = ref('0.00')
const lucro       = ref('0.00')
const numVendas   = ref(0)
const loading     = ref(true)
const erro        = ref(null)

// listas para selects
const vendedores = ref([])
const produtos   = ref([])
const clientes   = ref([])
const formas     = ref([])

// Carrega vendors, produtos, clientes, formas
async function fetchLists() {
  const [rv, rp, rc, rf] = await Promise.all([
    fetch('http://127.0.0.1:3000/vendedores'),
    fetch('http://127.0.0.1:3000/produtos'),
    fetch('http://127.0.0.1:3000/clientes'),
    fetch('http://127.0.0.1:3000/formas_pagamentos')
  ])
  vendedores.value = await rv.json()
  produtos.value   = await rp.json()
  clientes.value   = await rc.json()
  formas.value     = await rf.json()
}

// computed ordenados
const sortedVendedores = computed(() =>
  [...vendedores.value].sort((a, b) =>
    a.nome.localeCompare(b.nome, 'pt', { sensitivity: 'base' })
  )
)
const sortedProdutos = computed(() =>
  [...produtos.value].sort((a, b) =>
    a.nome.localeCompare(b.nome, 'pt', { sensitivity: 'base' })
  )
)
const sortedClientes = computed(() =>
  [...clientes.value].sort((a, b) =>
    a.nome.localeCompare(b.nome, 'pt', { sensitivity: 'base' })
  )
)
const sortedFormas = computed(() => formas.value)

// inicializa periodValue e busca
function onPeriodChange() {
  if (periodType.value === 'month') {
    periodValue.value = new Date().toISOString().slice(0, 7)
  } else {
    periodValue.value = new Date().getFullYear().toString()
  }
  fetchMetrics()
}

// busca métricas no backend
async function fetchMetrics() {
  if (!periodValue.value) return
  loading.value = true
  erro.value    = null
  try {
    const params = new URLSearchParams()
    params.append('periodType', periodType.value)
    params.append('periodValue', periodValue.value)
    if (vendedorSelecionado.value)      params.append('vendedor',   vendedorSelecionado.value)
    if (produtoSelecionado.value)       params.append('produto',     produtoSelecionado.value)
    if (clienteSelecionado.value)       params.append('cliente',     clienteSelecionado.value)
    if (formaPagamentoSelecionada.value) params.append('pagamento',  formaPagamentoSelecionada.value)

    const res = await fetch(`http://127.0.0.1:3000/lucros?${params.toString()}`)
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}))
      throw new Error(errData.details || errData.error || `HTTP ${res.status}`)
    }
    const data = await res.json()
    totalVendas.value = data.receita.toFixed(2)
    lucro.value       = data.lucro.toFixed(2)
    numVendas.value   = data.numVendas
  } catch (e) {
    console.error('fetchMetrics erro:', e)
    erro.value = e.message
  } finally {
    loading.value = false
  }
}

// On mount
onMounted(async () => {
  await fetchLists()
  onPeriodChange()
})
</script>

<style scoped>
.page-title { font-size: 2rem; margin-bottom: 1rem; color: #333; }
.metrics-container {
  background: #fff;
  padding: 2rem;
  border-radius: 8px 8px 0 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  width: 100%;
  min-height: 700px;
}
.filter-row { display: flex; align-items: center; gap: 1.5rem; margin-bottom: 1.5rem; }
.filter-label, .period-label { font-weight: 700; color: #333; font-size: 1.2rem; }
.select-search, .inputFormBP, .period-select, .period-input {
  padding: 0.75rem 1.25rem; border: 1px solid #bbb; border-radius: 4px; background: #fafafa;
  font-size: 1.1rem; transition: border-color 0.2s;
}
.select-search:focus, .inputFormBP:focus { outline: none; border-color: #0069d9; }
.period-select { width: 9rem; }
.period-input { width: 14rem; }
.metrics-cards {
  display: flex; gap: 1.25rem; justify-content: space-between; margin-bottom: 2rem;
}
.card {
  flex: 1; background: #eaf1ff; padding: 1.25rem; border-radius: 6px; text-align: center;
}
.card h3 { margin-bottom: 1rem; color: #004085; font-size: 1.4rem; }
.card-value { font-size: 2.25rem; font-weight: bold; color: #003366; }
.bottom-filters {
  display: flex; gap: 2rem; background: #fff; padding: 1.25rem; border-radius: 0 0 8px 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}
.filter-section {
  flex: 1; display: flex; flex-direction: column; gap: 0.75rem;
}
.filter-section h4 { margin: 0; color: #333; font-size: 1.1rem; }
@media (max-width: 768px) {
  .metrics-cards, .filter-row, .bottom-filters {
    flex-direction: column; align-items: flex-start;
  }
  .select-search, .period-select, .period-input {
    width: 100%;
  }
}
</style>
