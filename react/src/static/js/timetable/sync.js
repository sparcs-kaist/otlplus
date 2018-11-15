var csrf_token = $('input[name=csrfmiddlewaretoken]').val();
var oldSync = Backbone.sync;
Backbone.sync = function(method, model, options){
  options.beforeSend = function(xhr){
    xhr.setRequestHeader('X-CSRFToken', csrf_token);
  };
  return oldSync(method, model, options);
};

Backbone.emulateJSON = true;
