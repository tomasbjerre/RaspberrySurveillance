/**
 * API
 */
(function($) {
    $.fn.getCameras = function(callback) {
        $.ajax({
                url: "api/api.php?operation=cameras", 
                async: true,
                dataType: "json",
                success: function(data, textStatus, jqXHR) {
                    callback(data);
                },
                error: function(data, textStatus, jqXHR) {
                }
            });
    }

    $.fn.getOptions = function(cameraIp,callback) {
        $.ajax({
                url: "api/api.php?operation=camera&ip="+cameraIp+"&how", 
                async: true,
                dataType: "json",
                success: function(data, textStatus, jqXHR) {
                    callback(data);
                },
                error: function(data, textStatus, jqXHR) {
                }
            });
    }

    $.fn.getSnapshotUrl = function(cameraIp,options) {
        return "api/api.php?operation=camera&ip="+cameraIp+"&snapshot"+options+"&random="+Math.random();
    }
})(jQuery);

/**
 * GUI
 */
(function($) {
    function getOptions(cameraIp) {
     return $(".options",getCamera(cameraIp)).serialize();
    }

    function getCamera(cameraIp) {
     return $('[data-ip="'+cameraIp+'"]');
    }

    $.fn.addCamera = function(cameraIp) {
     $('.cameras').append('<div class="camera" data-ip="'+cameraIp+'"><div class="preview"><img src="spinner.gif"/></div><form class="options"></form><input type="button" value="Refresh" class="refresh"/><input type="button" value="Options" class="options"/></div>');
    }

    $.fn.addOption = function(cameraIp,option,optionals) {
        var optionalsHtml = "";
        $(optionals).each(function(index, optional) {
         optionalsHtml += '<option value="'+optional+'">'+optional+'</option>';
        });
        var selectHtml = '<div class="option"><label for="'+option+'">'+option+'</label><select name="'+option+'">'+optionalsHtml+'</select></div>';
        $(".options",getCamera(cameraIp)).append(selectHtml);
    }

    $.fn.takeSnapshot = function(cameraIp) {
        $.fn.setPreviewSpinner(cameraIp);
        $.fn.fixWidthHeightPreview();
        $camera = getCamera(cameraIp);
        var image = new Image();
        image.src = $.fn.getSnapshotUrl(cameraIp,"&"+getOptions(cameraIp));
        $(image).one("load", function() {
            $(".preview").html(image);
            $.fn.fixWidthHeightPreview();
        });
    }

    $.fn.fixWidthHeightPreview = function() {
     var $image = $(".preview img");
     var maxWidth = $(".preview").width();
     var maxHeight = $(".preview").height();
     var reduce = 1;
     var reduceW = 1;
     var reduceH = 1;
     var imageWidth = $image[0].width;
     var imageHeight = $image[0].height;
     if (imageWidth > maxWidth) {
      reduceW = maxWidth / imageWidth;
     }
     if (imageHeight > maxHeight) {
      reduceH = maxHeight / imageHeight;
     }
     if (reduceH > reduceW) {
      reduce = reduceW;
     } else {
      reduce = reduceH;
     }
     $image.width(imageWidth*reduce);
     $image.height(imageHeight*reduce); 
    }

    $.fn.setPreviewSpinner = function(cameraIp) {
        $(".preview",getCamera(cameraIp)).html('<img src="spinner.gif"/>');
    }

    $.fn.setEvents = function(cameraIp) {
        $("select",getCamera(cameraIp)).change(function() {
            $.fn.takeSnapshot(cameraIp);
        });
        $(".refresh",getCamera(cameraIp)).click(function() {
            $.fn.takeSnapshot(cameraIp);
        });
        $(".preview img").live('click',function() {
            window.open($(".preview img").attr('src'));
        });
    }
})(jQuery);

/**
 * Glue
 */
(function($) {
    function addCamera(camera) {
        $.fn.addCamera(camera['ip']);
        $.fn.getOptions(camera['ip'],function(options){
            $.each(options,function(option,optionals){
                $.fn.addOption(camera['ip'],option,optionals);
            });
            $.fn.takeSnapshot(camera['ip']);
            $.fn.setEvents(camera['ip']);
        });
    }

    $(document).ready(function(){
        $.fn.getCameras(function(cameras){
            $.each($(cameras),function(key, camera) {
                addCamera(camera);
            });
        });
    });
})(jQuery);
