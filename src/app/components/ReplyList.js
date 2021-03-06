import React from 'react';
import * as firebase from "firebase";
import Reply from './Reply';

class ReplyList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			replies: [],
			scribeKey: this.props.currentScribe.key
		};
	}; //end constructor

	componentDidMount() {
		const keyRef = this.state.scribeKey;
		firebase.database().ref('mainTL/' + keyRef + '/scribeReplies/').on('value', (res) => {
			const replyData = res.val();
			const replyDataArray = [];
			for (let objKey in replyData) {
				replyData[objKey].key = objKey;
				replyDataArray.push(replyData[objKey])
			}
			this.setState({replies: replyDataArray})
		});
	} // end componentDidMount

	deleteReply(itm, evt) {
		evt.stopPropagation();
		const keyRef = this.state.scribeKey;
		let userId = itm.userId;
		let mainTLRef = firebase.database().ref('mainTL/' + keyRef + '/scribeReplies/');
		let userTLRef = firebase.database().ref('userTL/' + userId + '/');

		if (itm.hasOwnProperty("replyImage")) {
			let deleteImgRef = firebase.storage().refFromURL(itm.replyImage);
			if (window.confirm("Do you really want to delete this?")) {
				mainTLRef.child(itm.key).remove(); //removes item from mainTL
				userTLRef.child(itm.key).remove(); //removes item from userTL
				deleteImgRef.delete(); //removes item from storageBucket
			}
		} else {
			if (window.confirm("Do you really want to delete this?")) {
				mainTLRef.child(itm.key).remove(); //removes item from mainTL
				userTLRef.child(itm.key).remove(); //removes item from userTL
			}
		}
	} // end deleteScribe

	toggleLikes(itm, evt) {
		evt.preventDefault();
		const keyRef = this.state.scribeKey;
		let mainTLReplyRef = firebase.database().ref('mainTL/' + keyRef + '/scribeReplies/' + itm.key + '/');
		let userTLReplyRef = firebase.database().ref('userTL/' + itm.userId + '/' + itm.key + '/');
		let uid = firebase.auth().currentUser.uid;

		// handles implementation of starCount for mainTL replies
		mainTLReplyRef.transaction(function (post) {
			if (post) {
				if (post.stars && post.stars[uid]) {
					post.starCount--;
					post.stars[uid] = null;
				} else {
					post.starCount++;
					if (!post.stars) {
						post.stars = {};
					}
					post.stars[uid] = true;
				}
			}
			return post;
		}); // end mainTL transaction

		// handles implementation of starCount for userTL replies
		userTLReplyRef.transaction(function (post) {
			if (post) {
				if (post.stars && post.stars[uid]) {
					post.starCount--;
					post.stars[uid] = null;
				} else {
					post.starCount++;
					if (!post.stars) {
						post.stars = {};
					}
					post.stars[uid] = true;
				}
			}
			return post;
		}); // end end userTL transaction
	} // end toggleLikes

	reportReply(itm, evt) {
		evt.preventDefault();
		const parentKeyRef = this.state.scribeKey;
		firebase.database().ref('mainTL/' + parentKeyRef + '/scribeReplies/' + itm.key).update({reported: true}); //sets reported as true and removes item from mainTL upon render
		firebase.database().ref('userTL/' + itm.userId + '/' + itm.key).update({reported: true}); //sets reported as true on userTL
	} // end reportScribe

	render() {
		const keyRef = this.state.scribeKey;
		let replies = this.state.replies.map((itm, index) => {
			return (<Reply stream={itm} parentId={keyRef} removeReply={this.deleteReply.bind(this, itm)} favReply={this.toggleLikes.bind(this, itm)} reportReply={this.reportReply.bind(this, itm)} key={itm.key}/>);
		})
		return (
			<div>
				{replies}
			</div>
		);
	} //end render
}

export default ReplyList;
