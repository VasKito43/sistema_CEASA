<template>
  <h2>Registros de Saída</h2>

  <div class="containerRV">
    <div v-if="loading" class="loading">Carregando...</div>
    <div v-else-if="erro" class="erro">{{ erro }}</div>
    <div v-else>
      <div class="pdf-button-container">
        <button @click="generatePDF" class="botaoPDF">Exportar PDF</button>
      </div>
      <ul class="ulEstoque">
        <li
          v-for="grupo in gruposPorCliente"
          :key="grupo.cliente_nome + grupo.data"
          class="itemEntrada"
        >
          <h4 class="campo-grupo">
            Cliente: {{ grupo.cliente_nome }}
          </h4>
          <h4 class="campo-grupo">
            Data: {{ formatDate(grupo.data) }}
          </h4>
          <ul class="sub-lista">
            <li
              v-for="item in grupo.itens"
              :key="item.id"
              class="sub-item"
            >
              <h5 class="campo">Usuário: <span>{{ item.usuario_nome }}</span></h5>
              <h5 class="campo">Produto: <span>{{ item.produto_nome }}</span></h5>
              <h5 class="campo">Quantidade: <span>{{ item.quantidade }}</span></h5>
              <h5 class="campo">Data: <span>{{ formatDate(item.data) }}</span></h5>
              <h5 class="campo">Vendedor: <span>{{ item.vendedor_nome }}</span></h5>
              <h5 class="campo">Cliente: <span>{{ item.cliente_nome }}</span></h5>
              <h5 class="campo">Forma Pagamento: <span>{{ item.forma_pagamento_nome }}</span></h5>
              <h5 class="campo">Valor Custo: <span>R$ {{ item.valor_custo.toFixed(2) }}</span></h5>
              <h5 class="campo">Valor Venda: <span>R$ {{ item.valor_venda.toFixed(2) }}</span></h5>
              <h5 class="campo destaque">
                Total da Saída: <span>R$ {{ item.total_saida.toFixed(2) }}</span>
              </h5>
              <h5 class="campo destaque">
                Lucro da Saída: <span>R$ {{ item.lucro_saida.toFixed(2) }}</span>
              </h5>

              <div class="item-actions">
                <button @click="editar(item)" class="btnEdit">✎</button>
                <button @click="confirmDelete(item)" class="btnDelete">🗑️</button>
              </div>
            </li>
          </ul>
        </li>
      </ul>

      <!-- Modal de edição -->
      <div v-if="editItem" class="modalEdit">
        <div class="modalContent">
          <h3>Editando Saída #{{ editItem.id }}</h3>

          <div class="row">
            <label>Local do Produto (filtra produtos)</label>
            <select v-model="editLocalFilter" class="select-search">
              <option :value="null">-- todos --</option>
              <option v-for="l in locais" :key="l" :value="l">{{ l }}</option>
            </select>
          </div>

          <div class="row">
             <label>Produto</label>
             <select v-model="editForm.produtoId">
                <option :value="null">-- selecione --</option>
                <option v-for="p in filteredProdutosEdit" :key="p.id" :value="p.id">{{ p.nome }}</option>
              </select>
           </div>

          <div class="row">
            <label>Quantidade</label>
            <input type="number" v-model.number="editForm.quantidade" min="1" />
          </div>

          <div class="row">
            <label>Valor de Custo</label>
            <input type="number" v-model.number="editForm.valor_custo" step="0.01" />
          </div>

          <div class="row">
            <label>Valor de Venda</label>
            <input type="number" v-model.number="editForm.valor_venda" step="0.01" />
          </div>

          <div class="row">
             <label>Data</label>
             <input type="date" v-model="editForm.data" />
           </div>

          <div class="row">
            <label>Vendedor</label>
            <select v-model="editForm.vendedorId">
              <option :value="null">-- selecione --</option>
              <option v-for="v in sortedVendedores" :key="v.id" :value="v.id">{{ v.nome }}</option>
            </select>
          </div>

           <div class="row">
             <label>Forma de Pagamento</label>
              <select v-model="editForm.id_forma_pagamento">
                <option :value="null">-- selecione --</option>
                <option
                  v-for="f in sortedFormas"
                  :key="f.id"
                  :value="f.id"
                >{{ f.nome }}</option>
              </select>
           </div>

          <div class="actions">
            <button @click="salvarEdicao" class="botaoSalvar">Salvar</button>
            <button @click="cancelEdit" class="botaoCancelar">Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- === FILTROS === -->
  <div class="containerBP">
    <div class="form2 period-filter">
      <h4 class="title-filter">Buscar por texto:</h4>
      <input
        type="text"
        v-model="filtroTexto"
        placeholder="Usuário, produto, vendedor ou cliente"
        class="inputFormEstoque title-filter"
      />
    </div>
    <div class="form2 period-filter">
      <h4 class="title-filter">Local:</h4>
      <select v-model="localFilter" class="inputFormEstoque title-filter">
        <option :value="null">-- todos --</option>
        <option v-for="l in locais" :key="l" :value="l">{{ l }}</option>
      </select>
    </div>
    <div class="form2 period-filter">
      <h4 class="title-filter">Período:</h4>
      <select
        v-model="periodType"
        @change="onPeriodChange"
        class="inputFormEstoque title-filter"
      >
        <option value="year">Ano</option>
        <option value="month">Mês</option>
        <option value="day">Dia</option>
      </select>
      <input
        v-if="periodType === 'day'"
        type="date"
        v-model="periodValue"
        @change="filtrarSaidas"
        class="inputFormEstoque title-filter"
      />
      <input
        v-else-if="periodType === 'month'"
        type="month"
        v-model="periodValue"
        @change="filtrarSaidas"
        class="inputFormEstoque title-filter"
      />
      <input
        v-else
        type="number"
        min="2000"
        max="2100"
        v-model="periodValue"
        @change="filtrarSaidas"
        placeholder="Ano"
        class="inputFormEstoque title-filter"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { groupBy } from 'lodash'

