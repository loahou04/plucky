'use strict';

let express = require('express'),
	router = express.Router(),
	config = require('config'),
	pipelineConfig = require('../assets/pipelineConfig'),
	jenkins = require('../assets/jenkins'),
	shell = require('../utility/shellHelper');

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
	console.log(req.query);
	if(req.query.version !== 'p' && req.query.version !== 'm' && req.query.version !== 'M') {
		return res.status(400).send('Bad request, version change must be patch \'p\', minor \'m\', or Major \'M\'  ');	
	}

	// execute multiple commands in series
	shell.series([
	    'cd ../hed-console'
	    `./createbuild.sh -${req.query.version}`
	], function(err, stdout, stderr){
		if(err) {
			console.log(err);
			return res.sendStatus(400);
		}
		console.log('executed many commands in a row'); 
	});
});

module.exports = router;
