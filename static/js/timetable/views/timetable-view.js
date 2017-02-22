/* global Backbone */
var app = app || {};

(function ($) {
  'use strict';

  // Timetable View
  // ---------------

  app.TimetableClickSearchView = Backbone.View.extend({
    initialize: function (opt) {
      this.isLookingTable = false;
      this.isBubbling = false;
      this.isDragging = false; 
    },
    el: '#timetable-contents',
    events: {
      'touchstart .half': "dragStart",
      'touchmove .half': "dragMoveM",
      'touchend .half': "dragEndM",
      'touchstart .lecture-block': "clickBlock",
      'mousedown .half': "dragStart",
      'mousemove .half': "dragMove",
      'mouseup': "dragEnd",
      'mousedown .lecture-block': "clickBlock",
    },

    dragStart: function (e) {
      if (this.isBubbling) {
        this.isBubbling = false;
      } else {
        e.stopPropagation();
        e.preventDefault();
        this.cellHeight = ($("div.half:last").offset().top - $("div.half:first").offset().top + $("div.half:last").height()) / 32;
        this.cellWidth = ($("div.half:last").offset().left - $("div.half:first").offset().left + $("div.half:last").width()) / 5;
        this.timetableOffset = $("div#timetable-contents").offset();
        this.cleanHalfs();
        this.isDragging = true;

        $(e.target).addClass('clicked');
        this.firstBlock = {
          day: $(e.target).data('day'),
          time: $(e.target).data('time')
        };
        this.secondBlock = {
          day: $(e.target).data('day'),
          time: $(e.target).data('time')
        };
      }
    },

    dragEnd: function (e) {
      if (this.isDragging) {
        this.isDragging = false;
        this.searchLecture();
      }
    },

    dragEndM: function (e) {
      if (this.isDragging) {
        this.isDragging = false;
        this.searchLecture();
      }
    },

    dragMove: function (e) {
      if (this.isDragging) {
        /*
        var targets = document.elementsFromPoint(e.clientX,e.clientY);
        var realTarget = $(targets).filter('.half')[0];
        
        if (realTarget) {
          this.secondBlock = {
            day: $(realTarget).data('day'),
            time: $(realTarget).data('time')
          }
          this.dragTable();
        }
        */

        var indexDay = parseInt((e.pageX - this.timetableOffset.left) / this.cellWidth) + 1;
        var indexTime = parseInt((e.pageY - this.timetableOffset.top) / this.cellHeight) + 1;
        console.log(this.cellHeight);
        
        var day = $(this.el).find('.day:nth-child(' + indexDay + ')');
        var cell = day.find('.half:nth-child(' + indexTime + ')');

        if (cell) {
          this.secondBlock = {
            day: $(cell).data('day'),
            time: $(cell).data('time')
          }
          this.dragTable();
        }
      }
    },

    dragMoveM: function (e) {
      if (this.isDragging) {
        /*
        var targets = document.elementsFromPoint(e.targetTouches[0].clientX,e.targetTouches[0].clientY);
        var realTarget = $(targets).filter('.half')[0];
        //console.log($(realTarget));
        
        if (realTarget) {
          this.secondBlock = {
            day: $(realTarget).closest('.half').data('day'),
            time: $(realTarget).closest('.half').data('time')
          }
          this.dragTable();
        }
        */

        var indexDay = parseInt((e.targetTouches[0].pageX - this.timetableOffset.left) / this.cellWidth) + 1;
        var indexTime = parseInt((e.targetTouches[0].pageY - this.timetableOffset.top) / this.cellHeight) + 1;
        
        var day = $(this.el).find('.day:nth-child(' + indexDay + ')');
        var cell = day.find('.half:nth-child(' + indexTime + ')');

        if (cell) {
          this.secondBlock = {
            day: $(cell).data('day'),
            time: $(cell).data('time')
          }
          this.dragTable();
        }
      }
    },

    clickBlock: function () {
      if (!this.isDragging) {
        this.isBubbling = true;
        this.cleanHalfs();
      }
    },

    cleanHalfs: function () {
      console.log($(this).find('.half'));  
      $(this.el).find('.half').removeClass('clicked').removeClass('selected');
      this.isLookingTable = false;
    },
    
    dragTable: function (e) {
      var fBDay = this.indexOfDay(this.firstBlock.day) + 1;
      var sBDay = this.indexOfDay(this.secondBlock.day) + 1;
      var fBTime = this.indexOfTime(this.firstBlock.time) + 1 ;
      var sBTime = this.indexOfTime(this.secondBlock.time) + 1 ;
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
      
      $(this.el).find('.half').removeClass('clicked');
      var days = $(this.el)
        .find(
        '.day:nth-child(n+' + fBDay + '):nth-child(-n+' + sBDay + ')');
      for (var i = 0, day; day = days[i]; i++) {
        for (var j = fBTime; j < sBTime + 1; j++) {
          $(day).find('.half:nth-child(' + j + ')').addClass('clicked');
        }
      }
    },
    
    searchLecture: function () {
      var fBDay = this.indexOfDay(this.firstBlock.day) + 1;
      var sBDay = this.indexOfDay(this.secondBlock.day) + 1;
      var fBTime = this.indexOfTime(this.firstBlock.time) + 1 ;
      var sBTime = this.indexOfTime(this.secondBlock.time) + 1 ;
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
      
      var days = $(this.el)
        .find(
        '.day:nth-child(n+' + fBDay + '):nth-child(-n+' + sBDay + ')');
      this.cleanHalfs();
      for (var i = 0, day; day = days[i]; i++) {
        for (var j = fBTime; j < sBTime + 1; j++) {
          $(day).find('.half:nth-child(' + j + ')').addClass('selected');
        }
      }
      
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

  app.lectureListView = Backbone.View.extend({
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

  app.TimetableLectureBlocksView = Backbone.View.extend({
    el: '#timetable-contents',
    //el: '#center',
    tagName: 'div',

    template: _.template($('#timetable-lecture-template').html()),

    events: {
      'click .timetable-tab': "render"
    },
    
    initialize: function() {
      _.bindAll(this,"render");
      this.render();
      //app.timetables.bind("reset", this.render);
      $(window).on("resize", this.render);
      this.listenTo(app.timetables, "successOnFetch", this.render);
      console.log("view");
    },

    render: function() {
      console.log("render");
      console.log(app.timetables.length);
      console.log(app.timetables.models);
      for (var i = 0, child; child = app.timetables.models[i]; i++) {
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
        $(this.el).find('.lecture-block').css('height', h*time-1);
        $(this.el).find('.lecture-block').css('width', w);
        timetable.cleanHalfs();
      }
    }
  })
})(jQuery);

var timetable = new app.TimetableClickSearchView();
var lectureList = new app.lectureListView();
var userLectureList = new app.TimetableLectureBlocksView();
app.timetables.getUserLectures();
