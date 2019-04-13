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
import {relative} from 'path'

export async function pomegranateApplication(cwd, Config, Plugins) {
  let projectDir = get('projectPluginDirectory', Config)
  let baseDir = get('baseDirectory', Config)
  let defaultPluginDir
  try {
    defaultPluginDir = relative(baseDir, projectDir)
  }
  catch(e){
    console.log('Unable to determine project plugin directory, plugin generation commands are unavailable.')
  }

  return {
    command: 'application',
    aliases: 'a',
    describe: 'Application specific commands.',
    builder: (yargs) => {
      return yargs
        .command({
          command: 'configure',
          aliases: 'c',
          describe: 'Creates pomegranate plugin configurations',
          builder: (yargs) => {
            yargs.option('e', {
              alias: 'env',
              default: 'false',
              type: 'boolean'
            })
          },
          handler: buildConfigs(cwd, Config, Plugins)
        })
        .command({
          command: 'build',
          aliases: 'b',
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
          handler: buildProject(cwd, Config, Plugins)
        })
        .help()
    },
    handler: () => {
      yargs.showHelp()
    }
  }
}