<script setup>
import { reactive, provide, watchEffect, watch, inject } from 'vue';
import LoadingSpinner from './LoadingSpinner.vue';
import FechamentoPedido from './FechamentoPedido.vue';
import FormaPagamento from './FormaPagamento.vue';

const stateEncaminhar = inject("stateEncaminhar")


const state = reactive({
    //variaveis reativas
    cliente: "",
    produtos: [],
    usuarios: [],
    estoque: [],
    erro: null,
    total: 0,
    pedidoId:"",
    estatusRV: "fechamento do pedido",
    formaPagamento:"",

    //funções
    recebeUsuarios:async () => {
    try{
        const resposta = await fetch("http://127.0.0.1:3000/usuarios");
        if (!resposta.ok) {
            throw new Error("Erro ao realizar busca")
        }
        const data = await resposta.json();
        state.usuarios = data;    
    } catch (error) {
        state.erro = error.message
    }},

    recebeEstoque: async () => {
    try{
        const resposta = await fetch("http://127.0.0.1:3000/estoque");
        if (!resposta.ok) {
            throw new Error("Erro ao realizar busca")
        }
        const data = await resposta.json();
        state.estoque = data;    
    } catch (error) {
        state.erro = error.message
    }},

    adicionaProdutoPedido: () => {
        state.produtos.push({
        produto: "",
        quantidade: ""
    })
    state.repetido()
    },

    repetido: () => {
        for(let i=0; i < state.produtos.length; i++){
            let repetido = 0
            let index1 = 0
            let index2
            for(let j=0; j < state.produtos.length; j++){
                if (state.produtos[i].produto.id === state.produtos[j].produto.id){
                    repetido ++;
                    index1 = i;
                    index2 = j;
                }
            }
            if (repetido > 1){
                if (state.produtos[index1].produto.id !== undefined){
                    state.produtos[index1].quantidade += state.produtos[index2].quantidade
                }
                state.produtos.splice(index2, 1);
            }
    }},
    calculaTotal: () => {
    state.total = 0
    for(let i=0; i < state.produtos.length; i++){
        if (state.produtos[i].produto.quantidade !== undefined){
            state.total += state.produtos[i].quantidade * state.produtos[i].produto.valor
        }
    }
    state.total = state.total.toFixed(2);
    state.repetido()
    },
    fecharPedido: async () => {
        if (state.cliente === "") {
            alert("Selecione um cliente para fechar o pedido");
            return;
        }
        state.estatusRV = 'loading'
        state.pedidoId = crypto.randomUUID();
        await state.criarPedido()
        await state.criarVendas()
        state.estatusRV = 'forma de pagamento'
        state.recebeEstoque()
        state.recebeUsuarios()
        state.calculaTotal()
        alert(`Pedido realizado.

    Selecionar uma forma de pagamento!!`)

    },
    deletaProduto: (index) => {
        state.produtos.splice(index, 1);
        if (state.estatusRV === 'forma de pagamento'){
        }
    },
    criarPedido: async () => {

        try {
            const resposta = await fetch("http://127.0.0.1:3000/pedidos", {
                method: "POST",
                headers:{
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(state.pedidoId)
            });
            if (resposta.ok) {
                console.log("Pedido criado")
            } else {
                alert("Erro ao resgistrar pedido")
            }
        } catch (erro) {
            console.error(erro);
            alert("Erro ao registrar pedido")
        } 
    },
    criarVendas: async () => {

        state.produtos = state.produtos.filter(item => item.produto?.quantidade !== undefined);

        for (const item of state.produtos) {
            let valorVenda = item.quantidade * item.produto.valor;
        
            const venda = {
                clienteId: state.cliente.id,
                estoqueId: item.produto.id,
                quantidade: item.quantidade,
                valorTotal: valorVenda,
                pedidoId: state.pedidoId
            };
        
            try {
                const resposta = await fetch("http://127.0.0.1:3000/vendas", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(venda)
                });
            
                if (!resposta.ok) {
                    throw new Error("Erro ao registrar venda");
                }
            
                console.log("Venda adicionada com sucesso!");
            } catch (erro) {
                console.error(erro);
                alert(erro.message);
            }
        }
    },
    atualizarPedido: async () => {
        if (state.formaPagamento === "") {
            alert("Por favor selecionar uma forma de pagamento");
            return;
        }
        state.estatusRV = 'loading'
        try {
            const resposta = await fetch(`http://127.0.0.1:3000/pedidos/${state.pedidoId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    valor: state.total,
                    estatus: "pagamento realizado",
                    formaPagamento: state.formaPagamento
                })
            });

            if (resposta.ok) {
                console.log("Pedido atualizado com sucesso!");
            } else {
                alert("Erro ao atualizar pedido");
                return; 
            }
        } catch (err) {
            alert("Erro ao atualizar pedido");
            return;
        }
        for (let i = 0;  i < state.produtos.length; i++){
                try{
                    const resposta = await fetch(`http://127.0.0.1:3000/vendas`,{
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                        }, 
                        body: JSON.stringify({
                          estoqueId: state.produtos[i].produto.id,
                          quantidade: state.produtos[i].quantidade,
                          valorTotal: state.produtos[i].quantidade * state.produtos[i].produto.valor,
                          pedidoId: state.pedidoId
                        })
                    });
                
                    if (resposta.ok) {
                        console.log("venda atualizado com sucesso!")
                    } else{
                        const erroData = await resposta.json();
                        state.erro = (erroData.error);
                    }
                } catch (err) {
                    console.error(err);
                    state.erro = ("Erro de comunicação com o servidor");
            }
        }
        alert("Pedido finalizado com sucesso!");
        state.fecharRP()

    },
    fecharRP: () =>{
        state.produtos = []
        state.estatusRV = "fechamento do pedido"
        state.cliente = ""
        state.formaPagamento = ""
        state.recebeEstoque()
        state.recebeUsuarios()
        state.calculaTotal()
        stateEncaminhar.recarregar()
    },
    bloquearDigitacao: (event) => {
      if (!['ArrowUp', 'ArrowDown', 'Tab'].includes(event.key)) {
        event.preventDefault(); 
      }
    },
    removeVenda: async (id, quantidade, cancelaPedido) => {

    const venda = {
            estoqueId: id,
            quantidade: quantidade,
            pedidoId: state.pedidoId
        };
    try{
        const resposta = await fetch(`http://127.0.0.1:3000/vendas`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(venda)
        });

        if (resposta.ok && !cancelaPedido) {
            alert("Produto excluido com sucesso!");
        } else {
            const erroData = await resposta.json();
            state.erro = (erroData.error);
        }
    } catch (err) {
        console.error(err);
        state.erro.value = ("Erro de comunicação com o servidor");
    }
    },
    
    cancelaPedido: async() => {
        state.estatusRV = 'loading'
        for (const item of state.produtos){
            await state.removeVenda(item.produto.id, item.quantidade, true)
            console.log("deletou!!")
        }
          
        try{
            const resposta = await fetch(`http://127.0.0.1:3000/pedidos/${state.pedidoId}`, {
                method: "DELETE"
            });

            if (resposta.ok) {
                alert("Pedido deletado com sucesso!");
            } else {
                const erroData = await resposta.json();
                state.erro = (erroData.error);
            }
        } catch (err) {
            console.error(err);
            state.erro = ("Erro de comunicação com o servidor");
        } finally {
            state.fecharRP()
        }
    },

    verificaBuscaPedido: () => {
        if (stateEncaminhar.buscaPedido){
        state.estatusRV = 'forma de pagamento'
    }
    }
});


