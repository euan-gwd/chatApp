import React from 'react';
import ReactDOM from 'react-dom';
import * as firebase from "firebase";
import defaultUserPic from '../Default_User_Pic.svg';
import "./layout.css";
import './icon-colors.css';

class AddReply extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			replied: this.props.initialState,
			reply_bodyText: '',
			reply_date: new Date().toISOString(),
			reply_file: '',
			reply_imagePreviewUrl: '',
			reply_imageUrl: ''
		};
	} //end constructor

	componentDidMount() {
		this.replyTimerID = setInterval(() => this.tick(), 1000);
	} //end componentDidMount

	componentWillUnmount() {
		clearInterval(this.replyTimerID);
	} //end componentWillUnmount

	tick() {
		this.setState({reply_date: new Date().toISOString()});
	} //end tick

	handleSubmit(evt) {
		evt.preventDefault();
		let currentScribeKey = this.props.currentScribe.key;
		let currentScribeUserName = this.props.currentScribe.userName;
		let file = this.state.reply_file;
		let userId = firebase.auth().currentUser.uid;
		let scribeText = this.state.reply_bodyText;
		let datetime = this.state.reply_date;
		let userName = firebase.auth().currentUser.displayName;
		let userEmail = firebase.auth().currentUser.email;
		let userPhoto = firebase.auth().currentUser.photoURL;
		let chars_left = 160 - this.state.reply_bodyText.length;

		if (file !== '' && chars_left >= 0) {
			let storageRef = firebase.storage().ref('/users/' + userId + '/' + currentScribeKey + '/' + file.name);
			let uploadTask = storageRef.put(file);
			uploadTask.on('state_changed', (snapshot) => {}, (error) => {
				// Handle unsuccessful uploads
			}, () => {
				// Handle successful uploads on complete
				let newScribeReplyKey = firebase.database().ref('mainTL/' + currentScribeKey + '/scribeReplies/').push().key;
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
				let userTLData = {
					scribe: scribeText,
					scribeImage: downloadURL,
					datetime: datetime,
					replyTo: currentScribeUserName,
					userId: userId,
					userName: userName,
					userEmail: userEmail,
					userPhoto: userPhoto,
					starCount: 0
				}
				updates['/mainTL/' + currentScribeKey + '/scribeReplies/' + newScribeReplyKey] = scribeData;
				updates['/userTL/' + userId + '/' + newScribeReplyKey] = userTLData;
				firebase.database().ref().update(updates);
			});
		} else {
			if (chars_left >= 0) {
				let newScribeReplyKey = firebase.database().ref('mainTL/' + currentScribeKey + '/scribeReplies/').push().key;
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
				let userTLData = {
					scribe: scribeText,
					datetime: datetime,
					replyTo: currentScribeUserName,
					userId: userId,
					userName: userName,
					userEmail: userEmail,
					userPhoto: userPhoto,
					starCount: 0
				}
				updates['/mainTL/' + currentScribeKey + '/scribeReplies/' + newScribeReplyKey] = scribeData;
				updates['/userTL/' + userId + '/' + newScribeReplyKey] = userTLData;
				firebase.database().ref().update(updates);
			}
		}
		ReactDOM.findDOMNode(this.refs.replyScribe).value = '';
		const newState = !this.state.replied;
		this.props.callbackParent(newState);
	} //end handleSubmit

	handleInput = (evt) => {
		this.setState({reply_bodyText: evt.target.value});
	} //end handleInput

	handleReplyImgUpload = (evt) => {
		evt.preventDefault();
		let reader = new FileReader();
		let reply_file = evt.target.files[0];
		reader.onloadend = () => {
			this.setState({reply_file: reply_file, reply_imagePreviewUrl: reader.result});
		}
		reader.readAsDataURL(reply_file)
	} //end handleReplyImgUpload

	removeReplyImgUpload = (evt) => {
		evt.preventDefault();
		ReactDOM.findDOMNode(this.refs.reply_fileUpload).value = '';
		this.setState({reply_file: '', reply_imagePreviewUrl: ''});
	} // end removeReplyImgUpload

	handleReplyCancel = (evt) => {
		const newState = !this.state.replied;
		this.setState({replied: newState});
		this.props.callbackParent(newState);
	} // end  handleReplyCancel

	render() {
		let $replyImagePreview = null;
		let reply_imagePreviewUrl = this.state.reply_imagePreviewUrl;
		if (reply_imagePreviewUrl) {
			$replyImagePreview = (
				<div className="imagePreview-Wrapper">
					<img src={reply_imagePreviewUrl} className="image is-128x128 image-rounded" alt={this.state.reply_file.name}/>
					<a className="remove topright" onClick={this.removeReplyImgUpload}>
						<span className="icon is-small">
							<i className="fa fa-times" aria-hidden="true"></i>
						</span>
					</a>
				</div>
			);
		} else {
			$replyImagePreview = null;
		} //end imagePreview
		return (
			<form onSubmit={this.handleSubmit.bind(this)}>
				<article className="media nested-flat-box">
					<div className="media-left">
						{(firebase.auth().currentUser.photoURL === null)
							? <figure className="image is-48x48">
									<img src={defaultUserPic} alt="defaultProfilePic" className="image-rounded"/>
								</figure>
							: <figure className="image is-48x48">
								<img src={firebase.auth().currentUser.photoURL} alt="profilePic" className="image-rounded"/>
							</figure>}
					</div>
					<div className="media-content">
						<div>
							<div className="control">
								{$replyImagePreview}
								<textarea ref='replyScribe' defaultValue={this.state.reply_bodyText} placeholder="What's your reply?" className='textarea' onChange={this.handleInput.bind(this)} required/>
							</div>
						</div>
						<div className="pt">
							<div className="columns is-mobile is-gapless">
								<div className="column is-narrow">
									<div className="control">
										<input type="file" accept="image/*" name="reply_fileUploader" ref="reply_fileUpload" id="reply_fileUpload" className="input-file" onChange={this.handleReplyImgUpload}/>
										<label htmlFor="reply_fileUpload" className="button is-primary is-outlined" type="button" data-balloon="upload photo" data-balloon-pos="up">
											<i className="fa fa-camera" aria-hidden="true"/>
										</label>
									</div>
								</div>
								<div className="column has-text-right char-count">
									<div className="pr">{160 - this.state.reply_bodyText.length}</div>
								</div>
								<div className="column is-narrow">
									<button className="button is-primary is-outlined" type="submit" disabled={this.state.reply_bodyText.length === 0}>
										<span className="icon is-small is-hidden-mobile">
											<i className="fa fa-pencil-square-o fa-fw" aria-hidden="true"/>
										</span>
										<span>Reply</span>
									</button>
								</div>
							</div>
						</div>
					</div>
					<div className="media-right">
						<a onClick={this.handleReplyCancel.bind(this)} data-balloon="cancel" data-balloon-pos="up">
							<span className="remove icon is-small">
								<i className="fa fa-times" aria-hidden="true"></i>
							</span>
						</a>
					</div>
				</article>
			</form>
		);
	} //end render
}

export default AddReply;
