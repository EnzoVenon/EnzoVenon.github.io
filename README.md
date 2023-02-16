# three_rollup

## About

Basic [THREE.js](https://threejs.org/) project template using [JavaScript modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) and [Rollup](https://rollupjs.org).

Allows to launch all official [THREE.js examples](https://threejs.org/examples) locally by resolving all module dependencies.

Includes VS Code integration (debug script and IntelliSense).

Based on https://github.com/Mugen87/three-jsm

## Installation

After downloading the repository, go to the root directory and install all dependencies using:


`npm install`



## Usage

Build the app using rollup:

`npm run build`


Launch the local server


`npm start`


Open `http://localhost:3000/` in your favorite browser for testing.


## Modifying the code

Simply edit files in `src` such as `src/main.js` and save.
Some official THREE.js examples relying on libs like `ammo` or using resources (textures, models) or involving containers need to be adapted to work:
- assets should go into `assets` directory, and the path of the loaders must be adapted
- modifications to the html might be needed: some code requires `container` or `stats` `div`s
- external libraries might require modifications to `rollup_config.js`

Check `rollup_config.js`

Keep in mind that all files references in `index.html` are relative to the `dist` folder hierarchy.

Note that `three/examples/jsm` is successfully aliased as `three/addons` to keep changes to `main.js` minimal.

Live reloading works.
Remember to close your browser if you get a message saying that the default port is already being used.

