'use strict';

let request = require('request');
const logger = require('../utility/logger');
const Boom = require('boom');

const requestET = (options, callback)=>{ // Request with basic error trapping built in
  logger.info('Outbound started: ', options);
  if(options.host){
	options.headers = options.headers || {};
	options.headers.host = options.host;
  }
  if(options.auth){
	switch(options.auth.type){
	  case('userpass'):
		options.auth = options.auth.userpass;
		break;
	  default:
		options.auth = options.auth[options.auth.type];
	}
  }
  options.url = ((url)=>{
	let parts = url.split('?');
	const prefix = parts.shift();
	let prefixParts = prefix.split('://');
	const protocol = prefixParts.shift();
	prefixParts = prefixParts.map((s)=>s.replace(/\/\//g, '\/'));
	prefixParts.unshift(protocol);
	parts.unshift(prefixParts.join('://'));
	return parts.join('?');
  })(options.url);
  request(options, (error, resp, payload)=>{
	logger.info('Outbound completed: ', options, error || payload);
	if(error){
	  let err = Boom.badRequest(error);
	  err.output.statusCode = 500;
	  return callback(error);
	}
	if(!payload){
	  return callback(null, payload);
	}
	if(options.returnRaw){
	  return callback(null, payload);
	}
	try{
	  const info = JSON.parse(payload);
	  if(info && info.error){
		const err = Boom.badRequest(info.error);
		err.output.statusCode = 500;
		return callback(err);
	  }
	  return callback(null, info);
	}catch(e){
	  if(payload.indexOf('HTTP ERROR ')>-1){
		const reCode = /HTTP ERROR ([0-9]+)/;
		const reReason = /Reason:\n<pre>(.*?)<\/pre>/;
		const code = reCode.exec(payload)[1];
		const reason = reReason.exec(payload)[1].trim();
		let err = Boom.badRequest(reason);
		err.output.statusCode = +code;
		return callback(err);
	  }
	  const err = Boom.badRequest(payload);
	  return callback(err);
	}
  });
};

const statusFromColor = (color)=>{
	switch(color){
		case('red'):
		return 'error';
		case('blue'):
		return 'ok';
		default:
		return color;
	}
};

module.exports = {
	getJobs: function(jenkins) {
		const url = `http://${jenkins.url}/api/json/`;
		return new Promise(function(resolve, reject) {
			requestET({
				url,
				auth: jenkins.auth,
				method: 'GET'
			}, (error, payload)=>{
				if(error){
					return reject(error);
				 }
				if(payload.error){
					let err = Boom.badRequest(payload.error);
					err.output.statusCode = 500;
					return reject(error);
				}
				resolve(payload.jobs.map((job)=>{
					return Object.assign(job, {status: statusFromColor(job.color)});
				}));
			});
		});
	}
};
