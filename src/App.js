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

  handleUpdate = (upd) => {
    const { entries, drafts, results, latestUpdate } = this.state;
    if (upd.time !== latestUpdate) {
      if ("entries" in upd) {
        this.setState({ entries: entries.concat(upd.entries) });
      } else if ("add" in upd) {
        const { time, add } = upd;
        const eInd = this.spot(add.id, entries);
        const rInd = this.spot(add.id, results);
        const toE =
          entries.length === 0 || add.id > entries[entries.length - 1].id;
        const toR = this.inSearch(add.id, time);
        toE && entries.splice(eInd, 0, add);
        toR && results.splice(rInd, 0, add);
        this.setState({
          ...(toE && { entries: entries }),
          ...(toR && { results: results }),
          latestUpdate: time,
        });
      } else if ("edit" in upd) {
        const { time, edit } = upd;
        const eInd = entries.findIndex((e) => e.id === edit.id);
        const rInd = results.findIndex((e) => e.id === edit.id);
        const toE = eInd !== -1;
        const toR = rInd !== -1 && this.inSearch(edit.id, time);
        if (toE) entries[eInd] = edit;
        if (toR) results[rInd] = edit;
        (toE || toR) && delete drafts[edit.id];
        this.setState({
          ...(toE && { entries: entries }),
          ...(toR && { results: results }),
          ...((toE || toR) && { drafts: drafts }),
          latestUpdate: time,
        });
      } else if ("del" in upd) {
        const { time, del } = upd;
        const eInd = entries.findIndex((e) => e.id === del.id);
        const rInd = results.findIndex((e) => e.id === del.id);
        const toE = eInd !== -1;
        const toR = this.inSearch(del.id, time) && rInd !== -1;
        toE && entries.splice(eInd, 1);
        toR && results.splice(rInd, 1);
        (toE || toR) && delete drafts[del.id];
        this.setState({
          ...(toE && { entries: entries }),
          ...(toR && { results: results }),
          ...((toE || toR) && { drafts: drafts }),
          latestUpdate: time,
        });
      }
    }
  };

  submitNew = (id, txt) => {
    window.urbit.poke({
      app: "journal",
      mark: "journal-action",
      json: { add: { id: id, txt: txt } },
      onSuccess: () => this.setState({ newDraft: {} }),
      onError: () => this.setErrorMsg("New entry rejected"),
    });
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
