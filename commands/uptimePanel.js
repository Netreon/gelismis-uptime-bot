const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, Events, ModalBuilder, TextInputBuilder, TextInputStyle, ButtonBuilder, ButtonStyle } = require(`discord.js`);

const falseembed = new EmbedBuilder()
.setColor(0xFF0000)
.setDescription("Aşağıdan, istediğiniz gibi projelerinizi uptime edebilirsiniz. Herhangi bir URL'yi uptime listenize eklediğinizde, aşağıdaki kuralları kabul etmiş olursunuz.")
.addFields(
    { name: 'Link Gizliliği', value: `Eklediğiniz linkler yetkililer tarafından görüntülenebilir.`},
    { name: 'Güvenlik', value: `Eklemeye çalıştığınız linkler HTTPS desteklemek zorundalar.`},
    { name: 'Bozmak', value: `Eklemeye çalıştığınız linklerin bota zarar vermesi, bozması yasaktır.`},
)

module.exports = {
	data: new SlashCommandBuilder()
		.setName('uptimepanel')
		.setDescription(`Panel oluşturur.`)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(client, interaction) {
        const add = new ButtonBuilder()
        .setCustomId('uekle')
        .setLabel('Ekle')
        .setStyle(ButtonStyle.Danger);

        const remove = new ButtonBuilder()
        .setCustomId('usil')
        .setLabel('Sil')
        .setStyle(ButtonStyle.Danger);

        const get = new ButtonBuilder()
        .setCustomId('usay')
        .setLabel('Göster')
        .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder()
            .addComponents(add, remove, get);

        await interaction.channel.send({ embeds: [falseembed], components: [row] })
            .then(() => {
                console.log(interaction.channel.id + " idli kanala uptime panel gönderildi.")
            })
            .catch((error) => {
                interaction.channel.send({ embeds: [falseembed], components: [row] })
            })
	},
};