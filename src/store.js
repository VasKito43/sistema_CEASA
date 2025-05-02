import { defineStore } from "pinia";
import { reactive } from "vue";

export const useStore = defineStore("main", () => {
    const estado = reactive({
        funcionario: null
    });

    function setFuncionario(novoFuncionario) {
        estado.funcionario = novoFuncionario;
    }

    return { estado, setFuncionario };
});

export const menuStore = defineStore('sidebar', {
    state: () => ({
        aberto: false
    }),
    actions: {
        toggle() {
            this.aberto = !this.aberto;
        }
    }
});