/*global define*/
define([
	'jquery',
	'underscore',
	'backbone',
	'collections/todos',
	'collections/song',
	'views/todos',
	'views/song_view',
	'text!templates/stats.html',
	'text!templates/song.html',
	'common',
	'AutocompleteList',
	'backboneLocalstorage',
	// 'backboneTypeahead'
], function ($, _, Backbone, Todos,Song, TodoView,SongView, statsTemplate, songTemplate,Common,AutocompleteList,Store) {
	'use strict';

	var AppView = Backbone.View.extend({

		// Instead of generating a new element, bind to the existing skeleton of
		// the App already present in the HTML.
		el: '#todoapp',

		// Compile our stats template
		template: _.template(statsTemplate),

		// Delegated events for creating new items, and clearing completed ones.
		events: {
			'keypress #new-todo':		'createOnEnter',
			'click #clear-completed':	'clearCompleted',
			'click #toggle-all':		'toggleAllComplete',
			'click #clearStorage':      'clearPlaylist'
		},

		// At initialization we bind to the relevant events on the `Todos`
		// collection, when items are added or changed. Kick things off by
		// loading any preexisting todos that might be saved in *localStorage*.
		initialize: function () {
			this.allCheckbox = this.$('#toggle-all')[0];
			this.$input = this.$('#new-todo');
			this.$footer = this.$('#footer');
			this.$main = this.$('#main');

			// NOTEL FIRST ARG HERE IS THE CORRESPONDING COLLECTION!
			// this.listenTo(Song, 'add', this.addOne);
			this.listenTo(Todos, 'reset', this.addAll);
			this.listenTo(Todos, 'change:completed', this.filterOne);
			this.listenTo(Todos, 'filter', this.filterAll);
			this.listenTo(Todos, 'all', this.render);
			// $('.dropdown-toggle').dropdown('toggle');
			//IDEA, write function to check for len in the localStorage and create songeViews for each one , like the click below
			//THEN ... get rid of the fetch below
			Todos.fetch();
		},

		// Re-rendering the App just means refreshing the statistics -- the rest
		// of the app doesn't change.
		render: function () {
			var completed = Todos.completed().length;
			var remaining = Todos.remaining().length;

			if (Todos.length) {
				this.$main.show();
				this.$footer.show();

				this.$footer.html(this.template({
					completed: completed,
					remaining: remaining
				}));

				this.$('#filters li a')
					.removeClass('selected')
					.filter('[href="#/' + (Common.TodoFilter || '') + '"]')
					.addClass('selected');
			} else {
				this.$main.hide();
				this.$footer.hide();
			}

		  var autocompleteRemote = new Backbone.AutocompleteList({
		    url: function() { 
		    	// return 'http://ws.audioscrobbler.com/2.0/?method=track.search&api_key=cef6d600c717ecadfbe965380c9bac8b&format=json&' + $.param({ track: $('form#autocomplete input[name=search]').val() });
		    	return 'http://ws.spotify.com/search/1/track.json?q=' + $('form#autocomplete input[name=search]').val();
		    },
		    collection: Song,
		    filter: null,
		    limit:20,
		    el: $('form#autocomplete input[name=search]'),
		    // NOTE: this is bringing the autocomplete dropdown.. ugly one
		    // template: _.template('<p style="background-color:white;"><%= name.replace(new RegExp("(" + $("form#autocomplete input[name=search]").val() + ")", "i") ,"<b>$1</b>") %></p>'),
		    template: _.template(songTemplate),
		    delay: 500,
		    minLength: 3,
		    results: $('#collection'),
		    click: function(model, i) {
		      // counter used for the number on the list
		      this.$el.empty();
		      // TODO SET A MODEL VALUE THAT SAYS THIS GOES IN NEW LIST AND THUS SHOW PLAYER
		      // SUCCESS!.. ADDIN THE NEW VIEW ITEM, NEED TO PASS IN THE VALUES THOUGHT, AND ADD TO NEW LIST TO RIGHT@!!!!!!
		      model.set({isPlayer:true});
		      Song.create();
		      Todos.add(model);
		      // set in storage
		      //TODO see if u can move to model and override the sync method for local storage!
			  localStorage.setItem(model.get('filtered_artist'), model.get('name'));
		      // TODO: this works, but all it to new list
		      var songview = new SongView({model: model});
			  $('#selected-song-list').append(songview.render().el);
			  // add counter to the playlist
			  console.log( $('.plCounter').length);
			  $('.plCounter').last().html($('.plCounter').length);
			  // clear the search input
			  $('form#autocomplete input[name=search]').val('');
		    }
		    // value: function(model) { return model.get('name') },
		  }).render();
			$('#todo-list').append(autocompleteRemote.render().el);
			//END ENPERIMENT

		  //END 2nd experiment
			// this.allCheckbox.checked = !remaining;
		},

		// Add a single todo item to the list by creating a view for it, and
		// appending its element to the `<ul>`.
		// NOTE THIS IS BEING USED AT MOMENT
		addOne: function (song) {
			console.log('add one...');
			// var view = new TodoView({ model: todo });
			var view = new SongView({model: song});
			$('#todo-list').append(view.render().el);
		},

		// Add all items in the **Todos** collection at once.
		addAll: function () {
			this.$('#todo-list').html('');
			Todos.each(this.addOne, this);
		},

		filterOne: function (todo) {
			todo.trigger('visible');
		},

		filterAll: function () {
			Todos.each(this.filterOne, this);
		},

		// Generate the attributes for a new Todo item.
		newAttributes: function () {
			return {
				title: this.$input.val().trim(),
				order: Todos.nextOrder(),
				completed: false
			};
		},

		// If you hit return in the main input field, create new **Todo** model,
		// persisting it to *localStorage*.
		createOnEnter: function (e) {
			if (e.which !== Common.ENTER_KEY || !this.$input.val().trim()) {
				return;
			}

			Todos.create(this.newAttributes());
			this.$input.val('');
		},

		// Clear all completed todo items, destroying their models.
		clearCompleted: function () {
			_.invoke(Todos.completed(), 'destroy');
			return false;
		},
		clearPlaylist: function(){
			// TODO TRY CLEAR THE COLLECTION.. SEE WHAT HAPPENS/
			// clear the playlist
			$('#selected-song-list').empty();
			//clear storage
			this.clearLocalStorage();	
		},
		// clear the html5 localstorage
		clearLocalStorage: function () {
			localStorage.clear();
			return false;
		},
		toggleAllComplete: function () {
			var completed = this.allCheckbox.checked;

			Todos.each(function (todo) {
				todo.save({
					'completed': completed
				});
			});
		}
	});

	return AppView;
});