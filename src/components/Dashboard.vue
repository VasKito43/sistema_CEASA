<script setup>
import { ref } from 'vue'
import Contador from './dashboard/Contador.vue'
import Cachorro from './dashboard/Cachorro.vue'
import Tradutor from './dashboard/Tradutor.vue'
import PessoasBd from './dashboard/PessoasBd.vue'
import CadastroBd from './dashboard/CadastroBd.vue'
import Calculadora from './dashboard/Calculadora.vue'
import Estoque from './dashboard/Estoque.vue'
import CadastroProduto from './dashboard/CadastroProduto.vue'
import RealizarVenda from './Realizar Venda/RealizarVenda.vue'
import BuscaPedido from './Realizar Venda/BuscaPedido.vue'
import { LogOut } from "lucide-vue-next";
import { useRouter } from "vue-router";
import { useStore, menuStore } from '../store';
import CadastroFuncionario from './Funcionario/CadastroFuncionario.vue'
import Funcionarios from './Funcionario/Funcionarios.vue'
import Entrada from './entradas_e_saidas/Entrada.vue'
import Saida from './entradas_e_saidas/Saida.vue'
import RegistroEntradas from './registros/RegistroEntradas.vue'
import RegistroSaidas from './registros/RegistroSaidas.vue'
import CadastroCliente from './dashboard/CadastroCliente.vue'
import LucrosTotais from './registros/LucrosTotais.vue'

const router = useRouter();
const conteudo = ref(null)
const store = useStore();
const menu = menuStore();



const componentesEntradasSaidas = ref([
    { texto: "Entrada de Produto", componente: Entrada, ativado: false },
    { texto: "Saída de Produto", componente: Saida, ativado: false },
])

const componentesEstoque = ref([
    { texto: "Produtos", componente: Estoque, ativado: false },
    { texto: "Cadastro de Produto", componente: CadastroProduto, ativado: false },
    { texto: "Cadastro de Cliente", componente: CadastroCliente, ativado: false },

])
const componentesRegistro = ref([
    { texto: "Registro de Entradas", componente: RegistroEntradas, ativado: false},
    { texto: "Registro de Saidas", componente: RegistroSaidas, ativado: false},
    { texto: "Lucros Totais", componente: LucrosTotais, ativado: false},

    // { texto: "Registro de Alteração", componente: BuscaPedido, ativado: false},
    // { texto: "Registro de Excluidos", componente: Funcionarios, ativado: false}

])


const botoes = ref([
    {texto: "Entradas e Saídas", expandido: false, conteudo: componentesEntradasSaidas},
    {texto: "Estoque", expandido: false, conteudo:  componentesEstoque},
    {texto: "Registros", expandido: false, conteudo:  componentesRegistro}

])


const expandeBotao = (botao) => {
    const botaoAberto = botoes.value.find((b) => b.expandido);
    
    if (botaoAberto && botaoAberto !== botao) {
        botaoAberto.expandido = false; 

        setTimeout(() => {
            botao.expandido = !botao.expandido;
        }, 300);
    } else {
        botao.expandido = !botao.expandido;
    }
};

const sair = () => {
    store.estado.funcionario = null
    router.push("/");

}

const ativaConteudo = (opcaoSelecionada) => {
    conteudo.value = opcaoSelecionada.componente;
};
</script>

<template>
    <div class="container">
        <div class="menu coluna" :class="{mostrar: menu.aberto}">
            <ul class="ulMenu">
                <li v-for="botao in botoes" :key="botao.texto" class="opcoes">
                    <div @click="expandeBotao(botao)" class="botao centralizado">
                        <p>{{ botao.texto }}</p>
                    </div>
                    <transition name="fade">
                        <div v-if="botao.expandido" class="opcoes-container">
                            <button
                                v-for="opcao in botao.conteudo"
                                :key="opcao.texto"
                                class="opcao"
                                @click="[ativaConteudo(opcao), menu.toggle()]"
                            >
                                {{ opcao.texto }}
                            </button>
                        </div>
                    </transition>
                </li>
            </ul>
            <button class="botaoSair" @click="sair"> <LogOut class="iconeSair" /> Sair </button>
        </div>
        <div class="conteudo">
            <component :is="conteudo" v-if="conteudo" />
        </div>
    </div>
</template>

<style>

@media (max-width: 768px){
.menu{
    position: fixed;
    min-width: 100vw;
    min-height: 100vh;
    transition:  transform 0.3s ease;
    transform: translateX(-100%);
}
.menu.mostrar {
    transform: translateX(0); 
    
}
.botao{
    min-width: 100vw;
}
.opcao{
    min-width: 93vw
}
.botaoSair{
    min-width: 95vw;
    margin-top: 2vh;
}
.conteudo{
    min-width: 90vw;
    margin: none !important;
    padding: none !important;
}
}

/* Efeito de transição */
.fade-enter-active, .fade-leave-active {
    transition: opacity 0.4s ease, transform 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
    opacity: 0;
    transform: translateY(-10px); /* Move um pouco para cima ao entrar */
}

.botao {
    width: 100%;
    height: 7vh;
    margin-top: 1vh;
    background: linear-gradient(to bottom right, #0a8fe75d, #0551f55b);
    font-size: 18pt;
    cursor: pointer;
    transition: background 0.3s;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
}

.botao:hover {
    background: linear-gradient(to bottom right, #3498db, #00d4f0);
}

.opcoes-container {
    display: flex;
    flex-direction: column;
    padding-left: 10px;
    margin-top: 1vh;
}

.opcao {
    width: 90%;
    margin: 5px;
    padding: 10px;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    cursor: pointer;
    transition: background 0.3s;
    border-radius: 5px;
    text-align: left;
}

.opcao:hover {
    background: rgba(255, 255, 255, 0.2);
}

.opcoes{
    background: none;
}

.botaoSair {
    background: linear-gradient(to right, #ff0000ee, #960303d7);
    font-size: 20pt;
    width: 20vw;
}

.botaoSair:hover {
  background: rgba(255, 0, 0, 0.473);

}

.iconeSair {
    width: 24px;
    height: 24px;
}

.ulMenu{
    height: 80vh;
    background: none;
}

.menu{
    background: linear-gradient(to right, #283688, #0f163d);
}

.menu.mostrar {
    left: 0;
}
</style>

