<script setup>
import { ref } from 'vue';


const numeros = ref([
    {simbolo:"1", valor: 1},
    {simbolo:"2", valor: 2},
    {simbolo:"3", valor: 3},
    {simbolo:"4", valor: 4},
    {simbolo:"5", valor: 5},
    {simbolo:"6", valor: 6},
    {simbolo:"7", valor: 7},
    {simbolo:"8", valor: 8},
    {simbolo:"9", valor: 9},
    {simbolo:"0", valor: 0}
])

const igual = ref({simbolo: "="})
const ac = ref({simbolo: "AC"})

const operadores = ref([
    {simbolo: "+"},
    {simbolo: "-"},
    {simbolo: "/"},
    {simbolo: "*"}
])

const display = ref("0")
const primeiroNumero = ref(0)
const segundoNumero = ref(0)
const operador = ref("")
const calculoExecutador = ref(false)

const recebeBotao = (botao) => {
    if (calculoExecutador.value){
        resetar()
    }

    switch (botao.simbolo){
        case "=":
            executaCalculo()
            break;

        case "AC":
            resetar()
            break;
    }

    if (operadores.value.some((op) => op.simbolo === botao.simbolo)) {
        if (segundoNumero.value === 0){
            operador.value = botao.simbolo
        }};

    if (numeros.value.some((num) => num.simbolo === botao.simbolo)) {
        if (operador.value === ""){
            primeiroNumero.value = (primeiroNumero.value * 10) + botao.valor
        } else {
            segundoNumero.value = (segundoNumero.value * 10) + botao.valor
        }
    };

    let num = 0
    if (segundoNumero.value === 0){
        num = primeiroNumero.value
    } else {
        num = segundoNumero.value
    }

    num = num.toString()

    console.log(num)
    if (num.length <= 15){
        display.value = num
    } else {
        alert("Erro: numero muito longo")
        resetar()
    }
}

const executaCalculo = () => {
    calculoExecutador.value = true
    switch (operador.value){
                case "+":
                    primeiroNumero.value = primeiroNumero.value + segundoNumero.value
                    break;

                case "-":
                    primeiroNumero.value = primeiroNumero.value - segundoNumero.value
                    break;

                case "*":
                    primeiroNumero.value = primeiroNumero.value * segundoNumero.value
                    break;

                case "/":
                    if (segundoNumero.value === 0){
                        alert("Segundo numero deve der diferente de 0")
                        resetar()
                    } else {
                        primeiroNumero.value = primeiroNumero.value / segundoNumero.value
                    }
                    break;
                default:
                    alert("operador não digitado")
                    resetar();
            }

    segundoNumero.value = 0

}

const resetar = () => {
    display.value = 0
    primeiroNumero.value = 0
    segundoNumero.value = 0
    operador.value = ""
    calculoExecutador.value = false
}

</script>

<template>
    <div class="centralizado">
        <div class="containerCalculadora">
            <div class="displayCalculadora">
                {{ display }}
            </div>
            <div class="containerNumeros">
                <button v-for="numero in numeros" class="botaoCalculadora" @click="recebeBotao(numero)">
                    {{ numero.simbolo }}
                </button>
                <button class="botaoCalculadora" @click="recebeBotao(ac)">{{ ac.simbolo }}</button>
                <button class="botaoCalculadora" @click="recebeBotao(igual)">{{ igual.simbolo }}</button>
            </div>
            <div class="containerOperador">
                <button v-for="operador in operadores" class="botaoCalculadora" @click="recebeBotao(operador)">
                    {{ operador.simbolo }}
                </button>
            </div>
        </div>
    </div>

</template>
