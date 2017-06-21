/* global Backbone */
var app = app || {};

(function () {
  'use strict';

  // Lecture Model
  // -------------
  
  //app.LectureActive = Backbone.Model.extend({
  app.Lecture = Backbone.Model.extend({
    defaults: {
      "click": false,
      "hover": false,
    },
    sync : function(){},
    save : function(){},
  });

  app.LectureActive = new app.Lecture;
})();
