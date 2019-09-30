const google = window.google;
const getNearbySearchResults = ({map, location, radius=1000, type=['restaurant']}) => {
    return new Promise((resolve, reject) => {
      let service = new google.maps.places.PlacesService(map);
      let request = {
        location,
        radius, //The maximum allowed radius is 50000 meters.
        type,
        language: 'zh-TW'
      };
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
    });
}

export default getNearbySearchResults;