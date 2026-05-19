const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Inicializa o Firebase Admin SDK (necessário para gerenciar usuários e senhas via servidor)
admin.initializeApp();

// ============================================================================
// FUNÇÃO 1: ASSISTENTE DE IA PARA LEITURA DE CONTRATOS
// ============================================================================
exports.processarContratoIA = functions
    .runWith({ timeoutSeconds: 120, memory: "1GB" })
    .https.onCall(async (data, context) => {
        try {
            // 1. Puxa a chave DENTRO da função (Garante que o .env já carregou)
            const API_KEY = process.env.GEMINI_API_KEY;
            
            if (!API_KEY) {
                console.error("ERRO FATAL: Chave da API do Gemini não encontrada no .env!");
                throw new functions.https.HttpsError('internal', 'Chave de API não configurada no servidor.');
            }

            // 2. Instancia o Gemini AQUI DENTRO!
            const genAI = new GoogleGenerativeAI(API_KEY);
            const model = genAI.getGenerativeModel({ 
                model: "gemini-1.5-flash",
                generationConfig: {
                    responseMimeType: "application/json",
                }
            });

            const { pdfBase64, texto } = data;
            
            const prompt = `
                Você é um assistente especialista de um CRM imobiliário. 
                Leia o contrato em anexo (PDF) ou o texto fornecido e extraia as informações estritamente no formato JSON abaixo.
                Se uma informação não existir ou você não encontrar, deixe o campo em branco ("").
                Importante: O campo "vgv" deve conter apenas números e ponto flutuante (ex: 712867.50).
                
                Texto adicional/observações: ${texto || "Nenhum"}

                FORMATO JSON OBRIGATÓRIO:
                {
                    "dataVenda": "AAAA-MM-DD",
                    "produto": "Nome do empreendimento ou imóvel",
                    "unidades": ["Lista de unidades"],
                    "vgv": "Valor total da venda",
                    "imobiliaria": "Nome da imobiliária",
                    "vendedores": [
                        { "nome": "", "cpfCnpj": "", "endereco": "", "bairro": "", "cidade": "", "uf": "", "cep": "" }
                    ],
                    "compradores": [
                        { "nome": "", "cpf": "", "end": "", "bairro": "", "cidade": "", "uf": "", "cep": "" }
                    ]
                }
            `;

            const partes = [{ text: prompt }];
            
            if (pdfBase64) {
                partes.push({
                    inlineData: { data: pdfBase64, mimeType: "application/pdf" }
                });
            }

            const result = await model.generateContent(partes);
            const response = await result.response;
            const textoResposta = response.text();
            
            return JSON.parse(textoResposta);

        } catch (error) {
            console.error("Erro detalhado na IA:", error);
            throw new functions.https.HttpsError('internal', `Erro no processamento: ${error.message}`);
        }
});

// ============================================================================
// FUNÇÃO 2: ATUALIZAR SENHA DE USUÁRIO EXISTENTE (ADMIN)
// ============================================================================
exports.modificarSenhaUsuarioAdmin = functions.https.onCall(async (data, context) => {
    // Garante que a requisição partiu de um usuário logado no sistema
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "Acesso restrito.");
    }
    
    const { email, novaSenha } = data;
    
    try {
        // Busca o usuário pelo E-mail e força a troca da senha na base de autenticação
        const userRecord = await admin.auth().getUserByEmail(email);
        await admin.auth().updateUser(userRecord.uid, { password: novaSenha });
        return { success: true };
    } catch (error) {
        console.error("Erro ao modificar senha:", error);
        throw new functions.https.HttpsError("internal", error.message);
    }
});