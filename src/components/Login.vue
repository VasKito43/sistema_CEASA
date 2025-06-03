<script setup>
import { useStore } from '../store';
import { useRouter } from "vue-router";
import { ref } from 'vue';

const store = useStore();
const router = useRouter();

const cpf = ref("");
const senha = ref("");
const aviso = ref("");
const resultado = ref("");
const loading = ref(false); // Estado para indicar carregamento

const entrar = async () => {
    if (!cpf.value || !senha.value) {
        aviso.value = "Preencha todos os campos para entrar!";
        return;
    }

    aviso.value = "";
    loading.value = true; // Ativa o estado de carregamento

    const funcionario = {
        cpf: cpf.value.replace(/\D/g, ''),
        senha: senha.value
    };

    try {
        const resposta = await fetch(""https://backendvue.onrender.com/validaUsuario", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(funcionario)
        });

        if (!resposta.ok) {
            throw new Error("Erro ao tentar verificar");
        }

        resultado.value = await resposta.json();
        console.log("Funcionário verificado com sucesso!");

        if (resultado.value.error) {
            aviso.value = resultado.value.error;
            cpf.value = "";
            senha.value = "";
        } else {
            store.setFuncionario(resultado);
            router.push("/home");
        }
    } catch (erro) {
        console.error(erro);
        aviso.value = erro.message;
    } finally {
        loading.value = false;
    }
};

</script>

<template>
    <div class="centralizado coluna containerLogin">
        <div class="centralizado coluna containerInput">
            <img src="../assets/alho.svg" alt="" class="logoVue">
            <p class="textoLogin">Sistema CEASA</p>

            <input type="text" v-model="cpf" v-mask="'###.###.###-##'" placeholder="CPF" class="inputLogin"
                :disabled="loading">
            <input type="password" v-model="senha" placeholder="Senha" class="inputLogin" :disabled="loading">

            <button @click="entrar" class="botaoLogin" :disabled="loading">
                <span v-if="!loading">Entrar</span>
                <div v-else class="spinner"></div>
            </button>

            <p class="aviso" v-if="aviso">{{ aviso }}</p>
        </div>
    </div>
</template>

<style>
@media (max-width: 768px) {
    .containerInput {
        min-width: 100vw;
        min-height: 100vh;
        border-radius: 0 !important;
        box-shadow: 0 6px 18px rgba(0, 0, 0, 0);
    }

    .logoVue {
        min-width: 30vw;
        margin-top: -20vh !important;

    }

    .textoLogin {
        font-size: 30pt !important;
        margin-bottom: 15vh !important;
    }

    .inputLogin {
        min-width: 70vw;
        min-height: 7vh;
        font-size: 14pt;
    }

    .inputLogin:focus {
        outline: 1px solid #3498db;
    }

    .botaoLogin {
        min-width: 70vw;
        min-height: 7vh;
        font-size: 14pt;
    }

}

.containerLogin {
    height: 100%;
    height: 100vh;
    background: linear-gradient(to right, #5c5c5c, #3b4ba3);
}

.logoVue {
    width: 10vw;
    margin-top: -3vh;
}

.textoLogin {
    font-weight: bold;
    font-size: 18pt;
    margin-bottom: 3vh;
    color: black;
}

.inputLogin {
    width: 18vw;
    height: 5vh;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
}

.inputLogin:disabled {
    background-color: #e0e0e0;
    cursor: not-allowed;
}

.botaoLogin {
    width: 18vw;
    height: 5vh;
    margin-right: 0.5vw;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    margin-top: 1vh;
}

.botaoLogin:hover {
    background: rgba(0, 0, 0, 0.753);

}

.botaoLogin:disabled {
    background-color: #aaa;
    cursor: not-allowed;
}

.containerInput {
    width: 22vw;
    height: 55vh;
    background: white;
    border-radius: 15px;
    box-shadow: 0 6px 18px rgba(0, 0, 0);
}

/* Estilização do Spinner */
.spinner {
    width: 20px;
    height: 20px;
    border: 3px solid transparent;
    border-top-color: white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

.aviso {
    margin-bottom: -2vh;
    margin-top: 4vh;
    color: red;
}
</style>
