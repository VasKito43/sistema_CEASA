<script setup>
import { ref, computed, onMounted } from 'vue'

const entradas = ref([])
const erro = ref(null)
const loading = ref(true)

// filtros texto e data
const filtroTexto = ref('')
const periodType   = ref('month')   // 'day' | 'month' | 'year'
const periodValue  = ref('')
const localFilter = ref(null)
const locais = ['CAMPO MOURÃO', 'MARINGÁ']


// formata ISO para pt-BR
const formatDate = iso => new Date(iso).toLocaleDateString('pt-BR', {
  day: '2-digit', month: '2-digit', year: 'numeric'
})

// inicializa periodValue conforme tipo
function onPeriodChange() {
  if (periodType.value === 'day') {
    periodValue.value = new Date().toISOString().slice(0,10)
  } else if (periodType.value === 'month') {
    periodValue.value = new Date().toISOString().slice(0,7)
  } else {
    periodValue.value = String(new Date().getFullYear())
  }
}

// computa lista filtrada, enriquecida e ordenada
const entradasFiltradasOrdenado = computed(() => {
  const txt = filtroTexto.value.toLowerCase()
  const pv  = periodValue.value  // YYYY-MM-DD, YYYY-MM ou YYYY

  return entradas.value
    .map(item => {
      const valorUnit = item.valor != null ? parseFloat(item.valor) : 0
      const qtd       = item.quantidade != null ? parseInt(item.quantidade) : 0
      return {
        ...item,
        valor: valorUnit,
        total_entrada: valorUnit * qtd
      }
    })
    .filter(item => {
      if (localFilter.value && item.local !== localFilter.value) return false
      // texto
      const nomeUsuario = item.usuario_nome.toLowerCase()
      const nomeProduto = item.produto_nome.toLowerCase()
      const matchTxt = !txt || nomeUsuario.includes(txt) || nomeProduto.includes(txt)

      // data flexível
      const rawDate = new Date(item.data).toISOString().slice(0,10)
      let matchDate = true
      if (pv) {
        if (periodType.value === 'day') {
          matchDate = rawDate === pv
        } else if (periodType.value === 'month') {
          matchDate = rawDate.slice(0,7) === pv
        } else { // year
          matchDate = rawDate.slice(0,4) === pv
        }
      }
      return matchTxt && matchDate
    })
    .sort((a, b) => new Date(b.data) - new Date(a.data))
})

// busca API
async function recebeEntradas() {
  loading.value = true
  try {
    const resp = await fetch('https://backendvue.onrender.com/recebeEntradas')
    if (!resp.ok) throw new Error(`Erro HTTP ${resp.status}`)
    entradas.value = await resp.json()
  } catch (e) {
    erro.value = e.message
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  onPeriodChange()
  recebeEntradas()
})
</script>

<template>
  <h2>Registros de Entrada</h2>

  <div class="containerRV">
    <div v-if="loading" class="loading">Carregando...</div>
    <div v-else-if="erro" class="erro">{{ erro }}</div>
    <div v-else>
      <ul class="ulEstoque">
        <li
          v-for="item in entradasFiltradasOrdenado"
          :key="item.id"
          class="itemEntrada"
        >
          <h5 class="campo">Usuário: <span>{{ item.usuario_nome }}</span></h5>
          <h5 class="campo">Produto: <span>{{ item.produto_nome }}</span></h5>
          <h5 class="campo">Quantidade: <span>{{ item.quantidade }}</span></h5>
          <h5 class="campo">Valor Unitário: <span>R$ {{ item.valor.toFixed(2) }}</span></h5>
          <h5 class="campo destaque">Total da Entrada: <span>R$ {{ item.total_entrada.toFixed(2) }}</span></h5>
          <h5 class="campo">Data: <span>{{ formatDate(item.data) }}</span></h5>
        </li>
      </ul>
    </div>
  </div>

  <div class="containerBP">
    <div class="form2 period-filter">
      <h4 class="title-filter">Buscar por nome:</h4>
      <input
        type="text"
        v-model="filtroTexto"
        placeholder="Nome de usuário ou produto"
        class="inputFormEstoque title-filter"
      />
    </div>
    <div class="form2 period-filter">
      <h4 class="title-filter">Local:</h4>
      <select v-model="localFilter" @change="" class="inputFormEstoque title-filter">
        <option :value="null">-- todos --</option>
        <option v-for="l in locais" :key="l" :value="l">{{ l }}</option>
      </select>
    </div>
    <div class="form2 period-filter">
      <h4 class="title-filter">Período:</h4>
      <select v-model="periodType" @change="onPeriodChange" class="inputFormEstoque title-filter">
        <option value="day">Dia</option>
        <option value="month">Mês</option>
        <option value="year">Ano</option>
      </select>
      <input
        v-if="periodType==='day'"
        type="date"
        v-model="periodValue"
        class="inputFormEstoque title-filter"
      />
      <input
        v-else-if="periodType==='month'"
        type="month"
        v-model="periodValue"
        class="inputFormEstoque title-filter"
      />
      <input
        v-else
        type="number"
        min="2000"
        max="2100"
        v-model="periodValue"
        placeholder="Ano"
        class="inputFormEstoque title-filter"
      />
    </div>
  </div>
</template>

<style scoped>
@media (max-width: 768px) {
  .inputFormEstoque { width: 50vw; }
  .itemEntrada    { min-width: 78vw; }
}

.itemEntrada {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  width: 30vw;
  margin: 1vh 1vw;
  padding: 1.5vh 1vw;
  background: #1f1f1f;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  border: 1px solid #333;
}

.ulEstoque {
  display: flex;
  flex-wrap: wrap;
  list-style: none;
  padding: 0;
}

h5.campo {
  font-size: 1rem;
  font-weight: 500;
  color: #e0e0e0;
  margin: 0.3em 0;
}

h5.campo span {
  font-weight: 600;
  color: #fff;
}

h5.campo.destaque span {
  color: #00e676;
}

.loading,
.erro {
  font-size: 1.2em;
  color: #f0f0f0;
  text-align: center;
  margin: 2vh 0;
}

.form2 {
  margin: 1em 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.inputFormEstoque { padding:0.5rem; border:1px solid #ccc; border-radius:4px; }
@media (max-width: 768px) {
  /* Faz o período ficar em coluna no mobile */
  .period-filter {
    flex-direction: column;
    align-items: stretch;
  }
  .period-filter select,
  .period-filter input {
    width: 100%;
  }
  .title-filter{
    margin-left: 2vw !important;
  }
}
</style>
