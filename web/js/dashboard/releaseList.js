import React from 'react';
import releaseApi from '../api/releaseApi';
import { Step, Stepper, StepButton } from 'material-ui/Stepper';

class ReleaseList extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			releaseList: []
		};
	}

	componentWillMount() {
		releaseApi.getRelease(this.props.project).then((releaseList) => {
			this.setState({
				releaseList
			});
		}).catch((error) => {
			console.error(error);
		});
	}

	deploy(id, env) {
		console.log(`deploy ${env}`);

	}

	createReleaseList() {
		let releaseList = [];
		this.state.releaseList.forEach((release) => {
			// const releaseEnv = [];

			// if(release.projectBuilt) {
			// 	release.environmentOrder.forEach((env) => {
			// 		releaseEnv.push(
			// 			<Step key={`${release._id}-${env}`}>
			// 			</Step>
			// 		);
			// 	});
			// }
			releaseList.push(
				<div key={release._id}>
					<span>Version: {release.version}</span>
					<span>Built: {release.projectBuilt} </span>
					<Stepper linear={false}>
						<Step>
							<StepButton onClick={() => { this.deploy(release._id, 'dev'); }} completed>dev</StepButton>
						</Step>
						<Step>
							<StepButton onClick={() => { this.deploy(release._id, 'qa'); }}>qa</StepButton>
						</Step>
						<Step>
							<StepButton onClick={() => { this.deploy(release._id, 'stg'); }}>stg</StepButton>
						</Step>
						<Step>
							<StepButton onClick={() => { this.deploy(release._id, 'prd'); }}>prd</StepButton>
						</Step>
					</Stepper>
				</div>
			);
		});

		return releaseList;
	}

	render() {
		const releaseList = this.createReleaseList();
		// completed=release.releaseEnv.find(env);
		return (
			<div>
				{releaseList}
			</div>
		);
	}
}

export default ReleaseList;