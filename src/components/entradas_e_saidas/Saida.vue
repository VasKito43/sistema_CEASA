<script setup>
import { ref, onMounted, computed } from 'vue'
import { useStore } from '../../store'

const produtos = ref([])
const vendedores = ref([])
const erro = ref(null)
const loading = ref(true)
const store = useStore()

const produtoSelecionado = ref(null)
const vendedorSelecionado = ref(1)
const quantidade = ref(1)
const descricao = ref('')

const sortedProdutos = computed(() =>
  produtos.value
    .slice()
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt', { sensitivity: 'base' }))
)
const sortedVendedores = computed(() =>
  vendedores.value
    .slice()
    .sort((a, b) => a.id - b.id)
)

const produtoObj = computed(() =>
  produtos.value.find(p => p.id === produtoSelecionado.value)
)

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

onMounted(async () => {
  try {
    await Promise.all([fetchProdutos(), fetchVendedores()])
  } catch (e) {
    erro.value = e.message
  } finally {
    loading.value = false
  }
})

const cadastrar = async () => {
  if (!produtoObj.value) {
    alert('Selecione um produto')
    return
  }

  const saida = {
    usuarioId: store.estado.funcionario.id,
    produtoId: produtoObj.value.id,
    quantidade: Number(quantidade.value),
    valorTotal: 0,
    desconto: 0,
    valorFinal: 0,
    vendedorId: vendedorSelecionado.value,
    descricao: descricao.value
  }

  try {
    const res = await fetch('https://backendvue.onrender.com/realizarSaida', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(saida)
    })

    if (res.ok) {
      alert('Saída realizada com sucesso!')
    } else {
      alert('Erro ao realizar saída')
    }
  } catch (e) {
    console.error(e)
    alert('Erro ao realizar saída')
  } finally {
    produtoSelecionado.value = null
    quantidade.value = 1
    descricao.value = ''
    vendedorSelecionado.value = 1
  }
}
</script>

<template>
  <h2>Saída de Produto</h2>

  <div class="containerRV">
    <select v-model="produtoSelecionado" class="selectProduto">
      <option :value="null">Selecione um produto</option>
      <option
        v-for="item in sortedProdutos"
        :key="item.id"
        :value="item.id"
      >
        {{ item.nome }}
      </option>
    </select>

    <br>

    <select v-model="vendedorSelecionado" class="selectProduto">
      <option :value="null">Selecione um vendedor</option>
      <option
        v-for="item in sortedVendedores"
        :key="item.id"
        :value="item.id"
      >
        {{ item.nome }}
      </option>
    </select>
    <br>

    <label class="labelRV labelEnt">Quantidade</label>
    <input
      v-model.number="quantidade"
      @input="quantidade = Math.max(1, Math.floor(quantidade))"
      type="number"
      min="1"
      step="1"
      class="inputQuantidade inputQuant"
    />
    <br>

    <label class="labelRV labelEnt">Descrição</label><br>
    <textarea class="desc" v-model="descricao"></textarea>

    <div v-if="erro" class="erro">{{ erro }}</div>
    <div v-else-if="loading">Carregando...</div>
  </div>

  <div class="containerRV2">
  <p></p>
    <button @click="cadastrar" class="botaoCadastro botaoRV">
      Enviar
    </button>
  </div>
</template>

<style>
.labelEnt {
  margin-left: 2.8rem;
}
.inputQuant {
  margin-left: 2.1rem;
}
.desc {
  height: 18vh;
  width: 29vw;
  margin-left: 2vw;
  resize: none;
  padding: 0.5rem;
  text-align: left;
  vertical-align: top;
  border-radius: 10px;
  border: solid 1px black;
}
@media (max-width: 768px) {
  .labelEnt {
    margin-left: 0.7rem;
  }
  .inputQuant {
    margin-left: 2rem;
  }
  .desc {
    width: 78vw;
  }
}
</style>
