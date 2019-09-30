import React, {Component} from 'react';
import getUserLocation from './util/getUserLocation';
import getNearbySearchResults from './util/getNearbySearchResults';
import getRandomNumber from './util/getRandomNumber';
import Place from './components/Place/Place';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDice, faBars} from '@fortawesome/free-solid-svg-icons';
import { Header, Icon, Image, Menu, Segment, Sidebar } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import './App.css';
const google = window.google;

const mockLocation = {
  lat: 25.0823774,
  lng: 121.57112389999999
};

const mockResult = {"geometry":{"location":{"lat":25.082989,"lng":121.56790490000003},"viewport":{"south":25.08163871970849,"west":121.56660381970846,"north":25.0843366802915,"east":121.56930178029143}},"icon":"https://maps.gstatic.com/mapfiles/place_api/icons/restaurant-71.png","id":"20bf179531a75b13e3267e653f2eb1e4e62e152e","name":"福岡屋拉麵","opening_hours":{"open_now":false},"photos":[{"height":3096,"html_attributions":["<a href=\"https://maps.google.com/maps/contrib/103555148828225958348/photos\">芋台場</a>"],"width":5504}],"place_id":"ChIJgQyg3G6sQjQRiqa5iwMtKLM","plus_code":{"compound_code":"3HM9+55 Taipei, Taiwan","global_code":"7QQ33HM9+55"},"price_level":1,"rating":4,"reference":"ChIJgQyg3G6sQjQRiqa5iwMtKLM","scope":"GOOGLE","types":["restaurant","food","point_of_interest","establishment"],"user_ratings_total":612,"vicinity":"No. 6號, Lane 323, Section 1, Neihu Road, Neihu District","html_attributions":[]};

class App extends Component {
  constructor(){
    super();
    this.infowindow = null;
    this.map = null;
  }
  state = {
    userLocation: null,
    result: null,
    searchRadius: 1000,
    sideBarVisible: false,
    // userLocation: mockLocation,
    // result: mockResult
  }

  updateResult = async () => {
    let map = this.map;
    let result = null;
    this.setState({
      result
    });

    try {
      // get nearbysearch results
      let candidates = await getNearbySearchResults({
        map,
        location: this.state.userLocation, 
        radius: this.state.searchRadius,
        type: ['restaurant']
      });
      console.log('candidates: ', candidates);

      if (candidates.length===0) {
        throw new Error('result not found');
      }

      // get a random result
      result = candidates[getRandomNumber(candidates.length)];
      while(result.permanently_closed) {
        result = candidates[getRandomNumber(candidates.length)];
      }
      
      // set state
      this.setState({
        result: {
          name: result.name,
          place_id: result.place_id,
          rating: result.rating || '',
          user_ratings_total: result.user_ratings_total || '',
          vicinity: result.vicinity || '',
          photos: result.photos || [],
          opening_hours: result.opening_hours || {},
          geometry: result.geometry || {}
        }
      });
      console.log('this.state.result', this.state.result);
    } catch (error) {
      console.error(error);
      this.setState({
        result: 'not found'
      });
      return;
    }

    // set result's marker
    let resultMarker = new google.maps.Marker({
      position: result.geometry.location, 
      map: map
    });
    // set infowindow
    let link = `https://www.google.com/maps/search/?api=1&query=${result.name}&query_place_id=${result.place_id}`;
    if(this.infowindow){
      this.infowindow.close();
      this.infowindow = null;
    }
    this.infowindow = new google.maps.InfoWindow({
      content: `
      <div>${result.name}</div>
      <div>${result.rating}</div>
      <div>${result.vicinity}</div>
      <div>${result.opening_hours? result.opening_hours.open_now?'Open':'Closed':''}</div>
      <a href="${link}" target="_blank" rel="noopener noreferrer">View on Google Maps</a>
      `,
      position: result.geometry.location
    });
    this.infowindow.open(map, resultMarker);
    resultMarker.addListener('click', ()=>{
      this.infowindow.open(map, resultMarker);
    });
  }
  
  async componentDidMount(){
    let searchRadius = this.state.searchRadius;
    try {
      // get user's location
      this.setState({
        userLocation: await getUserLocation()
      });
      console.log('this.state.userLocation', this.state.userLocation);
    } catch (error) {
      console.error(error);
      this.setState({
        userLocation: 'not found'
      });
      return;
    }

    let userLocation = this.state.userLocation;

    let map = new google.maps.Map(document.getElementById('map'), {
      center: userLocation, 
      zoom: 14
    });
    this.map = map;
    // zone circle
    new google.maps.Circle({
      strokeColor: '#03fcca',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#03fcca',
      fillOpacity: 0.35,
      map: map,
      center: userLocation,
      radius: searchRadius,
      clickable: true,
      draggable: true,
      editable: true,
      zIndex: 0
    });

    // user location marker
    new google.maps.Marker({
      position: userLocation, 
      map: map,
      icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
    });

    await this.updateResult();
  }

  toggleSideBar = () => {
    this.setState((state)=>({
      sideBarVisible: !state.sideBarVisible
    }));
  }

  render(){
    return (
      <div className="App">
          <Sidebar
            as={Menu}
            animation='overlay'
            icon='labeled'
            inverted
            onHide={() => this.toggleSideBar()}
            vertical
            visible={this.state.sideBarVisible}
            width='thin'
          >
            <Menu.Item as='a'>
              <Icon name='home' />
              Home
            </Menu.Item>
            <Menu.Item as='a'>
              <Icon name='gamepad' />
              Games
            </Menu.Item>
            <Menu.Item as='a'>
              <Icon name='camera' />
              Channels
            </Menu.Item>
          </Sidebar>
          <header>
            <div onClick={this.toggleSideBar}>
              <FontAwesomeIcon className="icon bars" icon={faBars} />
            </div>
            <div className="title">randomlife</div>
            <div onClick={async _ => await this.updateResult()}>
              <FontAwesomeIcon className="icon dice" icon={faDice} />
            </div>
          </header>
          {this.state.userLocation?
              this.state.result?
                <Place data={this.state.result}/>:
                'Finding restaurant...':
              'Finding location...'}
          <div id="map"></div>
      </div>
    );
  }
}

export default App;
