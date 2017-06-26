/* global Backbone */
var app = app || {};

(function () {
  'use strict';

  // Lecture Model
  // -------------
  
  var lectureActive = Backbone.Model.extend({
    defaults: {
      "type": "none",     // "none", "hover", "click"
      "from": "",         // "list", "table"
      "lecture": null,    // lecture model
    },
    sync : function(){},
    save : function(){},
  });

  app.LectureActive = new lectureActive;
})();
