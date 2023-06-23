const { Client, GatewayIntentBits, Routes, Collection, ActivityType, EmbedBuilder, Events, ModalBuilder, TextInputStyle, TextInputBuilder, ActionRowBuilder } = require("discord.js");
const config = require("./config");
const fs = require("node:fs");
const path = require("node:path");
const { REST } = require("@discordjs/rest");
const db = require("croxydb");
const { uptime } = require("node:process");
const INTENTS = Object.values(GatewayIntentBits);

const client = new Client({ intents: INTENTS });
client.commands = new Collection();
const slashCommands = [];

client.on("guildCreate", async (guild) => {
    console.log(`${client.user.tag} sunucuya eklendi: ${guild.name} (${guild.id})`);

    const rest = new REST({ version: '9' }).setToken(config.token);

    try {
        await rest.put(Routes.applicationGuildCommands(config.clientID, guild.id), { body: slashCommands });
        console.log(`Başarıyla komutlar yüklendi - Sunucu: ${guild.name} (${guild.id})`);
    } catch (error) {
        console.error('Komut yüklenirken bir hata oluştu:', error);
    }
});
client.once("ready", async () => {
    console.log(`${client.user.tag} olarak giriş yapıldı.`);
	client.user.setStatus("dnd");


    const rest = new REST({ version: '9' }).setToken(config.token);

    try {
        const guilds = await client.guilds.fetch();
        const guildIDs = guilds.map(guild => guild.id);	

        for (const guildID of guildIDs) {
            await rest.put(Routes.applicationGuildCommands(config.clientID, guildID), { body: slashCommands });
            console.log(`Başarıyla komutlar yüklendi - Sunucu ID: ${guildID}`);
        }

        console.log(`Toplam ${guildIDs.length} sunucuda komutlar yüklendi.`);
    } catch (error) {
        console.error('Komut yüklenirken bir hata oluştu:', error);
	}
});

client.on("ready", async () => {
    client.user.setActivity("Linkleri", { type: ActivityType.Watching });
    console.log("Durum güncellendi.");
});

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);

	client.commands.set(command.data.name, command);
    slashCommands.push(command.data.toJSON());

    console.log(`${command.data.name} dosyası yüklendi.`)
}

client.on(`interactionCreate`, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`Komut ${interaction.commandName} bulunamadı.`);
		return;
	}

	try {
		await command.execute(client, interaction);
	} catch (error) {
		console.error("Bir hata oluştu: " + error);
        await interaction.reply({ content: 'Bu komut çalıştırılırken bir hata oluştu!', ephemeral: true });
	}
});

const axios = require('axios');

async function pingURL(url) {
  try {
    await axios.get(url)
      .then(tst => {
        console.log(`Pinged ${url} successfully!`);
      })
      .catch(err => {
        console.error(`Error pinging ${url}: ${err.message}`);
      })
    // Additional handling or logging can be done with the response data
  } catch (error) {
    console.error(`Error pinging ${url}: ${error.message}`);
  }
}

