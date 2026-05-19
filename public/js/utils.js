// ============================================================
// CITRONI CRM — UTILITÁRIOS GLOBAIS (utils.js)
// Fase 1 da modularização: Funções puras de formatação,
// máscaras de input e cálculos sem dependência de Firebase.
// ============================================================

// ==========================================
// TOGGLE DE VISIBILIDADE DE SENHA
// ==========================================
window.alternarVisibilidadeSenha = function(inputId, iconeId) {
    const input = document.getElementById(inputId);
    const icone = document.getElementById(iconeId);
    if (input.type === 'password') {
        input.type = 'text';
        icone.classList.replace('bi-eye', 'bi-eye-slash');
    } else {
        input.type = 'password';
        icone.classList.replace('bi-eye-slash', 'bi-eye');
    }
};

// ==========================================
// FORMATAÇÃO DE DATAS E WHATSAPP
// ==========================================
window.formatarDataGlobal = function(dataStr) {
    if (!dataStr) return '-';
    const p = dataStr.split('-');
    return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : dataStr;
}

window.gerarLinkWhatsApp = function(telefone) {
    if (!telefone) return '-';
    let num = telefone.replace(/\D/g, ''); 
    if (num.length === 10 || num.length === 11) { num = '55' + num; }
    if (num.length < 10) return telefone; 
    return `<a href="https://wa.me/${num}" target="_blank" class="text-success text-decoration-none fw-bold" title="Abrir WhatsApp">
                <i class="bi bi-whatsapp"></i> ${telefone}
            </a>`;
}

// ==========================================
// FORMATAÇÃO E MÁSCARAS DE MOEDA
// ==========================================
window.aplicarMascaraMoeda = function(event) {
    let input = event.target;
    let valor = input.value.replace(/\D/g, "");
    if (valor === "") { input.value = ""; return; }
    valor = (parseInt(valor, 10) / 100).toFixed(2);
    valor = valor.replace(".", ",");
    valor = valor.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
    input.value = valor;
}

window.converterMoedaParaFloat = function(valorFormatado) {
    if (!valorFormatado) return 0;
    let numeroLimpo = valorFormatado.replace(/\./g, "").replace(",", ".");
    return parseFloat(numeroLimpo) || 0;
}

// ==========================================
// MÁSCARAS DE DOCUMENTOS (CPF, CNPJ)
// ==========================================
window.aplicarMascaraCpf = function(event) {
    let v = event.target.value.replace(/\D/g, "");
    v = v.replace(/(\d{3})(\d)/, "$1.$2");
    v = v.replace(/(\d{3})(\d)/, "$1.$2");
    v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    event.target.value = v;
}

window.aplicarMascaraCnpj = function(event) {
    let v = event.target.value.replace(/\D/g, "");
    v = v.replace(/^(\d{2})(\d)/, "$1.$2");
    v = v.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
    v = v.replace(/\.(\d{3})(\d)/, ".$1/$2");
    v = v.replace(/(\d{4})(\d)/, "$1-$2");
    event.target.value = v;
}

// Máscara inteligente que detecta CPF ou CNPJ pelo tamanho
window.aplicarMascaraCpfCnpj = function(event) {
    let v = event.target.value.replace(/\D/g, "");
    if (v.length <= 11) { // Máscara de CPF
        v = v.replace(/(\d{3})(\d)/, "$1.$2");
        v = v.replace(/(\d{3})(\d)/, "$1.$2");
        v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    } else { // Máscara de CNPJ
        v = v.replace(/^(\d{2})(\d)/, "$1.$2");
        v = v.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
        v = v.replace(/\.(\d{3})(\d)/, ".$1/$2");
        v = v.replace(/(\d{4})(\d)/, "$1-$2");
    }
    event.target.value = v;
}

// ==========================================
// LÓGICA DE PESSOAS: IDADE E SIGNO
// ==========================================

// Função auxiliar interna para calcular o signo a partir de dia/mês
function _calcularSigno(dia, mes) {
    if ((mes == 3 && dia >= 21) || (mes == 4 && dia <= 19)) return "Áries ♈";
    if ((mes == 4 && dia >= 20) || (mes == 5 && dia <= 20)) return "Touro ♉";
    if ((mes == 5 && dia >= 21) || (mes == 6 && dia <= 20)) return "Gêmeos ♊";
    if ((mes == 6 && dia >= 21) || (mes == 7 && dia <= 22)) return "Câncer ♋";
    if ((mes == 7 && dia >= 23) || (mes == 8 && dia <= 22)) return "Leão ♌";
    if ((mes == 8 && dia >= 23) || (mes == 9 && dia <= 22)) return "Virgem ♍";
    if ((mes == 9 && dia >= 23) || (mes == 10 && dia <= 22)) return "Libra ♎";
    if ((mes == 10 && dia >= 23) || (mes == 11 && dia <= 21)) return "Escorpião ♏";
    if ((mes == 11 && dia >= 22) || (mes == 12 && dia <= 21)) return "Sagitário ♐";
    if ((mes == 12 && dia >= 22) || (mes == 1 && dia <= 19)) return "Capricórnio ♑";
    if ((mes == 1 && dia >= 20) || (mes == 2 && dia <= 18)) return "Aquário ♒";
    if ((mes == 2 && dia >= 19) || (mes == 3 && dia <= 20)) return "Peixes ♓";
    return "";
}

window.calcularIdadeESigno = function() {
    const dataInput = document.getElementById('pesDtNasc').value;
    if (!dataInput) {
        document.getElementById('pesIdade').value = '';
        document.getElementById('pesSigno').value = '';
        return;
    }

    const hoje = new Date();
    const nasc = new Date(dataInput + "T00:00:00");
    let idade = hoje.getFullYear() - nasc.getFullYear();
    const m = hoje.getMonth() - nasc.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) { idade--; }
    document.getElementById('pesIdade').value = idade + " anos";
    document.getElementById('pesSigno').value = _calcularSigno(nasc.getDate(), nasc.getMonth() + 1);
}

window.calcularIdadeESignoColab = function() {
    const dataInput = document.getElementById('colabDataNasc').value;
    if (!dataInput) {
        document.getElementById('colabIdade').value = '';
        document.getElementById('colabSigno').value = '';
        return;
    }

    const hoje = new Date();
    const nasc = new Date(dataInput + "T00:00:00");
    let idade = hoje.getFullYear() - nasc.getFullYear();
    const m = hoje.getMonth() - nasc.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) { idade--; }
    document.getElementById('colabIdade').value = idade + " anos";
    document.getElementById('colabSigno').value = _calcularSigno(nasc.getDate(), nasc.getMonth() + 1);
}
