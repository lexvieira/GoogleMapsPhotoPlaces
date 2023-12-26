import express, { Request, Response } from 'express';
import { geturl, GetGoogleMapsPhotoURL, GetGoogleMapsPlaceIDByAutoComplete, GetGoogleMapsPlaceIDByText, GetPlaceNameByURL, RenderImageGoogleMaps, saveFileFromJSON, RemoveKeyURL, DateDiffInDays, GetGoogleMapsPlaceDetails, GetGoogleMapsPhotoURLByLocalData } from "../services/urlServices";
import * as bodyParser from 'body-parser';
import axios from 'axios';
import path from 'path';
import { Console } from 'console';
import dotenv from 'dotenv';

dotenv.config()

const unshorterurl = express.Router();
const REMOVE_API_KEYS_FROM_LINKS = (process.env.REMOVE_API_KEYS_FROM_LINKS === 'true');
const debugSteps = (process.env.DEBUG_STEPS === 'true');
unshorterurl.use(express.json());

unshorterurl.post('/unshort-url', async (req: Request, res: Response) => {
    const errorresponseData = {
        "message": "It wasn't possible to Unshort the URL",
        "errorMessage": "Request failed with status code 404"
    };
    try {
        const { urllink } = req.body;
        let url = urllink;

        url = await geturl(urllink)

        const responseData = {
            "message": "Return URL:",
            "url": url
        };
        res.status(200).json(responseData)
    } catch (error) {
        res.status(500).json(errorresponseData)
    }
});

unshorterurl.post('/unshort-url-array', async (req: Request, res: Response) => {
    const errorresponseData = {
        "message": "It wasn't possible to Unshort the URL",
        "errorMessage": "Request failed with status code 404"
    };

    try {
        const { urllink } = req.body;
        let urls: [] = urllink;
        let linksArray: ({})[] = [];
        await Promise.all(urls.map(async (url, index) => {
            let urlUnshortObj = {
                id: index,
                status: true,
                urlUnshorted: "",
                placeName: "",
                placeID: "",
                urlImage: "",
                urlImageMaps: "",
                storageDate: "",
                expireDate: "",
            };

            // Request Unshort URL
            // console.log(urlUnshortObj);
            try {
                let urlUnshort = await geturl(url);
                urlUnshortObj.urlUnshorted = urlUnshort;
                // Get the Local Name
                urlUnshortObj.placeName = GetPlaceNameByURL(urlUnshort);

                // Get Place ID
                if (urlUnshortObj.placeName != "") {
                    let placeID: any = await GetGoogleMapsPlaceIDByAutoComplete(urlUnshortObj.placeName)

                    if (placeID === null) {
                        placeID = await GetGoogleMapsPlaceIDByText(urlUnshortObj.placeName)
                    }

                    urlUnshortObj.placeID = placeID
                    // Return URL Image
                    let urlImage: any = await GetGoogleMapsPhotoURL(placeID)
                    urlUnshortObj.urlImage = REMOVE_API_KEYS_FROM_LINKS ? RemoveKeyURL(urlImage) : urlImage
                    // // Store the Link from lh3.googleusercontent.com/places 
                    let urlImageMaps: any = await geturl(urlImage);
                    urlUnshortObj.urlImageMaps = urlImageMaps
                    // Set Storage and Expire Dates
                    let storageDate: Date = new Date();
                    storageDate.setHours(0, 0, 0, 0);
                    let expireDate: Date = new Date(storageDate.setMonth(storageDate.getMonth() + 1));

                    urlUnshortObj.storageDate = storageDate.toString();
                    urlUnshortObj.expireDate = expireDate.toString();

                    // Save Image - Not Necessary
                    // RenderImageGoogleMaps(placeID, index, urlImage)
                }
            } catch (error) {
                urlUnshortObj.urlUnshorted = "";
                urlUnshortObj.status = false;
                // console.log(error);
            }

            // console.log(urlUnshortObj);
            linksArray.push(urlUnshortObj);
            // console.log(linksArray);
        }));

        const responseData = {
            "message": "Return URL:",
            "urls": linksArray
        };

        res.status(200).json(responseData)
    } catch (error) {
        res.status(500).json(errorresponseData)
    }
});

