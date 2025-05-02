<script setup>

import { ref } from 'vue'

const estoque = ref([])
const estoqueFiltrado = ref([])
const erro = ref(null)
const loading = ref(true)
const nome = ref("")
const valor = ref("")
const quantidade = ref("")


const recebeEstoque = async () => {
    try{
        const resposta = await fetch("http://127.0.0.1:3000/estoque");
        if (!resposta.ok) {
            throw new Error("Erro ao realizar busca")
        }
        const data = await resposta.json();
        estoque.value = data;    
        filtraEstoque();
    } catch (error) {
        erro.value = error.message
    } finally {
        loading.value = false
    }};

recebeEstoque()

const atualizarEstoque = async (produto) => {
    loading.value = true

    try{
        const resposta = await fetch(`http://127.0.0.1:3000/estoque/${produto.id}`,{
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            }, 
            body: JSON.stringify({
              nome: produto.nome,
              quantidade: produto.quantidade,
              valor: produto.valor,
              imagem: produto.imagem
            })
        });

        if (resposta.ok) {
            alert("Produto atualizado com sucesso!")
        } else{
            const erroData = await resposta.json();
            erro.value = (erroData.error);
        }
    } catch (err) {
        console.error(err);
        erro.value = ("Erro de comunicação com o servidor");
    } finally {
        recebeEstoque();
    }
}


const filtraEstoque = () => {
    const valorConvertido = parseFloat(valor.value);
    const quantidadeConvertido = parseFloat(quantidade.value);


    estoqueFiltrado.value = estoque.value.filter(produto => {
        const nomeMatch = produto.nome.toLowerCase().includes(nome.value.toLowerCase())
        const valorMatch = !isNaN(valorConvertido) && valor.value !== "" ? produto.valor <= valorConvertido : true;
        const quantidadeMatch = !isNaN(quantidadeConvertido) && quantidade.value !== "" ? produto.quantidade <= quantidadeConvertido : true;
        return nomeMatch && valorMatch && quantidadeMatch
    })
    console.log(estoqueFiltrado)
}
</script>

<template>
    <h2>Estoque de Produtos</h2>
    <div class="containerRV">
        <div v-if="loading" class="loading">Carregando...</div>
        <div v-else-if="erro" class="erro">{{ erro }}</div>
        <div v-else class="divPessoas">
            <ul class="ulEstoque">
                <li v-for="produto in estoqueFiltrado" :key="produto.id" class="itemEstoque ">
                    <img :src="produto.imagem" alt="imagem do produto" class="imgProduto"><br>
                    <label class="labelEstoque labelNome">Nome</label>
                    <input v-model="produto.nome" placeholder="Nome" class="inputEstoque"/><br>
                    <label class="labelEstoque labelValor">Valor  R$</label>
                    <input v-model="produto.valor" placeholder="Valor" class="inputEstoque"/> <br>
                    <label class="labelEstoque labelQuantidade">Quantidade</label>
                    <input v-model="produto.quantidade" placeholder="Quantidade" class="inputEstoque"/>
                    <button @click="atualizarEstoque(produto)" class="botaoPessoas botaoAtualizar botaoAtualizaEstoque">Atualizar</button><br>
    
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
            <h4>Valor: </h4>
            <input type="number" v-model="valor" @input="filtraEstoque"  placeholder="Valor Maximo do Produto" class="inputFormEstoque valorFormEstoque">
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
  height: 30vh;
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