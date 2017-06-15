var express = require('express');
var app = express();
var request = require('request');

var key = 'GmMIRVKYQBvJUm5FQLohqZZHT';
var secret = 'TdKnuAnHnZwkAMcaa5so6o8oXYB0p8eEJmi6qmAr1czyjRKHiO';

app.use((req, res, next) => {
    console.log(new Date().getTime(), req.url);

    next();
});

app.get('/search-twitter', (req, res) => {
    var search = req.query.q;
    
    search = encodeURIComponent(search).replace(/[!'()*]/g, function(text) {
            return "%" + text.charCodeAt(0).toString(16);
    });

    var bearer = key + ":" + secret;
    var encodedBearer = new Buffer(bearer).toString('base64');

    request.post({
        url: 'https://api.twitter.com/oauth2/token',
        form: {
            grant_type: 'client_credentials'
        },
        headers: {
            Authorization: 'Basic ' + encodedBearer
        }
    }, (authErr, authResponse, authBody) => {
        var authJSON = JSON.parse(authBody);
        var access_token = authJSON.access_token;

        request.get({
            url: 'https://api.twitter.com/1.1/search/tweets.json?q=' + search + "&count=100",
            headers: {
                Authorization: 'Bearer ' + access_token
            },
            json: true
        }, (searchErr, searchResponse, searchBody) => {
            res.json(searchBody);
        });
    });
});

app.use(express.static('.'));

app.listen(process.env.PORT || 3000, () => {
    console.log('App listening on port 3000')
});