import * as pixels from 'get-pixels'
import * as fs from 'fs'
import * as _ from 'lodash'
import * as path from 'path'
import {COMMAND_SOURCE} from './index';

const imgUrl = 'https://i.imgur.com/ZU48OtS.png';

pixels(imgUrl, (err, pixData) => {
	// console.log('got pixels', pixData);
	let commands = [];
	const width = pixData.shape[0];
	const height = pixData.shape[1];
	const widthOffset = 100;
	const heightOffset = 50;
	let lastColor;
	for (let y = 0; y < height; y++) {
		let line = '';
		for (let x = 0; x < width; x++) {
			const index = (y*width+x)*4
			const color = pixData.data.slice(index, index + 4);
			if(color[0] <= 10) {
				//black skip it
				line += " ";
				continue
			}
			line += "*";
			// console.log(`${[x,y]} color ${color}`);
			if(!lastColor || !_.isEqual(lastColor, color)) {
				commands.push(`setrgb(${color[0]},${color[1]},${color[2]})`)
				lastColor = color;
			}
			commands.push(`pp(${widthOffset+x},${heightOffset+y})`)
		}
		console.log(line);
		line = '';
	}
	console.log(commands);
	let commandString = '';
	commands.forEach(el => {
		commandString += el + `\n`
	})
	fs.writeFileSync(path.resolve(__dirname,COMMAND_SOURCE), commandString);
});