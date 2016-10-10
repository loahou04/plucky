import fetchWrap from './fetchwrapper';

export default {
	getRelease: function(projectName) {
		return fetchWrap(`/api/release/?projectName=${projectName}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		});
	}
}