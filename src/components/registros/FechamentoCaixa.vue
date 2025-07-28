<template>
  <h2>Fechamento de Caixa</h2>

  <div class="containerRV metrics-container">
    <div v-if="loading" class="loading">Carregando...</div>
    <div v-else-if="erro" class="erro">{{ erro }}</div>
    <div v-else>
      <!-- Filtros -->
      <div class="filter-row">
        <label class="filter-label">Data</label>
        <input
          v-model="dateValue"
          type="date"
          class="inputFormBP"
          @change="fetchClosing"
        />

        <label class="filter-label">Vendedor</label>
        <select
          v-model="vendedorSelecionado"
          class="select-search"
          @change="fetchClosing"
        >
          <option :value="null">-- selecione --</option>
          <option
            v-for="v in sortedVendedores"
            :key="v.id"
            :value="v.id"
          >{{ v.nome }}</option>
        </select>

        <button @click="generatePDF" class="botaoPDF">Baixar PDF</button>
      </div>

      <!-- Valores por forma de pagamento -->
      <div class="metrics-cards">
        <div
          v-for="(dados, forma) in valoresPorForma"
          :key="forma"
          class="card"
        >
          <h3>{{ forma }}</h3>
          <p class="card-value">Recebido: R$ {{ formatMoney(dados.total) }}</p>
          <p class="card-profit">Lucro: R$ {{ formatMoney(dados.lucro) }}</p>
        </div>
        <div class="card total-card">
          <h3>Total Geral</h3>
          <p class="card-value">R$ {{ formatMoney(totalGeral) }}</p>
          <p class="card-profit">Lucro Geral: R$ {{ formatMoney(lucroGeral) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

// estado
const loading = ref(true)
const erro = ref(null)

// filtros
const dateValue = ref(new Date().toISOString().slice(0,10))
const vendedorSelecionado = ref(null)

// dados
const vendedores = ref([])
const valoresPorForma = ref({})
const totalGeral = ref(0)
const lucroGeral = ref(0)

// carregamento de vendedores
async function fetchVendedores() {
  try {
    const res = await fetch('http://127.0.0.1:3000/vendedores')
    if (!res.ok) throw new Error('Erro ao buscar vendedores')
    vendedores.value = await res.json()
  } catch (e) {
    console.error(e)
  }
}

// busca fechamento de caixa
async function fetchClosing() {
  if (!dateValue.value || !vendedorSelecionado.value) {
    loading.value = false
    return
  }
  loading.value = true
  erro.value = null
  try {
    const params = new URLSearchParams({
      date: dateValue.value,
      vendedor: vendedorSelecionado.value
    })
    const res = await fetch(`http://127.0.0.1:3000/fechamento?${params.toString()}`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    // resposta: { valoresPorForma, totalGeral, lucroGeral }
    valoresPorForma.value = data.valoresPorForma || {}
    totalGeral.value = parseFloat(data.totalGeral) || 0
    lucroGeral.value = parseFloat(data.lucroGeral) || 0
  } catch (e) {
    erro.value = e.message
  } finally {
    loading.value = false
  }
}

// ordenação
const sortedVendedores = computed(() =>
  [...vendedores.value].sort((a,b) =>
    a.nome.localeCompare(b.nome, 'pt', { sensitivity:'base' })
  )
)

// formata dinheiro
function formatMoney(val) {
  return Number(val).toFixed(2)
}

// PDF
function generatePDF() {
  const doc = new jsPDF({ orientation: 'landscape' })
  const head = [['Forma','Recebido (R$)','Lucro (R$)']]
  const body = Object.entries(valoresPorForma.value).map(([forma, d]) => [
    forma,
    d.total.toFixed(2),
    d.lucro.toFixed(2)
  ])
  // adicionar totais no final
  body.push([
    'TOTAL GERAL',
    totalGeral.value.toFixed(2),
    lucroGeral.value.toFixed(2)
  ])
  autoTable(doc, {
    head,
    body,
    startY: 20,
    styles: { fontSize: 10 },
  })
  doc.save(`fechamento_${dateValue.value}_${vendedorSelecionado.value}.pdf`)
}

// on mount
onMounted(async () => {
  await fetchVendedores()
  await fetchClosing()
})
</script>

<style scoped>
.metrics-container {
  background: #fff;
  padding: 1.5rem;
  border-radius: 8px;
}
.filter-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.filter-label {
  font-weight: 600;
}
.select-search,
.inputFormBP {
  padding: 0.5rem 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  height: 5vh;
}
.botaoPDF {
  padding: 0.5rem 1rem;
  background: #007bff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.metrics-cards {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}
.card {
  flex: 1;
  background: #9e9fa1;
  padding: 1rem;
  border-radius: 6px;
  text-align: center;
}
.card h3 {
  margin-bottom: 0.5rem;
  color: #004085;
}
.card-value {
  font-size: 1.5rem;
  font-weight: bold;
}
.card-profit {
  font-size: 1.2rem;
  color: #383838;
}
.total-card {
  background: #0069d97e;
}
.loading,
.erro {
  text-align: center;
  margin: 2rem 0;
  color: #666;
}
@media(max-width:768px) {
  .filter-row,
  .metrics-cards {
    flex-direction: column;
  }
}
</style>
