const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')
const radians = require('degrees-radians');
const _ = require('lodash');
const Promise = require('promise');
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/";

// Reply functions [text, image, sticker, flex, ...]
const reply = require('./reply-functions');

const app = express()

app.use(morgan('combined'))
app.use(bodyParser.json())
app.use(cors())

// Line Config
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.listen(process.env.PORT || 8081)

app.get('/posts', (req, res) => {
  res.send('')
})

app.post('/webhook', (req, res) => {
  let reply_token = req.body.events[0].replyToken
  let msg = req.body.events[0].message
  let msg_type = msg.type
  
  
  if (msg_type == 'location') {
    var latUser = msg.latitude
    var lonUser = msg.longitude

    try {
      MongoClient.connect(url, (err, client) => {
        var db = client.db("iotdb");
        
        //Step 1: declare promise
        var getMongoPromise = () => {
          return new Promise((resolve, reject) => {
              db
                .collection('project')
                .aggregate([
                              { $group: 
                                { _id: "$node",
				                          dust: { $last: "$dust" },
                                  date_time: { $last: "$date" }, 
                                  lon: { $last:"$lon" }, 
                                  lat: { $last:"$lat" }
                                }
                              }, 
                              { $project: 
                                { "node": "$_id", "dust": "$dust", "date": "$date_time", "lon": "$lon", "lat": "$lat" }
                              }, 
                              { $sort: 
                                { "date_time": -1}
                              }
                            ])

                .toArray((err, data) => {
                  err 
                    ? reject(err) 
                    : resolve(data);
                  });
          });
        };

        //Step 2: async promise handler
        var callGetMongoPromise = async () => {  
          var result = await (getMongoPromise());
            return result;
        };
 
        //Step 3: make the call
        callGetMongoPromise().then((result) => {
          client.close();
          
          var near = []

          _.each(result, (value) => {
            near.push(calculateDistance(latUser, lonUser, value.lat, value.lon))
          })

          var distance = _.min(near)
          var indexNode = _.indexOf(near, distance);

          var dustNode = result[indexNode].dust

          var lonNode = result[indexNode].lon
          var latNode = result[indexNode].lat

      		var dustStatus = dustIndicator(dustNode)

          var title = 'Measured ' + distance + ' km away'
          var info = 'Dust: ' + dustNode + ' μg/m^3. \n' +
                     'Status: ' + dustStatus + '\n' +
                     'Status: ' + coStatus

          reply.Location(reply_token, title, info, latNode, lonNode)
		
        })
      }) //end mongo client
    } 
    catch (e) {
      next(e)
    }
  }
  else {
    reply.Text(reply_token, "We accept only your location.")
  }

  res.sendStatus(200)
})

function dustIndicator(value) {

  var dustStatus;

  if (value < 50) {
    dustStatus = 'Very Good \n Have a wonderful day :)'
  }
  else if (value > 50 && value < 80) {
    dustStatus = 'Good \n Wanna go out ? Do it.'
  }
  else if (value > 80 && value < 124) {
    dustStatus = 'Moderate \n Considure wearing a mask ?'
  }
  else if (value > 124 && value < 180) {
    dustStatus = 'Bad \n Please wear a mask before going outside.'
  }
  else if (value > 180 && value < 236) {
    dustStatus = 'Severe \n Please avoid going outside.'
  }
  else {
    dustStatus = 'Extreme Severe \n It is extremely not recommend going outside.'
  }

  return dustStatus
}

function calculateDistance(lat1, lon1, lat2, lon2) {

  var R = 6371; // to km
  var dLat = radians(lat2 - lat1);
  var dLon = radians(lon2 - lon1);
  var lat1 = radians(lat1);
  var lat2 = radians(lat2);

  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c;

  return d.toFixed(2); // Kilometer.00
}
















