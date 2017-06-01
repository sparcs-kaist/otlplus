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
      this.isBlockClick = false;
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
        var indexDay = parseInt((e.pageX - this.timetableOffset.left) / this.cellWidth) + 1;
        var indexTime = parseInt((e.pageY - this.timetableOffset.top) / this.cellHeight) + 1;
        
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
      var fBTime = this.indexOfTime(this.firstBlock.time) + 1;
      var sBTime = this.indexOfTime(this.secondBlock.time) + 1;
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
      'click .timetable-tab': "render",
      'mouseover .lecture-block': "blockHover",
      'mouseout .lecture-block': "blockOut",
      'click': "blockClick",
    },
    
    initialize: function() {
      _.bindAll(this,"render");
      this.render();
      //app.timetables.bind("reset", this.render);
      $(window).on("resize", this.render);
      this.listenTo(app.timetables, "successOnFetch", this.render);
    },

    blockHover: function (e) {
      if (!app.LectureActive.get("click")) {
        var target = $(e.target);
        if (target.hasClass('lecture-block')) {
          target.addClass('active');
        } else {
          target.parent().parent().find('.lecture-block').addClass('active').removeClass('click');
        }
        var title = target.parent().find('.timetable-lecture-name').text();
        for (var i = 0, child; child = app.timetables.models[i]; i++) {
          if (child.attributes.title === title) {
            app.LectureActive.set(child.attributes);
            break;
          }
        }
        app.LectureActive.set("click", false);
        app.LectureActive.set("hover", true);
      }
    },

    blockOut: function () {     
      if (!app.LectureActive.get("click")) {
        $(this.el).find('.lecture-block').removeClass('active').removeClass('click');
        app.LectureActive.clear();
        app.LectureActive.set({
          "click":false,
          "hover":false,
        })
      }
    },

    blockClick: function (e) {
      var target = $(e.target);
      console.log(target);
      $(this.el).find('.lecture-block').removeClass('active').removeClass('click');
      if (target.hasClass("half") || target.hasClass('day') || target.is('#timetable-contents')) {
        app.LectureActive.clear();
        app.LectureActive.set({
          "click":false,
          "hover":false,
        })
        return;
      } else if (target.hasClass('lecture-block')) {
        target.addClass('click').removeClass('active');
      } else {
        target.parent().parent().find('.lecture-block').addClass('click').removeClass('active');
      }
      var title = target.parent().find('.timetable-lecture-name').text();
      for (var i = 0, child; child = app.timetables.models[i]; i++) {
        if (child.attributes.title === title) {
          app.LectureActive.set(child.attributes);
          break;
        }
      }
      app.LectureActive.set("click", true);
      app.LectureActive.set("hover", false);
    },

    render: function() {
      for (var i = 0, child; child = app.timetables.models[i]; i++) {
        var day = timetable.indexOfDay(child.attributes.day) + 1;
        var startTime = timetable.indexOfTime(child.attributes.starttime) + 1;
        var endTime = timetable.indexOfTime(child.attributes.endtime) + 1;
        var time = endTime-startTime;
        var block = $(this.el)
          .find(
          '.day:nth-child(n+' + day + '):nth-child(-n+' + day + ')')
          .find('.half:nth-child(n+' + startTime + '):nth-child(-n+' + startTime + ')')
        var w = block.width();
        var h = block.height()+1;
        block.html(this.template({title: child.attributes.title}));
      }
      var lectureBlock = $(this.el).find('.lecture-block');
      console.log(lectureBlock);
      lectureBlock.css('height', h*time-1);
      lectureBlock.css('width', w+2);
      //var left = lectureBlock.left() - 1;
      var dif = -1;
      lectureBlock.css({left: "+=" + dif});
      timetable.cleanHalfs();
    }
  })
	
	app.ListLectureBlocksView = Backbone.View.extend({
    el: '#result-pages',

    events: {
      'mouseover .list-elem-body-wrap': "listHover",
      'mouseout .list-elem-body-wrap': "listOut",
      //'click': "blockClick",
    },
    
    initialize: function() {
    },

    listHover: function (e) {
			console.log(e);
      if (!app.LectureActive.get("click")) {
        var ct = $(e.currentTarget);
        var title = ct.parent().find('.list-elem-title').find('strong').text();
				console.log(title);
        for (var i = 0, child; child = app.timetables.models[i]; i++) {
          if (child.attributes.title === title) {
            app.LectureActive.set(child.attributes);
            break;
          }
        }
        app.LectureActive.set("click", false);
        app.LectureActive.set("hover", true);
      }
    },

    listOut: function () {     
      if (!app.LectureActive.get("click")) {
        app.LectureActive.clear();
        app.LectureActive.set({
          "click":false,
          "hover":false,
        })
      }
    },

    listClick: function (e) {
      var target = $(e.target);
      console.log(target);
      $(this.el).find('.lecture-block').removeClass('active').removeClass('click');
      if (target.hasClass("half") || target.hasClass('day') || target.is('#timetable-contents')) {
        app.LectureActive.clear();
        app.LectureActive.set({
          "click":false,
          "hover":false,
        })
        return;
      } else if (target.hasClass('lecture-block')) {
        target.addClass('click').removeClass('active');
      } else {
        target.parent().parent().find('.lecture-block').addClass('click').removeClass('active');
      }
      var title = target.parent().find('.timetable-lecture-name').text();
      for (var i = 0, child; child = app.timetables.models[i]; i++) {
        if (child.attributes.title === title) {
          app.LectureActive.set(child.attributes);
          break;
        }
      }
      app.LectureActive.set("click", true);
      app.LectureActive.set("hover", false);
    },
  })

  app.LectureInfoView = Backbone.View.extend({
    el: '#lecture-info',
    tagName: 'div',

    template: _.template($('#lecture-detail-template').html()),

    initialize: function () {
      this.listenTo(app.LectureActive, 'change', this.changeInfo);
    },

    events: {
    },

    changeInfo: function () {
      if ((!app.LectureActive.get("click") && !app.LectureActive.get("hover")) || !app.LectureActive.has("title")) {
        this.deleteInfo();
      } else {
        this.deleteInfo();
        this.render();
      }
    },

    render: function () {
      var block = $(this.el);
      block.html(this.template(app.LectureActive.attributes));
    },

    deleteInfo: function () {
      $(this.el).find('.lecture-detail').remove();
    },
  })
  
  app.TimetableInfoView = Backbone.View.extend({
    el: '#info',

    initialize: function () {
      this.listenTo(app.LectureActive, 'change', this.changeInfo);
    },

    events: {
    },

    changeInfo: function () {
      if ((!app.LectureActive.get("click") && !app.LectureActive.get("hover")) || !app.LectureActive.has("title")) {
        this.deleteInfo();
      } else {
        this.deleteInfo();
        this.render();
      }
    },

    deleteInfo: function () {
      $(this.el).find('.active-credit').html("");
      $(this.el).find('#credits').removeClass("active");
      $(this.el).find('#au').removeClass("active");
    },

    render: function () {
      var target = $(this.el).find("span:contains(" + app.LectureActive.attributes.type + ")");
      if (!target.hasClass('lecture-type-span')) {
        target = $(this.el).find("span#other-lectures").parent().find(".lecture-type-span");
      }
      var credit = app.LectureActive.attributes.credit 
      var au = app.LectureActive.attributes.au 
      target.parent().find('.active-credit').html("(" + app.LectureActive.attributes.credit + ")");

      if (credit !== "0") {
        $(this.el).find("#credits").addClass("active")
      }
      if (au !== "0") {
        $(this.el).find("#au").addClass("active") 
      }
    },
  })
})(jQuery);

var lectureInfo = new app.LectureInfoView();
var timetable = new app.TimetableClickSearchView();
var lectureList = new app.lectureListView();
var userLectureList = new app.TimetableLectureBlocksView();
var userLectureList2 = new app.ListLectureBlocksView();
var timetableInfo = new app.TimetableInfoView();
app.timetables.getUserLectures();
