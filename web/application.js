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
})(jQuery);

/**
 * GUI
 */
(function($) {
    $.fn.addCamera = function(callback) {

    }

    $.fn.addOption = function(callback) {

    }

    $.fn.takeSnapshot = function(callback) {

    }
})(jQuery);

/**
 * Glue
 */
(function($) {
    function addCamera(camera) {
        $.fn.addCamera(camera)
        $.fn.getOptions(camera['ip'],function(options){
            $.each($(options),function(key, option) {
                $.fn.addOption(camera,option);
            });
            $.fn.takeSnapshot(camera);
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