watch(state.produtos, state.calculaTotal, { deep: true });
watch(
  state.produtos,
  (novosProdutos) => {
    novosProdutos.forEach((item) => {
      const maxQuantidade = item.produto?.quantidade || 1;
      if (item.quantidade < 1) {
        item.quantidade = 1;
      } else if (item.quantidade > maxQuantidade) {
        item.quantidade = maxQuantidade;
      }
    });
  },
  { deep: true }
);

watchEffect(() => {
  state.calculaTotal();
});

watchEffect(() => {
  state.produtos.forEach((item) => {
    const maxQuantidade = item.produto?.quantidade || 1;
    if (item.quantidade < 1) {
      item.quantidade = 1;
    } else if (item.quantidade > maxQuantidade) {
      item.quantidade = maxQuantidade;
    }
  });
});


state.recebeEstoque()
state.recebeUsuarios()
state.calculaTotal()

if (stateEncaminhar && stateEncaminhar.buscaPedido){
    state.verificaBuscaPedido()
}

provide("state", state);
</script>




<template>
    <FechamentoPedido v-if="state.estatusRV === 'fechamento do pedido'"/>
    <LoadingSpinner v-else-if="state.estatusRV === 'loading'"/>
    <FormaPagamento v-else-if="state.estatusRV === 'forma de pagamento'"/>
</template>
