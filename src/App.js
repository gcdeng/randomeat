import React, {Component} from 'react';
import './App.css';
import getUserPosition from './util/getUserPosition';

class App extends Component {
  async componentDidMount(){
    let pos = await getUserPosition();
    console.log(pos);
    
  }
  render(){
    return (
      <div className="App">
        
      </div>
    );
  }
}

export default App;
