/* global Backbone */
var app = app || {};

(function () {
  'use strict';

  // Timetable Collection
  // --------------------
  
  // The collection of timetables is backed by a remote server.  
  var Timetables = Backbone.Collection.extend({
    // Reference to this collection's model.
    model: app.Timetable,
    url: '/timetable/api/table_load/',

    fetch: function(options) {
      if (this._prevFetch != undefined &&
          this._prevFetch.readyState > 0 &&
          this._prevFetch.readyState < 4) {
        this._prevFetch.abort();
      }
      return this._prevFetch = Backbone.Collection.prototype.fetch.call(this, options);
    },
  });

  // Create
  app.timetables = new Timetables();
})();
