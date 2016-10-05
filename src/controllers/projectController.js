'use strict';

let express = require('express'),
	router = express.Router(),
	config = require('config'),
	pipelineConfig = require('../assets/pipelineConfig'),
	jenkins = require('../assets/jenkins'),
	sys = require('util'),
	execFile = require('child_process').execFile;

router.get('/', function(req, res) {
	let projectList = [];
	config.projects.forEach((project) => {
		projectList.push(pipelineConfig(project));
		console.log(jenkins.getJobs(project.jenkins));
	});

	res.status(200).send(projectList);
});

// build project with these params
router.post('/:id', function(req, res) {
	// patch, minor, major version changes
	if(req.query.version !== 'p' && req.query.version !== 'm' && req.query.version !== 'M') {
		return res.status(400).send('Bad request, version change must be patch \'p\', minor \'m\', or Major \'M\'  ');	
	}

	let product = config.projects.find((project) => {
		return project.name === req.params.id;
	});

	let startDirectory = process.cwd();
	process.chdir(product.bitesizeFiles);
	const child = execFile('../hed-console/createbuild.sh', [`-${req.query.version}`], (err, stdout, stderr) => {
		if (err) {
			console.log(err);
			return res.sendStatus(400);
		}

		res.sendStatus(200);
	});
	// go back to the original directory or we are screwed!
	process.chdir(startDirectory);

});

module.exports = router;
