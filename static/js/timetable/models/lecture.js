/* global Backbone */
var app = app || {};

(function () {
  'use strict';

  // Lecture Model
  // -------------
  
  //app.LectureActive = Backbone.Model.extend({
  var lectureActive = Backbone.Model.extend({
    defaults: {
      "click": false,
      "hover": false,
    }
  });

  app.LectureActive = new lectureActive;
})();
