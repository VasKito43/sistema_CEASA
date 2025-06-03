<script setup>
import { ref } from 'vue';

const nome = ref("")
const telefone = ref("")
const cpf = ref("")
const senha = ref("")
const erro = ref(null)

const validarCPF = (cpf) => {
    cpf = cpf.replace(/\D/g, ''); 

    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) {
        return false; 
    }

    let soma = 0, resto;

    for (let i = 0; i < 9; i++) soma += parseInt(cpf.charAt(i)) * (10 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(9))) return false;

    soma = 0;
    for (let i = 0; i < 10; i++) soma += parseInt(cpf.charAt(i)) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;

    return resto === parseInt(cpf.charAt(10));
};

const cadastrar = async () => {
    const cpfLimpo = cpf.value.replace(/\D/g, '');

    if (!validarCPF(cpfLimpo)) {
        alert("CPF inválido. Por favor, insira um CPF válido.");
        return;
    }

    const funcionario = {
        nome: nome.value,
        telefone: telefone.value.replace(/\D/g, ''),
        cpf: cpfLimpo,
        senha: senha.value
    };

    try {
        const resposta = await fetch("https://backendvue.onrender.com/funcionarios", {
            method: "POST",
            headers:{
                "Content-Type": "application/json"
            },
            body: JSON.stringify(funcionario)
        });
        if (resposta.ok) {
            alert("Funcionário adicionado com sucesso!");
        } else {
            alert("Erro ao registrar funcionário");
        }
    } catch (erro) {
        console.error(erro);
        alert("Erro ao registrar funcionário");
    } finally {
        nome.value = "";
        telefone.value = "";
        cpf.value = "";
        senha.value = "";
    }
};
</script>

<template>
    <div class="containerRV">
        <h2 class="tituloCadastro">Cadastro de Funcionário</h2>

        <input type="text" v-model="nome" placeholder="Nome" class="inputCadastro">
        <input type="tel" v-model="telefone" placeholder="Telefone" v-mask="'(##) #####-####'" class="inputCadastro">
        <input type="tel" v-model="cpf" placeholder="CPF" v-mask="'###.###.###-##'" class="inputCadastro">
        <input type="password" v-model="senha" placeholder="Senha" class="inputCadastro">

        <button @click="cadastrar" class="botaoCasdastro">Cadastrar</button>
        
        <div v-if="erro" class="erro">{{ erro }}</div>
    </div>
    <div class="containerBP"></div>
</template>
