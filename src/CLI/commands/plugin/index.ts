/**
 * @file index
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project pomegranate-cli
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

/**
 * @file pluginCommands
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project @framework
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */
import Bluebird from 'bluebird'
import {joinFqShortname, getFqShortname, fqDeclaredName} from "@pomegranate/plugin-tools";
import {map, toLower, first, get, filter, each} from 'lodash/fp'
import {Argv} from "yargs";
import yargs from 'yargs'

export async function pluginCommands(cwd, Pomegranate, FutureConfigState){

  let {Plugins} = await Pomegranate.Pomegranate.CliPlugins(FutureConfigState)
  // let plugins = get('Plugins', PomInstance)
  let commands = map((plugin: any) => {
    // console.log(toLower(first(fqShortName(plugin.configuration.name))))
    let Injector = get('injector', plugin)
    let commandFunction = get('commands', plugin)
    return {
      pluginName: getFqShortname(plugin),
      commandRoot: toLower(fqDeclaredName(plugin.configuration.name)),
      builderFn: Injector.inject(commandFunction)
    }
  }, filter(plugin => plugin.commands,Plugins))
  return {
    command: 'plugin',
    describe: 'Runs Plugin stuff',
    aliases: 'p',
    builder: (yargs: Argv) => {
      yargs
        .usage('usage: $0 plugin [cmd]')

      each((pluginCommander) => {
        // yargs.command(pluginCommander.commandRoot, `${pluginCommander.pluginName} Commands`,pluginCommander.builderFn)
        yargs.command({
          command: pluginCommander.commandRoot,
          describe: `${pluginCommander.pluginName} Commands`,
          builder: pluginCommander.builderFn,
          handler: (argv) => {
            yargs.showHelp()
          }
        })
      }, commands)

      return yargs
        .help()
    },
    handler: (args) => {
      yargs.showHelp()
    }
  }
}