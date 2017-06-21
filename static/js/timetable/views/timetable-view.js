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
      $(window).on("resize", this.render);
    },

    el: '#timetable-wrap',
    dragCell : '#drag-cell',

    events: {
      'touchstart .half.table-drag': "dragStart",
      'touchmove .half.table-drag': "dragMove",
      'touchend': "dragEnd",
      'touchstart .lecture-block': "clickBlock",
      'mousedown .half.table-drag': "dragStart",
      'mousemove .half.table-drag': "dragMove",
      'mouseup': "dragEnd",
      'mousedown .lecture-block': "clickBlock",
      'click .drag-close': "dragClose",
    },

    dragStart: function (e) {
      if (this.isBubbling) {
        this.isBubbling = false;
      } else {
        e.stopPropagation();
        e.preventDefault();
        this.isDragging = true;
        $(this.dragCell).removeClass('none');
        $(this.dragCell).children().addClass('none');

        this.firstBlock = $(e.currentTarget);
        this.secondBlock = $(e.currentTarget);
        this.render();
      }
    },

    dragMove: function (e) {
      if (this.isDragging) {
        this.secondBlock = $(e.currentTarget);
        this.render();
      }
    },

    dragEnd: function (e) {
      if (this.isDragging) {
        this.isDragging = false;
        if (this.firstBlock[0] == this.secondBlock[0]) {
          $(this.dragCell).addClass('none');
        }
        else {
          this.searchLecture();
          $(this.dragCell).children().removeClass('none');
        }
      }
    },

    clickBlock: function () {
      if (!this.isDragging) {
        this.isBubbling = true;
      }
    },

    dragClose: function (e) {
      $(this.dragCell).addClass('none');
    },
    
    searchLecture: function () {
      var fBDay = this.indexOfDay(this.firstBlock.day) + 2;
      var sBDay = this.indexOfDay(this.secondBlock.day) + 2;
      var fBTime = this.indexOfTime(this.firstBlock.time) + 2;
      var sBTime = this.indexOfTime(this.secondBlock.time) + 2;
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
    },

    render: function () {
      if(timetable.firstBlock) {
        var left = Math.min(timetable.firstBlock.offset().left, timetable.secondBlock.offset().left) - $(timetable.el).offset().left - 1;
        var width = Math.abs(timetable.firstBlock.offset().left - timetable.secondBlock.offset().left) + timetable.firstBlock.width() + 2;
        var top = Math.min(timetable.firstBlock.offset().top, timetable.secondBlock.offset().top) - $(timetable.el).offset().top + 2;
        var height = Math.abs(timetable.firstBlock.offset().top - timetable.secondBlock.offset().top) + timetable.firstBlock.height() -2;

        $(timetable.dragCell).css('left', left+'px');
        $(timetable.dragCell).css('width', width+'px');
        $(timetable.dragCell).css('top', top+'px');
        $(timetable.dragCell).css('height', height+'px');
      }
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
      if (!app.LectureActive.get("click")) {
        var ct = $(e.currentTarget);
        var id = Number(ct.attr('data-id'));
        var lecList;
        switch (ct.parent().parent().parent().attr('class').split()[0]) {
          case 'search-page':
            lecList = app.searchLectureList;
            break;
          case 'major-page':
            lecList = app.majorLectureList;
            break;
          case 'humanity-page':
            lecList = app.humanityLectureList;
            break;
        }
        var lecture = lecList.models.find(function(x){return x.attributes.id===id});
        app.LectureActive.set(lecture.attributes);
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
      'click .open-dict-button': "openDictPreview",
      'click .close-dict-button': "closeDictPreview",
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

    openDictPreview: function(e) {
      $(this.el).find('.detail-top').addClass('none');
      $(this.el).find('.detail-bottom').removeClass('none');
    },

    closeDictPreview: function(e) {
      $(this.el).find('.detail-bottom').addClass('none');
      $(this.el).find('.detail-top').removeClass('none');
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
