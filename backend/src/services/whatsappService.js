const logger = require('../utils/logger');

/**
 * WhatsAppService
 * ----------------
 * Camada de abstração para qualquer provedor de WhatsApp Business API
 * (Meta Cloud API, Twilio, Z-API, Gupshup etc.). O restante do sistema
 * NUNCA chama o provedor diretamente — sempre passa por aqui, então trocar
 * de provedor no futuro é uma mudança isolada neste arquivo.
 *
 * Modo atual: "stub" — apenas loga a mensagem no console (útil para
 * desenvolvimento local sem credenciais reais). Para produção, implemente
 * `sendViaProvider()` com a chamada HTTP real usando as variáveis de
 * ambiente WHATSAPP_API_URL / WHATSAPP_API_TOKEN / WHATSAPP_FROM_NUMBER.
 */
class WhatsAppService {
  constructor() {
    this.provider = process.env.WHATSAPP_PROVIDER || 'stub';
  }

  async sendMessage(toPhone, message) {
    if (this.provider === 'stub') {
      logger.info(`[WhatsAppService:STUB] Para ${toPhone}: "${message}"`);
      return { success: true, provider: 'stub' };
    }
    return this.sendViaProvider(toPhone, message);
  }

  async sendVerificationCode(toPhone, code) {
    const message = `Conecta Candidato: seu código de confirmação é ${code}. Válido por 10 minutos. Não compartilhe este código.`;
    return this.sendMessage(toPhone, message);
  }

  async sendPasswordResetCode(toPhone, code) {
    const message = `Conecta Candidato: seu código para redefinir a senha é ${code}. Válido por 10 minutos.`;
    return this.sendMessage(toPhone, message);
  }

  async sendTransactionalUpdate(toPhone, text) {
    return this.sendMessage(toPhone, text);
  }

  // Implementação real de um provedor externo (exemplo de contrato a seguir)
  async sendViaProvider(toPhone, message) {
    // Exemplo de integração futura (pseudo-código):
    //
    // const response = await fetch(process.env.WHATSAPP_API_URL, {
    //   method: 'POST',
    //   headers: {
    //     Authorization: `Bearer ${process.env.WHATSAPP_API_TOKEN}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     from: process.env.WHATSAPP_FROM_NUMBER,
    //     to: toPhone,
    //     type: 'text',
    //     text: { body: message },
    //   }),
    // });
    // return response.json();
    logger.warn('WHATSAPP_PROVIDER configurado, mas sendViaProvider() não implementado ainda.');
    return { success: false, reason: 'provider_not_implemented' };
  }
}

module.exports = new WhatsAppService();
