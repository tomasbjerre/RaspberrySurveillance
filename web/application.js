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
     $('.cameras').append('<div class="camera" data-ip="'+cameraIp+'"><div class="preview"><img src="spinner.gif"/></div><form class="options"></form><input type="button" value="Refresh" class="refresh"/></div>');
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
        $camera = getCamera(cameraIp);
        var options = "&"+getOptions(cameraIp);
        imageUrl = $.fn.getSnapshotUrl(cameraIp,options);

        var image = new Image();
        image.src = imageUrl;
        $(image).one("load", function() {
            $(".preview").html(image);
        });
    }

    $.fn.setPreviewSpinner = function(cameraIp) {
        $(".preview",getCamera(cameraIp)).html('<img src="spinner.gif"/>');
    }

    $.fn.takeSnapshotWhenChanged = function(cameraIp) {
        $("select",getCamera(cameraIp)).change(function() {
            $.fn.takeSnapshot(cameraIp);
        });
        $(".refresh",getCamera(cameraIp)).click(function() {
            $.fn.takeSnapshot(cameraIp);
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
            $.fn.takeSnapshotWhenChanged(camera['ip']);
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
