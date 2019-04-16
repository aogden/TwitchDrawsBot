import * as pixels from 'get-pixels'
import * as fs from 'fs'
import * as _ from 'lodash'
import * as path from 'path'
import {COMMAND_SOURCE} from './bot';

const IMG_URL = 'https://i.imgur.com/rRECLEq.jpg';
const ORIGIN_OFFSETS = {x:0, y:0};
const BLACK_NO_OP_THRESHOLD = 35;

console.log(`generating draw commands from source ${IMG_URL}`)

pixels(`https://i.imgur.com/3K7DJxl.png`, (err, sourcePixData) => {
	pixels(IMG_URL, (err, pixData) => {
		if(err) {
			console.error(err);
			return;
		}
		
		let commands = [];
		let groupedCommands = {};
		let skips = 0;
		const width = pixData.shape[0];
		const height = pixData.shape[1];
		let lastColor;
		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				const index = (y*width+x)*4
				const color = pixData.data.slice(index, index + 4);
				const sourceColor = sourcePixData.data.slice(index, index + 4);
				if(sourceColor[0] > 10 || sourceColor[1] > 10 || sourceColor[2] > 10) {
					skips++;
					continue;
				}
				if(color[0] <= BLACK_NO_OP_THRESHOLD && color[1] <= BLACK_NO_OP_THRESHOLD && color[2] <= BLACK_NO_OP_THRESHOLD) {
					//black skip it
					continue
				}
				color[0] = color[0] - color[0] % 2;
				color[1] = color[1] - color[1] % 2;
				color[2] = color[2] - color[2] % 2;
				if(!lastColor || !_.isEqual(lastColor, color)) {
					commands.push(`setrgb(${color[0]},${color[1]},${color[2]})`)
					lastColor = color;
				}
				commands.push(`pp(${ORIGIN_OFFSETS.x+x},${ORIGIN_OFFSETS.y+y})`)
				const colAr = [color[0],color[1],color[2]]
				// console.log(`AO ${JSON.stringify(colAr)}`)
				if(!groupedCommands[JSON.stringify(colAr)]) {
					groupedCommands[JSON.stringify(colAr)] = [];
				}
				groupedCommands[JSON.stringify(colAr)].push(`pp(${ORIGIN_OFFSETS.x+x},${ORIGIN_OFFSETS.y+y})`);
			}
		}
		// console.log(commands);
		// console.log(skips);
		let betterCommands = [];
		let c = 0;
		for (const key in groupedCommands) {
			if (groupedCommands.hasOwnProperty(key)) {
				const element = groupedCommands[key];
				const color = JSON.parse(key);
				// console.log(key);
				betterCommands.push(`setrgb(${color[0]},${color[1]},${color[2]})`)
				element.forEach(command => {
					betterCommands.push(command);
				})
				c += element.length;
			}
		}
		let commandString = '';
		betterCommands.forEach(el => {
			commandString += el + `\n`
		})
		fs.writeFileSync(path.resolve(__dirname,COMMAND_SOURCE), commandString);
	});
})