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
    url: '/timetable/api/show',
  });

  // Create
  app.timetables = new Timetables();
})();
