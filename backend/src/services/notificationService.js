const { Notification, User } = require('../models');
const whatsappService = require('./whatsappService');

class NotificationService {
  /**
   * Cria uma notificação in-app e, opcionalmente, também envia por WhatsApp
   * (apenas para conteúdo transacional — nunca propaganda política sem
   * opt-in explícito).
   */
  async notify({ userId, type, title, message, sendWhatsapp = false }) {
    const notification = await Notification.create({
      user_id: userId,
      type,
      title,
      message,
      channel: sendWhatsapp ? 'whatsapp' : 'in_app',
    });

    if (sendWhatsapp) {
      const user = await User.findByPk(userId);
      if (user?.phone) {
        await whatsappService.sendTransactionalUpdate(user.phone, `${title}: ${message}`);
      }
    }

    return notification;
  }

  async listForUser(userId, { onlyUnread = false } = {}) {
    const where = { user_id: userId };
    if (onlyUnread) where.read_at = null;
    return Notification.findAll({ where, order: [['created_at', 'DESC']] });
  }

  async markAsRead(notificationId, userId) {
    const notification = await Notification.findOne({ where: { id: notificationId, user_id: userId } });
    if (!notification) return null;
    notification.read_at = new Date();
    await notification.save();
    return notification;
  }
}

module.exports = new NotificationService();
