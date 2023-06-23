const { Events } = require('discord.js');
const fs = require('fs');
const jsonData = fs.readFileSync('croxydb/croxydb.json');
const data = JSON.parse(jsonData);
const uptimeData = data.uptime;
const allUptimeValues = uptimeData.filter(value => typeof value === 'string');
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
  } catch (error) {
    console.error(`Error pinging ${url}: ${error.message}`);
  }
}

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute() {
    if (allUptimeValues && Array.isArray(allUptimeValues)) {
      allUptimeValues.forEach(url => pingURL(url));
    }
    setInterval(() => {
      if (allUptimeValues && Array.isArray(allUptimeValues)) {
        allUptimeValues.forEach(url => pingURL(url));
      }
    }, 270000);
	},
};