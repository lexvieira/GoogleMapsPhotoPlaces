import express, { Request, Response } from 'express';
import { geturl, GoogleMapsPhoto, GoogleMapsPlaceID } from "../services/urlServices";
import * as bodyParser from 'body-parser';
import axios from 'axios';

const unshorterurl = express.Router();

// unshorterurl.use(bodyParser.json());
// unshorterurl.use(bodyParser.urlencoded({ extended: false }));

unshorterurl.use(express.json());

unshorterurl.post('/get-url-picture', async (req: Request, res: Response) => {

    try {
        const { urllink } = req.body;
        console.log(req.body.urllink)
        console.log("Getting Body: " + urllink);
        console.log("Getting Body: " + req.body);
        // let urllink = "https://maps.app.goo.gl/wxkcrGqNXfpFwvk79"
        let url = urllink;

        console.log(urllink);
        try {
            url = await geturl(urllink)
        } catch (error) {
            url = "Error Retrieving URL";
        }

        // console.log(url);
        const responseData = {
            "message": "Return URL:",
            "url": url
        };
        res.status(200).json(responseData)
        // res.json(responseData);
    } catch (error) {
        console.log(error);
        throw error;
    }

});

unshorterurl.get('/get-photo/:id', async (req: Request, res: Response) => {

    var id = req.params.id;
    console.log(id);

    let placeID = await GoogleMapsPlaceID(id)

    let photoURL = await GoogleMapsPhoto(placeID)
    const responseData = {
        "message": "Return URL:",
        "placeid": placeID,
        "photoURL": photoURL
    };
    res.status(200).json(responseData)

});



export default unshorterurl;