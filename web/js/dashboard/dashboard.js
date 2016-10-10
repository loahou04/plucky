import React from 'react';
import api from '../api';
import { Card, CardText, CardTitle } from 'material-ui/Card';
import Health from './health';

class Dashboard extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			projects: []
		}
	}

	componentWillMount() {
		api.getEnvironments().then((data) => {
			this.setState({
				projects: data
			});
		});
	}

	createProjectCards() {
		let projectList = [];
		this.state.projects.forEach((project) => {
			projectList.push(
				<div className="col-md-6" key={`${project.name}`}>
					<Card>
						<CardTitle title={project.name} />
						<CardText>
							<Health project={project.name} />
						</CardText>
					</Card>
				</div>
			);
		});

		return projectList;
	}

	render() {
		const projects = this.createProjectCards();
		return (
			<div className="row">
				{projects}
			</div>
		);
	}
}

export default Dashboard;