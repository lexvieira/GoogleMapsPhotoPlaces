import axios from 'axios';
import { response } from 'express';
import * as fs from 'fs';
import * as https from 'https';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config()

const GOOGLEAPIKEY = process.env.MAPS_API_KEY
const debugSteps = (process.env.DEBUG_STEPS === 'true');

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
    // console.log(error.response.headers.location);
    // throw error;
    if (Math.trunc(error.response.status / 100) === 3) {

      url = error.response.headers.location;// 
      // return url; //geturl(error.response.headers.location);
    } else {
      // console.log(error);
      throw error;
      // url = "It wasn't possible to Unshort the URL";
    }
  }
  // console.log(url);
  return url;
}

export const GetGoogleMapsPhotoURLByLocalData = async (localData: any) => {
  if (localData.status === 'OK' && localData.result.photos && localData.result.photos.length > 0) {
    const photoReference = localData.result.photos[0].photo_reference;
    if (debugSteps) {
      console.log(`Checking Photo References: ${photoReference}`);
    }
    const photoURL = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=500&photoreference=${photoReference}&key=${GOOGLEAPIKEY}`;
    // console.log('Photo URL:', photoURL);
    return photoURL;
  } else {
    console.log('No photos found for this place.');
    return null;
  }
}

export const GetGoogleMapsPhotoURL = async (placeID: any) => {
  try {
    // const GOOGLEAPIKEY = process.env.MAPS_API_KEY
    // let fetchURLPlace = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${placeName}&inputtype=textquery&key=${GOOGLEAPIKEY}`  
    // console.log(fetchURLPlace)
    try {
      let fetchURLPlace = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeID}&fields=photos&key=${GOOGLEAPIKEY}`

      const response = await axios.get(fetchURLPlace);

      if (response.data.status === 'OK' && response.data.result.photos && response.data.result.photos.length > 0) {
        const photoReference = response.data.result.photos[0].photo_reference;

        const photoURL = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=500&photoreference=${photoReference}&key=${GOOGLEAPIKEY}`;
        // console.log('Photo URL:', photoURL);
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

export const GetGoogleMapsPlaceDetails = async (placeID: any) => {
  try {
    let fetchURLPlace = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeID}&fields=photos&key=${GOOGLEAPIKEY}`
    // console.log(fetchURLPlace)
    // return;
    // const response:any = await axios.get(fetchURLPlace);

    const response = await axios.get(fetchURLPlace);

    if (response.data.status === 'OK') {
      // console.log(response);
      let placeDetails;
      placeDetails = response.data;

      // const photoURL = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=500&photoreference=${photoReference}&key=${GOOGLEAPIKEY}`;
      // console.log('Photo URL:', photoURL);
      return placeDetails;
    } else {
      console.log('No Details found for this place.');
      return null;
    }
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

export const GetGoogleMapsPlaceIDByText = async (placeName: any) => {
  let fetchURLPlace = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${placeName}&inputtype=textquery&key=${GOOGLEAPIKEY}`
  try {
    const response = await axios.get(fetchURLPlace);
    if (response.data.status === 'OK' && response.data.candidates.length > 0) {
      const placeID = response.data.candidates[0].place_id;
      if (debugSteps) {
        console.log('Place ID (Find Place From Text):', placeID);
      }
      return placeID;
    } else {
      // console.log('No results found.');
      return null;
    }
  } catch (error) {
    if (debugSteps) {
      console.log(`Place ID Not Found for Place Name: ${placeName}: ${error}`);
    }
    // console.error('Error:', error);
    return null;
  }
}

export const GetGoogleMapsPlaceIDByAutoComplete = async (placeName: any) => {
  let fetchURLPlace = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${placeName}&key=${GOOGLEAPIKEY}`
  try {
    const response = await axios.get(fetchURLPlace);
    if (response.data.status === 'OK' && response.data.predictions.length > 0) {
      const placeID = response.data.predictions[0].place_id;
      if (debugSteps) {
        console.log('Place ID (AutoComplete):', placeID);
      }
      return placeID;
    } else {
      // console.log('No results found.');
      return null;
    }
  } catch (error) {
    // console.error('Error:', error);
    console.error(`Place ID Not Found for Place Name: ${placeName}: ${error}`);
    return null;
  }
}

export const GetPlaceNameByURL = (placeURL: string) => {
  let placeName = ""
  try {
    placeName = placeURL.split("place/")[1].split("/")[0];
  } catch (error) {
    placeName = ""
  }
  return placeName;
}

export const RenderImageGoogleMaps = (placeID: string, idURL: number, urlImage: string) => {
  let imageName: string = "img_" + idURL + "_" + placeID + ".jpg"
  // const file = fs.createWriteStream(imageName);

  let destinationPath: string = path.join(process.cwd(), '/src/images/', imageName);

  // Save Image on Disk
  // https.get(urlImage, response => {
  //   response.pipe(file);
  //   file.on('finish', () => {
  //     file.close();
  //     console.log(`Image downloaded as ${imageName}`);
  //   });

  //   // Creating symlink to file 
  //   fs.symlinkSync(path.join(process.cwd(), '/src/images/', imageName) , "symlinkToFile");
  //   // fs.symlinkSync(__dirname + "\\" + "images\\" + imageName, "symlinkToFile");

  //   console.log("\nImage was Created"); 

  //   }).on('error', err => {
  //       fs.unlink(imageName, (err => {
  //         if (err) console.log(err); 
  //         else { 
  //           console.log("\nDeleted symlinkToFile"); 

  //           // Get the files in current directory 
  //           // after deletion 
  //           getFilesInDirectory(); 
  //         } 
  //       }));
  //   })

  saveFileFromURL(urlImage, destinationPath)
    .then(() => {
      console.log('Image downloaded and saved successfully.');
      // Further processing or database storage can be done here
    })
    .catch((err) => {
      console.error('Failed to download and save the image:', err);
    });

}


// Function to download and save an image
const saveFileFromURL = async (fileURL: string, destinationPath: string) => {
  try {
    const response = await axios({
      url: fileURL,
      method: 'GET',
      responseType: 'stream',
    });

    // Create a writable stream and pipe the image data to the file
    const writer = fs.createWriteStream(destinationPath);
    response.data.pipe(writer);

    // Return a promise to handle the completion or errors
    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  } catch (error) {
    console.error('Error downloading image:', error);
    throw new Error('Error downloading image');
  }
};

export const saveFileFromJSON = async (file: [], destinationPath: string) => {
  try {

    const jsonData = JSON.stringify(file, null, 2);

    fs.writeFile(destinationPath, jsonData, (err) => {
      if (err) {
        console.error('Error writing JSON file:', err);
      } else {
        console.log('JSON file has been saved successfully.');
      }
    });

  } catch (error) {
    console.error('Error Saving File:', error);
    // throw new Error('Error Saving File');
  }
};

// Function to get current filenames 
// in directory with specific extension 
const getFilesInDirectory = () => {
  console.log("\nFiles present in directory:");
  let files = fs.readdirSync(__dirname);
  files.forEach(file => {
    console.log(file);
  });
}

export const RemoveKeyURL = (url: string) => {
  return url.split("&key")[0]
}

export const DateDiffInDays = (dateStart: string, dateEnd: string) => {
  if (!dateStart || !dateEnd) {
    return false;
  }

  const date1: Date = new Date(dateStart);
  const date2: Date = new Date(dateEnd);

  if (isNaN(date1.getTime()) || isNaN(date2.getTime())) {
    return false;
  }

  const differenceInMs = Math.abs(date2.getTime() - date1.getTime());
  const differenceInDays = Math.ceil(differenceInMs / (1000 * 60 * 60 * 24));

  return differenceInDays;
}
