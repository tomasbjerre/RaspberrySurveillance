/**
 * API
 */
(function($) {
    $.fn.storeMotionOptions = function(options,callback) {
        $.ajax({
                url: "api/api.php?operation=motion&action=store",
                async: true,
                cache: false,
                dataType: "json",
                type: "post",
                data: options,
                success: function(data, textStatus, jqXHR) {
                    callback();
                },
                error: function(data, textStatus, jqXHR) {
                    //alert("Error when storing motion options.");
                    callback();
                }
            });
    }

    $.fn.getMotionOptions = function(callback) {
        $.ajax({
                url: "api/api.php?operation=motion&action=get",
                async: true,
                cache: false,
                dataType: "json",
                success: function(data, textStatus, jqXHR) {
                    callback($.parseJSON(data));
                },
                error: function(data, textStatus, jqXHR) {
                    //alert("Error when getting motion options.");
                }
            });
    }

    $.fn.startMotion = function(callback) {
        $.ajax({
                url: "api/api.php?operation=motion&action=start",
                async: true,
                cache: false,
                dataType: "json",
                success: function(data, textStatus, jqXHR) {
                    callback($.parseJSON(data));
                },
                error: function(data, textStatus, jqXHR) {
                    //alert("Error when starting motion options.");
                }
            });
    }

    $.fn.stopMotion = function(callback) {
        $.ajax({
                url: "api/api.php?operation=motion&action=stop",
                async: true,
                cache: false,
                dataType: "json",
                success: function(data, textStatus, jqXHR) {
                    callback($.parseJSON(data));
                },
                error: function(data, textStatus, jqXHR) {
                    //alert("Error when stopping motion options.");
                }
            });
    }

    $.fn.getStatus = function(callback) {
        $.ajax({
                url: "api/api.php?operation=status&action=all",
                async: true,
                cache: false,
                dataType: "json",
                success: function(data, textStatus, jqXHR) {
                    callback(data);
                },
                error: function(data, textStatus, jqXHR) {
                    //alert("Error when getting status.");
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
            $(".snapshot").height($(".snapshot img").height());
            
            markMonitoredArea();
        });
    }

    function markMonitoredArea() {
     var rectangle = $('<div class="area"><div class="area">Monitoring this area!</div></div>');
     if ($('.snapshot .area').length > 0) {
      rectangle = $('.snapshot .area').first();
     }
     
     var img = $('.snapshot img');
     var imgPos = img.position();
     rectangle.css('top',(imgPos.top+monitoredY()*img.height())+'px');
     rectangle.css('left',(imgPos.left+monitoredX()*img.width())+'px');
     rectangle.css('width',monitoredW()*img.width()+'px');
     rectangle.css('height',monitoredH()*img.height()+'px');
     $('.snapshot img').parent().append(rectangle);
    }

    function monitoredW() {
     return parseFloat($("#monitor_area").val().split("x")[0]);
    }

    function monitoredH() {
     return parseFloat($("#monitor_area").val().split("x")[1].split("+")[0]);
    }

    function monitoredX() {
     return parseFloat($("#monitor_area").val().split("x")[1].split("+")[1]);
    }

    function monitoredY() {
     return parseFloat($("#monitor_area").val().split("x")[1].split("+")[2]);
    }

    $.fn.selectMonitoredArea = function() {
     var x,y,w,h;
     var img = $(".snapshot img");
     img.bind('mousedown',function(e) {
      img.unbind();
      x = (e.pageX - this.offsetLeft)/img.width();
      y = (e.pageY - this.offsetTop)/img.height();
      img.bind('mouseup',function(e) {
       img.unbind();
       w = (e.pageX - this.offsetLeft - x*img.width())/img.width();
       h = (e.pageY - this.offsetTop - y*img.height())/img.height();
       $("#monitor_area").val(w+"x"+h+"+"+x+"+"+y);
       markMonitoredArea();
      });
      alert("Click on the bottom right corner of the area you want to monitor.");
     });
     alert("Click on the upper left corner of the area you want to monitor.");
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

    var isUpdatingStatus = false;
    function updateStatus(status) {
        if (!isUpdatingStatus) {
         isUpdatingStatus = true;
         $.fn.getStatus(function(status) {
            fixStartStop(status.motionRunning);
            $("#temp").text(status.temp);
            $("#space").text(status.targetFree);
            $("#running").text((status.motionRunning?"Yes":"No"));
            if (status.motionRunning) {
                $("#log").html(status.log);
                $("#log").closest(".row").fadeIn();
            } else {
                $("#log").closest(".row").fadeOut();
            }
            isUpdatingStatus = false;
         });
        }
    }

    $.fn.guiSetup = function(options,status) {
        updateStatus();
        setInterval(updateStatus, 5000);
        fixStartStop(status.motionRunning);
        $(".refresh").click(function() {
            $.fn.takeSnapshot();
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
                //enableStop();
            });
        });
        $(".stop").live('click',function() {
            disableStop();
            $.fn.stopMotion(function() {
                //enableStart();
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
                $.fn.guiSetup(options,status);
            });
        });
    });
})(jQuery);
