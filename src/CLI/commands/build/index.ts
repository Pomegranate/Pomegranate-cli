/**
 * @file init
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project @framework
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */
import yargs from 'yargs'
import Bluebird from 'bluebird'
import {get, getOr} from 'lodash/fp'
import {buildConfigs} from "./handlers/configs";
import {buildProject} from "./handlers/project"
import {buildPlugin} from "./handlers/plugin";
import {relative} from 'path'

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


export async function buildPomegranate(cwd, Pomegranate, FutureConfigState) {
  let ProjectConfig = await FutureConfigState.getState()
  let projectDir = get('projectPluginDirectory', ProjectConfig)
  let baseDir = get('baseDirectory', ProjectConfig)
  let defaultPluginDir
  try {
    defaultPluginDir = relative(baseDir, projectDir)
  }
  catch(e){
    console.log('Unable to determine project plugin directory, plugin generation commands are unavailable.')
  }

  return {
    command: 'build',
    aliases: 'b',
    describe: 'generative commands for Pomegranate',
    builder: (yargs) => {
      return yargs
        .command({
          command: 'plugin <builder> <name>',
          aliases: 'pl',
          describe: 'Creates a new local Pomegranate plugin',
          builder: (yargs) => {
            yargs
              .positional('builder', {
                describe: 'The type of builder to use',
                choices: ['application','command','composite','effect','injectable','loghandler'],
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
          handler: buildPlugin(cwd, Pomegranate, FutureConfigState)
        })
        .command({
          command: 'config',
          aliases: 'c',
          describe: 'Creates pomegranate plugin configurations',
          builder: (yargs) => {
            yargs.option('e', {
              alias: 'env',
              default: 'false',
              type: 'boolean'
            })
          },
          handler: buildConfigs(cwd, Pomegranate, FutureConfigState)
        })
        .command({
          command: 'project',
          aliases: 'p',
          describe: 'Builds the current project with TypeScript',
          builder: (yargs) => {
            yargs
              .options('c', {
                alias: 'clean',
                description: 'Removes and recreates build directory before compile.',
                default: false,
                boolean: true
              })
              .options('w', {
                alias: 'watch',
                description: 'Watches the project directory for changes.',
                default: false,
                boolean: true
              })
          },
          handler: buildProject(cwd, Pomegranate, FutureConfigState)
        })
        .help()
    },
    handler: () => {
      yargs.showHelp()
    }
  }
}