# TwitchDrawsBot

A script to generate commands from an image and drive a bot for [Twitch Draws](https://www.twitch.tv/themindsbehindtwitch)

## To Configure

`$ npm install`

copy `.env.template` to `.env` and fill with your credentials and target channel

[Twitch OAuth token tool](https://twitchapps.com/tmi/)

## To build

`$ npm run build`

## To generate draw commands

Update `IMG_URL` and `ORIGIN_OFFSETS` in `pixelgen.ts` pointing to the image you'd like to draw with x,y offsets

run

`$ npm run gencommands`

## To run draw bot

`$ npm run start`

## TODO

* Multiple bot accounts with commands segmented for each
* Command list cleanup as they are sent
* Pixel detection on TwitchDraws canvas to not overwrite other contributions
* Interesting new drawing patterns
* Optimization for minimum command list size (color grouping/color flattening)