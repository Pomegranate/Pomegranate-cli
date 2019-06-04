/**
 * @file init
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project @framework
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */
import yargs from 'yargs'
import Bluebird from 'bluebird'
import {get, getOr} from 'lodash/fp'
import {buildPlugin} from "./handlers/plugin";
import {relative} from 'path'

export const buildableTypes = ['action', 'anything', 'application', 'command', 'composite', 'factory', 'instance', 'loghandler', 'merge', 'override']

export const command = 'build <path>'
export const describe = 'Builds Pomegranate app at <path>'
export const aliases = 'b'
export const builder = (yargs) => {
  return yargs
    .command()
    .command({})
    .help()
}
export const handler = (argv) => {

}


export async function pomegranateCreate(cwd, Config, Plugins) {
  try {
    let f = Config.transformedValues
  }
  catch(e){
    return null
  }
  let {buildDirs, projectDirs} = Config.transformedValues()
  let projectDir = get('projectPluginDirectory', Config)
  let baseDir = get('baseDirectory', Config)
  let defaultPluginDir
  try {
    defaultPluginDir = projectDirs.pluginDirectory
  }
  catch(e){
    console.log('Unable to determine project plugin directory, plugin generation commands are unavailable.')
  }

  return {
    command: 'create',
    aliases: 'c',
    describe: 'Generative commands for Pomegranate.',
    builder: (yargs) => {
      return yargs
        .command({
          command: 'plugin <type> <name>',
          aliases: 'pl',
          describe: 'Creates a new local Pomegranate plugin',
          builder: (yargs) => {
            yargs
              .positional('type', {
                describe: 'The type plugin to create',
                choices: buildableTypes,
                type: 'string'
              })
              .positional('name', {
                describe: 'The plugin name',
                type: 'string'
              })
              .option('f', {
                alias: 'force',
                describe: 'Overwrite existing',
                default: false,
                type: 'boolean'
              })
              .option('l', {
                alias: 'language',
                describe: 'Generate TypeScript or Javascript',
                default: 'ts',
                choices: ['ts', 'js'],
                type: 'string'
              })
              .option('p', {
                alias: 'path',
                describe: 'Path to write output, defaults to the pluginDirectory in PomegranateSettings.js',
                default: defaultPluginDir,
                type: 'string'
              })
              .option('c', {
                alias: 'comments',
                describe: 'Generates the plugin with usage comments.',
                default: false,
                type: 'boolean'
              })
          },
          handler: buildPlugin(cwd, Config, Plugins)
        })
        .help()
    },
    handler: () => {
      yargs.showHelp()
    }
  }
}