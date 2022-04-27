import Urbit from "@urbit/http-api";
import React, {Component} from 'react';

class App extends Component { 
  state = {
    status: null,
  };

  componentDidMount() {
    window.urbit = new Urbit("");
    window.urbit.ship = window.ship;
    window.urbit.onOpen = () => this.setState({status: "con"});
    window.urbit.onRetry = () => this.setState({status: "try"});
    window.urbit.onError = (err) => this.setState({status: "err"});
    this.init();
  };

  render(){
    return (
      <React.Fragment>
        <div>
          hello
        </div>
      </React.Fragment>
    )
  }
};

export default App;
