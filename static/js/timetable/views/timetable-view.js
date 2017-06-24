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

    events: {
      'mouseover .lecture-block': "blockHover",
      'mouseout .lecture-block': "blockOut",
      'click': "blockClick",
    },
    
    initialize: function() {},

    blockHover: function (e) {
      if (!app.LectureActive.get("click")) {
        var ct = $(e.currentTarget);
        var id = Number(ct.attr('data-id'));
        var lecList = app.CurrentTimetable.get('lectures');

        ct.addClass('active');

        var lecture = lecList.find(function(x){return x.id===id});
        app.LectureActive.set(lecture);
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
      var block = target.closest('.lecture-block');
      $(this.el).find('.lecture-block').removeClass('active').removeClass('click');
      if (block.length === 0) {
        // Click target is not child(or itself) of lecture block
        app.LectureActive.clear();
        app.LectureActive.set({
          "click":false,
          "hover":false,
        })
        return;
      } else {
        block.addClass('click').removeClass('active');
      }
      var id = Number(block.attr('data-id'));
      var lecList = app.CurrentTimetable.get('lectures');
      var lecture = lecList.find(function(x){return x.id===id});
      app.LectureActive.set(lecture);
      app.LectureActive.set("click", true);
      app.LectureActive.set("hover", false);
    },
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
      $(this.el).find('#credits .normal').removeClass("none");
      $(this.el).find('#credits .active').addClass("none");
      $(this.el).find('#au .normal').removeClass("none");
      $(this.el).find('#au .active').addClass("none");
      $('.lecture-block').removeClass('active');
    },

    render: function () {
      var typeDiv = $(this.el).find("[data-type='" + app.LectureActive.attributes.type_en + "']");
      if (typeDiv.length === 0) {
        typeDiv = $(this.el).find("[data-type='Etc']");
      }
      var credit = Number(app.LectureActive.attributes.credit);
      var au = Number(app.LectureActive.attributes.credit_au);
      var id = Number(app.LectureActive.get('id'));
      var inTimetable = app.CurrentTimetable.get('lectures').find(function(x){return x.id===id});
      var type_text, credit_text, au_text;

      if (inTimetable) {    // Lecture in timetable
        type_text = "(" + (credit+au) + ")";
        credit_text = Number($(this.el).find("#credits .normal").html());
        au_text = Number($(this.el).find("#au .normal").html());
        if (!app.LectureActive.get('click')) {
          $('.lecture-block[data-id=' + id + ']').addClass('active');
        }
      } else {         // Lecture not in timetable
        type_text = "+" + (credit + au);
        credit_text = Number($(this.el).find("#credits .normal").html()) + credit;
        au_text = Number($(this.el).find("#au .normal").html()) + au;
      }

      typeDiv.find('.active-credit').html(type_text);
      if (credit !== 0) {
        $(this.el).find("#credits .active").html(String(credit_text));
        $(this.el).find("#credits .normal").addClass("none");
        $(this.el).find("#credits .active").removeClass("none");
      }
      if (au !== 0) {
        $(this.el).find("#au .active").html(au_text);
        $(this.el).find("#au .normal").addClass("none");
        $(this.el).find("#au .active").removeClass("none");
      }
    },
  })

  app.TimetableTabView = Backbone.View.extend({
    el: '#timetable-tabs',

    template: _.template($('#timetable-lecture-template').html()),

    events: {
      'click .timetable-tab': "changeTab",
    },

    initialize: function() {
      _.bindAll(this,"render");
      $(window).on("resize", this.render);
      this.listenTo(app.CurrentTimetable, 'change', this.render);
      this.listenTo(app.timetables, 'update', this.makeTab);
      this.listenTo(app.YearSemester, 'change', this.fetchTab);
    },

    fetchTab: function() {
      var options = {data: {year: app.YearSemester.get('year'),
                            semester: app.YearSemester.get('semester')},
                    type: 'POST'};
      app.timetables.fetch(options);
    },

    makeTab: function() {
      app.CurrentTimetable.set(app.timetables.models[0].attributes);
      // this.render is automatically called here

      var template = _.template($('#timetable-tab-template').html());
      var block = $('#timetable-tabs');
      block.html(template({ids : app.timetables.pluck('id')}));
      block.children().first().addClass('active');
    },

    changeTab: function(e) {
      var id = Number($(e.currentTarget).attr('data-id'));
      var timetable = app.timetables.models.find(function(x){return x.get('id')===id});
      app.CurrentTimetable.set(timetable.attributes);
      // this.render is automatically called here
    },

    render: function() {
      // Make timetable blocks
      $('#timetable-contents .lecture-block').remove();
      var lectures = app.CurrentTimetable.get('lectures')
      for (var i = 0, child; child = lectures[i]; i++) {
        console.log(lectures);
        child['day'] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'][i%7];
        child['starttime'] = (Math.floor(i / 7) * 3 + 9) + '00';
        child['endtime'] = (Math.floor(i) * 3 + 12) + '00';

        var day = timetable.indexOfDay(child.day) + 2;
        var startTime = timetable.indexOfTime(child.starttime) + 2;
        var endTime = timetable.indexOfTime(child.endtime) + 2;
        var time = endTime-startTime;
        var block = $('#timetable-contents')
          .find(
          '.day:nth-child(n+' + day + '):nth-child(-n+' + day + ')')
          .find('.half:nth-child(n+' + startTime + '):nth-child(-n+' + startTime + ')')
        var w = block.width();
        var h = block.height()+1;
        block.html(this.template({title: child.title,
                                  id: child.id,
                                  width: w+2,
                                  height: h*time-1}));
      }

      // Update credit info
      var credit=0, au=0;
      var byType=[0,0,0,0,0,0];
      for (var i = 0, child; child = lectures[i]; i++) {
        credit += child.credit;
        au += child.credit_au;
        switch (child.type_en) {
          case ('Basic Required'):
            byType[0] += child.credit+child.credit_au;
            break;
          case ('Basic Required'):
            byType[1] += child.credit+child.credit_au;
            break;
          case ('Major Required'):
            byType[2] += child.credit+child.credit_au;
            break;
          case ('Major Elective'):
            byType[3] += child.credit+child.credit_au;
            break;
          case ('Humanities & Sociel Elective'):
            byType[4] += child.credit+child.credit_au;
            break;
          default:
            byType[5] += child.credit+child.credit_au;
        }
      }
      $('#credits .normal').html(credit);
      $('#au .normal').html(au);
      $('.lecture-type[data-type="Basic Required"').find('.credit-text').html(byType[0]);
      $('.lecture-type-right[data-type="Basic Elective"').find('.credit-text').html(byType[1]);
      $('.lecture-type[data-type="Major Required"').find('.credit-text').html(byType[2]);
      $('.lecture-type-right[data-type="Major Elective"').find('.credit-text').html(byType[3]);
      $('.lecture-type[data-type="Humanities & Sociel Elective"').find('.credit-text').html(byType[4]);
      $('.lecture-type-right[data-type="Etc"').find('.credit-text').html(byType[5]);


      // Update map : TODO

      // Update exam info : TODO
    }
  })
})(jQuery);

var lectureInfo = new app.LectureInfoView();
var timetable = new app.TimetableClickSearchView();
var lectureList = new app.lectureListView();
var userLectureList = new app.TimetableLectureBlocksView();
var userLectureList2 = new app.ListLectureBlocksView();
var timetableInfo = new app.TimetableInfoView();
var timetableTabView = new app.TimetableTabView();
