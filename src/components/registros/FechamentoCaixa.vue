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
  if (!dateValue.value || !vendedorSelecionado.value) {
    loading.value = false
    return
  }
  loading.value = true
  erro.value = null
  valoresPorForma.value = {}
  sellerMetrics.value   = {}
  totalGeral.value      = 0
  lucroGeral.value      = 0
  try {
    const isGroup = ['CM','GERAL','FAMILIA'].includes(vendedorSelecionado.value)
    if (isGroup) {
      // define arrays conforme cada grupo
      const mapIds = {
        CM:      [4,5,6,7,8,9],
        GERAL:   [1,3,4,5,6,7,8,9],
        FAMILIA: [5,8,9]
      }[vendedorSelecionado.value]
 
      // para cada id, busca métricas individualmente
      await Promise.all(mapIds.map(async id => {
        const p = new URLSearchParams({ date: dateValue.value, vendedor: id })
        const r = await fetch(`https://backendvue.onrender.com/fechamento?${p.toString()}`)
        const d = await r.json()
        sellerMetrics.value[id] = {
          total: parseFloat(d.totalGeral),
          lucro: parseFloat(d.lucroGeral)
        }
      }))
 
      // depois combinar tudo num total
      totalGeral.value = Object.values(sellerMetrics.value).reduce((s,x)=> s + x.total,0)
      lucroGeral.value = Object.values(sellerMetrics.value).reduce((s,x)=> s + x.lucro,0)
      loading.value = false
      return
    }
    const params = new URLSearchParams({
      date: dateValue.value,
      vendedor: vendedorSelecionado.value
    })
    const res = await fetch(`https://backendvue.onrender.com/fechamento?${params.toString()}`)
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
async function generatePDF() {
  const doc = new jsPDF({ orientation: 'portrait' });
  const chosen = vendedorSelecionado.value;

  // mapa de grupos
  const groupMap = {
    CM:      [4,5,6,7,8,9],
    GERAL:   [1,3,4,5,6,7,8,9],
    FAMILIA: [5,8,9]
  };

  // 1) não é grupo: comportamento normal
  if (!groupMap[chosen]) {
    const head = [['Forma','Recebido','Lucro']];
    const body = Object.entries(valoresPorForma.value)
      .map(([f,d]) => [ f, d.total.toFixed(2), d.lucro.toFixed(2) ]);
    body.push([ 'TOTAL GERAL', totalGeral.value.toFixed(2), lucroGeral.value.toFixed(2) ]);
    autoTable(doc, { head, body, startY: 20, styles:{ fontSize:10 } });
    doc.save(`fechamento_${dateValue.value}_${chosen}.pdf`);
    return;
  }

  // 2) É grupo: gerar uma seção por vendedor
  let y = 20;
  for (const id of groupMap[chosen]) {
    // busca fechamento individual
    const res = await fetch(`https://backendvue.onrender.com/fechamento?date=${dateValue.value}&vendedor=${id}`);
    const { valoresPorForma: vf, totalGeral: tg, lucroGeral: lg } = await res.json();

    // título do vendedor
    doc.setFontSize(12);
    doc.text(`Vendedor: ${getSellerName(id)}`, 14, y);
    y += 6;

    // tabela do vendedor
    const head = [['Forma','Recebido','Lucro']];
    const body = Object.entries(vf)
      .map(([f,d]) => [ f, d.total.toFixed(2), d.lucro.toFixed(2) ]);
    body.push([ 'TOTAL', tg.toFixed(2), lg.toFixed(2) ]);

    autoTable(doc, {
      head, body,
      startY: y,
      styles: { fontSize: 8 }
    });
    y = doc.lastAutoTable.finalY + 7;
    if (y > 260) {  // quebra de página
      doc.addPage();
      y = 20;
    }
  }

  // 3) Tabela de TOTAL AGREGADO DO GRUPO
  const totReceita = [], totLucro = [];
  for (const id of groupMap[chosen]) {
    const res = await fetch(`https://backendvue.onrender.com/fechamento?date=${dateValue.value}&vendedor=${id}`);
    const { totalGeral: tg, lucroGeral: lg } = await res.json();
    totReceita.push(tg);
    totLucro.push(lg);
  }
  const sumReceita = totReceita.reduce((a,b) => a + b, 0);
  const sumLucro   = totLucro.reduce((a,b) => a + b, 0);

  let y2 = doc.lastAutoTable.finalY + 5;
  
  doc.setFontSize(12);
  doc.text('TOTAL AGREGADO DO GRUPO', 14, y2);
  y2 += 6;

  autoTable(doc, {
    head: [['','Receita (R$)','Lucro (R$)']],
    body: [[ 
      'TOTAL GRUPO', 
      sumReceita.toFixed(2),
      sumLucro.toFixed(2)
    ]],
    startY: y2,
    styles: { fontSize: 10 }
  });

  // 4) Salvar
  doc.save(`fechamento_${dateValue.value}_${chosen}.pdf`);
}

// on mount
onMounted(async () => {
  await fetchVendedores()
  await fetchClosing()
})

watch(vendedorSelecionado, () => {
  fetchClosing()
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
