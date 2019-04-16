import * as twitch from 'twitch-bot'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

export const COMMAND_SOURCE = 'commands.txt';

class Worker {
	private bot;
	public name:string;
	public async start(commandQueue:string[], bot) {
		this.bot = bot;
		console.log(`${this.bot.username} start`)
		return new Promise((resolve, reject) => {
			const didWork = this.consume(commandQueue);
			if(!didWork) {resolve();}
		})
	}
	private consume(commandQueue):boolean {
		const command = commandQueue.shift();
		if(command) {
			this.bot.say(command);
			console.log(`${this.bot.username}: sent command ${command}`);
			setTimeout(() => { this.consume(commandQueue); }, 2000);
		}
		return !!command;
	}
}

export function start() {
	dotenv.config();
	
	let chatbots = [];

	if(process.env.ACCOUNTS) {
		const accounts = JSON.parse(process.env.ACCOUNTS);
		accounts.forEach(account => {
			chatbots.push(new twitch({
				username: account.username,
				oauth: account.oauth,
				channels: [process.env.CHANNEL]
			}));
		})
	} else {
		const bot = new twitch({
			username: process.env.USERNAME,
			oauth: process.env.OAUTH,
			channels: [process.env.CHANNEL]
		});
		chatbots.push(bot);
	}

	let i = 1;
	chatbots.forEach(bot => {
		let commandQueueGlobal = [];
		const commandString = fs.readFileSync(path.resolve(__dirname,`commands${i}.txt`), "utf8");
		commandQueueGlobal = commandString.split('\n');
		
		console.log(`${bot.username} joining`);
		bot.on('join', () => {
			const worker = new Worker();
			worker.name = bot.username;
			console.log(`${bot.username} joined`);
			setTimeout(() => {worker.start(commandQueueGlobal, bot);}, Math.random() * 5000);
			
		});
		
		bot.on('error', err => {
			console.error(err);
		})

		bot.on('timeout', evt => {
			console.log(evt);
		})

		bot.on('part', channel => {
			console.log('part');
		})
		i++;
	})
}