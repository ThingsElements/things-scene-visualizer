var ncp = require('ncp').ncp;
const {
  resolve
} = require('path');
const module_resolve = require('resolve');

var visualizerModulePath
try {
  visualizerModulePath = module_resolve.sync('@things-elements/things-scene-visualizer');
  var destination = resolve(visualizerModulePath, 'obj')
  var source = resolve(visualizerModulePath, '')
} catch (e) {
  console.log(e)
  process.exit()
}

source = resolve(visualizerModulePath, '../../obj')

console.log(`
destination: ${destination}
source: ${source}
`)

if (source != destination) {
  ncp(source, destination, function (err) {
    if (err) {
      return console.error(err);
    }
    console.log('done!');
  });
} else {
  console.log("It's dev")
}
