const google = window.google;
const getNearbySearchResults = (location) => {
    return new Promise((resolve, reject)=>{
      let userLocation = new google.maps.LatLng(location.latitude, location.longitude);
      let map = new google.maps.Map(document.getElementById('map'), {center: userLocation, zoom: 15});
      let service = new google.maps.places.PlacesService(map);
      let request = {
        location: userLocation,
        radius: 1000, //The maximum allowed radius is 50000 meters.
        type: ['restaurant', "food", "cafe"],
        language: 'zh-TW'
      }
      let allResults = [];
      service.nearbySearch(request, (results, status, pagination)=>{
        if (status !== 'OK') reject(allResults);
        allResults = [
          ...allResults,
          ...results
        ];
        if(pagination.hasNextPage) {
            pagination.nextPage();
        } else {
          resolve(allResults);
        }
      });
    })
}

export default getNearbySearchResults;