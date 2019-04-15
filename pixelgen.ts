import * as pixels from 'get-pixels'
import * as fs from 'fs'
import * as _ from 'lodash'
import * as path from 'path'
import {COMMAND_SOURCE} from './bot';

const IMG_URL = 'https://i.imgur.com/hwAlcbT.png';
const ORIGIN_OFFSETS = {x:0, y:600};
const BLACK_NO_OP_THRESHOLD = 10;

console.log(`generating draw commands from source ${IMG_URL}`)
pixels(IMG_URL, (err, pixData) => {
	if(err) {
		console.error(err);
		return;
	}
	
	let commands = [];
	const width = pixData.shape[0];
	const height = pixData.shape[1];
	let lastColor;
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const index = (y*width+x)*4
			const color = pixData.data.slice(index, index + 4);
			if(color[0] <= BLACK_NO_OP_THRESHOLD && color[1] <= BLACK_NO_OP_THRESHOLD && color[2] <= BLACK_NO_OP_THRESHOLD) {
				//black skip it
				continue
			}
			if(!lastColor || !_.isEqual(lastColor, color)) {
				commands.push(`setrgb(${color[0]},${color[1]},${color[2]})`)
				lastColor = color;
			}
			commands.push(`pp(${ORIGIN_OFFSETS.x+x},${ORIGIN_OFFSETS.y+y})`)
		}
	}
	console.log(commands);
	let commandString = '';
	commands.forEach(el => {
		commandString += el + `\n`
	})
	fs.writeFileSync(path.resolve(__dirname,COMMAND_SOURCE), commandString);
});