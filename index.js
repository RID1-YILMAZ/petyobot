const TopluyoBOT = require('topluyo-bot');
const bot = TopluyoBOT(require('./.token.json'));

const modifikasyon = require('./modifikasyon');
const moderasyon = require('./moderasyon');

function fixText(s) {
  return String(s || '')
    .replace(/İ/g, 'i').replace(/I/g, 'i').replace(/ı/g, 'i')
    .replace(/Ç/g, 'c').replace(/ç/g, 'c')
    .replace(/Ğ/g, 'g').replace(/ğ/g, 'g')
    .replace(/Ö/g, 'o').replace(/ö/g, 'o')
    .replace(/Ş/g, 's').replace(/ş/g, 's')
    .replace(/Ü/g, 'u').replace(/ü/g, 'u')
    .toLowerCase().trim();
}

bot.on('connected', () => {
  console.log('✅ PETYO EMBEDLİ SUNUCU MODUNDA AKTİF!');
});

bot.on('message', async (m) => {
  try {
    const channel_id = m.channel_id || m.post_channel_id || m.post?.channel_id;
    const user_id = m.user_id || m.post?.user_id;
    const rawText = m.message || m.text || m.post?.text || m.post?.content || '';

    if (!rawText || !channel_id) return;

    // Kanal bilgisinden Sunucu ID al
    let groupId = 'default';
    try {
      const chInfo = await bot.post('/!api/channel/get', { channel_id });
      groupId = String(chInfo?.group_id || chInfo?.data?.group_id || 'default');
    } catch (e) {}

    const fixed = fixText(rawText);
    const data = modifikasyon.getMemory();

    // Sunucu özel prefix listesi
    const serverObj = data.sunucular[groupId] || { prefixes: ['pet', 'petyo'] };
    const currentPrefixes = serverObj.prefixes || ['pet', 'petyo'];

    const hasMention = fixed.includes('@petyobot');
    const matchedPrefix = currentPrefixes.find(p => fixed.startsWith(p) || fixed.includes(p));

    if (!hasMention && !matchedPrefix) return;

    // Temizle
    let clean = fixed.replace(/@petyobot/g, '');
    if (matchedPrefix) {
      clean = clean.replace(new RegExp(matchedPrefix, 'g'), '');
    }

    const args = clean.trim().split(/\s+/).filter(Boolean);
    const cmd = args[0] || '';

    console.log(`🎯 [TETİKLENDİ] Sunucu: ${groupId} | Kanal: ${channel_id} | Cmd: "${cmd}"`);

    // Mesaj Gönderme Yardımcısı (Embed Destekli)
    const sendEmbed = async (embedObj) => {
      try {
        await bot.post('/!api/post/add', {
          channel_id,
          text: embedObj.text,
          embeds: embedObj.embeds
        });
      } catch (err) {
        await bot.post('/!api/post/add', { channel_id, text: embedObj.text });
      }
    };

    // 1. TEST KOMUTU
    if (cmd === '' || cmd === 'test') {
      const embed = modifikasyon.createEmbed({
        title: '⚡ Petyo Online',
        description: 'Buradayım! Petyo sunucu üyesi olarak aktif ve hizmetinde! ✨',
        color: '#00ff77'
      });
      return sendEmbed(embed);
    }

    // 2. EMBEDLİ SEKMELİ YARDIM MENÜSÜ
    if (cmd === 'yardim' || cmd === 'yardım') {
      const sub = args[1] || '';

      if (sub === 'modifikasyon') {
        const embed = modifikasyon.createEmbed({
          title: '🛠️ Modifikasyon Sekmesi',
          description: 'Sunucu ve prefix yapılandırma komutları:',
          color: '#ff0055',
          fields: [
            { name: '`pet prefix`', value: '— Sunucudaki aktif prefixleri listeler' },
            { name: '`pet prefix ekle [yeni]`', value: '— Sunucuya yeni bir prefix ekler' },
            { name: '`pet prefix sil [prefix]`', value: '— Eklenmiş bir prefix\'i kaldırır' },
            { name: '`pet ayarlar`', value: '— Sunucu modifikasyon raporunu sunar' }
          ]
        });
        return sendEmbed(embed);
      }

      if (sub === 'moderasyon') {
        const embed = modifikasyon.createEmbed({
          title: '🛡️ Moderasyon Sekmesi',
          description: 'Sunucu yönetim ve ceza komutları:',
          color: '#ff0000',
          fields: [
            { name: '`pet ban @kullanıcı`', value: '— Sunucudan kullanıcıyı yasaklar' },
            { name: '`pet sil [sayı]`', value: '— Belirtilen miktarda mesajı temizler' }
          ]
        });
        return sendEmbed(embed);
      }

      // ANA YARDIM MENÜSÜ (HEXABOT STİLİ EMBED)
      const mainEmbed = modifikasyon.createEmbed({
        title: '📋 Komut Menüsü',
        description: 'Aşağıdaki sekmelerden komut detaylarına ulaşabilirsiniz:',
        color: '#ff0055',
        fields: [
          { name: '`pet yardım modifikasyon`', value: '— Sunucu ve prefix ayarları' },
          { name: '`pet yardım moderasyon`', value: '— Moderasyon ve ceza komutları' },
          { name: '`pet test`', value: '— Bot çalışma durumunu kontrol eder' }
        ]
      });
      return sendEmbed(mainEmbed);
    }

    // 3. MODİFİKASYON MODÜLÜ
    const resModif = await modifikasyon.handleModifikasyon({ cmd, args: args.slice(1), groupId, createEmbed: modifikasyon.createEmbed });
    if (resModif) return sendEmbed(resModif);

    // 4. MODERASYON MODÜLÜ
    const resMod = await moderasyon.handleModerasyon({ cmd, args: args.slice(1), createEmbed: modifikasyon.createEmbed });
    if (resMod) return sendEmbed(resMod);

  } catch (err) {
    console.error('🔥 HATA:', err);
  }
});