const API_BASE = 'https://backendvue.onrender.com' // ajuste se necessário

const localFilter = ref(null)
const locais = ['CAMPO MOURÃO', 'MARINGÁ']
const editLocalFilter = ref(null)

// estado
const saidas = ref([])
const erro = ref(null)
const loading = ref(true)

// filtros
const filtroTexto = ref('')
const periodType  = ref('month')
const periodValue = ref('')

// dados auxiliares
const produtos = ref([])
const formasPagamento = ref([])
const vendedores = ref([])

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
function formatDateISO(iso) {
  return new Date(iso).toISOString().slice(0,10)
}
function formatMoney(val) {
  return `R$ ${val.toFixed(2)}`
}

function filtrarSaidas() { /* recompute automatico via computed */ }

function onPeriodChange() {
  if (periodType.value === 'day') {
    periodValue.value = new Date().toISOString().slice(0,10)
  } else if (periodType.value === 'month') {
    periodValue.value = new Date().toISOString().slice(0,7)
  } else {
    periodValue.value = new Date().getFullYear().toString()
  }
}

/* ---------------------------
   GRUPOS / EDIÇÃO / AÇÕES
   --------------------------- */
const gruposPorCliente = computed(() => {
  const lista = saidasFiltradasOrdenado.value
  const mapa = groupBy(lista, item => {
    const d = formatDateISO(item.data)
    return `${item.cliente_nome}__${d}`
  })
  return Object.entries(mapa).map(([chave, itens]) => {
    const [cliente_nome, data] = chave.split('__')
    return { cliente_nome, data, itens }
  })
})

const editItem = ref(null)
const editForm = reactive({
  produtoId: null,
  quantidade: 0,
  valor_custo: 0,
  valor_venda: 0,
  data: '',
  id_forma_pagamento: null,
  vendedorId: null
})

function cancelEdit() {
  editItem.value = null
  // limpa filtro local edit
  editLocalFilter.value = null
}

async function editar(item) {
  // garante que temos produtos/formas/vendedores carregados
  if (produtos.value.length === 0) await fetchProdutos()
  if (formasPagamento.value.length === 0) await fetchFormas()
  if (vendedores.value.length === 0) await fetchVendedores()

  editItem.value = item
  Object.assign(editForm, {
    produtoId: item.produto_id,
    quantidade: item.quantidade,
    valor_custo: item.valor_custo,
    valor_venda: item.valor_venda,
    data: formatDateISO(item.data),
    id_forma_pagamento: item.forma_pagamento_id,
    vendedorId: item.vendedor_id
  })
  // set local filter to the product's local to make product select show correctly
  editLocalFilter.value = item.produto_local || null
}

