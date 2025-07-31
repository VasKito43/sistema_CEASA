<script setup>
import { ref, provide, reactive, watch } from 'vue';
import RealizarVenda from './RealizarVenda.vue';

const pedidos = ref([]);
const clientes = ref([]);
const vendas = ref([]);
const estoque = ref([]);
const erro = ref(null);
const loading = ref(true);
const pedidosFiltrado = ref([]);
const id = ref("");
const cliente = ref("");
const valor = ref("");
const produto = ref("");
const estatusFilter = ref(""); // Novo filtro para 'estatus'
const pagamentoFilter = ref(""); // Novo filtro para 'forma_pagamento'

const stateEncaminhar = reactive({
    produtos: "",
    pedidoId: "",
    selecionado: false,
    buscaPedido: false,

    recarregar: () => {
        stateEncaminhar.selecionado = false;
        recebePedidos();
        recebeClientes();
        recebeVendas();
        recebeEstoque();
    }
});

// Funções de recebimento de dados
const recebePedidos = async () => {
    try {
        const resposta = await fetch("https://backendvue.onrender.com/pedidos");
        if (!resposta.ok) throw new Error("Erro ao realizar busca");
        pedidos.value = await resposta.json();
        filtraPedidos();
    } catch (error) {
        erro.value = error.message;
    } finally {
        loading.value = false;
    }
};

const recebeClientes = async () => {
    try {
        const resposta = await fetch("https://backendvue.onrender.com/usuarios");
        if (!resposta.ok) throw new Error("Erro ao realizar busca");
        clientes.value = await resposta.json();
    } catch (error) {
        erro.value = error.message;
    } finally {
        loading.value = false;
    }
};

const recebeVendas = async () => {
    try {
        const resposta = await fetch("https://backendvue.onrender.com/vendas");
        if (!resposta.ok) throw new Error("Erro ao realizar busca");
        vendas.value = await resposta.json();
    } catch (error) {
        erro.value = error.message;
    } finally {
        loading.value = false;
    }
};

const recebeEstoque = async () => {
    try {
        const resposta = await fetch("https://backendvue.onrender.com/estoque");
        if (!resposta.ok) throw new Error("Erro ao realizar busca");
        estoque.value = await resposta.json();
    } catch (error) {
        erro.value = error.message;
    } finally {
        loading.value = false;
    }
};

// Função para encontrar cliente
const encontraCliente = (pedidoId) => {
    for (const venda of vendas.value) {
        if (venda.pedido_id === pedidoId) {
            for (const cliente of clientes.value) {
                if (venda.cliente_id === cliente.id) {
                    return cliente.nome;
                }
            }
        }
    }
    return "";
};

// Função para listar produtos
const listaProdutos = (pedidoId) => {
    const listaProdutos = vendas.value
        .filter(venda => venda.pedido_id === pedidoId)
        .map(venda => {
            const produto = estoque.value.find(p => p.id === venda.estoque_id);
            return produto ? produto.nome : "Produto não encontrado";
        });

    return listaProdutos.length ? listaProdutos : ["Produto não encontrado"];
};

// Função para filtrar pedidos
const filtraPedidos = () => {
    pedidosFiltrado.value = pedidos.value.filter(pedido => {
        const valorConvertido = parseFloat(valor.value);

        const clienteMatch = encontraCliente(pedido.id).toString().toLowerCase().includes(cliente.value.toLowerCase());
        const idMatch = pedido.id.toString().toLowerCase().includes(id.value.toLowerCase());
        const valorMatch = !isNaN(valorConvertido) && valor.value !== "" ? pedido.valor <= valorConvertido : true;
        const produtoMatch = listaProdutos(pedido.id).some(prod => prod.toString().toLowerCase().includes(produto.value.toLowerCase()));
        const estatusMatch = estatusFilter.value ? pedido.estatus === estatusFilter.value : true;
        const pagamentoMatch = pagamentoFilter.value ? pedido.forma_pagamento === pagamentoFilter.value : true;

        return idMatch && clienteMatch && valorMatch && produtoMatch && estatusMatch && pagamentoMatch;
    });
};

// Função chamada ao clicar no pedido
const encaminhaAlteraPedido = (pedidoId, estatus) => {
    if (estatus === "pendente") {
        const produtosEncaminhar = [];

        for (const venda of vendas.value) {
            if (venda.pedido_id === pedidoId) {
                for (const produto of estoque.value) {
                    if (venda.estoque_id === produto.id) {
                        produtosEncaminhar.push({
                            produto: produto,
                            quantidade: venda.quantidade
                        });
                    }
                }
            }
        }

        stateEncaminhar.produtos = produtosEncaminhar
        stateEncaminhar.pedidoId = pedidoId
        stateEncaminhar.buscaPedido = true
        stateEncaminhar.selecionado = true;

    }


};

// Observando as mudanças dos filtros
// watch([id, cliente, valor, produto, estatusFilter, pagamentoFilter], () => {
//     filtraPedidos();
// });

// Chamadas iniciais para obter os dados
recebePedidos();
recebeClientes();
recebeVendas();
recebeEstoque();

watch([estatusFilter, pagamentoFilter], () => {
    filtraPedidos();
});
provide("stateEncaminhar", stateEncaminhar);
</script>


