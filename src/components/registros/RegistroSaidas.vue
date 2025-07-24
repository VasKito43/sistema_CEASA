<script setup>
import { ref, computed } from 'vue'

const saidas = ref([])
const erro = ref(null)
const loading = ref(true)

// filtros
const filtroTexto = ref("")
const filtroData   = ref("")

const parseDateUTC = iso => {
  const d = new Date(iso)
  d.setMinutes(d.getMinutes() + d.getTimezoneOffset())
  return d
}

const formatDate = iso => {
  const d = parseDateUTC(iso)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

const saidasFiltradasOrdenado = computed(() => {
  const txt = filtroTexto.value.toLowerCase()
  const dt  = filtroData.value

  const filtrado = saidas.value.filter(item => {
    const nomeUsuario     = item.usuario_nome.toLowerCase()
    const nomeProduto     = item.produto_nome.toLowerCase()
    const nomeVendedor    = item.vendedor_nome.toLowerCase()
    const nomeCliente     = item.cliente_nome.toLowerCase()
    const formaPagamento  = item.forma_pagamento_nome.toLowerCase()

    const d = parseDateUTC(item.data)
    const rawDate = d.toISOString().slice(0,10)

    const textoMatch = !txt ||
      nomeUsuario.includes(txt) ||
      nomeProduto.includes(txt) ||
      nomeVendedor.includes(txt) ||
      nomeCliente.includes(txt) ||
      formaPagamento.includes(txt)

    const dataMatch = !dt || rawDate === dt

    return textoMatch && dataMatch
  })

  return filtrado
    .map(item => {
      const valorVenda = item.valor_venda != null ? parseFloat(item.valor_venda) : 0
      const valorCusto = item.valor_custo != null ? parseFloat(item.valor_custo) : 0
      const quantidade = item.quantidade != null ? parseInt(item.quantidade) : 0

      return {
        ...item,
        valor_venda: valorVenda,
        valor_custo: valorCusto,
        total_saida: valorVenda * quantidade,
        lucro_saida: (valorVenda - valorCusto) * quantidade
      }
    })
    .sort((a, b) => parseDateUTC(b.data) - parseDateUTC(a.data))
})

const recebeSaidas = async () => {
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

recebeSaidas()
</script>

<template>
  <h2>Registros de Saída</h2>

  <div class="containerRV">
    <div v-if="loading" class="loading">Carregando...</div>
    <div v-else-if="erro" class="erro">{{ erro }}</div>
    <div v-else>
      <ul class="ulEstoque">
        <li v-for="item in saidasFiltradasOrdenado" :key="item.id" class="itemEntrada">
          <h5 class="campo">Usuário: <span>{{ item.usuario_nome }}</span></h5>
          <h5 class="campo">Produto: <span>{{ item.produto_nome }}</span></h5>
          <h5 class="campo">Quantidade: <span>{{ item.quantidade }}</span></h5>
          <h5 class="campo">Data: <span>{{ formatDate(item.data) }}</span></h5>
          <h5 class="campo">Vendedor: <span>{{ item.vendedor_nome }}</span></h5>
          <h5 class="campo">Cliente: <span>{{ item.cliente_nome }}</span></h5>
          <h5 class="campo">Forma Pagamento: <span>{{ item.forma_pagamento_nome }}</span></h5>
          <h5 class="campo">Valor Custo: <span>{{ item.valor_custo ? `R$ ${item.valor_custo.toFixed(2)}` : '-' }}</span></h5>
          <h5 class="campo">Valor Venda: <span>{{ item.valor_venda ? `R$ ${item.valor_venda.toFixed(2)}` : '-' }}</span></h5>
          <h5 class="campo">Descrição: <span>{{ item.descrição }}</span></h5>

          <!-- NOVOS CAMPOS -->
          <h5 class="campo destaque">Total da Saída: <span>R$ {{ item.total_saida.toFixed(2) }}</span></h5>
          <h5 class="campo destaque">Lucro da Saída: <span>R$ {{ item.lucro_saida.toFixed(2) }}</span></h5>
        </li>
      </ul>
    </div>
  </div>

  <div class="containerBP">
    <div class="form2">
      <h4>Buscar por texto:</h4>
      <input type="text" v-model="filtroTexto" placeholder="Usuário, produto, vendedor ou cliente" class="inputFormEstoque" />
    </div>
    <div class="form2">
      <h4>Filtrar por data:</h4>
      <input type="date" v-model="filtroData" class="inputFormEstoque" />
    </div>
  </div>
</template>

<style scoped>
@media (max-width: 768px) {
  .inputFormEstoque { width: 50vw; }
  .itemEntrada { min-width: 76vw; }
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
.loading, .erro {
  font-size: 1.2em;
  color: #f0f0f0;
  text-align: center;
  margin: 2vh 0;
}
.form2 {
  margin: 1em 0;
}
</style>
