const fs = require('fs');
const DATA_FILE = './sunucular.json';

let memoryCache = null;

function loadData() {
  if (memoryCache) return memoryCache;
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    memoryCache = JSON.parse(raw);
  } catch (e) {
    memoryCache = { sunucular: {} };
  }
  return memoryCache;
}

function saveData() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(memoryCache, null, 2), 'utf8');
  } catch (e) {
    console.error('Veri kaydetme hatası:', e);
  }
}

module.exports = {
  getMemory: loadData,

  // Embed Kart Oluşturucu
  createEmbed: function({ title, description, color = '#ff0055', fields = [] }) {
    let content = `**${title}**\n\n${description}`;
    if (fields.length > 0) {
      content += '\n\n' + fields.map(f => `**${f.name}**\n${f.value}`).join('\n\n');
    }
    return {
      embeds: [
        {
          title: title,
          description: description,
          color: color,
          fields: fields
        }
      ],
      text: content
    };
  },

  handleModifikasyon: async function({ cmd, args, groupId, createEmbed }) {
    const data = loadData();

    if (!data.sunucular[groupId]) {
      data.sunucular[groupId] = {
        prefixes: ['pet', 'petyo', '!']
      };
    }

    const serverData = data.sunucular[groupId];

    // Otomatik olarak '!' yoksa ekle
    if (!serverData.prefixes.includes('!')) {
      serverData.prefixes.push('!');
      saveData();
    }

    // PREFIX YÖNETİMİ
    if (cmd === 'prefix') {
      const action = args[0] ? args[0].toLowerCase() : 'liste';
      const val = args[1] ? args[1].toLowerCase().trim() : '';

      if (action === 'ekle') {
        if (!val) {
          return createEmbed({
            title: '⚠️ Eksik Parametre',
            description: 'Lütfen eklenecek prefix\'i belirtin.\n**Örnek:** `!prefix ekle ?`',
            color: '#ffaa00'
          });
        }
        if (serverData.prefixes.includes(val)) {
          return createEmbed({
            title: '⚠️ Uyarı',
            description: `\`${val}\` prefix'i bu sunucuda zaten ekli!`,
            color: '#ffaa00'
          });
        }
        serverData.prefixes.push(val);
        saveData();
        return createEmbed({
          title: '✨ Prefix Eklendi',
          description: `Yeni prefix başarıyla tanımlandı: \`${val}\`\n\n**Aktif Prefixler:** \`${serverData.prefixes.join(', ')}\``,
          color: '#00ff77'
        });
      }

      if (action === 'sil' || action === 'kaldir') {
        if (!val) {
          return createEmbed({
            title: '⚠️ Eksik Parametre',
            description: 'Lütfen silinecek prefix\'i belirtin.',
            color: '#ffaa00'
          });
        }
        if (val === 'pet' || val === 'petyo' || val === '!') {
          return createEmbed({
            title: '⛔ Güvenlik Engeli',
            description: 'Varsayılan **`pet`** ve **`!`** prefix\'leri silinemez!',
            color: '#ff0000'
          });
        }
        if (!serverData.prefixes.includes(val)) {
          return createEmbed({
            title: '❌ Hata',
            description: `\`${val}\` adında bir prefix bulunamadı.`,
            color: '#ff0000'
          });
        }

        serverData.prefixes = serverData.prefixes.filter(p => p !== val);
        saveData();
        return createEmbed({
          title: '🗑️ Prefix Silindi',
          description: `\`${val}\` prefix'i başarıyla kaldırıldı.`,
          color: '#00ff77'
        });
      }

      // Prefix Liste
      return createEmbed({
        title: '🌸 Sunucu Prefix Listesi',
        description: `• **Aktif Prefixler:** \`${serverData.prefixes.join(', ')}\`\n• **Varsayılanlar:** \`pet\`, \`!\``,
        color: '#ff0055'
      });
    }

    // AYARLAR RAPORU
    if (cmd === 'modifikasyon' || cmd === 'ayarlar') {
      return createEmbed({
        title: '⚙️ Sunucu Ayarları',
        description: `• **Sunucu ID:** \`${groupId}\`\n• **Aktif Prefixler:** \`${serverData.prefixes.join(', ')}\`\n• **Durum:** Aktif / Dinleniyor`,
        color: '#ff0055'
      });
    }

    return null;
  }
};
