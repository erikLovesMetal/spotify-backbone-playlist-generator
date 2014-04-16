/*global define*/
define([
	'jquery',
	'underscore',
	'backbone',
	'backboneLocalstorage',
	'models/todo',
	'models/song',
	'views/song_view',
], function ($,_, Backbone, Store, Todo, SongModel,SongView) {
	'use strict';

	var TodosCollection = Backbone.Collection.extend({
		// Reference to this collection's model.
		initialize: function(){
		},
		model: SongModel,
		//@TODO... get rid of this, not being used... find way to use collection with no url or localstorage property
		localStorage: new Store('Main'),

		// Filter down the list of all todo items that are finished.
		completed: function () {
			return this.filter(function (todo) {
				return todo.get('completed');
			});
		},

		// Filter down the list to only todo items that are still not finished.
		remaining: function () {
			return this.without.apply(this, this.completed());
		},

		// We keep the Todos in sequential order, despite being saved by unordered
		// GUID in the database. This generates the next order number for new items.
		nextOrder: function () {
			if (!this.length) {
				return 1;
			}
			return this.last().get('order') + 1;
		},

		// Todos are sorted by their original insertion order.
		comparator: function (todo) {
			return todo.get('order');
		},
		parse: function(){
			var counter = 0;
			//loop through localstorage
			for(var key in localStorage) {
				// new model instance for each iteration
				var songModelInstance = new SongModel();
				counter = counter + 1;
				songModelInstance.set('filtered_artist',key);
				songModelInstance.set('name',localStorage.getItem(key));
				//figure out model arg here
				var songview = new SongView({model: songModelInstance});
				// $('#selected-song-list').append(localStorage.getItem(key));
				$('#selected-song-list').append(songview.render().el);
				$('.plCounter').last().html(counter);
			}
		   // return parsed;
		}
	});

	return new TodosCollection();
});