import React from 'react';
import { browserHistory, Router, Route } from 'react-router';
import App from './pages/App';
import { Login } from './pages/Login'
import Chat from './pages/Chat'
import ForOFour from './pages/FourOFour';

const Routes = props => {
	return (
		<Router history={browserHistory}>
			<Route path="/" component={App} name="App" >
				<Route path="/login" component={Login} name="Login" />
				<Route path="/chat" component={Chat} name="Chat" />
				<Route path="*" component={ForOFour} name="404: No Match for route" />
			</Route>
		</Router>
	);
};

export default Routes;
