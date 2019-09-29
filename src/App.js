import React, {Component} from 'react';
import './App.css';
import getUserPosition from './util/getUserPosition';
import getNearbySearchResults from './util/getNearbySearchResults';
const randomNumber = (range) => {
  return Math.floor((Math.random() * range));
}
class App extends Component {
  state = {
    userLocation: null,
    result: null
    // userLocation: {
    //   latitude: 25.0823774,
    //   longitude: 121.57112389999999
    // },
    // result: {"geometry":{"location":{"lat":25.082989,"lng":121.56790490000003},"viewport":{"south":25.08163871970849,"west":121.56660381970846,"north":25.0843366802915,"east":121.56930178029143}},"icon":"https://maps.gstatic.com/mapfiles/place_api/icons/restaurant-71.png","id":"20bf179531a75b13e3267e653f2eb1e4e62e152e","name":"福岡屋拉麵","opening_hours":{"open_now":false},"photos":[{"height":3096,"html_attributions":["<a href=\"https://maps.google.com/maps/contrib/103555148828225958348/photos\">芋台場</a>"],"width":5504}],"place_id":"ChIJgQyg3G6sQjQRiqa5iwMtKLM","plus_code":{"compound_code":"3HM9+55 Taipei, Taiwan","global_code":"7QQ33HM9+55"},"price_level":1,"rating":4,"reference":"ChIJgQyg3G6sQjQRiqa5iwMtKLM","scope":"GOOGLE","types":["restaurant","food","point_of_interest","establishment"],"user_ratings_total":612,"vicinity":"No. 6號, Lane 323, Section 1, Neihu Road, Neihu District","html_attributions":[]}
  }
  
  async componentDidMount(){
    // get user's location
    let userPosition = await getUserPosition();
    this.setState({
      userLocation: userPosition.coords
    });
    console.log('this.state.userLocation', this.state.userLocation);
    // let userPosition = this.state.userLocation;

    // get nearbysearch results
    let candidates = await getNearbySearchResults(this.state.userLocation);
    console.log('candidates: ', candidates);

    // get a random result
    let result = candidates[randomNumber(candidates.length)];
    this.setState({
      result
    });
    console.log('result', this.state.result);
  }
  render(){
    return (
      <div className="App">
        {this.state.userLocation?
            this.state.result?
              JSON.stringify(this.state.result):
              'Finding restaurant...':
            'Finding location...'}
      </div>
    );
  }
}

export default App;
