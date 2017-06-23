/* global Backbone */
var app = app || {};

(function () {
  'use strict';

  // Timetable Model
  // ---------------
  
  app.Timetable = Backbone.Model.extend({
  });

  app.CurrentTimetable = new app.Timetable;
})();
