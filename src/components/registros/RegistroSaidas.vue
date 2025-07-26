<template>
  <h2>Registros de Saída</h2>

  <!-- Botão para gerar PDF -->


  <div class="containerRV">
    <div v-if="loading" class="loading">Carregando...</div>
    <div v-else-if="erro" class="erro">{{ erro }}</div>
    <div v-else>
      <div class="pdf-button-container">
         <button @click="generatePDF" class="botaoPDF">Exportar PDF</button>
       </div>
      <ul class="ulEstoque">
        <li
          v-for="item in saidasFiltradasOrdenado"
          :key="item.id"
          class="itemEntrada"
        >
          <h5 class="campo">Usuário: <span>{{ item.usuario_nome }}</span></h5>
          <h5 class="campo">Produto: <span>{{ item.produto_nome }}</span></h5>
          <h5 class="campo">Quantidade: <span>{{ item.quantidade }}</span></h5>
          <h5 class="campo">Data: <span>{{ formatDate(item.data) }}</span></h5>
          <h5 class="campo">Vendedor: <span>{{ item.vendedor_nome }}</span></h5>
          <h5 class="campo">Cliente: <span>{{ item.cliente_nome }}</span></h5>
          <h5 class="campo">Forma Pagamento: <span>{{ item.forma_pagamento_nome }}</span></h5>
          <h5 class="campo">Valor Custo: <span>{{ formatMoney(item.valor_custo) }}</span></h5>
          <h5 class="campo">Valor Venda: <span>{{ formatMoney(item.valor_venda) }}</span></h5>
          <h5 class="campo destaque">Total da Saída: <span>{{ formatMoney(item.total_saida) }}</span></h5>
          <h5 class="campo destaque">Lucro da Saída: <span>{{ formatMoney(item.lucro_saida) }}</span></h5>
        </li>
      </ul>
    </div>
  </div>

  <div class="containerBP">
    <div class="form2">
      <h4>Buscar por texto:</h4>
      <input
        type="text"
        v-model="filtroTexto"
        placeholder="Usuário, produto, vendedor ou cliente"
        class="inputFormEstoque"
      />
    </div>
    <div class="form2">
      <h4>Filtrar por data:</h4>
      <input
        type="date"
        v-model="filtroData"
        class="inputFormEstoque"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

// estado
const saidas = ref([])
const erro = ref(null)
const loading = ref(true)

// filtros
const filtroTexto = ref('')
const filtroData = ref('')

// parse e formatação de data
function parseDateUTC(iso) {
  const d = new Date(iso)
  d.setMinutes(d.getMinutes() + d.getTimezoneOffset())
  return d
}
function formatDate(iso) {
  const d = parseDateUTC(iso)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

// helper moeda
function formatMoney(val) {
  return `R$ ${val.toFixed(2)}`
}

// dados enriquecidos e filtrados
const saidasFiltradasOrdenado = computed(() => {
  return saidas.value
    .map(item => {
      const vVenda = parseFloat(item.valor_venda) || 0
      const vCusto = parseFloat(item.valor_custo) || 0
      const qtd = parseInt(item.quantidade) || 0
      return {
        ...item,
        valor_venda: vVenda,
        valor_custo: vCusto,
        total_saida: vVenda * qtd,
        lucro_saida: (vVenda - vCusto) * qtd
      }
    })
    .filter(item => {
      const txt = filtroTexto.value.toLowerCase()
      const dateFilter = filtroData.value
      const rawDate = parseDateUTC(item.data).toISOString().slice(0,10)
      const matchTxt = !txt ||
        item.usuario_nome.toLowerCase().includes(txt) ||
        item.produto_nome.toLowerCase().includes(txt) ||
        item.vendedor_nome.toLowerCase().includes(txt) ||
        item.cliente_nome.toLowerCase().includes(txt) ||
        item.forma_pagamento_nome.toLowerCase().includes(txt)
      const matchDate = !dateFilter || rawDate === dateFilter
      return matchTxt && matchDate
    })
    .sort((a,b) => parseDateUTC(b.data) - parseDateUTC(a.data))
})

// busca no back
async function recebeSaidas() {
  loading.value = true
  try {
    const resp = await fetch('http://127.0.0.1:3000/recebeSaidas')
    if (!resp.ok) throw new Error(`Erro HTTP ${resp.status}`)
    saidas.value = await resp.json()
  } catch (e) {
    erro.value = e.message
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  recebeSaidas()
})

// PDF
function generatePDF() {
  const doc = new jsPDF({ orientation: 'landscape' })
  const columns = [
    'Usuário','Produto','Qtd','Data','Vendedor','Cliente','Forma','Custo','Venda','Total','Lucro'
  ]
  const rows = saidasFiltradasOrdenado.value.map(i => [
    i.usuario_nome,
    i.produto_nome,
    i.quantidade,
    formatDate(i.data),
    i.vendedor_nome,
    i.cliente_nome,
    i.forma_pagamento_nome,
    i.valor_custo.toFixed(2),
    i.valor_venda.toFixed(2),
    i.total_saida.toFixed(2),
    i.lucro_saida.toFixed(2)
  ])
  autoTable(doc, { head: [columns], body: rows, startY: 20, styles: { fontSize: 8 } })
  doc.save('registros_saida.pdf')
}
</script>

<style scoped>
.pdf-button-container { margin:1rem 0; }
.botaoPDF {
  padding:0.5rem 1rem; background:#007bff; color:#fff; border:none; border-radius:4px;
  cursor:pointer; font-size:1rem;
}
.ulEstoque { display:flex; flex-wrap:wrap; gap:1rem; list-style:none; padding:0; }
.itemEntrada { background:#333; padding:1rem; border-radius:6px; width:28vw; }
h5.campo { margin:0.2rem 0; color:#eee; font-size:0.9rem; }
h5.campo span { font-weight:600; color:#fff; }
.campo.destaque span { color:#4caf50; }
.inputFormEstoque { padding:0.5rem; border:1px solid #ccc; border-radius:4px; }
@media(max-width:768px) {
  .itemEntrada { width:76vw; }
  .containerBP { flex-direction:column; }
}
</style>
