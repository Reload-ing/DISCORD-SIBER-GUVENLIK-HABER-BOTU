function chunkArray(array, chunkSize) {
  const chunks = [];

  for (let i = 0; i < array.length; i += chunkSize) {
    const chunk = array.slice(i, i + chunkSize);
    chunks.push(chunk);
  }

  return chunks;
}

const Discord = require('discord.js');
const NewsAPI = require('newsapi');
const newsapi = new NewsAPI('APİ KEY');
const client = new Discord.Client();

let lastArticleTitle = '';

client.on('ready', () => {
  console.log(`Bot ${client.user.tag} adıyla giriş yaptı!`);
});

client.on('message', async message => {
  if (message.content === '!haberler') {
    try {
      const response = await newsapi.v2.everything({
        q: 'siber güvenlik AND teknoloji',
        language: 'tr',
        sortBy: 'publishedAt',
      });

      const articleList = response.articles.map(article => `**${article.title}**\n${article.description}\n${article.url}`).join('\n\n');

      if (articleList) {
        const newsEmbed = new Discord.MessageEmbed()
          .setColor('#0099ff')
          .setTitle('***Son Haberler***')
          .setDescription(articleList.substring(0, 4096)); // Description max length is 2048

        message.channel.send(newsEmbed);
      } else {
        message.channel.send('Üzgünüm, şu anda hiç haber yok.');
      }
    } catch (error) {
      console.error('News API yanıt vermedi:', error);
      message.channel.send('Üzgünüm, haberleri alırken bir hata oluştu.');
    }
  }
});

client.on('ready', () => {
  setInterval(async () => {
    try {
      const response = await newsapi.v2.everything({
        q: 'siber güvenlik AND teknoloji',
        language: 'tr',
        sortBy: 'publishedAt',
      });

      if (response.articles.length > 0) {
        const article = response.articles[0];
        if (article.title !== lastArticleTitle) {
          lastArticleTitle = article.title;
          const newsEmbed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle(article.title)
            .setURL(article.url)
            .setDescription(article.description.substring(0, 2048)) // Description max length is 2048
            .setTimestamp(new Date(article.publishedAt))
            .setThumbnail(article.urlToImage)
            .setFooter('İnönü Haber <> Reloading', '');

          const channel = client.channels.cache.get('1076531371499073598');
          const message = await channel.send(newsEmbed);

          // Doğru saat bilgisini almamızı sağlar.
          message.createdAt = new Date(article.publishedAt);
          message.editedAt = null;
        }
      }
    } catch (error) {
      console.error('News API yanıt vermedi:', error);
    }
  }, 300000); // 5 dakika = 300000 ms
});

client.login('TOKEN');
