/* global Backbone */
var app = app || {};

(function ($) {
  'use strict';

  // Timetable Model
  // ---------------

  app.TimetableSearchView = Backbone.View.extend({
    initialize: function (opt) {
      this.isLookingTable = false;
      this.isBubbling = false;
    },
    el: '#timetable-contents',
    events: {
      'click .half': "clickHandler",
      'click .lecture-block': "clickBlock",
    },
    clickHandler: function (e) {
      if (this.isBubbling) {
        this.isBubbling = false;
      } else {
        if (this.isLookingTable) {
          this.isLookingTable = false;
          this.secondBlock = {
            day: $(e.target).data('day'),
            time: $(e.target).data('time')
          }
          this.searchLecture();
          // this.cleanHalfs();
          
        } else {
          this.cleanHalfs();
          
          $(e.target).addClass('clicked');
          this.isLookingTable = true;
          this.firstBlock = {
            day: $(e.target).data('day'),
            time: $(e.target).data('time')
          };
        }
      }
    },

    clickBlock: function () {
      this.isBubbling = true;
      this.cleanHalfs();
    },

    cleanHalfs: function () {
      console.log($(this).find('.half'));  
      $(this.el).find('.half').removeClass('clicked').removeClass('selected');
      this.isLookingTable = false;
    },
    
    searchLecture: function () {
      var fBDay = this.indexOfDay(this.firstBlock.day) + 1;
      var sBDay = this.indexOfDay(this.secondBlock.day) + 1;
      var fBTime = this.indexOfTime(this.firstBlock.time) + 1 ;
      var sBTime = this.indexOfTime(this.secondBlock.time) + 1 ;

      console.log(fBDay, sBDay, fBTime, sBTime);
      
      var temp;
      if (fBDay > sBDay) {
        temp = fBDay;
        fBDay = sBDay;
        sBDay = temp;
      }
      
      if (fBTime > sBTime) {
        temp = fBTime;
        fBTime = sBTime;
        sBTime = temp;
      }
      
      console.log(fBDay, sBDay, fBTime, sBTime);
      
      console.log(
        '.day:nth-child(n+' + fBDay + '):nth-child(-n+' + sBDay + ')',
        $(this.el)
        .find(
        '.day:nth-child(n+' + fBDay + '):nth-child(-n+' + sBDay + ')')
      )
        
      
      var days = $(this.el)
        .find(
        '.day:nth-child(n+' + fBDay + '):nth-child(-n+' + sBDay + ')');
      console.log(days);
      days.find('.half:nth-child(n+' + fBTime + '):nth-child(-n+' + sBTime + ')')
        .addClass('selected');
      
      console.log(lectureList);
      lectureList.$el.removeClass('closed');
    },
    
    indexOfDay: function (day) {
      var days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
      return days.indexOf(day);
    },
    
    indexOfTime: function (time) {
      var time = parseInt(time);
      var firstTime = 800;
      time -= firstTime;
      
      var hour = Math.round(time / 100);
      var min = time - hour * 100;

      return hour*2 + min/30;
    }
  })

  app.lecturelistView = Backbone.View.extend({
    el: '.lecture-list',
    initialize: function (opt) {
      // this.isLookingTable = false;
    },
      
    events: {
      'click .close': "closeView"
    },
    
    closeView: function () {
      this.$el.addClass('closed');
    }
  })

  app.TimetableLectureView = Backbone.View.extend({
    //el: '#timetable-contents',
    el: '#center',
    tagName: 'div',

    template: _.template($('#timetable-lecture-template').html()),

    events: {
      'click .timetable-tab': "render"
    },
    
    initialize: function() {
      _.bindAll(this,"render");
      this.render();
      //app.timetables.bind("reset", this.render);
      console.log("view");
    },

    render: function() {
      console.log("render");
      console.log(app.timetables.length);
      console.log(app.timetables.models);
      for (var child of app.timetables.models) {
        console.log(child.attributes.day);
        var day = timetable.indexOfDay(child.attributes.day) + 1;
        var startTime = timetable.indexOfTime(child.attributes.starttime) + 1;
        var endTime = timetable.indexOfTime(child.attributes.endtime) + 1;
        var time = endTime-startTime;
        console.log('day, time', day, time);
        var block = $(this.el)
          .find(
          '.day:nth-child(n+' + day + '):nth-child(-n+' + day + ')')
          .find('.half:nth-child(n+' + startTime + '):nth-child(-n+' + startTime + ')')
        console.log('block', block);
        var w = block.width();
        var h = block.height()+1;
        block.html(this.template({title: child.attributes.name}));
        $(this.el).find('.lecture-block').css('height', h*time);
        $(this.el).find('.lecture-block').css('width', w);
        timetable.cleanHalfs();
      }
    }
  })
})(jQuery);

var timetable;
var lectureList;
var userLectureList;
app.timetables.fetch().done(function() {
  timetable = new app.TimetableSearchView();
  lectureList = new app.lecturelistView();
  userLectureList = new app.TimetableLectureView();
});
