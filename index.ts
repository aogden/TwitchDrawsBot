import * as twitch from 'twitch-bot'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

dotenv.config();

const bot = new twitch({
  username: process.env.USERNAME,
  oauth: process.env.OAUTH,
  channels: [process.env.CHANNEL]
});

console.log('joining');
bot.on('join', () => {
	const commandString = fs.readFileSync(path.resolve(__dirname,'commands.txt'), "utf8");
	const commands = commandString.split('\n');
	// console.log(commands);
	let count = 0;
	//TODO: don't schedule all these up front
	commands.forEach(command => {
		setTimeout(() => { bot.say(command) }, count * 2000);
		count += 1;
	});
});

bot.on('error', err => {
	console.error(err);
})