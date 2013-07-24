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
     var motion = '<h2>Motion</h2><hr/>';
     motion += '<form>';
     motion += '<div><label for="width">Width</label><input type="text" name="width"/><font></font></div>';
     motion += '<div><label for="height">Height</label><input type="text" name="height"/><font></font></div>';
     motion += '<div><label for="threshold">Threshold</label><input type="text" name="threshold"/><font>Number of changed pixels declaring motion.</font></div>';
     motion += '<div><label for="max_mpeg_time">Duration</label><input type="text" name="max_mpeg_time"/><font>Length of captured videos.</font></div>';
     motion += '<div><label for="netcam_url">Camera</label><input type="text" name="netcam_url"/><font>URL of camera.</font></div>';
     motion += '<div><label for="target_dir">Target dir</label><input type="text" name="target_dir"/><font>Where recordings are first saved.</font></div>';
     motion += '<label for="on_movie_end_options">On movie end</label>';
     motion += '<div class="onmovieend">';
     motion += '<div><input type="radio" name="on_movie_end_options" value="noting"/><label for="noting">Do nothing</label></div>';
     motion += '<div><input type="radio" name="on_movie_end_options" value="copy_webdav"/><label for="copy_webdav">Copy to webdav</label><input class="path" typ="text" name="copy_webdav_url"></div>';
     motion += '<div><input type="radio" name="on_movie_end_options" value="move_webdav"/><label for="move_webdav">Move to webdav</label><input class="path" typ="text" name="move_webdav_url"></div>';
     motion += '</div>';
     motion += '<input type="text" name="on_movie_end" class="hidden"/>';
     motion += '<div class="controls">';
     motion += '<input type="button" class="button" name="start" value="Start"/>';
     motion += '<input type="button" class="button" name="stop" value="Stop"/>';
     motion += '<input type="button" class="button" name="save" value="Save"/>';
     motion += '</div>';
     motion += '<div class="info">';
     motion += '<code id="status">Up 2 days, Temp 51C, CPU 700Mhz</code>';
     motion += '<code id="target">54GB available on /tmp/motion</code>';
     motion += '</div>';
     motion += '</form>';
     $('.cameras').append('<div class="camera" data-ip="'+cameraIp+'"><div class="snapshot"><div class="preview"><img src="spinner.gif"/></div><input type="button" value="Refresh" class="button refresh"/><form class="options"></form></div><div class="title">'+cameraIp+'</div><div class="motion">'+motion+'</div></div>');
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
            $(".netcam_url").val(image.src);
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
