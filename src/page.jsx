import React from 'react';

import SearchTweets from './search-tweets';

class Page extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            countTotal: 0,
            countPlace: 0,
            tweetIDs: [],
            hidden: false
        };
    }
    
    render() {
        return (
            <div>
                <div className={this.state.hidden ? "count-info" : "hidden"}>
                    We found <span className="count">{this.state.countTotal}</span> tweets with <span className="query-value">{this.state.query}</span> from all over the world, but only <span className="count">{this.state.countPlace}</span> shared locations
                    <span onClick={(e) => this.handleDiscard(e)} className="new-search">
                        <span>New Search</span>
                        <i className="glyphicon glyphicon-search search-icon"></i>
                    </span>
                </div>
                <SearchTweets 
                    searchTweets={(url, query) => this.searchTweets(url, query)} hidden={this.state.hidden} />
            </div>
        );
    }

    handleDiscard(e) {
        e.preventDefault();
        location.reload();
    }

    // love uw and i really love uw
    // query = uw

    // love + uw + and i really love + uw
    highlightQuery(query, text){
        var queryIndex = [];
        var i = -1;
        var modifiedText = "";
        var tempText = text.toLowerCase();
        var tempQuery = query.toLowerCase();
        
        while((i = tempText.indexOf(tempQuery, i + 1)) >= 0) {
            queryIndex.push(i);
        }
        
        if(queryIndex.length !== 0) {
            var initialIndex = 0;
            queryIndex.forEach((index) => {
                modifiedText += text.substring(initialIndex, index) + "<span class='query-value'>" + text.substring(index, index + query.length) + "</span>";
                initialIndex = query.length;
            });

            // Get rest of the text
            modifiedText += text.substring(queryIndex[queryIndex.length - 1] + query.length);

            return modifiedText;
        } else {
            return "This is a retweet. You can click the marker to view the retweet.";
        }
    }

    searchTweets(url, query) {

        // requestLoop means how many requests we want to send to twitter server
        // 100 tweet objects per request
        // Initialize it as 0
        var requestLoop = 0;

        // Initialize count again for each search
        this.setState({
            countTotal: 0,
            countPlace: 0,
            hidden: true,
            query: query
        });

        var savedMaxID = "initial";

        initMap();

        // Keep sending request to tweeter server, and adding more tweet objects to tweetList
        // Only tweet objects that have place object will be added
        this.recurFetch(url, query, savedMaxID, requestLoop);
    }

    recurFetch(url, query, savedMaxID, requestLoop) {
        if(requestLoop === 100) {
            // base case

            // Reset url
            url = "";
        } else {
            fetch(url)
            .then((response) => {
                return response.json();
            })
            .then((json) => {
                // Check if there is an error first
                // error undefined means no error
                if(json.errors === undefined) {
                    var newMaxID = json.search_metadata.max_id_str;

                    // Prevent duplicate searches
                    if(savedMaxID !== newMaxID) {
                                              
                        // Loop through json
                        json.statuses.map((item) => {

                            // For each item, regardless of place info, always increase countTotal
                            var countTotal = this.state.countTotal;
                            countTotal ++;

                            // Check each item place first, if not null, construct a tweet object
                            if(item.place != null) {
                                var countPlace = this.state.countPlace;
                                var tweetIDs = this.state.tweetIDs;
                                var knownTweet = tweetIDs.includes(item.id_str);
                                if(!knownTweet) {
                                    countPlace ++;
                                    tweetIDs.push(item.id_str);
                                    this.setState({
                                        countTotal: countTotal,
                                        countPlace: countPlace,
                                        tweetIDs: tweetIDs
                                    });

                                    // Populate map
                                    var latLng = new google.maps.LatLng(item.place.bounding_box.coordinates["0"]["0"]["1"], item.place.bounding_box.coordinates["0"]["0"]["0"]);
                                    var marker = new google.maps.Marker({
                                        animation: google.maps.Animation.DROP,
                                        position: latLng,
                                        map: map
                                    }); 

                                    var tweetDate = item.created_at;
                                    tweetDate = tweetDate.replace("+0000 ", "") + " UTC";

                                    var tweetText = item.text;

                                    // If user searches multiple queries, do not use highlightQuery
                                    if(query.indexOf(" ") === -1) {
                                        tweetText = this.highlightQuery(query, item.text);
                                    }
   
                                    var contentString = 
                                        '<div class="tweet-content">'+
                                            '<img src="' + item.user.profile_image_url + '"/>' + 
                                            '<h1>' + item.user.name + '<br/><small>' + '@' + item.user.screen_name + '</small>' + '</h1>' +              
                                            '<p class="text">' + tweetText + '</p>' +
                                            '<p class="date">' + '<i class="fa fa-calendar" aria-hidden="true"></i> ' + tweetDate + '</p>' +
                                            '<p class="location">' + '<i class="fa fa-map-marker" aria-hidden="true"></i> ' + item.place.full_name + " " + item.place.country +  '</p>'
                                        '</div>';

                                    var infowindow = new google.maps.InfoWindow({
                                        content: contentString
                                    });

                                    // When user clicks the marker, it redirects user to that twitter page
                                    marker.addListener('click', function() {
                                        window.open('https://twitter.com/' + item.user.screen_name + '?lang=en', '_blank');
                                    });

                                    marker.addListener('mouseout', function() {
                                        infowindow.close(map, marker);
                                    });

                                    marker.addListener('mouseover', function() {
                                        infowindow.open(map, marker);
                                    });
                                }

                            } else {
                                this.setState({
                                    countTotal: countTotal
                                });
                            }
                        });
                    }

                    // Get next request url
                    var nextResults = json.search_metadata.next_results;
                    
                    // Update url
                    if(nextResults !== undefined) {
                        url = "/search-twitter" + nextResults;
                    }

                    savedMaxID = json.search_metadata.max_id_str;

                    // Update requestLoop
                    requestLoop ++;

                    this.recurFetch(url, query, savedMaxID, requestLoop);
                } else {
                    window.alert(json.errors["0"].message);
                }
            })
            .catch((error) => {
                // Handle search error
                window.alert(error.message);
            });
        }
    }
}

export default Page;