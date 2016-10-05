import React from 'react';
import ReactDOM from 'react-dom';
import api from './api';

api.getEnvironments().then((data) => {
	console.log(data);
});


ReactDOM.render(<div> hello asdf</div>, document.getElementById('entry'));