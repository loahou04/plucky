'use strict';

const express = require('express'),
	router = express.Router(),
	config = require('config'),
	yaml = require('../persistence/yaml'),
	jenkins = require('../persistence/jenkins'),
	sys = require('util'),
	execFile = require('child_process').execFile,
	releaseService = require('../services/releaseService'),
	logger = require('../utility/logger');


// get all the projects available
router.get('/', function(req, res) {
	res.status(200).send(config.projects);
});

// kick off createbuild.sh file which will subsequently kick off a build for jenkins
router.post('/:name', function(req, res) {
	// patch, minor, major version changes
	if(req.query.version !== 'p' && req.query.version !== 'm' && req.query.version !== 'M') {
		return res.status(400).send('Bad request, version change must be patch \'p\', minor \'m\', or Major \'M\'  ');	
	}

	let project = config.projects.find((prj) => {
		return prj.name === req.params.name;
	});

	if(!project) {
		return res.sendStatus(404);
	}

	let startDirectory = process.cwd();
	process.chdir(project.bitesizeFiles);
	const child = execFile('../hed-console/createbuild.sh', [`-${req.query.version}`], (err, stdout, stderr) => {
		if (err) {
			logger.error(err);
			return res.sendStatus(400);
		}
		// this is an ugly way to get the final version number that was created..but i can fix it later if we need to
		const releaseVersion = stdout.match(/Created bitesize build for version:\s\d+.\d+.\d+/)[0].match(/\d+.\d+.\d+/)[0];
		let releaseId; 

		releaseService.insertRelease({
			version: releaseVersion,
			projectName: project.name,
			projectBuilt: !project.needsBuildBeforeDeploy,
			currentEnv: 'none',
			environmentOrder: yaml.getOrderedEnvironments(project),
		}).then((doc) => {
			// immediately send the document but the UI will need to do calls to get the release object to know if the
			// build finishes or fails
			res.status(201).send(doc);
			releaseId = doc._id;
			return jenkins.waitForIdle(project.jenkins, 'seed-job');
		}).then(() => {
			let jobs = [];
			yaml.getBuildProjects(project).components.forEach((asset) => {
				jobs.push(asset.name);
			});
			return jenkins.executeJobs(project.jenkins, jobs);
		}).then((result) => {
			if(result === 'failed') {
				return releaseService.updateRelease(releaseId, {projectBuilt: 'failed'}).then(function(doc) {
					logger.info('release set to failed');
				});
			}

			releaseService.updateRelease(releaseId, {projectBuilt: true}).then(function(doc) {
				logger.info('release got updated');
			});
		}).catch((err) => {
			logger.error('error', err);
		});
	});
	// go back to the original directory or we are screwed!
	process.chdir(startDirectory);

});

module.exports = router;
