import React, {Component} from 'react';
import getUserLocation from './util/getUserLocation';
import getNearbySearchResults from './util/getNearbySearchResults';
import getRandomNumber from './util/getRandomNumber';
import Place from './components/Place/Place';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDice, faBars} from '@fortawesome/free-solid-svg-icons';
import { Menu, Sidebar, Dropdown, Rating } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import './App.css';
const google = window.google;

// const mockLocation = {
//   lat: 25.0823774,
//   lng: 121.57112389999999
// };

// const mockResult = {"geometry":{"location":{"lat":25.082989,"lng":121.56790490000003},"viewport":{"south":25.08163871970849,"west":121.56660381970846,"north":25.0843366802915,"east":121.56930178029143}},"icon":"https://maps.gstatic.com/mapfiles/place_api/icons/restaurant-71.png","id":"20bf179531a75b13e3267e653f2eb1e4e62e152e","name":"福岡屋拉麵","opening_hours":{"open_now":false},"photos":[{"height":3096,"html_attributions":["<a href=\"https://maps.google.com/maps/contrib/103555148828225958348/photos\">芋台場</a>"],"width":5504}],"place_id":"ChIJgQyg3G6sQjQRiqa5iwMtKLM","plus_code":{"compound_code":"3HM9+55 Taipei, Taiwan","global_code":"7QQ33HM9+55"},"price_level":1,"rating":4,"reference":"ChIJgQyg3G6sQjQRiqa5iwMtKLM","scope":"GOOGLE","types":["restaurant","food","point_of_interest","establishment"],"user_ratings_total":612,"vicinity":"No. 6號, Lane 323, Section 1, Neihu Road, Neihu District","html_attributions":[]};
const defaultSearchRadius = 500;
class App extends Component {
  constructor(){
    super();
    this.infowindow = null;
    this.map = null;
    this.circle = null;
  }
  state = {
    // userLocation: mockLocation,
    // result: mockResult,
    userLocation: null,
    result: null,
    sideBarVisible: false,
    type: 'restaurant',
    rating: 0,
  }

  updateResult = async () => {
    let map = this.map;
    let result = null;
    this.setState({
      result
    });
    let radius = this.circle.getRadius() || defaultSearchRadius;
    radius = radius<=50000? radius:50000;
    let location = this.state.userLocation;
    if(this.circle.getCenter()) {
      location = {
        lat: this.circle.getCenter().lat(),
        lng: this.circle.getCenter().lng()
      }
    }
    try {
      // get nearbysearch results
      let candidates = [];
      candidates = await getNearbySearchResults({
        map,
        location, 
        radius,
        type: [this.state.type]
      });

      // filter
      if(this.state.rating>0){
        let rating = this.state.rating;
        candidates = candidates.filter(candidate=>{
          return candidate.rating>=rating;
        });
      }
      
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
    }
    let infowindow = new google.maps.InfoWindow({
      content: `
      <div>${result.name}</div>
      <div>${result.rating}</div>
      <div>${result.vicinity}</div>
      <div>${result.opening_hours? result.opening_hours.open_now?'Open':'Closed':''}</div>
      <a href="${link}" target="_blank" rel="noopener noreferrer">View on Google Maps</a>
      `,
      position: result.geometry.location
    });
    infowindow.open(map, resultMarker);
    this.infowindow = infowindow;
    resultMarker.addListener('click', ()=>{
      if(infowindow.getMap()!=null){
        infowindow.close();
      } else {
        infowindow.open(map, resultMarker);
        infowindow.setZIndex(999);
      }
    });
  }
  
  async componentDidMount(){
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
      zoom: 15
    });
    this.map = map;
    // zone circle
    this.circle = new google.maps.Circle({
      strokeColor: '#03fcca',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#03fcca',
      fillOpacity: 0.35,
      map: map,
      center: userLocation,
      radius: defaultSearchRadius,
      clickable: true,
      draggable: true,
      editable: true,
      zIndex: 0
    });

    // user location marker
    new google.maps.Marker({
      position: userLocation, 
      map: map,
      icon: './street-view-solid.svg'
    });

    await this.updateResult();
  }

  setSideBarVisible = (visible) => {
    this.setState({
      sideBarVisible: visible
    });
  }

  render(){
    let options = [
      {
        key: 0,
        text: 'Restaurant',
        value: 'restaurant',
      },
      {
        key: 1,
        text: 'Cafe',
        value: 'cafe',
      },
    ];
    let handleTypeSelection = (e, data) => {
      this.setState({
        type: data.value
      });
    }
    // let handleRadiusChange = (e, o) => {
    //   console.log(e, o);
    //   this.setState({
    //     searchRadius: o.value
    //   });
    // }
    let handleRate = (e, {rating, maxRating}) => {
      this.setState({
        rating
      });
    }
    
    return (
      <div className="App">
          <Sidebar
            className="sidebar-menu"
            as={Menu}
            animation='overlay'
            onHide={() => this.setSideBarVisible(false)}
            vertical
            visible={this.state.sideBarVisible}
            width='thin'
          >
            <FontAwesomeIcon 
            className="icon bars" 
            icon={faBars} 
            onClick={()=>this.setSideBarVisible(false)}/>
            
            <Menu.Item>
              <div className="text">Type</div>
              <Dropdown 
                fluid 
                selection 
                options = {options}
                value = {this.state.type}
                onChange = {handleTypeSelection}></Dropdown>
            </Menu.Item>
            <Menu.Item>
              {/* <Icon name='gamepad' /> */}
              <div className="text">Rating</div>
              <Rating 
                className="star-rating"
                icon='star' 
                defaultRating={0} 
                maxRating={5} 
                clearable
                size="large"
                onRate={handleRate} />
            </Menu.Item>
            {/* <Menu.Item>
              Radius: {this.state.searchRadius} meters
              <Input
                type='range'
                min={1000}
                max={50000}
                value={this.state.searchRadius}
                onChange={handleRadiusChange}
              />
            </Menu.Item> */}
          </Sidebar>
          <header>
            <div onClick={()=>this.setSideBarVisible(true)}>
              <FontAwesomeIcon className="icon bars" icon={faBars} />
            </div>
            <div className="title">randomeat</div>
            <div onClick={async _ => await this.updateResult()}>
              <FontAwesomeIcon className="icon dice" icon={faDice} />
            </div>
          </header>
          <main>
            <Place 
              result={this.state.result}
              type={this.state.userLocation?this.state.type:'location'}/>
            <div id="map"></div>
          </main>
      </div>
    );
  }
}

export default App;
