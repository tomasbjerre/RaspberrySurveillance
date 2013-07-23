/**
 * API
 */
(function($) {
    $.fn.getCameras = function(callback) {
        $.ajax({
                url: "api/api.php?operation=cameras", 
                async: true,
                cache: true,
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
                cache: true,
                dataType: "json",
                success: function(data, textStatus, jqXHR) {
                    callback(data);
                },
                error: function(data, textStatus, jqXHR) {
                }
            });
    }

    $.fn.getSnapshotUrl = function(cameraIp,options) {
        return "api/api.php?operation=camera&ip="+cameraIp+"&snapshot";
    }
})(jQuery);

/**
 * GUI
 */
(function($) {
    $.fn.addCamera = function(camera) {
     $('.cameras').append('<div class="camera" data-ip="'+(camera['ip'])+'"><div class="preview"><img src="spinner.gif"/></div><div class="options"></div></div>');
    }

    $.fn.addOption = function(option) {

    }

    $.fn.takeSnapshot = function(cameraIp) {
	$camera = $('[data-ip="'+cameraIp+'"]');
        options = [];
        $(".preview",$camera).html('<img src="'+$.fn.getSnapshotUrl(cameraIp,options)+'"/>');
    }
})(jQuery);

/**
 * Glue
 */
(function($) {
    function addCamera(camera) {
        $.fn.addCamera(camera);
        $.fn.getOptions(camera['ip'],function(options){
            $.each($(options),function(key, option) {
                $.fn.addOption(camera,option);
            });
            $.fn.takeSnapshot(camera['ip']);
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
