/**
 * API
 */
(function($) {
    $.fn.storeMotionOptions = function(options,callback) {
        $.ajax({
                url: "api/api.php?operation=motion&action=store",
                async: true,
                dataType: "json",
                type: "post",
                data: options,
                success: function(data, textStatus, jqXHR) {
                    callback();
                },
                error: function(data, textStatus, jqXHR) {
                    alert("Error when storing motion options.");
                    callback();
                }
            });
    }

    $.fn.getMotionOptions = function(callback) {
        $.ajax({
                url: "api/api.php?operation=motion&action=get",
                async: true,
                dataType: "json",
                success: function(data, textStatus, jqXHR) {
                    callback($.parseJSON(data));
                },
                error: function(data, textStatus, jqXHR) {
                    alert("Error when getting motion options.");
                }
            });
    }

    $.fn.startMotion = function(callback) {
        $.ajax({
                url: "api/api.php?operation=motion&action=start",
                async: true,
                dataType: "json",
                success: function(data, textStatus, jqXHR) {
                    callback($.parseJSON(data));
                },
                error: function(data, textStatus, jqXHR) {
                    alert("Error when starting motion options.");
                }
            });
    }

    $.fn.stopMotion = function(callback) {
        $.ajax({
                url: "api/api.php?operation=motion&action=stop",
                async: true,
                dataType: "json",
                success: function(data, textStatus, jqXHR) {
                    callback($.parseJSON(data));
                },
                error: function(data, textStatus, jqXHR) {
                    alert("Error when stopping motion options.");
                }
            });
    }

    $.fn.getStatus = function(callback) {
        $.ajax({
                url: "api/api.php?operation=status&action=all",
                async: true,
                dataType: "json",
                success: function(data, textStatus, jqXHR) {
                    callback(data);
                },
                error: function(data, textStatus, jqXHR) {
                    alert("Error when getting status.");
                }
            });
    }

    $.fn.getSnapshotUrl = function(options) {
        return "api/api.php?operation=camera&snapshot&"+options+"&random="+Math.random();
    }
})(jQuery);

/**
 * GUI
 */
(function($) {
    function getOptions() {
     return $("#panel").serialize();
    }

    $.fn.takeSnapshot = function() {
        $.fn.setSpinner();
        $.fn.fixWidthHeight();
        var image = new Image();
        image.src = $.fn.getSnapshotUrl(getOptions());
        $(image).one("load", function() {
            $(".snapshot").html(image);
            $.fn.fixWidthHeight();
        });
    }

    $.fn.fixWidthHeight = function() {
     var $image = $(".snapshot img");
     var maxWidth = $(".snapshot").width();
     var maxHeight = $(".snapshot").height();
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

    $.fn.setSpinner = function() {
        $(".snapshot").html('<img src="spinner.gif"/>');
    }

    $.fn.setOption = function(option, value) {
        var checkbox = $('#'+option+'[type="checkbox"]');
        var radio = $('[name="'+option+'"][value="'+value+'"]');
        if(checkbox != undefined && checkbox.length == 1) {
            if (value == checkbox.val()) {
                checkbox.attr('checked','checked');
            } else {
                checkbox.removeAttr('checked');
            }
        } else if (radio != undefined && radio.length == 1) {
            if (value == radio.val()) {
                radio.prop('checked', true);
            } else {
                radio.prop('checked', false);
            }
        } else {
            $('[name="'+option+'"]').val(value);
        }
    }

    $.fn.guiSetup = function(status) {
        $("#temp").text(status.temp);
        $("#space").text(status.targetFree);
        fixStartStop(status.motionRunning);
        $(".refresh").click(function() {
            $.fn.takeSnapshot();
        });
        $(".snapshot img").live('click',function() {
            window.open($(".snapshot img").attr('src'));
        });
        $(".save").live('click',function() {
            $(".save").attr('disabled','disabled');
            $.fn.storeMotionOptions(getOptions(),function() {
                $(".save").removeAttr('disabled');
            });
        });
        $(".start").live('click',function() {
            disableStart();
            $.fn.startMotion(function() {
                enableStop();
            });
        });
        $(".stop").live('click',function() {
            disableStop();
            $.fn.stopMotion(function() {
                enableStart();
            });
        });
        $("#resolution").live('change',function(){
            var wh = $("#resolution").val().split("x");
            $("[name='width']").val(wh[0]);
            $("[name='height']").val(wh[1]);
        });
    }

    function disableStop() {
        $(".stop").attr('disabled','disabled');
    }

    function disableStart() {
        $(".start").attr('disabled','disabled');
    }

    function enableStart() {
        $(".start").removeAttr('disabled');
    }

    function enableStop() {
        $(".stop").removeAttr('disabled');
    }

    function fixStartStop(motionRunning) {
        if (motionRunning) {
            disableStart();
            enableStop();
        }else{
            enableStart();
            disableStop();
        }
    }
})(jQuery);

/**
 * Glue
 */
(function($) {
    $(document).ready(function(){
        $.fn.getMotionOptions(function(options){
            $.each(options,function(option,value){
                $.fn.setOption(option,value);
            });
            $.fn.takeSnapshot();
            $.fn.getStatus(function(status) {
                $.fn.guiSetup(status);
            });
        });
    });
})(jQuery);