<template>
    <RealizarVenda v-if="stateEncaminhar.selecionado" />
    <div v-else>
        <h2>Busca Pedidos</h2>

        <div class="containerRV centro">
            <div v-if="loading" class="loading">Carregando...</div>
            <div v-else-if="erro" class="erro">{{ erro.value }}</div>
            <div v-else>
                <div v-for="pedido in pedidosFiltrado" :key="pedido.id" class="pedidoPB"
                    :class="{ 'pendente': pedido.estatus === 'pendente' }"
                    @click="encaminhaAlteraPedido(pedido.id, pedido.estatus)">
                    <p class="itensPedido"><b>ID:</b> {{ pedido.id }}</p>
                    <p class="itensPedido"><b>Cliente:</b> {{ encontraCliente(pedido.id) }}</p>
                    <p class="itensPedido"><b>Valor:</b> R$ {{ pedido.valor }}</p>
                    <p class="itensPedido"><b>Estatus:</b> {{ pedido.estatus }}</p>
                    <p class="itensPedido"><b>Forma de Pagamento:</b> {{ pedido.forma_pagamento }}</p>
                    <p class="itensPedido"><b>Produtos:</b></p>
                    <p class="itensPedido" v-for="produto in listaProdutos(pedido.id)">- {{ produto }}</p>
                </div>
            </div>
        </div>

        <div class="containerBP">
            <div class="form1  coluna primeiroFormBP">
                <div class="form2">
                    <h4>ID: </h4>
                    <input type="text" v-model="id" @input="filtraPedidos" placeholder="ID do Pedido"
                        class="inputFormBP idFormBP">

                </div>
                <div class="form2 ">
                    <h4>Cliente: </h4>
                    <input type="text" v-model="cliente" @input="filtraPedidos" placeholder="Nome do Cliente"
                        class="inputFormBP clienteFormBP">
                </div>
            </div>

            <div class="form1 coluna">
                <div class="form2">
                    <h4>Valor: </h4>
                    <input type="number" v-model="valor" @input="filtraPedidos" placeholder="Valor Maximo do Pedido"
                        class="inputFormBP valorFormBP">
                </div>
                <div class="form2">
                    <h4>Produto: </h4>
                    <input type="text" v-model="produto" @input="filtraPedidos" placeholder="Nome do Produto"
                        class="inputFormBP produtoFormBP">
                </div>
            </div>

            <!-- <select -->
            <div class="form1 coluna">
                <div class="form2">
                    <h4>Estatus: </h4>
                    <select class="selectBP inputFormBP estatusFormBP" v-model="estatusFilter">
                        <option value="" class="optionCliente">.......................................................
                        </option>
                        <option value="pendente" class="optionCliente">Pendente</option>
                        <option value="pagamento realizado" class="optionCliente">Pagamento Realizado</option>
                    </select>
                </div>
                <div class="form2">
                    <h4>Pagamento: </h4>
                    <select class="selectBP inputFormBP" v-model="pagamentoFilter">
                        <option value="" class="optionCliente">.......................................................
                        </option>
                        <option value="dinheiro" class="optionCliente">Dinheiro</option>
                        <option value="pix" class="optionCliente">Pix</option>
                        <option value="debito" class="optionCliente">Debito</option>
                        <option value="credito" class="optionCliente">Credito</option>
                        <option value="boleto" class="optionCliente">Boleto</option>
                        <option value="cheque" class="optionCliente">Cheque</option>
                    </select>
                </div>
            </div>
        </div>
    </div>
</template>

<style>
h4 {
    color: rgb(63, 63, 63);
}

.pedidoPB {
    background: linear-gradient(to right, #474747ee, #0e0d0dd7);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
    border: solid 1px black;
    border-radius: 10px;
    margin-top: 2vh;
    width: 60vw;
    padding: 2vh;
}

.itensPedido {
    margin: 1vh;
    margin-left: 1vh;
    font-size: 14pt;
}

.containerBP {
    background: white;
    height: 11vh;
    border-bottom-left-radius: 10px;
    border-bottom-right-radius: 10px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: space-between;

}

.selectClienteBP {
    margin-top: 2vw;
    margin-left: 2vw;
    width: 15vw;
    height: 4vh;
    border-radius: 10px;
    font-size: 12pt;
    color: white;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
}

.form1 {
    width: 33%;
    margin-right: 8vh;
}

.form2 {
    display: flex;
    align-items: center;
    justify-content: right;
}

.selectBP {
    width: 15vw;
    height: 4vh;
    background: white;
    color: rgb(59, 59, 59);
    border-radius: 10px;
    border: none;
    margin: 5px;
    padding: 5px;
    border: solid 1px black;
    text-align: center;
    cursor: pointer;
}

.pendente {
    background: linear-gradient(to bottom right, #1f5980, #196b3b);
    cursor: pointer;
}

@media (max-width: 768px) {
    .containerBP {
        overflow-y: auto;

    }

    .containerBP::-webkit-scrollbar {
        width: 10px;
    }

    .containerBP::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 10px;
    }

    .containerBP::-webkit-scrollbar-thumb {
        background: linear-gradient(to bottom right, #3f3f3f, #686868);
        border-radius: 10px;
        border: 2px solid #ffffff;
    }

    .containerBP::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(to bottom right, #3f3f3f, #686868);
    }

    .primeiroFormBP {
        margin-top: 1vh;
    }

    .inputFormBP {
        width: 52vw;
    }

    .estatusFormBP {
        margin-left: 10.1vw;
    }

    .produtoFormBP {
        margin-left: 8.9vw;
    }

    .valorFormBP {
        margin-left: 16.1vw;
    }

    .clienteFormBP {
        margin-left: 11.3vw;
    }

    .idFormBP {
        margin-left: 23.2vw;
    }

    .pedidoPB {
        width: 80vw;
    }

}
</style>