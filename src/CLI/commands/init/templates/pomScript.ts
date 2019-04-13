export const template = `
/*
 * Pomegranate Application: {{AppName}}
 * Created On: {{CreateDate}}
 *
 * Pomegranate application start up.
 *
 */

'use strict';

const Pomegranate = require('pomegranate')
const PomSettings = require('./PomegranateSettings')

async function startPomegranate(){
  const Pom = await Pomegranate.Run(PomSettings)
  Pom.start()
}

module.exports = ((Env) => {
  if(Env.POM_COMMAND_MODE){
    return {PomSettings, Pomegranate}
  }
  
  startPomegranate()

})(process.env)

`