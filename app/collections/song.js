/*global define*/
define([
      'jquery',
	'underscore',
	'backbone',
  'backboneLocalstorage',
	'models/song'
], function ($,_, Backbone, Store,SongModel) {
	'use strict';
      /* NOTE : took out "store" above, not sure ill need it... */
	var SongCollection = Backbone.Collection.extend({
		// Reference to this collection's model.
		initialize: function () {
    },
    // localStorage: new Store('balls'),
    // url: function() { 
    //       // return 'http://ws.audioscrobbler.com/2.0/?method=track.search&api_key=cef6d600c717ecadfbe965380c9bac8b&format=json&' + $.param({ track: $('form#autocomplete input[name=search]').val() });
    //       return 'http://ws.spotify.com/search/1/track.json?q=' + $('form#autocomplete input[name=search]').val();
    // },
		model: SongModel,
    parse: function(response) {
      // loop through the returned tracks  and get the artists array name value and add it to the parent obj so view can output it
      //NOTE: would appear there is a sexier way to do this?...
      //console.log(response.tracks);
      _.each(response.tracks, function(elem, index){ 
        elem.filtered_artist = elem.artists[0].name;
      }); 

      return response.tracks;
    }
	});

	return new SongCollection();
});