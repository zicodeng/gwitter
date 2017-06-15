import React from "react";

class SearchTweets extends React.Component {
    render() {
        return (
            <form className={this.props.hidden ? "hidden" : "search-form"} role="search" onSubmit={(e) => this.handleSubmitSearch(e)}>
                <div className="input-group add-on">
                    <input id = "searchbox" type="text" ref="query" className="form-control input-group" placeholder="e.g. uw or #uw" />
                    <span className="input-group-btn">
                        <button type="submit" className="btn btn-default btn-md"><i className="glyphicon glyphicon-search"></i></button>
                    </span>
                </div>
            </form>
        )
    }

    // Change characters to percent-encoded values
    // Example: # = %23
    percentEncoding(value) {
        return encodeURIComponent(value).replace(/[!'()*]/g, function(text) {
            return "%" + text.charCodeAt(0).toString(16);
        });
    }

    handleSubmitSearch(e) {
        e.preventDefault();
        var url = "/search-twitter?q=" + this.percentEncoding(this.refs.query.value);
        this.props.searchTweets(url, this.refs.query.value);
    }
}

export default SearchTweets;