async function salvarEdicao() {
  if (!editItem.value) return
  // validações locais (sem fazer fetch)
  if (
    editForm.produtoId == null ||
    editForm.id_forma_pagamento == null ||
    editForm.vendedorId == null ||
    editForm.quantidade < 1 ||
    editForm.valor_custo == null || isNaN(editForm.valor_custo) ||
    editForm.valor_venda == null || isNaN(editForm.valor_venda) ||
    !editForm.data
  ) {
    alert('Preencha todos os campos obrigatórios corretamente')
    return
  }

  try {
    const payload = {
      produtoId_antigo:   editItem.value.produto_id,
      produtoId_novo:     editForm.produtoId,
      quantidade_antiga:  editItem.value.quantidade,
      quantidade_nova:    editForm.quantidade,
      valor_custo:        +editForm.valor_custo,
      valor_venda:        +editForm.valor_venda,
      data:               editForm.data,
      id_forma_pagamento: editForm.id_forma_pagamento,
      vendedorId:         editForm.vendedorId
    }

    const res = await fetch(`${API_BASE}/atualizarSaida/${editItem.value.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || 'Falha ao salvar edição')
    }

    alert('Saída atualizada com sucesso!')
    editItem.value = null
    await recebeSaidas()
  } catch (e) {
    console.error('Erro ao atualizar saída:', e)
    alert(`Erro ao atualizar saída: ${e.message}`)
  }
}

/* ---- exclusão com confirmação ---- */
async function confirmDelete(item) {
  const ok = confirm(`Confirma exclusão da saída #${item.id} — produto: ${item.produto_nome}, qtd: ${item.quantidade}?`)
  if (!ok) return
  try {
    const res = await fetch(`${API_BASE}/deletarSaida/${item.id}`, { method: 'DELETE' })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || `Erro ao deletar (HTTP ${res.status})`)
    }
    alert('Saída excluída com sucesso.')
    await recebeSaidas()
  } catch (e) {
    console.error('Erro ao excluir saída:', e)
    alert(`Erro ao excluir: ${e.message}`)
  }
}

/* ---------------------------
   FILTROS / LISTAGEM / DATA
   --------------------------- */
const saidasFiltradasOrdenado = computed(() => {
  return saidas.value
    .map(item => {
      const vVenda = parseFloat(item.valor_venda) || 0
      const vCusto = parseFloat(item.valor_custo) || 0
      const qtd    = parseInt(item.quantidade)     || 0
      return {
        ...item,
        valor_venda: vVenda,
        valor_custo: vCusto,
        total_saida: vVenda * qtd,
        lucro_saida: (vVenda - vCusto) * qtd
      }
    })
    .filter(item => {
      if (localFilter.value && item.produto_local !== localFilter.value) return false
      const txt = filtroTexto.value.toLowerCase()
      const rawDate = parseDateUTC(item.data)
        .toISOString()
        .slice(0,
          periodType.value === 'day'   ? 10 :
          periodType.value === 'month' ? 7  :
          4
        )

      const matchTxt  = !txt ||
        item.usuario_nome.toLowerCase().includes(txt) ||
        item.produto_nome.toLowerCase().includes(txt) ||
        item.vendedor_nome.toLowerCase().includes(txt) ||
        item.cliente_nome.toLowerCase().includes(txt) ||
        item.forma_pagamento_nome.toLowerCase().includes(txt)

      const matchDate = !periodValue.value || rawDate === periodValue.value

      return matchTxt && matchDate
    })
    .sort((a,b) => parseDateUTC(b.data) - parseDateUTC(a.data))
})

/* ---------------------------
   FETCH / DATA LOADING
   --------------------------- */
async function recebeSaidas() {
  loading.value = true
  try {
    const resp = await fetch(`${API_BASE}/recebeSaidas`)
    if (!resp.ok) throw new Error(`Erro HTTP ${resp.status}`)
    saidas.value = await resp.json()
  } catch (e) {
    erro.value = e.message
  } finally {
    loading.value = false
  }
}

