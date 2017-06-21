/* global Backbone */
var app = app || {};

(function () {
  'use strict';

  var SomeLectureList = Backbone.Collection.extend({
    // Reference to this collection's model.
    model: app.Lecture,
    initialize: function(url) {
      this.url = url;
    },
  });

  // Create
  app.searchLectureList = new SomeLectureList('');
  app.majorLectureList = new SomeLectureList('/timetable/list/major/');
  app.majorLectureList.fetch();
  app.humanityLectureList = new SomeLectureList('/timetable/list/humanity/');
  app.humanityLectureList.fetch();
})();