unshorterurl.post('/get-maps-url-array-photo', async (req: Request, res: Response) => {
    const errorresponseData = {
        "message": "It wasn't possible to Unshort the URL",
        "errorMessage": "Request failed with status code 404"
    };

    let date: Date = new Date()
    let year: number = date.getFullYear();
    let month: number = date.getMonth();
    let day: number = date.getDay();

    let destinationPath: string = path.join(process.cwd(), '/src/data/', `data_${year}${month}${day}.json`);

    try {
        const { dataCountries, saveImages } = req.body;
        let urls: [] = dataCountries;
        let linksArray: any[] = [];

        // console.log(urls);
        await Promise.all(
            urls.map(async (countries: any, index) => {
            console.log(`Country: ${countries.country}`);
            let dataCountry: any[] = countries.data;
            // console.log(`Data Country: ${dataCountry}`);
            await Promise.all(dataCountry.map(async (regions, index) => {
                console.log(regions.region);
                let dataRegion: any[] = regions.data;
                await Promise.all(dataRegion.map(async (places, index) => {
                    let urlUnshortObj = {
                        id: index,
                        status: true,
                        urlUnshorted: "",
                        placeDetails: {},
                        placeName: "",
                        placeID: "",
                        urlImage: "",
                        urlImageMaps: "",
                        storageDate: "",
                        expireDate: "",
                    };

                    // Request Unshort URL
                    const currentDate: Date = new Date();
                    const expireDate: Date = new Date(places.fulllink.expireDate);

                    try {
                        if (places.fulllink.placeName === "" || (!places.fulllink.expireDate || !expireDate || (currentDate > expireDate))) {
                            if (debugSteps) {
                                console.log("Checking Data")
                            }
                            let urlUnshort = await geturl(places.link)
                            urlUnshortObj.urlUnshorted = urlUnshort
                            if (debugSteps) {
                                console.log(`Full URL: ${urlUnshort}`);
                            }
                            // Get the Local Name
                            let placeName: string = GetPlaceNameByURL(urlUnshort)
                            urlUnshortObj.placeName = placeName;

                            if (debugSteps) {
                                console.log(`Place Name: ${urlUnshortObj.placeName}`);
                            }
                            // Get Place ID
                            if (urlUnshortObj.placeName != "") {
                                // Get Place ID from Google Maps API
                                let placeID: any = await GetGoogleMapsPlaceIDByAutoComplete(urlUnshortObj.placeName)
                                if (debugSteps) {
                                    console.log(`First Try: ${placeID}`)
                                }
                                if (placeID === null) {
                                    placeID = await GetGoogleMapsPlaceIDByText(urlUnshortObj.placeName)
                                }
                                if (debugSteps) {
                                    console.log(`Second Try: ${placeID}`)
                                }
                                urlUnshortObj.placeID = placeID

                                if (debugSteps) {
                                    console.log(`Place ID: ${urlUnshortObj.placeID}`);
                                }
                                // Get Details Based on Google Maps PlaceID // Useful to Render a Gallery on the next Stages.
                                let placeDetails: any = await GetGoogleMapsPlaceDetails(placeID)

                                // saveFileFromJSON(placeDetails,destinationPath)

                                if (debugSteps) {
                                    // console.log(placeDetails);
                                }
                                urlUnshortObj.placeDetails = placeDetails
                                // Return URL Image
                                if (placeDetails.status === 'OK') {
                                    // && placeDetails && placeDetails.length > 0
                                    console.log(`Debug Steps: place Details: ${debugSteps}`)
                                    if (debugSteps) {
                                        console.log("Saving place Details");
                                    }
                                    let urlImage: any = await GetGoogleMapsPhotoURLByLocalData(placeDetails);
                                    // let urlImage: any = await GetGoogleMapsPhotoURL(placeID) //Request Just The URL Image
                                    urlUnshortObj.urlImage = REMOVE_API_KEYS_FROM_LINKS ? RemoveKeyURL(urlImage) : urlImage
                                    // Store the Link from lh3.googleusercontent.com/places 
                                    let urlImageMaps: any = await geturl(urlImage);
                                    urlUnshortObj.urlImageMaps = urlImageMaps

                                    places.image = urlImageMaps;
                                    // Set Storage and Expire Dates
                                    let storageDate: Date = new Date();
                                    storageDate.setHours(0, 0, 0, 0);
                                    let expireDate: Date = new Date(storageDate.setMonth(storageDate.getMonth() + 1));

                                    urlUnshortObj.storageDate = storageDate.toString();
                                    urlUnshortObj.expireDate = expireDate.toString();
                                }

                                // Save Image - Not Necessary
                                // RenderImageGoogleMaps(placeID, index, urlImage)
                            }
                        }

                    } catch (error) {
                        urlUnshortObj.urlUnshorted = ""
                        urlUnshortObj.status = false
                        if (debugSteps) {
                            console.log(`Error: ${error}`);
                        }
                    }
                    try {
                        if (debugSteps) {
                            console.log("Filling Fullink")
                        }
                        if (debugSteps) {
                            console.log(urlUnshortObj);
                        }
                        places.fulllink = { ...urlUnshortObj }
                    } catch (error) {
                        if (debugSteps) {
                            console.log("Fail Add Object")
                        }
                    }
                    if (debugSteps) {
                        console.log(`Places: `)
                        console.log(places)
                    }
                }));
            }));
        }));

        saveFileFromJSON(urls, destinationPath);

        const responseData = {
            "message": "Return URL:",
            "urls": urls
        };

        res.status(200).json(responseData)
    } catch (error) {
        res.status(500).json(errorresponseData)
    }
});

unshorterurl.get('/get-photo/:id', async (req: Request, res: Response) => {

    var id = req.params.id;
    console.log(id);

    let placeID = await GetGoogleMapsPlaceIDByAutoComplete(id)

    let photoURL = await GetGoogleMapsPhotoURL(placeID)
    const responseData = {
        "message": "Return URL:",
        "placeid": placeID,
        "photoURL": photoURL
    };
    res.status(200).json(responseData)

});



export default unshorterurl;