async function fetchProdutos() {
  const res = await fetch(`${API_BASE}/produtos`)
  if (!res.ok) throw new Error('Erro ao buscar produtos')
  produtos.value = await res.json()
}
async function fetchFormas() {
  const res = await fetch(`${API_BASE}/formas_pagamentos`)
  if (!res.ok) throw new Error('Erro ao buscar formas de pagamento')
  formasPagamento.value = await res.json()
}
async function fetchVendedores() {
  const res = await fetch(`${API_BASE}/vendedores`)
  if (!res.ok) throw new Error('Erro ao buscar vendedores')
  vendedores.value = await res.json()
}

const filteredProdutosEdit = computed(() =>
  produtos.value
    .filter(p => !editLocalFilter.value || p.local === editLocalFilter.value)
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt', { sensitivity: 'base' }))
)

const sortedFormas = computed(() =>
  formasPagamento.value.slice().sort((a, b) => a.nome.localeCompare(b.nome, 'pt', { sensitivity: 'base' }))
)
const sortedVendedores = computed(() =>
  vendedores.value.slice().sort((a, b) => a.nome.localeCompare(b.nome, 'pt', { sensitivity: 'base' }))
)

onMounted(async () => {
  onPeriodChange()
  try {
    await Promise.all([fetchProdutos(), fetchFormas(), fetchVendedores(), recebeSaidas()])
  } catch (e) {
    console.error(e)
  }
})

/* ---------------------------
   PDF
   --------------------------- */
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
  autoTable(doc, {
    head: [columns],
    body: rows,
    startY: 20,
    styles: { fontSize: 8 }
  })
  doc.save('registros_saida.pdf')
}
</script>

<style scoped>
.containerRV {
  padding: 1rem;
}
.loading, .erro {
  text-align: center;
  margin: 2rem 0;
  color: #f0f0f0;
  font-size: 1.2em;
}
.pdf-button-container {
  margin-bottom: 1rem;
}
.botaoPDF {
  padding: 0.5rem 1rem;
  background: #007bff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.ulEstoque {
  list-style: none;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}
.itemEntrada {
  background: #333;
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  margin-right: 0.1vw;
  width: 23vw;
}
.campo-grupo {
  color: #fff;
  margin-bottom: 0.5rem;
}
.sub-lista {
  list-style: none;
  padding: 0;
}
.sub-item {
  background: #444;
  margin-bottom: 0.75rem;
  padding: 0.75rem;
  border-radius: 4px;
  position: relative;
  width: 21.4vw;
}
.sub-item h5 {
  margin: 0.25rem 0;
  font-size: 0.9rem;
  color: #e0e0e0;
}
.sub-item h5 span {
  color: #fff;
  font-weight: 600;
}
.sub-item h5.destaque span {
  color: #00e676;
}
.item-actions {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  display: flex;
  gap: 0.4rem;
}
.inputFormEstoque { padding:0.5rem; border:1px solid #ccc; border-radius:4px; }
.btnEdit {
  background: transparent;
  border: none;
  color: #ffd54f;
  font-size: 1.1rem;
  cursor: pointer;
}
.btnDelete {
  background: transparent;
  border: none;
  color: #ff6b6b;
  font-size: 1.1rem;
  cursor: pointer;
}
.modalEdit {
  background: rgba(0,0,0,0.6);
  position: fixed;
  top: 0; left: 0; right:0; bottom:0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.modalEdit > div {
  background: #fff;
  padding: 1.5rem;
  border-radius: 6px;
  width: 90%;
  max-width: 520px;
}
.row {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
}
.row label {
  font-weight: bold;
  margin-bottom: 0.25rem;
}
.row input, .row select {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}
.botaoSalvar {
  background: #28a745;
  color: #fff;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
}
.botaoCancelar {
  background: #dc3545;
  color: #fff;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
}
.select-search { padding:0.5rem; border:1px solid #ccc; border-radius:4px; }
@media(max-width:768px){
  .itemEntrada, .sub-item {
    width: 100%;
  }
}
</style>
