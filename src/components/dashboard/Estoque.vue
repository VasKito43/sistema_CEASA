<script setup>
import { ref, computed } from 'vue'

const estoque = ref([])
const estoqueFiltrado = ref([])
const erro = ref(null)
const loading = ref(true)
const nome = ref("")
const quantidadeMinima = ref("")
const quantidade = ref("")

const estoqueFiltradoOrdenado = computed(() =>
  estoqueFiltrado.value.slice().sort((a, b) =>
    a.nome.localeCompare(b.nome, 'pt', { sensitivity: 'base' })
  )
)

const recebeEstoque = async () => {
  try {
    const resposta = await fetch("http://127.0.0.1:3000/produtos")
    if (!resposta.ok) {
      throw new Error("Erro ao realizar busca")
    }
    const data = await resposta.json()
    estoque.value = data
    filtraEstoque()
  } catch (error) {
    erro.value = error.message
  } finally {
    loading.value = false
  }
}

recebeEstoque()

const filtraEstoque = () => {
  const quantidadeMin = parseFloat(quantidadeMinima.value)
  const quantidadeMax = parseFloat(quantidade.value)

  estoqueFiltrado.value = estoque.value.filter((produto) => {
    const nomeMatch = produto.nome.toLowerCase().includes(nome.value.toLowerCase())
    const quantidadeMinMatch =
      !isNaN(quantidadeMin) && quantidadeMinima.value !== ""
        ? produto.quantidade >= quantidadeMin
        : true
    const quantidadeMaxMatch =
      !isNaN(quantidadeMax) && quantidade.value !== ""
        ? produto.quantidade <= quantidadeMax
        : true

    return nomeMatch && quantidadeMinMatch && quantidadeMaxMatch
  })
}

const atualizarProduto = async (produto) => {
    loading.value = true

    try {
        const resposta = await fetch(`http://127.0.0.1:3000/produtos/${produto.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                nome: produto.nome.toUpperCase(),
                quantidade: produto.quantidade
            })
        });

        if (resposta.ok) {
            alert("produto atualizado com sucesso!")
        } else {
            const erroData = await resposta.json();
            erro.value = (erroData.error);
        }
    } catch (err) {
        console.error(err);
        erro.value = ("Erro de comunicação com o servidor");
    } finally {
        recebeEstoque()
    }
}

const deletarProduto = async (produto) => {
    const confirmacao = confirm(`Tem certeza que deseja deletar o produto "${produto.nome}"?`)

    if (!confirmacao) {
        return; // Sai da função se o usuário cancelar
    }

    loading.value = true

    try {
        const resposta = await fetch(`http://127.0.0.1:3000/produtos/${produto.id}`, {
            method: "DELETE"
        });

        if (resposta.ok) {
            alert("Produto deletado com sucesso!");
        } else {
            const erroData = await resposta.json();
            erro.value = (erroData.error);
        }
    } catch (err) {
        console.error(err);
        erro.value = ("Erro de comunicação com o servidor");
    } finally {
        recebeEstoque()
    }
}


</script>

<template>
    <h2>Estoque de Produtos</h2>
    <div class="containerRV">
        <div v-if="loading" class="loading">Carregando...</div>
        <div v-else-if="erro" class="erro">{{ erro }}</div>
        <div v-else class="divPessoas">
            <ul class="ulEstoque">
                <li v-for="produto in estoqueFiltradoOrdenado" :key="produto.id" class="itemEstoque ">
                    <br>
                    <label class="labelEstoque labelNome">Nome</label>
                    <input v-model="produto.nome" placeholder="Nome" class="inputEstoque"/>
                    <button @click="deletarProduto(produto)" class="botaoPessoas botaoAtualizar botaoCP botaoAtualizaEstoque">Deletar</button><br>

                    <label class="labelEstoque labelQuantidade">Quantidade</label>
                    <input v-model="produto.quantidade" placeholder="Quantidade" class="inputEstoque"/>
                    <button @click="atualizarProduto(produto)" class="botaoPessoas botaoAtualizar botaoAtualizaEstoque">Atualizar</button><br>
    
                </li>
            </ul>
    
        </div>

    </div>

    <div class="containerBP">
        <div class="form1  coluna primeiroFormPessoas">
            <p class="risco">-</p>
        <div class="form2">
            <h4>Nome: </h4>
            <input type="text" v-model="nome" @input="filtraEstoque" placeholder="Nome do Produto" class="inputFormEstoque nomeFormEstoque">
        </div>
        </div>
    
        <div class="form1 coluna">
          <p class="risco">-</p>
          <div class="form2">
            <h4>Quantidade: </h4>
            <input type="number" v-model="quantidadeMinima" @input="filtraEstoque" placeholder="Quantidade Mínima do Produto" class="inputFormEstoque valorFormEstoque">
          </div>
        </div>

    
        <div class="form1 coluna">
        <p class="risco">-</p>
        <div class="form2">
            <h4>Quantidade: </h4>
            <input type="number" v-model="quantidade" @input="filtraEstoque"  placeholder="Quantidade Maxima do Produto" class="inputFormEstoque">
        </div>

        </div>
    </div>
</template>

<style>
@media (max-width: 768px){
.inputFormEstoque{
    width: 50vw;
}
.nomeFormEstoque{
    margin-left: 16.5vw;
}
.valorFormEstoque{
    margin-left: 18.5vw;
}
.itemEstoque{
    min-width: 76vw;
    min-height: 30vh;
    
}
.inputEstoque{
    min-width: 40vw;
    
}
.imgProduto{
    display: none;
    
}
.botaoAtualizaEstoque{
    margin-left: 15vw;
    min-width: 45vw;
}
}
.itemEstoque{
  height: 20vh;
  width: 33vw;
  margin-left: 2vw;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
  margin-top: 3vh;
  background: linear-gradient(to right, #47474767, #0e0d0d59);
  border: solid 1px black;
}

.ulEstoque{
  width: 72vw;
  background: none;
  display: flex;
  flex-wrap: wrap;
}
.botaoAtualizaEstoque{
    padding: 1vh;
}
</style>