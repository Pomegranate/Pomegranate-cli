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
import {map, toLower, first, get, filter, each, isFunction, isObject} from 'lodash/fp'
import {Argv} from "yargs";
import yargs from 'yargs'

export async function pluginCommands(cwd, Config, Plugins){

  let commands = await Bluebird.all(map(async (plugin: any) => {
    // console.log(toLower(first(fqShortName(plugin.configuration.name))))
    let Injector = get('injector', plugin)
    let commandFunction = get('commands', plugin)
    return {
      pluginName: getFqShortname(plugin),
      commandRoot: toLower(getFqShortname(plugin)),
      builderFn: await Injector.inject(commandFunction)
    }
  }, filter(plugin => plugin.commands,Plugins)))

  return {
    command: 'plugin',
    describe: 'Plugin provided commands.',
    aliases: 'p',
    builder: (yargs: Argv) => {
      yargs
        .usage('usage: $0 plugin [cmd]')

      each((pluginCommander) => {
        yargs.command({
          command: pluginCommander.commandRoot,
          describe: `${pluginCommander.pluginName} Commands`,
          builder: pluginCommander.builderFn,
          handler: (argv) => {
            yargs.showHelp()
          }
        })
      // }, filter((plugin) => {return isFunction(plugin.builderFn)}, commands))
      }, filter((plugin) => {return isFunction(plugin.builderFn)}, commands))


      return yargs
        .help()
    },
    handler: (args) => {
      yargs.showHelp()
    }
  }
}