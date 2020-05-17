import config from '../assets/config'

export default {
  async parseDesktop (data) {
    const fs = require('fs')
    const ini = require('ini')
    const util = require('util')
    const exec = util.promisify(require('child_process').exec)
    const text = ini.parse(fs.readFileSync(data, 'utf-8'))
    const command = (text['Desktop Entry'].Exec).replace(/ %u| %f/, '')
    // console.log(text['Desktop Entry'].Name, command)
    let icon = ''

    try {
      const {stdout} = await exec(`dpkg-query -L ${command} | grep png`)
      if (stdout) {
        // gets first icon from list
        icon = (stdout.split('\n'))[0]
      }
      // console.log(icon)
      const iconBuffer = fs.readFileSync(icon)
      const iconBase64 = Buffer.from(iconBuffer).toString('base64')

      return {
        url: command,
        icon: `data:image/png;base64,${iconBase64}`
      }
    } catch (error) {
      // console.log(`dpkg-query error: ${command} : `)
      return {
        url: command,
        icon: config.defaultIcon
      }
    }
  }
}
