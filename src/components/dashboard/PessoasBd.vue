<script setup>

import { ref, watch } from 'vue'

const usuarios = ref([])
const usuariosFiltrado = ref([])
const erro = ref(null)
const loading = ref(true)

const nome = ref("")
const celular = ref("")
const email = ref("")

const recebeUsuarios = async () => {
    try {
        const resposta = await fetch("https://backendvue.onrender.com/usuarios");
        if (!resposta.ok) {
            throw new Error("Erro ao realizar busca")
        }
        const data = await resposta.json();
        usuarios.value = data;
        filtraClientes();

    } catch (error) {
        erro.value = error.message
    } finally {
        loading.value = false
    }
};

recebeUsuarios()

const atualizarUsuarios = async (usuario) => {
    loading.value = true

    try {
        const resposta = await fetch(`https://backendvue.onrender.com/usuarios/${usuario.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                nome: usuario.nome,
                email: usuario.email,
                celular: usuario.celular.replace(/\D/g, '')
            })
        });

        if (resposta.ok) {
            alert("usuario atualizado com sucesso!")
        } else {
            const erroData = await resposta.json();
            erro.value = (erroData.error);
        }
    } catch (err) {
        console.error(err);
        erro.value = ("Erro de comunicação com o servidor");
    } finally {
        recebeUsuarios();
    }
}

const removerUsuarios = async (usuario) => {
    loading.value = true

    try {
        const resposta = await fetch(`https://backendvue.onrender.com/usuarios/${usuario.id}`, {
            method: "DELETE"
        });

        if (resposta.ok) {
            alert("Usuario deletado com sucesso!");
        } else {
            const erroData = await resposta.json();
            erro.value = (erroData.error);
        }
    } catch (err) {
        console.error(err);
        erro.value = ("Erro de comunicação com o servidor");
    } finally {
        recebeUsuarios();
    }
}

const filtraClientes = () => {
    usuariosFiltrado.value = usuarios.value.filter(usuario => {
        const nomeMatch = usuario.nome.toLowerCase().includes(nome.value.toLowerCase())
        const celularMatch = usuario.celular.toLowerCase().includes(celular.value.toLowerCase())
        const emailMatch = usuario.email.toLowerCase().includes(email.value.toLowerCase())
        return nomeMatch && celularMatch && emailMatch
    })
}



</script>

<template>
    <h2>Clientes</h2>
    <div class="containerRV">
        <div v-if="loading" class="loading">Carregando...</div>
        <div v-else-if="erro">{{ erro }}</div>
        <ul class="ulPessoas">
            <li v-for="usuario in usuariosFiltrado" :key="usuario.id" class="itemPessoas ">
                <input v-model="usuario.nome" placeholder="Nome" class="itemP inputPessoas" /><br>
                <input v-model="usuario.celular" placeholder="Celular" class="inputPessoas" type="tel"
                    v-mask="'(##) #####-####'" /><br>
                <input v-model="usuario.email" placeholder="CPF" class="inputPessoas" /><br>
                <button @click="atualizarUsuarios(usuario)"
                    class="botaoPessoas botaoAtualizar botaoAtualizaPessoas">Atualizar</button>
                <button @click="removerUsuarios(usuario)" class="botaoPessoas botaoRemover">Remover</button><br>
            </li>
        </ul>


    </div>
    <div class="containerBP">
        <div class="form1  coluna primeiroFormPessoas">
            <p class="risco">-</p>
            <div class="form2">
                <h4>Nome: </h4>
                <input type="text" v-model="nome" @input="filtraClientes" placeholder="Nome do Cliente"
                    class="inputFormPessoas nomeFomrPessoas">

            </div>

        </div>

        <div class="form1 coluna">
            <p class="risco">-</p>
            <div class="form2">
                <h4>Celular: </h4>
                <input type="tel" v-model="celular" @input="filtraClientes" placeholder="Celular do Cliente"
                    v-mask="'(##) #####-####'" class="inputFormPessoas">
            </div>
        </div>

        <div class="form1 coluna">
            <p class="risco">-</p>
            <div class="form2">
                <h4>Email: </h4>
                <input type="text" v-model="email" @input="filtraClientes" placeholder="Email do Cliente"
                    class="inputFormPessoas emailFormPessoas">
            </div>
        </div>
    </div>
</template>

<style>
@media (max-width: 768px) {
    .itemPessoas {
        min-width: 76vw;
    }

    .inputPessoas {
        min-width: 73.5vw;
    }

    .botaoPessoas {
        min-width: 35.5vw;
    }

    .containerBP {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        min-height: 15vh;
    }

    h2 {
        margin-top: -3vh;
    }

    .form1 {
        align-items: baseline;
        margin: 0;
        padding: 0;
        margin-top: -2vh;
        margin-bottom: 1.5vh;
        margin-left: 3vw;
    }

    .risco {
        font-size: 1pt;
        padding: 0px;
    }

    .form2 {
        margin: 0;
        padding: 0;
    }

    h4 {
        font-size: 16pt;

    }

    .primeiroFormPessoas {
        margin-top: -0.5vh;
    }

    .inputFormPessoas {
        min-width: 62vw;
    }

    .nomeFomrPessoas {
        margin-left: 4.8vw;
    }

    .emailFormPessoas {
        margin-left: 5.3vw;
    }
}

.ulPessoas {
    width: 72vw;
    background: none;
    display: flex;
    flex-wrap: wrap;
}

.itemPessoas {
    height: 30vh;
    width: 20vw;
    margin-left: 3vw;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
    margin-top: 3vh;
    background: linear-gradient(to right, #4747473f, #0e0d0d3a);
    border: solid 1px black;

}

.inputPessoas {
    margin-left: 1vw;
    height: 5vh;
    font-size: 12pt;
}

.botaoAtualizaPessoas {
    margin-top: 3vh;
    margin-left: 1vw;
    margin-right: 0.5vw;
}

.botaoAtualizar {
    background: linear-gradient(to right, #30a801ee, #53d119d7);
    width: 6.5vw;
    font-size: 14pt;

}

.botaoRemover {
    width: 8.5vw;
    background: linear-gradient(to right, #ff0000ee, #960303d7);
    font-size: 14pt;

}

.itemP {
    margin-top: 3vh;
}
</style>