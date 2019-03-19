const request = require('request')
require('dotenv').config();

const config = {
  channelAccessToken: process.env.channelAccessToken,
};

module.exports = {
    Text: function(reply_token, msg) {
        let headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer {' + config.channelAccessToken + '}'
        }
        let body = JSON.stringify({
            replyToken: reply_token,
            messages: [{
                type: 'text',
                text: msg
            }]
        })
        request.post({
            url: 'https://api.line.me/v2/bot/message/reply',
            headers: headers,
            body: body
        }, (err, res, body) => {
            console.log('status = ' + res.statusCode);
        });
    },

    Location: function(reply_token, title, info, latitude, longitude) {
        let headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer {' + config.channelAccessToken + '}'
        }
        let body = JSON.stringify({
            replyToken: reply_token,
            messages: [{
                type: 'location',
                title: title,
                address: info,
                latitude: latitude,
                longitude: longitude
            }]
        })
        request.post({
            url: 'https://api.line.me/v2/bot/message/reply',
            headers: headers,
            body: body
        }, (err, res, body) => {
            console.log('status = ' + res.statusCode);
        });
    },
    
    Sticker: function(reply_token, packageId, stickerId) {
        let headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer {' + config.channelAccessToken + '}'
        }
        let body = JSON.stringify({
            replyToken: reply_token,
            messages: [{
                type: 'sticker',
                packageId: packageId,
                stickerId: stickerId
            }]
        })
        request.post({
            url: 'https://api.line.me/v2/bot/message/reply',
            headers: headers,
            body: body
        }, (err, res, body) => {
            console.log('status = ' + res.statusCode);
        });
    },
    
    Image: function(reply_token, image_url) {
        let headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer {' + config.channelAccessToken + '}'
        }
        let body = JSON.stringify({
            replyToken: reply_token,
            messages: [{
                type: 'image',
                originalContentUrl: image_url,
                previewImageUrl: image_url
            }]
        })
        request.post({
            url: 'https://api.line.me/v2/bot/message/reply',
            headers: headers,
            body: body
        }, (err, res, body) => {
            console.log('status = ' + res.statusCode);
        });
    },
    
    Flex: function(reply_token, title, info, latitude, longitude) {
        let headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer {' + config.channelAccessToken + '}'
        }
        let body = JSON.stringify({
            replyToken: reply_token,
            messages: [{
                
              }]
        })
        request.post({
            url: 'https://api.line.me/v2/bot/message/reply',
            headers: headers,
            body: body
        }, (err, res, body) => {
            console.log('status = ' + res.statusCode);
        });
    },
};
