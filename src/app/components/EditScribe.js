import React from 'react';
import ReactDOM from 'react-dom';
import base from '../rebase.config';
import "./scribes.css";

const max_chars = 160;

class EditScribe extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      charsLeft: max_chars - this.props.charCount,
      currentChars: this.props.charCount,
      scribeText: this.props.currentScribe.scribe,
      date: new Date().toLocaleString()
    };
  }

  componentDidMount() {
    this.timerID = setInterval(() => this.tick(), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  tick() {
    this.setState({date: new Date().toLocaleString()});
  }

  handleSubmit(e) {
    e.preventDefault();
    let scribeText = this.state.scribeText;
    let datetime = this.state.date;
    let userName = this.props.currentScribe.userName;
    let userEmail = this.props.currentScribe.userEmail;
    let userPhoto = this.props.currentScribe.userPhoto;
				let charCount = this.state.charsUsed;
				let scribeKeyRef = this.props.currentScribe.key;
    if (this.state.charsLeft >= 0) {
      let updates = {};
      let scribeData = {
        scribe: scribeText,
        datetime: datetime,
        userName: userName,
        userEmail: userEmail,
        userPhoto: userPhoto,
								scribeCharCount: charCount
      }
      updates['/msgList/' + scribeKeyRef] = scribeData;
      base.database().ref().update(updates);
    }

    ReactDOM.findDOMNode(this.refs.scribe).value = '';
    this.setState({charsLeft: max_chars});
  }

  handleCharacterCount() {
    let input_chars = this.refs.scribe.value.length;
    let currentChars = this.state.currentChars;
    let chars_used = currentChars + input_chars;
    this.setState({
      charsLeft: max_chars - chars_used,
						charsUsed: chars_used
    });
  }

  handleInput(evt) {
    this.setState({scribeText: evt.target.value})
  }

  render() {
    return (
        <form onSubmit={this.handleSubmit.bind(this)}>
          <article className="media flat-box">
            <div className="media-left">
              {(this.props.currentScribe.userPhoto === null)
                ? <i className="fa fa-user-circle-o fa-2x" aria-hidden="true"></i>
                : <figure className="image is-48x48">
                  <img src={this.props.currentScribe.userPhoto} alt="profilePic" className="scribe-image-rounded"/>
                </figure>}
            </div>
            <div className="media-content">
              <div className="field">
                <p className="control">
                  <textarea ref='scribe' defaultValue={this.state.scribeText} className='textarea' onBlur={this.handleInput.bind(this)} onChange={this.handleCharacterCount.bind(this)} required/>
                  <span className="help is-primary has-text-centered" id="uploadBar" ref="uploadNotif">Updating scribe now...</span>
                </p>
              </div>
              <div className="pt">
                <div className="columns is-mobile is-gapless">
                  <div className="column has-text-right char-count">
                    <div className="pr">{this.state.charsLeft}</div>
                  </div>
                  <div className="column is-narrow">
                    <button className="button is-info" type="submit">
                      <span className="icon">
                        <i className="fa fa-pencil-square-o fa-fw" aria-hidden="true"/>
                      </span>
                      <span>Update</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </form>
    );
  }

}

export default EditScribe;
