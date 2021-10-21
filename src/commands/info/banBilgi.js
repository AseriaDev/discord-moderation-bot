const { Owners } = global.client.settings;
const { botYt, penals } = global.client.guildSettings;
const { staffs } = penals.ban;
const Penals = require('../../schemas/penals.js');
const moment = require('moment');
require('moment-duration-format');
moment.locale('tr');

module.exports = {
    name: 'banbilgi',
    aliases: ['ban-bilgi'],
    category: 'Bilgi',
    usage: '<ID>',
    guildOnyl: true,
    cooldown: true,

    /**
     * @param { Client } client 
     * @param { Message } message 
     * @param { Array<String> } args
     * @param { MessageEmbed } Embed
     */

    async execute(client, message, args, Embed) {

        if(!Owners.includes(message.author.id) && !message.member.hasPermission('BAN_MEMBERS') && !message.member.roles.cache.has(botYt) && !staffs.some(role => message.member.roles.cache.has(role))) return;

        if(!args[0]) return message.channel.error(message, `Bir kullanıcı ID'si belirtmelisin!`, { timeout: 8000, reply: true, react: true });
        if(isNaN(args[0]) || args[0].toLocaleString().includes('-')) return message.channel.error(message, `Geçerli bir kullanıcı ID'si belirtmelisin!`, { timeout: 8000, reply: true, react: true,})

        let bannedUser = await client.fetchBan(message.guild, args[0]);

        if(!bannedUser) return message.channel.error(message, `Bu üye sunucudan yasaklı değil yada geçerli bir üye belirtilmedi!`, { timeout: 8000, react: true });

        let penal = await Penals.findOne({ guildID: message.guild.id, userID: bannedUser.user.id, type: "BAN", active: true });

        if(penal) {

            if(penal.type == 'BAN') {

                message.channel.true(message, Embed.setDescription(`
\`${bannedUser.user.tag}\` kullanıcısının **yasaklanma** bilgisi :

**Ceza ID :** \`#${penal.id}\`
**Yasaklanan Kullanıcı :** \`${bannedUser.user.tag} (${bannedUser.user.id})\`
**Yasaklayan Yetkili :** \`${client.users.cache.get(penal.staff).tag} (${client.users.cache.get(penal.staff).id})\`
**Yasaklanma Tarihi :** \`${moment(penal.date).format(`DD MMMM YYYY (HH:mm)`)}\`
**Yasaklanma Sebebi :** \`${!penal.reason ? 'Belirtilmedi!' : penal.reason}\`     
                `), { react: true });

            } else if(penal.type == 'FORCE_BAN') {

                message.channel.true(message, Embed.setDescription(`
\`${bannedUser.user.tag}\` kullanıcısının **kalıcı yasaklanma** bilgisi :
                
**Ceza ID :** \`#${penal.id}\`
**Yasaklanan Kullanıcı :** \`${bannedUser.user.tag} (${bannedUser.user.id})\`
**Yasaklayan Yetkili :** \`${client.users.cache.get(penal.staff).tag} (${client.users.cache.get(penal.staff).id})\`
**Yasaklanma Tarihi :** \`${moment(penal.date).format(`DD MMMM YYYY (HH:mm)`)}\`
**Yasaklanma Sebebi :** \`${!penal.reason ? 'Belirtilmedi!' : penal.reason}\`     
                `), { react: true });

            };

        } else {

            message.channel.true(message, Embed.setDescription(`
\`${bannedUser.user.tag}\` kullanıcısının **yasaklanma** bilgisi :
            
**Ceza ID :** \`Veri Bulunamadı!\`
**Yasaklanan Kullanıcı :** \`${bannedUser.user.tag} (${bannedUser.user.id})\`
**Yasaklayan Yetkili :** \`Veri Bulunamadı!\`
**Yasaklanma Tarihi :** \`Veri Bulunamadı!\`
**Yasaklanma Sebebi :** \`${!bannedUser.reason ? `Belirtilmedi!` : bannedUser.reason}\`     
            `), { react: true });

        };

    },
};