(function($){
  $.fn.julienMP3Player = function(options){
    var settings = {
      joie: 2,
      markup: '<div class="jmp3_container">\
                <a href="#" class="jmp3_play">Play</a>\
                <a href="#" class="jmp3_stop">Stop</a>\
                <span class="jmp3_currentTrackName"></span>\
              </div>'
    };

    // We need SoundManager2
    if (!soundManager) {
      alert("You need to include SoundManager2 for this plugin to work.");
      return false;
    }

    return this.each(function(){
      var tracks = [];
      if (options){
        $.extend(settings, options);
      }
      // add the songs from the UL into the tracks array
      $(this).find('li>a').each(function(i){
        var sound = soundManager.createSound({
          id: 'song' + i.toString(),
          url: $(this).attr('href')
        })
        tracks.push( sound );
      });

      $(this).hide(); // hide the UL markup

      var $jmp3_content = $(settings.markup);

      $jmp3_content.find('.jmp3_play').bind('click.jmp3', function(){
        tracks[0].togglePause(); // play the first track
        return false;
      });
      $jmp3_content.find('.jmp3_stop').bind('click.jmp3', function(){
        tracks[0].stop(); // stop the first track
        return false;
      });

      $(this).after($jmp3_content);
    });
  };
})(jQuery);
