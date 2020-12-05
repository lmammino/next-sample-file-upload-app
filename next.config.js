const { join } = require('path')

module.exports = {
  serverRuntimeConfig: {
    DATA_PATH: join(__dirname, 'data')
  }
}
