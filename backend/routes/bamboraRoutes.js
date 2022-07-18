import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
const URL = "https://api.na.bambora.com/v1/profiles";
const index = express.Router();
var jsonParser = bodyParser.json();
index.post("/", jsonParser, async (req, res) => {
  //receive data from front end
  // send recived data to bambora

  const dataliser = async () => {
    const recBody = req.body;
    console.log(recBody);
    try {
      await axios({
        method: "post",
        url: URL,
        headers: {
          Authorization:
            "Passcode MzAwMjEyOTAwOkZGMTM1NTBCRDY2NzQxRTA4QzI2ODE1N0Y0RDExN0Iz",
          "Content-Type": "application/json",
        },
        data: recBody,
      }).then((resp) => {
        console.log(resp.data);
        res.send(resp.data);
      });
    } catch (error) {
      console.log(error);
    }
  };

  dataliser();
});

export default index;
