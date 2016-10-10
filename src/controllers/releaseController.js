'use strict';

let express = require('express'),
	router = express.Router(),
	config = require('config'),
	yaml = require('../persistence/yaml'),
	jenkins = require('../persistence/jenkins'),
	sys = require('util'),
	execFile = require('child_process').execFile,
	releaseService = require('../services/releaseService');

router.get('/', function(req, res) {
	if(!req.query.projectName) {
		return res.status(400).send('Bad request, must send project name');	
	}
	releaseService.getReleases(req.query.projectName).then((releaseList) => {
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
router.put('/:id/deploy', function(req, res) {
	if(!req.query.env) {
		// shouldn't ever happen since the UI would follow this step.  
		return res.status(400).send('Bad request! env query parameter is required');	
	}

	releaseService.getReleasesById(req.params.id).then((release) => {
		let project = config.projects.find((prj) => {
			return prj.name === release.projectName;
		});

		if(!project) {
			return res.status(500).send('Something terribly wrong has happened');
		}
		jenkins.executeJob('dev-deploy').then((result) => {
			console.log('RESULT SUCCESSFUL', result);
			res.sendStatus(202);
		}).catch((err) => {
			console.log('MAJOR ERROR', err);
			res.sendStatus(500);
		});
	});
});


module.exports = router;
