/**
 * @file start
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project @framework
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

import {Argv} from "yargs";
import {join}  from 'path'
import {fork} from 'child_process'
import {buildProject} from "../application/handlers/project";


export const startPomegranate = (cwd, Config, Plugins) => {
  try {
    let f = Config.transformedValues
  }
  catch(e){
    return null
  }

  return {
      command: 'start [path]',
      describe: 'Starts a Pomegranate application',
      aliases: 's',
      builder: (yargs: Argv) => {
        let cwd = process.cwd()
        return yargs
          .positional('path', {
            description: 'path containing a pom.js',
            default: cwd,
            defaultDescription: 'Defaults to process.cwd()',
            type: 'string'
          })
          .option('b', {
              alias: 'build',
              description: 'Builds the project before starting.',
              default: false,
              type: 'boolean'
            })
          .option('c', {
            alias: 'clean',
            description: 'Cleans the build directory. Requires --b / -build option.',
            default: false,
            implies: 'build',
            type: 'boolean'
          })
          .option('f', {
            alias: 'file',
            description: 'Pom startup file',
            default: 'pom.js',
            defaultDescription: 'pom.js',
            string: true
          })
          .usage('Usage: $0 start [path]')
      },
      handler: async (argv) => {
        if(argv.build){
          let builder = await buildProject(cwd, Config, Plugins)
          await builder(argv)
        }
        delete process.env.POM_COMMAND_MODE
        let file = join(argv.path, argv.file)
        fork(file)
      }
    }
}