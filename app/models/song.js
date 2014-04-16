/*global define*/
define([
	'underscore',
	'backbone'
], function (_, Backbone) {
	'use strict';

	var SongModel = Backbone.Model.extend({
		// Default attributes for the todo
		// and ensure that each todo created has `title` and `completed` keys.
		defaults: {
			title: '',
			name:'',
			completed: false,
			song: '',
			filtered_artist: '',
			isPlayer: false
		},
		label: function () {
        return this.get("title");
    },
    artist: function () {
        // return this.get("artists").name;
        return 'me damn it';
    },
    // Toggle the `completed` state of this todo item.
		toggle: function () {
			this.save({
				completed: !this.get('completed')
			});
		}

	});

	return SongModel;
});