#!/usr/bin/env node

/**
 * @file index
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project pomegranate-cli
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */
import {cloneDeep} from 'lodash/fp'
import {join} from 'path'
import {startPomegranate} from "./CLI/commands/start"
import {pomegranateApplication} from "./CLI/commands/application";
import {pomegranateCreate} from "./CLI/commands/create"
import {initPomegranate} from "./CLI/commands/init"
import {Argv} from "yargs"
import {pluginCommands} from "./CLI/commands/plugin";

const yargs = require('yargs')

const cwd = process.cwd()
const initialFile = join(cwd, 'pom.js')

let Pomegranate
const strapPom = async function(){
  let Config
  let Plugins
  let cliData
  let futureState
  let PomSettings
  try {
    process.env.POM_COMMAND_MODE = '1'
    Pomegranate = require(initialFile)
  }
  catch(e){
    console.log(e)
    console.log('No pom.js file found.')
  }

  try {
    if (Pomegranate) {
      let clonedSettings = cloneDeep(Pomegranate.PomSettings)
      clonedSettings.logLevel = 0
      let localApp = await Pomegranate.Pomegranate.RunCLI(cwd, clonedSettings)
      Config = localApp.Config
      Plugins = localApp.Plugins


    }
  } catch(e){
    console.log(e)
    console.log(`Pomegranate in current working directory is unavailable or has errors. 
    Commands which rely on the current state of your application may be unavailable.`)
  }
  yargs
    .command(initPomegranate())
    .command(await pluginCommands(cwd, Config, Plugins))
    .command(await pomegranateApplication(cwd, Config, Plugins))
    .command(await pomegranateCreate(cwd, Config, Plugins))
    .command(startPomegranate(cwd, Config, Plugins))
    .demandCommand(1, 'You must provide at least one command.')
    .recommendCommands()
    .strict()
    .fail((msg, err) => {
      if (msg) {
        console.log(msg)
        yargs.showHelp()
      }
      if (err) {
        console.error(err.message)
      }

      process.exit(1)
    })
    .argv

}

strapPom()