client.on(Events.InteractionCreate, async (interaction) => {
	if (!interaction.isButton()) return;
	const dmhata = new EmbedBuilder()
		.setColor(0xFF0000)
		.setTitle("DM'nizi açınız!")
		.setDescription(`Lütfen DM'nizi kontol edip tekrar deneyiniz, ${interaction.user.toString()}.`)
		.setFooter({ text: 'Umut Uptime' })
	if (interaction.customId === 'uekle') {
		// Create the modal
		const modal = new ModalBuilder()
		.setCustomId('uptimeAddModal')
		.setTitle('Uptime Ekle');

		// Add components to modal

		// Create the text input components
		const uptimeLinkInput = new TextInputBuilder()
			.setCustomId('uptimeLinkAdd')
		    // The label is the prompt the user sees for this input
			.setLabel("Proje URL'si")
		    // Short means only a single line of text
			.setStyle(TextInputStyle.Short);

		// An action row only holds one text input,
		// so you need one action row per text input.
		const firstActionRow = new ActionRowBuilder().addComponents(uptimeLinkInput);

		// Add inputs to the modal
		modal.addComponents(firstActionRow);

		// Show the modal to the user
		await interaction.showModal(modal);
	}
	if (interaction.customId === 'usil') {
		// Create the modal
		const modal = new ModalBuilder()
		.setCustomId('uptimeRemoveModal')
		.setTitle('Uptime Sil');

		// Add components to modal

		// Create the text input components
		const uptimeLinkInput = new TextInputBuilder()
			.setCustomId('uptimeLinkRemove')
		    // The label is the prompt the user sees for this input
			.setLabel("Proje URL'si")
		    // Short means only a single line of text
			.setStyle(TextInputStyle.Short);

		// An action row only holds one text input,
		// so you need one action row per text input.
		const firstActionRow = new ActionRowBuilder().addComponents(uptimeLinkInput);

		// Add inputs to the modal
		modal.addComponents(firstActionRow);

		// Show the modal to the user
		await interaction.showModal(modal);
	}
	if (interaction.customId === 'usay') {
		if (db.fetch("uptimeu" + interaction.user.id).length > 0) {
			const goster = new EmbedBuilder()
			.setColor(0xFF0000)
			.setTitle("Eklediğin Linkler")
			.setDescription("🔗 " + db.fetch("uptimeu" + interaction.user.id).join('\n🔗 '))
			.setFooter({ text: 'Umut Uptime' })
			interaction.reply({ embeds: [goster], ephemeral: true })
			.catch(err => {
				interaction.user.send({ embeds: [goster] })
					.catch((errrr) => {
						console.log("Mesaj gönderilemedi: " + interaction.user.username)
					})
			})
		} else {
			const gosterilemedi = new EmbedBuilder()
			.setColor(0xFF0000)
			.setTitle("Eklediğin Linkler")
			.setDescription("Hiçbir link eklememişsin!")
			.setFooter({ text: 'Umut Uptime' })
			interaction.reply({ embeds: [gosterilemedi], ephemeral: true })
			.catch(err => {
				interaction.user.send({ embeds: [gosterilemedi] })
					.catch((errrr) => {
						console.log("Mesaj gönderilemedi: " + interaction.user.username)
					})
			})
		}
	}
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isModalSubmit()) return;
	if (interaction.customId === 'uptimeAddModal') {
		const link = interaction.fields.getTextInputValue('uptimeLinkAdd');
		const eklendi = new EmbedBuilder()
			.setColor(0xFF0000)
			.setTitle("Link Eklendi!")
			.setDescription(`Başarıyla ${link} linkini uptime listesine ekledin!`)
			.setFooter({ text: 'Umut Uptime' })
		const zatenekli = new EmbedBuilder()
			.setColor(0xFF0000)
			.setTitle("Link Zaten Ekli!")
			.setDescription(`${link} linki zaten uptime listesinde bulunuyor!`)
			.setFooter({ text: 'Umut Uptime' })

		const jsonData = fs.readFileSync('croxydb/croxydb.json');
		const data = JSON.parse(jsonData);

		const uptimeData = data.uptime;
		const allUptimeValues = uptimeData.filter(value => typeof value === 'string');

		if (!allUptimeValues.includes(link)) {
			if (!link.includes("@")) {
				if (link.startsWith("https://")) {
					const uptimeFetch2 = db.fetch("uptimeu" + interaction.user.id);
					const uptimeCount2 = uptimeFetch2.length
					if (uptimeCount2 > 4) {
						// Üstteki değer limitden mutlaka 1 düşük olmalıdır. Aksi taktirde örnek olarak limit 5 ise üste 5 yazarsanız kullanıcı toplamda 6 link ekleyebilecektir.
						const linkEmbed3 = new EmbedBuilder()
						.setColor(0xFF0000)
						.setTitle("Bir Eklenemedi")
						.setDescription(`Maksimum olan 5 uptime link limitini aşamazsınız. Uptime ekleme işleminiz engellenmiştir.`)
						.setFooter({ text: 'Umut Uptime' })
						interaction.reply({ embeds: [linkEmbed3], ephemeral: true })
							.catch(err => {
								interaction.user.send({ embeds: [linkEmbed3] })
									.catch((errrr) => {
										console.log("Mesaj gönderilemedi: " + interaction.user.username)
									})
							})
					} else {
						await axios.get(link)
					.then(prsp => {
						db.push("uptime", link);
						if (db.has("uptimeu" + interaction.user.id)) {
							if (db.has("uptimeu" + interaction.user.id)) {
								db.push("uptimeu" + interaction.user.id, link);
							}
						} else {
							db.set("uptimeu" + interaction.user.id, link);
							db.push("uptimeu" + interaction.user.id, link);
						}
						const logkanal = client.channels.cache.get(config.logKanal)
						const uptimeFetch = db.fetch("uptimeu" + interaction.user.id);
						const uptimeCount = uptimeFetch.length
						if (link.includes("uptime")) {
							const linkEmbed2 = new EmbedBuilder()
							.setColor(0xFF0000)
							.setTitle("Bir Link Eklendi!")
							.setDescription(`Aşağıda link ile ilgili bilgiler bulunuyor.`)
							.addFields(
								{ name: 'Ekleyen', value: `${interaction.user.toString()}`, inline: true},
								{ name: 'Toplam', value: `${uptimeCount}`, inline: true},
								{ name: '\u200B', value: '\u200B', inline: true},
								{ name: 'Uptime Tespiti', value: `Tespitlendi`, inline: true},
								{ name: 'Link', value: `${link}`, inline: true},
							)
							.setFooter({ text: 'Umut Uptime' })
							logkanal.send({ embeds: [linkEmbed2] })
							interaction.reply({ embeds: [eklendi], ephemeral: true })
								.catch(err => {
									interaction.user.send({ embeds: [eklendi] })
										.catch((errrr) => {
											console.log("Mesaj gönderilemedi: " + interaction.user.username)
										})
								})
							pingURL(link)
						} else {
							const linkEmbed2 = new EmbedBuilder()
							.setColor(0xFF0000)
							.setTitle("Bir Link Eklendi!")
							.setDescription(`Aşağıda link ile ilgili bilgiler bulunuyor.`)
							.addFields(
								{ name: 'Ekleyen', value: `${interaction.user.toString()}`, inline: true},
								{ name: 'Toplam', value: `${uptimeCount}`, inline: true},
								{ name: '\u200B', value: '\u200B', inline: true},
								{ name: 'Uptime Tespiti', value: `Tespitlenemedi`, inline: true},
								{ name: 'Link', value: `${link}`, inline: true},
							)
							.setFooter({ text: 'Umut Uptime' })
							logkanal.send({ embeds: [linkEmbed2] })
							interaction.reply({ embeds: [eklendi], ephemeral: true })
								.catch(err => {
									interaction.user.send({ embeds: [eklendi] })
										.catch((errrr) => {
											console.log("Mesaj gönderilemedi: " + interaction.user.username)
										})
								})
							pingURL(link)
						}
					})
					.catch(err => {
						const hataping = new EmbedBuilder()
						.setColor(0xFF0000)
						.setTitle("Link Eklenemedi")
						.setDescription(`Lütfen geçerli bir link giriniz!`)
						.setFooter({ text: 'Umut Uptime' })
						interaction.reply({ embeds: [hataping], ephemeral: true })
							.catch(err => {
								interaction.user.send({ embeds: [hataping] })
									.catch((errrr) => {
										console.log("Mesaj gönderilemedi: " + interaction.user.username)
									})
							})
					})
					}
				} else {
					const hataping5 = new EmbedBuilder()
					.setColor(0xFF0000)
					.setTitle("Link Eklenemedi")
					.setDescription(`Link yanlış veya HTTPS desteklemiyor. Güvenlik amacıyla HTTPS desteklemeyen linkler uptime listesine eklenemezler.`)
					.setFooter({ text: 'Umut Uptime' })
					interaction.reply({ embeds: [hataping5], ephemeral: true })
						.catch(err => {
							interaction.user.send({ embeds: [hataping5] })
								.catch((errrr) => {
									console.log("Mesaj gönderilemedi: " + interaction.user.username)
								})
						})
				}
			} else {
				const hataping = new EmbedBuilder()
					.setColor(0xFF0000)
					.setTitle("Link Eklenemedi")
					.setDescription(`Lütfen geçerli bir link giriniz!`)
					.setFooter({ text: 'Umut Uptime' })
					interaction.reply({ embeds: [hataping], ephemeral: true })
					.catch(err => {
						interaction.user.send({ embeds: [hataping] })
							.catch((errrr) => {
								console.log("Mesaj gönderilemedi: " + interaction.user.username)
							})
					})
			}
		} else {
			interaction.reply({ embeds: [zatenekli], ephemeral: true })
			.catch(err => {
				interaction.user.send({ embeds: [zatenekli] })
					.catch((errrr) => {
						console.log("Mesaj gönderilemedi: " + interaction.user.username)
					})
			})
		}
	}

	if (interaction.customId === 'uptimeRemoveModal') {
		const link = interaction.fields.getTextInputValue('uptimeLinkRemove');
		const zatenyok = new EmbedBuilder()
			.setColor(0xFF0000)
			.setTitle("Link Mevcut Değil!")
			.setDescription(`${link} linki senin uptime listende mevcut değil!`)
			.setFooter({ text: 'Umut Uptime' })
		const silindi = new EmbedBuilder()
			.setColor(0xFF0000)
			.setTitle("Link Silindi!")
			.setDescription(`Başarıyla ${link} linkini uptime listesinden silindi!`)
			.setFooter({ text: 'Umut Uptime' })

		const jsonData = fs.readFileSync('croxydb/croxydb.json');
		const data = JSON.parse(jsonData);

		const uptimeData = data.uptime;
		const allUptimeValues = uptimeData.filter(value => typeof value === 'string');

		const allUptimeValues2 = db.fetch("uptimeu" + interaction.user.id)

		if (allUptimeValues.includes(link)) {
			if (allUptimeValues2.includes(link)) {
				db.unpush("uptime", link);
				if (db.has("uptimeu" + interaction.user.id)) {
					db.unpush("uptimeu" + interaction.user.id, link);
				}
				const logkanal = client.channels.cache.get(config.logKanal)
				const uptimeFetch = db.fetch("uptimeu" + interaction.user.id);
				const uptimeCount = uptimeFetch.length
				const linkEmbed3 = new EmbedBuilder()
				.setColor(0xFF0000)
				.setTitle("Bir Link Silindi!")
				.setDescription(`Aşağıda link ile ilgili bilgiler bulunuyor.`)
				.addFields(
					{ name: 'Silen', value: `${interaction.user.toString()}`, inline: true},
					{ name: 'Toplam', value: `${uptimeCount}`, inline: true},
					{ name: '\u200B', value: '\u200B', inline: true},
					{ name: 'Link', value: `${link}`, inline: true},
				)
				.setFooter({ text: 'Umut Uptime' })
				logkanal.send({ embeds: [linkEmbed3] })
				interaction.reply({ embeds: [silindi], ephemeral: true })
				.catch(err => {
					interaction.user.send({ embeds: [silindi] })
						.catch((errrr) => {
							console.log("Mesaj gönderilemedi: " + interaction.user.username)
						})
				})
			}
		} else {
			interaction.reply({ embeds: [zatenyok], ephemeral: true })
			.catch(err => {
				interaction.user.send({ embeds: [zatenyok] })
					.catch((errrr) => {
						console.log("Mesaj gönderilemedi: " + interaction.user.username)
					})
			})
		}
	}
});

client.login(config.token);