'use strict';

let path = require('path');
let yaml = require('js-yaml');
let fs = require('fs');

function orderedEnv(environments) {
	let orderedEnvList = environments.filter(function(env) {
		return !env.next_environment;
	});
	for(let i = 0; i < environments.length; i++) {
		let env = environments[i];
		if(env.next_environment) {
			let idx = 0;
			for(let j = 0; j < orderedEnvList.length; j++) {
				let orderedEnv = orderedEnvList[j];
				if(env.name === orderedEnv.next_environment) {
					idx = j+1;
					break;
				}
			}
			orderedEnvList.splice(idx, 0, env);
		}
	}
	return orderedEnvList;
}

module.exports = function(config) {
	let yamlConfig;
	// Get document, or throw exception on error
	try {
		// we need to get to the top level directory
		yamlConfig = yaml.safeLoad(fs.readFileSync(path.join(`${config.bitesizeFiles}/environments.bitesize`), 'utf8'));

	} catch (e) {
		console.log(e);
		throw new Error('error loading bitsize files');
	}

	return {
		id: config.name,
		environments: orderedEnv(yamlConfig.environments)
	};
};