import React from 'react';
import './App.css';
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register';
import Particles from 'react-particles-js';

const initialState = {
	input: '',
	imageUrl: '',
	box: {},
	route: 'signin',
	isSignIn: false,
	user: {
		id: '',
		name: '',
		email: '',
		entries: 0,
		joined: ''
	}
}

class App extends React.Component {
	
	constructor() {
		super();
		this.state = initialState;
	}

	loadUser = (data) => {
		this.setState({user: {
			id: data.id,
			name: data.name,
			email: data.email,
			entries: data.entries,
			joined: data.joined
		}})
	}

	calculateFaceLocation = (data) => {
		const clarifyFace = data.outputs[0].data.regions[0].region_info.bounding_box;
		const image = document.getElementById('inputimage');
		const width = Number(image.width);
		const height = Number(image.height);
		return {
			leftcol: clarifyFace.left_col * width,
			toprow: clarifyFace.top_row * height,
			rightcol: width - (clarifyFace.right_col * width),
			bottomrow: height - (clarifyFace.bottom_row * height)
		}
	}

	dispalyFaceBox = (box) => {
		this.setState({box: box})
	}

	onInputChange = (event) => {
		this.setState({input: event.target.value});
	}

	onButtonSubmit = () => {
		this.setState({imageUrl: this.state.input})
		fetch('https://secure-everglades-85631.herokuapp.com/imageurl', {
			method: 'post',
			headers: {'content-type': 'application/json'},
			body: JSON.stringify({
				input: this.state.input
			})
		})
		.then(response => response.json())
		.then(response => {
			if (response) {
				fetch('https://secure-everglades-85631.herokuapp.com/image', {
				method: 'put',
				headers: {'content-type': 'application/json'},
					body: JSON.stringify({
						id: this.state.user.id
					})
				})
				.then(response => response.json())
				.then(count => {
					this.setState(Object.assign(this.state.user, { entries: count}))
				})
				.catch(console.log)
			}
			this.dispalyFaceBox(this.calculateFaceLocation(response))
		})
		.catch(err => console.log(err));
	}

	onRouteChange = (route) => {
		if (route === 'home') {
			this.setState({isSignIn: true})
		} else {
			this.setState(initialState)
		}
		this.setState({route: route})
	}

	render() {
		return (
		    <div className="App">
		    	<Particles className = 'particles'
		              params={{
		            		particles: {
		            			line_linked: {
		            				shadow: {
		            					enable: true,
		            					color: "#559aca",
		            					blur: 5,
		            					width: 5,
		            					opacity: 0.4
		            				}
		            			},
		            		}
		            	}}
		           />
		      <Navigation isSignIn = {this.state.isSignIn} onRouteChange = {this.onRouteChange}/>
		      { this.state.route === 'home' ?
		      	<div>
			      	<Logo />
				    <Rank name={this.state.user.name} entries={this.state.user.entries}/>
				    <ImageLinkForm onInputChange = {this.onInputChange} onButtonSubmit = {this.onButtonSubmit}/>
				    <FaceRecognition box = {this.state.box} imageUrl = {this.state.imageUrl}/>
			    </div>
			    : (
			    	this.state.route === 'signin' ?
			    		<Signin loadUser={this.loadUser} onRouteChange = {this.onRouteChange}/> 
		      			: 
		      			<Register loadUser = {this.loadUser} onRouteChange = {this.onRouteChange}/> 
			    )
		      	
			  }
		    </div>
	    );
	}
  
}

export default App;
