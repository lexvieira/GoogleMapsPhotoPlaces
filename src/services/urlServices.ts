import * as bodyParser from 'body-parser';
import axios from 'axios';

export async function geturl(link: string) {

    var url = "1";
    try {
        await axios({
            method: "get",
            url: link,
            maxRedirects: 0
        }).then(res => {
            // url = "2";
            // console.log(url);
            url = res.data.args;
            // console.log(url);
        });

    } catch (error: any) {
        if (Math.trunc(error.response.status / 100) === 3) {

            url = error.response.headers.location;// 
            // return url; //geturl(error.response.headers.location);
        } else {
            url = "It wasn't possible to Unshort the URL";
        }
    }
    console.log(url);
    return url;
}

export const GoogleMapsPhoto = async (placeID: any) => {
    try {
        const GOOGLEAPIKEY = process.env.MAPS_API_KEY
        // let fetchURLPlace = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${placeName}&inputtype=textquery&key=${GOOGLEAPIKEY}`  
        // console.log(fetchURLPlace)
        // console.log(fetchURLPlace)

          try {
            let fetchURLPlace = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeID}&fields=photos&key=${GOOGLEAPIKEY}`  

            const response = await axios.get(fetchURLPlace);
            
            if (response.data.status === 'OK' && response.data.result.photos && response.data.result.photos.length > 0) {
              const photoReference = response.data.result.photos[0].photo_reference;
              const photoURL = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${GOOGLEAPIKEY}`;
              console.log('Photo URL:', photoURL);
              return photoURL;
            } else {
              console.log('No photos found for this place.');
              return null;
            }
          } catch (error) {
            console.error('Error:', error);
            return null;
          }          
    } catch (error) {
        console.error(`Error fetching image for ${placeID}: ${error}`);
    }
}

export const GoogleMapsPlaceID = async (placeName: any) => {
    try {
        const GOOGLEAPIKEY = process.env.MAPS_API_KEY
        // let fetchURLPlace = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${placeName}&inputtype=textquery&key=${GOOGLEAPIKEY}`  
        // console.log(fetchURLPlace)
        let fetchURLPlace = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${placeName}&key=${GOOGLEAPIKEY}`  
        // console.log(fetchURLPlace)
        try {
            const response = await axios.get(fetchURLPlace);
            if (response.data.status === 'OK' && response.data.predictions.length > 0) {
              const placeID = response.data.predictions[0].place_id;
              console.log('Place ID:', placeID);
              return placeID;
            } else {
              console.log('No results found.');
              return "Not Found";
            }
          } catch (error) {
            console.error('Error:', error);
            return "Error Searching";
          }
    } catch (error) {
        console.error(`Error fetching image for ${placeName}: ${error}`);
    }
}

