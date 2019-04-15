import * as twitch from 'twitch-bot'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

export const COMMAND_SOURCE = 'commands.txt';

class Worker {
	private bot;
	public async start(commandQueue:string[], bot) {
		this.bot = bot;
		return new Promise((resolve, reject) => {
			const didWork = this.consume(commandQueue);
			if(!didWork) {resolve();}
		})
	}
	private consume(commandQueue):boolean {
		const command = commandQueue.shift();
		if(command) {
			this.bot.say(command);
			console.log(`sent command ${command}`);
			setTimeout(() => { this.consume(commandQueue); }, 2000);
		}
		return !!command;
	}
}

export function start() {
	dotenv.config();

	const bot = new twitch({
		username: process.env.USERNAME,
		oauth: process.env.OAUTH,
		channels: [process.env.CHANNEL]
	});
	
	let commandQueueGlobal = [];
	const commandString = fs.readFileSync(path.resolve(__dirname,COMMAND_SOURCE), "utf8");
	commandQueueGlobal = commandString.split('\n');
	
	console.log('joining');
	bot.on('join', () => {
		const worker = new Worker();
		worker.start(commandQueueGlobal, bot);
	});
	
	bot.on('error', err => {
		console.error(err);
	})
}