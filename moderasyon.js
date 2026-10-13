module.exports = {
  handleModerasyon: async function({ cmd, args, createEmbed }) {
    if (cmd === 'ban') {
      return createEmbed({
        title: '🛡️ Moderasyon / Ban',
        description: 'Kullanıcı yasaklama komutu hazırlanıyor...',
        color: '#ff0000'
      });
    }

    if (cmd === 'sil') {
      return createEmbed({
        title: '🧹 Moderasyon / Sil',
        description: 'Toplu mesaj silme komutu hazırlanıyor...',
        color: '#ffaa00'
      });
    }

    return null;
  }
};
