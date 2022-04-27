import Urbit from "@urbit/http-api";
import React, {Component} from 'react';

class App extends Component { 
  state = {
    entries: [], // list of journal entries for display
    drafts: {}, // edits which haven't been submitted yet
    newDraft: {}, // new entry which hasn't been submitted yet
    results: [], // search results
    searchStart: null, // search query start date
    searchEnd: null, // search query end date
    resultStart: null, // search results start date
    resultEnd: null, // search results end date
    searchTime: null, // time of last search
    latestUpdate: null, // most recent update we've received
    entryToDelete: null, // deletion target for confirmation modal
    status: null, // connection status (con, try, err)
    errorCount: 0, // number of errors so far
    errors: new Map(), // list of error messages for display
  };

  componentDidMount() {
    window.urbit = new Urbit("");
    window.urbit.ship = window.ship;
    window.urbit.onOpen = () => this.setState({status: "con"});
    window.urbit.onRetry = () => this.setState({status: "try"});
    window.urbit.onError = (err) => this.setState({status: "err"});
    this.init();
  };

  init = () => {
    this.getEntries().then(
      (result) => {
        this.handleUpdate(result);
        this.setState({ latestUpdate: result.time });
        this.subscribe();
      },
      (err) => {
        this.setErrorMsg("Connection failed");
        this.setState({ status: "err" });
      }
    );
  };

  getEntries = async () => {
    const { entries: e } = this.state;
    const before = e.length === 0 ? Date.now() : e[e.length - 1].id;
    const max = 10;
    const path = `/entries/before/${before}/${max}`;
    return window.urbit.scry({
      app: "journal",
      path: path,
    });
  };

  setErrorMsg = (msg) => {
    const {errors, errorCount} = this.state;
    const id = errorCount + 1;
    this.setState({
      errors: errors.set(id, msg),
      errorCount: id
    })
  };

  render(){
    return (
      <React.Fragment>
        <div>
          Hello, Urbit.
        </div>
      </React.Fragment>
    )
  }
};

export default App;
