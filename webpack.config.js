/**************
func:     webpack
params:   runtime
describe: runs the webpack build for the public js file from the development
          file in the src/ui directory. will then place it in the public/js directory
          for use.
***************/
const path = require('path');

module.exports = {
  watch: true,
  entry: './src/ui/index.js',
  mode: 'development',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'public', 'js'),
  },
};
