import React from 'react';
import ReactDOM from 'react-dom';
import * as firebase from "firebase";
import defaultUserPic from '../Default_User_Pic.svg';
import "./layout.css";
import './icon-colors.css';

class AddScribe extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			bodyText: '',
			date: new Date().toISOString(),
			file: '',
			imagePreviewUrl: '',
			imageUrl: '',
			uploadBar: 'invisible'
		};
	} //end constructor

	componentDidMount() {
		this.timerID = setInterval(() => this.tick(), 1000);
	} //end componentDidMount

	componentWillUnmount() {
		clearInterval(this.timerID);
	} //end componentWillUnmount

	tick() {
		this.setState({date: new Date().toISOString()});
	} //end tick

	handleSubmit(evt) {
		evt.preventDefault();
		let file = this.state.file;
		let userId = firebase.auth().currentUser.uid;
		let scribeText = this.state.bodyText;
		let datetime = this.state.date;
		let userName = firebase.auth().currentUser.displayName;
		let userEmail = firebase.auth().currentUser.email;
		let userPhoto = firebase.auth().currentUser.photoURL;
		let chars_left = 160 - this.state.bodyText.length;

		if (file !== '' && chars_left >= 0) {
			let storageRef = firebase.storage().ref('/users/' + userId + '/' + file.name);
			let uploadTask = storageRef.put(file);
			uploadTask.on('state_changed', (snapshot) => {
				let progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
				(progress < 100)
					? this.setState({uploadBar: 'visible'})
					: this.setState({uploadBar: 'invisible'});
			}, (error) => {
				// Handle unsuccessful uploads
			}, () => {
				// Handle successful uploads on complete
				let newScribeKey = firebase.database().ref('mainTL/').push().key;
				let downloadURL = uploadTask.snapshot.downloadURL;
				let updates = {};
				let scribeData = {
					scribe: scribeText,
					scribeImage: downloadURL,
					datetime: datetime,
					userId: userId,
					userName: userName,
					userEmail: userEmail,
					userPhoto: userPhoto,
					starCount: 0
				}
				updates['/mainTL/' + newScribeKey] = scribeData;
				updates['/userTL/' + userId + '/' + newScribeKey] = scribeData;
				firebase.database().ref().update(updates);
				this.setState({uploadBar: 'invisible'});
			});
		} else {
			if (chars_left >= 0) {
				let newScribeKey = firebase.database().ref('mainTL/').push().key;
				let updates = {};
				let scribeData = {
					scribe: scribeText,
					datetime: datetime,
					userId: userId,
					userName: userName,
					userEmail: userEmail,
					userPhoto: userPhoto,
					starCount: 0
				}
				updates['/mainTL/' + newScribeKey] = scribeData;
				updates['/userTL/' + userId + '/' + newScribeKey] = scribeData;
				firebase.database().ref().update(updates);
			}
		}
		ReactDOM.findDOMNode(this.refs.scribe).value = '';
		this.setState({file: '', imagePreviewUrl: '', bodyText: ''});
	} //end handleSubmit

	handleInput = (evt) => {
		this.setState({bodyText: evt.target.value});
	} //end handleInput

	handleImgUpload = (evt) => {
		evt.preventDefault();
		let reader = new FileReader();
		let file = evt.target.files[0];
		reader.onloadend = () => {
			this.setState({file: file, imagePreviewUrl: reader.result});
		}
		reader.readAsDataURL(file)
	} //end handleImgUpload

	removeImgUpload = (evt) => {
		evt.preventDefault();
		ReactDOM.findDOMNode(this.refs.fileUpload).value = '';
		this.setState({file: '', imagePreviewUrl: ''});
	} //end removeImgUpload

	render() {
		let $imagePreview = null;
		let imagePreviewUrl = this.state.imagePreviewUrl;
		if (imagePreviewUrl) {
			$imagePreview = (
				<div className="imagePreview-Wrapper">
					<img src={imagePreviewUrl} className="image is-128x128 image-rounded" alt={this.state.file.name}/>
					<a className="remove topright" onClick={this.removeImgUpload}>
						<span className="icon">
							<i className="fa fa-times" aria-hidden="true"></i>
						</span>
					</a>
				</div>
			);
		} else {
			$imagePreview = null;
		} //end imagePreview
		return (
			<form onSubmit={this.handleSubmit.bind(this)} className='form-card'>
				<article className="media">
					<div className="media-left">
						{(this.props.userPhoto === null)
							? <figure className="image is-48x48">
									<img src={defaultUserPic} alt="defaultProfilePic" className="image-rounded"/>
								</figure>
							: <figure className="image is-48x48">
								<img src={this.props.userPhoto} alt="profilePic" className="image-rounded"/>
							</figure>}
					</div>
					<div className="media-content">
						<div>
							<div className="control">
								{$imagePreview}
								<textarea ref='scribe' defaultValue={this.state.bodyText} placeholder="What's happening?" className='textarea' onChange={this.handleInput.bind(this)} required/>
								<span className={`upload-bar ${this.state.uploadBar}`}>Sending Scribe now...</span>
							</div>
						</div>
						<div className="pt">
							<div className="columns is-mobile is-gapless">
								<div className="column is-narrow">
									<div className="control">
										<input type="file" accept="image/*" name="fileUploader" ref="fileUpload" id="fileUpload" className="input-file" onChange={this.handleImgUpload}/>
										<label htmlFor="fileUpload" className="button is-primary is-outlined" type="button" data-balloon="upload photo" data-balloon-pos="up">
											<i className="fa fa-camera" aria-hidden="true"/>
										</label>
									</div>
								</div>
								<div className="column has-text-right char-count">
									<div className="pr">{160 - this.state.bodyText.length}</div>
								</div>
								<div className="column is-narrow">
									<button className="button is-primary is-outlined" type="submit" disabled={this.state.bodyText.length === 0}>
										<span className="icon is-hidden-mobile">
											<i className="fa fa-pencil-square-o fa-fw" aria-hidden="true"/>
										</span>
										<span>Scribe</span>
									</button>
								</div>
							</div>
						</div>
					</div>
				</article>
			</form>
		);
	} //end render
}

export default AddScribe;
