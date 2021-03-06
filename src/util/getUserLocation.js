const getCurrentPosition = (options={}) => {
    return new Promise((resolve, reject)=>{
        navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
};

const getUserLocation = async () => {
    const options = {maximumAge:60000, timeout:60000};
    try {
        if(!navigator.geolocation){
            throw new Error('Browser doesn\'t support Geolocation.');
        }
        let position = await getCurrentPosition(options);
        return {lat: position.coords.latitude, lng: position.coords.longitude};
    } catch (e) {
        /** 
         * three error case:
         * 1. Browser doesn't support Geolocation
         * 2. User denied Geolocation
         * 3. Timeout expired
         */
        // console.warn('getUserPosition', error);
        throw new Error(e.message);
    }
};

export default getUserLocation;