<script setup>

import { ref } from 'vue'

const funcionarios = ref([])
const funcionariosFiltrado = ref([])
const erro = ref(null)
const loading = ref(true)
const nome = ref("")
const telefone = ref("")
const cpf = ref("")


const recebeFuncionarios = async () => {
    try {
        const resposta = await fetch("http://127.0.0.1:3000/funcionarios");
        if (!resposta.ok) {
            throw new Error("Erro ao realizar busca")
        }
        const data = await resposta.json();
        funcionarios.value = data;
        filtraFuncionario()
    } catch (error) {
        erro.value = error.message
    } finally {
        loading.value = false
    }
};

recebeFuncionarios()

const atualizarFuncionarios = async (funcionario) => {
    loading.value = true

    try {
        const resposta = await fetch(`http://127.0.0.1:3000/funcionarios/${funcionario.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                nome: funcionario.nome,
                telefone: funcionario.telefone.replace(/\D/g, ''),
                senha: funcionario.senha
            })
        });

        if (resposta.ok) {
            alert("funcionario atualizado com sucesso!")
        } else {
            const erroData = await resposta.json();
            erro.value = (erroData.error);
        }
    } catch (err) {
        console.error(err);
        erro.value = ("Erro de comunicação com o servidor");
    } finally {
        recebeFuncionarios();
    }
}

const removerFuncionarios = async (funcionario) => {
    loading.value = true

    try {
        const resposta = await fetch(`http://127.0.0.1:3000/funcionarios/${funcionario.id}`, {
            method: "DELETE"
        });

        if (resposta.ok) {
            alert("funcionario deletado com sucesso!");
        } else {
            const erroData = await resposta.json();
            erro.value = (erroData.error);
        }
    } catch (err) {
        console.error(err);
        erro.value = ("Erro de comunicação com o servidor");
    } finally {
        recebeFuncionarios();
    }
}

const filtraFuncionario = () => {
    funcionariosFiltrado.value = funcionarios.value.filter(funcionario => {
        const nomeMatch = funcionario.nome.toLowerCase().includes(nome.value.toLowerCase())
        const telefoneMatch = funcionario.telefone.toLowerCase().includes(telefone.value.toString().toLowerCase())
        const cpfMatch = funcionario.cpf.toLowerCase().includes(cpf.value.toString().toLowerCase())
        return nomeMatch && telefoneMatch && cpfMatch
    })
}
</script>

<template>
    <h2>Funcionarios</h2>
    <div class="containerRV">
        <div v-if="loading" class="loading">Carregando...</div>
        <div v-else-if="erro">{{ erro }}</div>
        <ul class="ulPessoas">
            <li v-for="funcionario in funcionariosFiltrado" :key="funcionario.id" class="itemPessoas itemFuncionario">
                <input v-model="funcionario.nome" placeholder="Nome" class="itemP inputPessoas" /><br>
                <input v-model="funcionario.telefone" placeholder="Telefone" class="inputPessoas" type="tel"
                    v-mask="'(##) #####-####'" /><br>
                <input v-model="funcionario.cpf" placeholder="CPF" class="inputPessoas" readonly
                    v-mask="'###.###.###-##'" /><br>
                <button @click="atualizarFuncionarios(funcionario)"
                    class="botaoPessoas botaoAtualizar botaoAtualizaPessoas">Atualizar</button>
                <button @click="removerFuncionarios(funcionario)" class="botaoPessoas botaoRemover">Remover</button><br>
            </li>
        </ul>


    </div>
    <!-- /////////////////////////// -->
    <div class="containerBP">
        <div class="form1  coluna primeiroFormPessoas">
            <p class="risco">-</p>
            <div class="form2">
                <h4>Nome: </h4>
                <input type="text" v-model="nome" @input="filtraFuncionario" placeholder="Nome do Funcionario"
                    class="inputFormFuncionarios nomeFormFuncionarios">

            </div>

        </div>

        <div class="form1 coluna">
            <p class="risco">-</p>
            <div class="form2">
                <h4>Telefone: </h4>
                <input type="tel" v-model="telefone" @input="filtraFuncionario" placeholder="Telefone do Funcionario"
                    v-mask="'(##) #####-####'" class="inputFormFuncionarios">
            </div>
        </div>

        <div class="form1 coluna">
            <p class="risco">-</p>
            <div class="form2">
                <h4>CPF: </h4>
                <input type="tel" v-model="cpf" @input="filtraFuncionario" placeholder="CPF do Funcionario"
                    v-mask="'###.###.###-##'" class="inputFormFuncionarios cpfFormFuncionario">
            </div>
        </div>
    </div>
</template>

<style>
@media (max-width: 768px) {
    .inputFormFuncionarios {
        width: 58vw;
    }

    .nomeFormFuncionarios {
        margin-left: 8vw;
    }

    .cpfFormFuncionario {
        margin-left: 12.4vw;
    }
}

.ulFuncionario {
    width: 72vw;
    background: none;
    display: flex;
    flex-wrap: wrap;
}
</style>