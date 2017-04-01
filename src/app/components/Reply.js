import React from 'react';
import moment from 'moment';
import * as firebase from "firebase";
import EditReply from './EditReply';
import AddNestedReply from './AddNestedReply';
import './scribes.css';

class Reply extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      edited: false,
      replied: false
    }
  }

  handleEditBtnClick() {
    this.setState({ edited: true })
  }

  onReplyEdited(newState) {
    this.setState({ edited: newState })
  }

  handleReplyBtnClick() {
    this.setState({ replied: true })
  }

  onScribeReply(newState) {
    this.setState({ replied: newState })
  }

  render() {
    let currentUser = firebase.auth().currentUser.displayName;
    let showLikesTotal = (this.props.stream.likes > 0)
      ? <span className="icon liked">
        <i className="fa fa-star" aria-hidden="true">
          <span className="pl">{this.props.stream.likes}</span>
        </i>
      </span>
      : <span className="icon">
        <i className="fa fa-star" aria-hidden="true"></i>
      </span>;
    return (
      <article className="media">
        <div className="media-left">
          {this.props.stream.hasOwnProperty("userPhoto")
            ? <figure className="image is-48x48">
              <img src={this.props.stream.userPhoto} alt="profilePic" className="image-rounded" />
            </figure>
            : <i className="fa fa-user-circle-o fa-2x" aria-hidden="true"></i>}
        </div>
        <div className="media-content">
          <div className="content">
            {(currentUser === this.props.stream.userName)
              ? <a onClick={this.props.removeReply.bind(null)} className="remove is-pulled-right">
                <span className="icon">
                  <i className="fa fa-times" aria-hidden="true"></i>
                </span>
              </a>
              : null}
            <div>
              <span className="title is-5 pr">{this.props.stream.userName}</span>
              <span className="subtitle is-6">{this.props.stream.userEmail}</span>
            </div>
            <div>
              {this.props.stream.scribe}
              {this.props.stream.hasOwnProperty("scribeImage")
                ? <div className="media-content px">
                  <figure className="">
                    <img src={this.props.stream.scribeImage} alt="scribeImage" className="image-rounded image" />
                  </figure>
                </div>
                : null}
            </div>
            <div className="scribe-actions-leveled-nested">
              <a className="reply" onClick={this.handleReplyBtnClick.bind(this)}>
                <span className="icon">
                  <i className="fa fa-reply" aria-hidden="true"></i>
                </span>
              </a>
              <a className="star" onClick={this.props.favReply.bind(null)}>
                {showLikesTotal}
              </a>
              {(currentUser === this.props.stream.userName)
                ? <a className="edit" onClick={this.handleEditBtnClick.bind(this)}>
                  <span className="icon">
                    <i className="fa fa-pencil" aria-hidden="true"></i>
                  </span>
                </a>
                : null}
              <p className="has-text-right">{moment(this.props.stream.datetime).fromNow()}</p>
            </div>
          </div>
          {this.state.edited
            ? <EditReply currentReply={this.props.stream} parentId={this.props.parentId} initialState={this.state.edited} callbackParent={(newState) => this.onReplyEdited(newState)} />
            : null}
          {this.state.replied
            ? <AddNestedReply currentScribe={this.props.stream} parentId={this.props.parentId} initialState={this.state.replied} callbackParent={(newState) => this.onScribeReply(newState)} />
            : null}
        </div>
      </article>
    );
  }
}

export default Reply;
