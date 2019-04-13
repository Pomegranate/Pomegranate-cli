export const template = `/*
 * Runtime settings for plugin: {{configName}}
 * Created On: {{configDate}}
 * Created with "pomegranate build config -e"
 *
 * The Env parameter in the function below refers to process.env
 * feel free to use it as such.
 */

module.exports = function(Env){
  return {{{configObject}}}
}
`