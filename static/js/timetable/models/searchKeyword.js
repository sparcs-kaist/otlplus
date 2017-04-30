/* global Backbone */
var app = app || {};

(function () {
  'use strict';

  // Search Keyword Model
  // -------------
  
  var searchKeyword = Backbone.Model.extend({
    url: '/timetable/search/keyword',
  });

  app.SearchKeyword = new searchKeyword;
})();
