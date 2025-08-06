<template>
  <h2>Fechamento de Caixa</h2>

  <div class="containerRV metrics-container">
    <div v-if="loading" class="loading">Carregando...</div>
    <div v-else-if="erro" class="erro">{{ erro }}</div>
    <div v-else>
      <!-- Filtros -->
      <div class="filter-row">
        <label class="filter-label period-label">Período</label>
     <select
       v-model="periodType"
       @change="onPeriodChange"
       class="inputFormBP period-select"
     >
       <option value="day">Dia</option>
       <option value="month">Mês</option>
       <option value="year">Ano</option>
     </select>
     <input
       v-if="periodType==='day'"
       v-model="periodValue"
       type="date"
       class="period-input"
       @change="fetchClosing"
     />
     <input
       v-else-if="periodType==='month'"
       v-model="periodValue"
       type="month"
       class="period-input"
       @change="fetchClosing"
     />
     <input
       v-else
       v-model="periodValue"
       type="number"
       min="2000"
       max="2100"
       placeholder="Ano"
       class="period-input"
       @change="fetchClosing"
     />

        <label class="filter-label">Vendedor</label>
        <select
          v-model="vendedorSelecionado"
          class="select-search"
          @change="fetchClosing"
        >
          <option :value="null">-- selecione --</option>
          <option value="CM">CM</option>
          <option value="GERAL">GERAL</option>
          <option value="FAMILIA">FAMILIA</option>
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
          v-for="(métricas, id) in sellerMetrics"
          :key="id"
          class="card extra"
        >
          <h3>{{ getSellerName(id) }}</h3>
          <p class="card-value">R$ {{ formatMoney(métricas.total) }}</p>
          <p class="card-profit">Lucro: R$ {{ formatMoney(métricas.lucro) }}</p>
        </div>
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
import { ref, onMounted, computed, watch  } from 'vue'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

const periodType  = ref('day')
const periodValue = ref(new Date().toISOString().slice(0,10))


const groupMap = {
  CM:      [4,5,6,7,8,9],
  GERAL:   [1,3,4,5,6,7,8,9],
  FAMILIA: [5,8,9]
}

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

const sellerMetrics = ref({})     // ex: { '4': { total: xx, lucro: yy }, ... }

function getSellerName(id) {
  const numId = `${id}`
  console.log(id)
  const seller = vendedores.value.find(v => v.id === numId)
  return seller ? seller.nome : `ID ${id}`
}

function onPeriodChange() {
  if (periodType.value === 'day') {
    periodValue.value = new Date().toISOString().slice(0,10)  // YYYY-MM-DD
  } else if (periodType.value === 'month') {
    periodValue.value = new Date().toISOString().slice(0,7)   // YYYY-MM
  } else {
    periodValue.value = String(new Date().getFullYear())      // YYYY
  }
  fetchClosing()
}

// carregamento de vendedores
async function fetchVendedores() {
  try {
    const res = await fetch('https://backendvue.onrender.com/vendedores')
    if (!res.ok) throw new Error('Erro ao buscar vendedores')
    vendedores.value = await res.json()
  } catch (e) {
    console.error(e)
  }
}

