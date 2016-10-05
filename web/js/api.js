import fetchWrap from './fetchwrapper';

export default {
	getEnvironments: function() {
		return fetchWrap(`/environment`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			}
		});
	}
}