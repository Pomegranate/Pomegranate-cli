/**
 * @file buildPlugin
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project @framework
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

import Bluebird from 'bluebird'
import stringifyObject from 'stringify-object'

import {fqParentName, getFqParentname} from "@pomegranate/plugin-tools";

import {template as ApplicationTsClean} from '../templates/generators/ts/TsApplicationPlugin'
import {template as CommandTsClean} from '../templates/generators/ts/TsCommandPlugin'
import {template as CompositeTsClean} from '../templates/generators/ts/TsCompositePlugin'
import {template as EffectTsClean} from '../templates/generators/ts/TsEffectPlugin'
import {template as InjectableTsClean} from '../templates/generators/ts/TsInjectablePlugin'
import {template as LoghandlerTsClean} from '../templates/generators/ts/TsLoghandlerPlugin'


import {template as ApplicationJsClean} from '../templates/generators/js/JsApplicationPlugin'
import {template as InjectableJsClean} from '../templates/generators/js/JsInjectablePlugin'


import {compile} from 'handlebars'
import {toPairs, has, map, reduce, set, endsWith, repeat, join as _join, compose, concat, get} from 'lodash/fp'
import {getConfigFilePath, configObjectPath, configPath} from '@pomegranate/plugin-tools'
import {pathExists, outputFile, ensureDir} from "fs-extra";
import {join, relative} from 'path'
import {switchWith} from "lodash-fun";


const ensurePlugin = (baseDir, path, contents, force) => {
  let rel = relative(baseDir, path)
  return pathExists(path)
    .then((exists): boolean | any => {
      if (force || !exists) {
        return outputFile(path, contents)
      }
      console.log(`Plugin "./${rel}" exists, rerun with -f to overwrite.`)
      return 'exists'

    })
    .then((result) => {
      if (result !== 'exists') {
        console.log(`Plugin "./${rel}" created.`)
      }
      return result
    })
}


const templateChoices = {
  application: {
    ts: {
      comments: null,
      clean: compile(ApplicationTsClean)
    },
    js: {
      comments: null,
      clean: compile(ApplicationJsClean)
    }

  },
  command: {
    ts: {
      comments: null,
      clean:  compile(CommandTsClean)
    },
    js: {
      comments:null,
      clean: null
    }
  },
  composite: {
    ts: {
      comments: null,
      clean:  compile(CompositeTsClean)
    },
    js: {
      comments:null,
      clean: null
    }
  },
  effect: {
    ts: {
      comments: null,
      clean:  compile(EffectTsClean)
    },
    js: {
      comments:null,
      clean: null
    }
  },
  injectable: {
    ts: {
      comments: null,
      clean: compile(InjectableTsClean)
    },
    js: {
      comments: null,
      clean: compile(InjectableJsClean)
    }
  },
  loghandler: {
    ts: {
      comments: null,
      clean: compile(LoghandlerTsClean)
    },
    js: {
      comments: null,
      clean: null
    }
  }



}

export const buildPlugin = (cwd, Pomegranate, FutureConfigState) => {
  return async (argv) => {
    let ProjectConfig = await FutureConfigState.getState()
    let baseDirectory = get('baseDirectory', ProjectConfig)
    let fqbd = baseDirectory ? baseDirectory : argv.path

    // console.log(argv)
    let chooseTemplatePath = `${argv.builder}.${argv.language}.${argv.comments ? 'comments' : 'clean'}`
    let templateCompiler = get(chooseTemplatePath, templateChoices)

    if(!templateCompiler){
      console.log(`builder: ${argv.builder}, lang: ${argv.language}, output: ${argv.comments ? 'comments' : 'clean'}`)
      console.log('No match for that input combination found. Probably not implemented yet.')
      return
    }

    let creationTime = new Date().toDateString()
    let compileData = {
      creationDate: new Date().toDateString(),
      type: argv.type,
      name: argv.name
    }

    let filename = `${argv.name}.${argv.language}`
    let filepath = join(argv.path, filename)

    let contents = templateCompiler(compileData)

    return ensurePlugin(fqbd, filepath, contents, argv.force)
  }
}

