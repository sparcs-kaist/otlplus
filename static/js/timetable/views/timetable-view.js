/* global Backbone */
var app = app || {};


// Set csrf token for ajax
function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
function csrfSafeMethod(method) {
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}
var csrftoken = getCookie('csrftoken');
$.ajaxSetup({
    beforeSend: function(xhr, settings) {
        if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
            xhr.setRequestHeader("X-CSRFToken", csrftoken);
        }
    }
});



(function ($) {
  'use strict';

  // Timetable View
  // ---------------

  // Dragging timetable
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

  // Adding lectures to timetable and cart from lecture lists
  app.lectureListView = Backbone.View.extend({
    el: '#result-pages',
    initialize: function (opt) {
    },
      
    events: {
      'click .add-to-table': "addToTable",
    },

    addToTable: function (e) {
      var ct = $(e.currentTarget);
      var lecture_id = Number(ct.closest('.list-elem-body-wrap').attr('data-id'));
      var timetable_id = Number(app.CurrentTimetable.get('id'));

      // If class time overlaps : TODO
      if (false) {
        return;
      }
      // If lecture is already in timetable
      if (app.CurrentTimetable.get('lectures').find(function(x){return x.id===lecture_id})) {
        console.log(123);
        return;
      }

      $.ajax({
        url: "/timetable/api/update",
        type: "POST",
        data: {
          table_id: timetable_id,
          lecture_id: lecture_id,
          delete: false,
        },
        success: function(result) {
          var lecList;
          switch (ct.parent().parent().parent().parent().parent().attr('class').split()[0]) {
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
          var lecture = lecList.find(function(x){return x.get("id")===lecture_id});

          // Update app.CurrentTimetable
          // app.timetables is automaticall updated because it has same array pointers
          app.CurrentTimetable.get('lectures').push(lecture.attributes);
          app.CurrentTimetable.trigger('change');
        },
      });
    },
  })

  // Targetting lecture in timetable blocks
  app.TimetableLectureBlocksView = Backbone.View.extend({
    el: '#timetable-contents',
    //el: '#center',
    tagName: 'div',

    events: {
      'mouseover .lecture-block': "blockHover",
      'mouseout .lecture-block': "blockOut",
      'click': "blockClick",
      'click .lecture-delete': "deleteLecture",
    },
    
    initialize: function() {},

    blockHover: function (e) {
      if (!app.LectureActive.get("click")) {
        var ct = $(e.currentTarget);
        var id = Number(ct.attr('data-id'));
        var lecList = app.CurrentTimetable.get('lectures');

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
      }

      var id = Number(block.attr('data-id'));
      var lecList = app.CurrentTimetable.get('lectures');
      var lecture = lecList.find(function(x){return x.id===id});
      app.LectureActive.set(lecture);
      app.LectureActive.set("click", true);
      app.LectureActive.set("hover", false);
    },

    deleteLecture: function (e) {
      var ct = $(e.currentTarget);
      var lecture_id = Number(ct.closest('.lecture-block').attr('data-id'));
      var timetable_id = Number(app.CurrentTimetable.get('id'));

      // If lecture is not in timetable
      if (!(app.CurrentTimetable.get('lectures').find(function(x){return x.id===lecture_id}))) {
        return;
      }

      $.ajax({
        url: "/timetable/api/update",
        type: "POST",
        data: {
          table_id: timetable_id,
          lecture_id: lecture_id,
          delete: true,
        },
        success: function(result) {
          var lecList = app.CurrentTimetable.get('lectures');
          var lecture = lecList.find(function(x){return x.id===lecture_id});

          // Update app.CurrentTimetable
          var timetableLectures = app.CurrentTimetable.get('lectures');
          timetableLectures = timetableLectures.filter(function(x){return x.id!==lecture_id});
          app.CurrentTimetable.set('lectures', timetableLectures);

          // Update app.timetables
          var timetableModel = app.timetables.models.find(function(x){return x.get('id')===timetable_id});
          timetableModel.set('lectures', timetableLectures)
        },
      });
    },
  })

  // Targetting lecture in from lecture lists
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

  // Showing informations of target lecture
  app.LectureActiveView = Backbone.View.extend({
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

    deleteInfo: function () {
      // Delete lecture detail
      $('#lecture-info').find('.lecture-detail').remove();

      // Delete credit info
      $('#info').find('.active-credit').html("");
      $('#info').find('#credits .normal').removeClass("none");
      $('#info').find('#credits .active').addClass("none");
      $('#info').find('#au .normal').removeClass("none");
      $('#info').find('#au .active').addClass("none");

      // Delete timetable blocks
      $('.lecture-block').removeClass('active');
      $('.lecture-block').removeClass('click');

      // Delete exam info : TODO

      // Delete map info : TODO
    },

    render: function () {
      // Show lecture detail
      $('#lecture-info').html(this.template(app.LectureActive.attributes));

      // Update credit info
      var typeDiv = $('#info').find("[data-type='" + app.LectureActive.attributes.type_en + "']");
      if (typeDiv.length === 0) {
        typeDiv = $('#info').find("[data-type='Etc']");
      }
      var credit = Number(app.LectureActive.attributes.credit);
      var au = Number(app.LectureActive.attributes.credit_au);
      var id = Number(app.LectureActive.get('id'));
      var inTimetable = app.CurrentTimetable.get('lectures').find(function(x){return x.id===id});
      var type_text, credit_text, au_text;
      if (inTimetable) {    // Lecture in timetable
        type_text = "(" + (credit+au) + ")";
        credit_text = Number($('#info').find("#credits .normal").html());
        au_text = Number($('#info').find("#au .normal").html());
      } else {         // Lecture not in timetable
        type_text = "+" + (credit + au);
        credit_text = Number($('#info').find("#credits .normal").html()) + credit;
        au_text = Number($('#info').find("#au .normal").html()) + au;
      }
      typeDiv.find('.active-credit').html(type_text);
      if (credit !== 0) {
        $('#info').find("#credits .active").html(String(credit_text));
        $('#info').find("#credits .normal").addClass("none");
        $('#info').find("#credits .active").removeClass("none");
      }
      if (au !== 0) {
        $('#info').find("#au .active").html(au_text);
        $('#info').find("#au .normal").addClass("none");
        $('#info').find("#au .active").removeClass("none");
      }

      // Highlight timetable blocks
      if (app.LectureActive.get('hover')) {
        $('.lecture-block[data-id=' + app.LectureActive.get('id') + ']').addClass('active');
      }
      if (app.LectureActive.get('click')) {
        $('.lecture-block[data-id=' + app.LectureActive.get('id') + ']').addClass('click');
      }

      // Update exam info : TODO

      // Delete map info : TODO
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

  // Fetching and changing timetable tabs
  app.TimetableTabView = Backbone.View.extend({
    el: '#timetable-tabs',

    template: _.template($('#timetable-lecture-template').html()),

    events: {
      'click .timetable-tab': "changeTab",
      'click .timetable-add': "createTable",
      'click .duplicate-table': "copyTable",
      'click .delete-table': "deleteTable",
    },

    initialize: function() {
      _.bindAll(this,"render");
      $(window).on("resize", this.resize);
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

    deleteTable: function(e) {
      if (app.timetables.length <= 1){
        alert("마지막 시간표는 삭제할 수 없습니다");
        return;
      }
      if (!confirm("정말 삭제하시겠습니까?\n이 동작은 취소하거나 되돌릴 수 없습니다.")){
        return;
      }

      var block = $(e.currentTarget).closest('.timetable-tab');
      var id = Number(block.attr('data-id'));

      $.ajax({
        url: "/timetable/api/table_delete",
        type: "POST",
        data: {
          table_id: id,
          year: app.YearSemester.get('year'),
          semester: app.YearSemester.get('semester'),
        },
        success: function(result) {
          var timetables = app.timetables.models.filter(function(x){return x.get('id')!==id});
          app.timetables.reset(timetables);
          app.timetables.trigger('update');
        },
      });
    },

    createTable: function(e) {
      $.ajax({
        url: "/timetable/api/table_create",
        type: "POST",
        data: {
          year: app.YearSemester.get('year'),
          semester: app.YearSemester.get('semester'),
        },
        success: function(result) {
          app.timetables.create({id: result.id,
                                 year: app.YearSemester.get('year'),
                                 semester: app.YearSemester.get('semester'),
                                 lectures: []});
          var newTable = app.timetables.find(function(x){return x.get('id')===result.id});
          app.CurrentTimetable.set(newTable.attributes);
        },
      });
    },

    copyTable: function(e) {
      var block = $(e.currentTarget).closest('.timetable-tab');
      var id = Number(block.attr('data-id'));

      $.ajax({
        url: "/timetable/api/table_copy",
        type: "POST",
        data: {
          table_id: id,
          year: app.YearSemester.get('year'),
          semester: app.YearSemester.get('semester'),
        },
        success: function(result) {
          var oldTable = app.timetables.models.find(function(x){return x.get('id')===id});
          app.timetables.create({id: result.id,
                                 year: app.YearSemester.get('year'),
                                 semester: app.YearSemester.get('semester'),
                                 lectures: _.clone(oldTable.get('lectures')),
                               });
          var newTable = app.timetables.find(function(x){return x.get('id')===result.id});
          app.CurrentTimetable.set(newTable.attributes);
        },
      });
    },

    resize: function() {
      var blocks = $('.lecture-block');
      for (var i=0, block; block=blocks[i]; i++) {
        block = $(block);
        var cell = $(block.closest('.half'));
        var w = cell.width();
        var h = cell.height()+1;
        var time = block.attr('data-cells');
        block.css({width: w+2,
                   height: h*time-1});
      }
    },

    render: function() {
      // Highlight selected timetable tab
      var id = app.CurrentTimetable.get('id');
      $('.timetable-tab').removeClass('active');
      $('.timetable-tab[data-id='+id+']').addClass('active');

      // Make timetable blocks
      $('#timetable-contents .lecture-block').remove();
      var lectures = app.CurrentTimetable.get('lectures')
      for (var i = 0, child; child = lectures[i]; i++) {
        for (var j=0; j<2; j++) {
          child['day'] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'][i%2 + 2*j];
          if (Math.floor(i/2)%2 == 0) {
            child['starttime'] = (Math.floor(i / 4) * 3 + 9) + '00';
            child['endtime'] = (Math.floor(i / 4) * 3 + 10) + '30';
          } else {
            child['starttime'] = (Math.floor(i / 4) * 3 + 10) + '30';
            child['endtime'] = (Math.floor(i / 4) * 3 + 12) + '00';
          }

          var day = timetable.indexOfDay(child.day) + 2;
          var startTime = timetable.indexOfTime(child.starttime) + 2;
          var endTime = timetable.indexOfTime(child.endtime) + 2;
          var time = endTime-startTime;
          var block = $('#timetable-contents')
            .find(
            '.day:nth-child(n+' + day + '):nth-child(-n+' + day + ')')
            .find('.half:nth-child(n+' + startTime + '):nth-child(-n+' + startTime + ')')
          block.html(this.template({title: child.title,
                                    id: child.id,
                                    cells: time}));
        }
      }
      this.resize();

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
          case ('Basic Elective'):
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

      // Delete lectureactive if not in new timetable
      var activeID = app.LectureActive.get('id')
      if (lectures.find(function(x){return x.id===activeID}) === undefined) {
        app.LectureActive.set({'hover': false,
                               'click': false});
      }

      // Disable add buttons
      $('.add-to-table').removeClass('disable');
      for (var i = 0, child; child = lectures[i]; i++) {
        $('[data-id='+child.id+'] .add-to-table').addClass('disable');
      }

      // Update map : TODO

      // Update exam info : TODO

      // Update active lecture
      app.LectureActive.trigger("change");
    }
  })
})(jQuery);

var timetable = new app.TimetableClickSearchView();
var lectureList = new app.lectureListView();
var userLectureList = new app.TimetableLectureBlocksView();
var userLectureList2 = new app.ListLectureBlocksView();
var lectureActiveView = new app.LectureActiveView();
var timetableTabView = new app.TimetableTabView();