// busca fechamento de caixa
async function fetchClosing() {
  if ((!periodValue.value && periodType.value !== 'day') || !vendedorSelecionado.value) {
    loading.value = false
    return
  }
  loading.value = true
  erro.value = null
  valoresPorForma.value = {}
  sellerMetrics.value   = {}
  totalGeral.value      = 0
  lucroGeral.value      = 0

  // monta os parâmetros de query
  const params = new URLSearchParams({
    periodType:  periodType.value,     // 'day' | 'month' | 'year'
    periodValue: periodValue.value,    // 'YYYY-MM-DD' or 'YYYY-MM' or 'YYYY'
    vendedor:    vendedorSelecionado.value
  })
  const res = await fetch(`https://backendvue.onrender.com/fechamento?${params.toString()}`)

  try {
    const isGroup = ['CM','GERAL','FAMILIA'].includes(vendedorSelecionado.value)
    if (isGroup) {
      const mapIds = {
        CM:      [4,5,6,7,8,9],
        GERAL:   [1,3,4,5,6,7,8,9],
        FAMILIA: [5,8,9]
      }[vendedorSelecionado.value]

      await Promise.all(mapIds.map(async id => {
        const p = new URLSearchParams(params)  // herda date ou period...
        p.set('vendedor', id)
        const r = await fetch(`https://backendvue.onrender.com/fechamento?${p.toString()}`)
        const d = await r.json()
        sellerMetrics.value[id] = {
          total: parseFloat(d.totalGeral),
          lucro: parseFloat(d.lucroGeral)
        }
      }))

      totalGeral.value = Object.values(sellerMetrics.value).reduce((s,x)=> s + x.total, 0)
      lucroGeral.value = Object.values(sellerMetrics.value).reduce((s,x)=> s + x.lucro, 0)
      loading.value = false
      return
    }

    const res = await fetch(`https://backendvue.onrender.com/fechamento?${params.toString()}`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    valoresPorForma.value = data.valoresPorForma || {}
    totalGeral.value      = parseFloat(data.totalGeral)  || 0
    lucroGeral.value      = parseFloat(data.lucroGeral)  || 0

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
async function generatePDF() {
  const doc = new jsPDF({ orientation: 'portrait' })

  // ===== Cabeçalho =====
  doc.setFontSize(14)
  doc.text('Fechamento de Caixa', 14, 20)

  doc.setFontSize(11)
  doc.text(`Data: ${dateValue.value}`, 14, 32)

  const label = ['CM','GERAL','FAMILIA'].includes(vendedorSelecionado.value)
    ? vendedorSelecionado.value
    : getSellerName(vendedorSelecionado.value)
  doc.text(`Vendedor/Grupo: ${label}`, 14, 44)
  // =====================

  // ----- Tabela: Formas de Pagamento -----
  const headFP = [['Forma', 'Recebido (R$)', 'Lucro (R$)']]
  const bodyFP = Object.entries(valoresPorForma.value).map(([f, d]) => [
    f,
    d.total.toFixed(2),
    d.lucro.toFixed(2),
  ])
  bodyFP.push([
    'TOTAL GERAL',
    totalGeral.value.toFixed(2),
    lucroGeral.value.toFixed(2),
  ])

  autoTable(doc, {
    head: headFP,
    body: bodyFP,
    startY: 56,
    styles: { fontSize: 10 },
  })

  // ----- Se for grupo: resumo por vendedor -----
  if (['CM','GERAL','FAMILIA'].includes(vendedorSelecionado.value)) {
    let y = doc.lastAutoTable.finalY + 10

    // título
    doc.setFontSize(12)
    doc.text('Resumo por Vendedor', 14, y)
    y += 8

    const headSV = [['Vendedor', 'Receita (R$)', 'Lucro Ajustado (R$)']]
    const bodySV = []

    // itera apenas sobre quem foi preenchido em sellerMetrics
    for (const [id, stats] of Object.entries(sellerMetrics.value || {})) {
      bodySV.push([
        getSellerName(Number(id)),
        stats.total.toFixed(2),
        stats.lucro.toFixed(2),
      ])
    }

    // total do grupo
    const totReceita = Object.values(sellerMetrics.value || {})
      .reduce((sum, x) => sum + x.total, 0)
    const totLucro = Object.values(sellerMetrics.value || {})
      .reduce((sum, x) => sum + x.lucro, 0)

    bodySV.push([
      'TOTAL GRUPO',
      totReceita.toFixed(2),
      totLucro.toFixed(2),
    ])

    autoTable(doc, {
      head: headSV,
      body: bodySV,
      startY: y,
      styles: { fontSize: 10 },
    })
  }

  doc.save(`fechamento_${dateValue.value}_${vendedorSelecionado.value}.pdf`)
}

onPeriodChange()

// on mount
onMounted(async () => {
  await fetchVendedores()
  await fetchClosing()
})

watch(vendedorSelecionado, () => {
  fetchClosing()
})
watch(periodType, onPeriodChange, { immediate: true })
</script>

<style scoped>
.metrics-container {
  background: #fff;
  padding: 1.5rem;
  border-radius: 8px;
  min-height: 77vh;
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
