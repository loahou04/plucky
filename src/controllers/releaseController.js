'use strict';

let express = require('express'),
	router = express.Router(),
	config = require('config'),
	yaml = require('../persistence/yaml'),
	jenkins = require('../persistence/jenkins'),
	sys = require('util'),
	execFile = require('child_process').execFile,
	releaseService = require('../services/releaseService');

function waitAndUpdateJob(jenkins, jobs) {

}

// get all releases
router.get('/', function(req, res) {
	releaseService.getReleases().then((releaseList) => {
		res.status(200).send(releaseList);
	});
});

// get release status
router.get('/:id', function(req, res) {
	releaseService.getReleasesById(req.params.id).then((release) => {
		if(!release) {
			return res.sendStatus(404);
		}
		res.status(200).send(release);
	});
});

// deploy project with env
router.post('/:id/deploy', function(req, res) {

	releaseService.getReleasesById(req.params.id).then((release) => {
		release.components.forEach((asset) => {
			jenkins.startJob(project.jenkins, asset.name);
		});
		res.sendStatus(202);
	});
	let project = config.projects.find((prj) => {
		return prj.name === req.params.name;
	});

	if(!project) {
		return res.sendStatus(404);
	}
	if(!req.query.env) {
		// shouldn't ever happen since the UI would follow this step.  
		return res.status(400).send('Bad request! env query parameter is required');	
	}
	let assetList = yaml.getBuildProjects(project).components;
	assetList.forEach((asset) => {
		jenkins.startJob(project.jenkins, asset.name);
	});
});


module.exports = router;
