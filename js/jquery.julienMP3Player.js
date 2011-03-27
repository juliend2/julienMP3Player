(function($){

  var methods = {
    _loading: function(){
      // console.log(((this.bytesLoaded/this.bytesTotal)*100)+'%');
    },
    _playSound: function(soundID){
      soundManager.getSoundById(soundID).togglePause();
    },
    _stopSound: function(soundID){
      soundManager.getSoundById(soundID).stop();
    },
    _getPrevTrackFrom: function(trackIDs, currentTrackID){
      var currentIndex = trackIDs.indexOf(currentTrackID);
      if (trackIDs[currentIndex - 1]){ // does the previous element exist?
        return trackIDs[currentIndex - 1];
      } else {
        // otherwise, we're at the beginning, so return the last one
        return trackIDs[trackIDs.length - 1];
      }
    },
    _getNextTrackFrom: function(trackIDs, currentTrackID){
      var currentIndex = trackIDs.indexOf(currentTrackID);
      if (trackIDs[currentIndex + 1]){ // does the next element exist?
        return trackIDs[currentIndex + 1];
      } else {
        // otherwise, we're at the end, so return the first one
        return trackIDs[0];
      }
    }
  };

  $.fn.julienMP3Player = function(options){
    var settings = {
      markup: '<div class="jmp3_container">\
                <a href="#" class="jmp3_play">Play</a>\
                <a href="#" class="jmp3_stop">Stop</a>\
                <span class="jmp3_currentTrackName"></span>\
                <a href="#" class="jmp3_next">Next</a>\
                <a href="#" class="jmp3_prev">Previous</a>\
              </div>'
    };

    // We need SoundManager2
    if (!soundManager) {
      alert("You need to include SoundManager2 for this plugin to work.");
      return false;
    }

    return this.each(function(elementIndex){

      if (options){ // merge the settings
        $.extend(settings, options);
      }

      var tracks = [], trackIDs = [], matchedObjects = $(this),
          currentSoundID;

      // add the songs from the UL into the tracks array
      matchedObjects.find('li>a').each(function(i){
        trackIDs.push('song_'+elementIndex+'_'+i.toString());
        var sound = soundManager.createSound({
          id: trackIDs[trackIDs.length-1],
          url: $(this).attr('href') /*,
          whileloading: methods._loading */
        });
        tracks.push( sound );
      });

      currentSoundID = tracks[0].sID;
      matchedObjects.hide(); // hide the UL markup

      var $jmp3_content = $(settings.markup);

      // play/pause current sound
      $jmp3_content.find('.jmp3_play').bind('click.jmp3', function(){
        methods._playSound(currentSoundID); // play the current track
        if ($jmp3_content.find('.jmp3_play').hasClass('jmp3_pause')){
          $jmp3_content.find('.jmp3_play').removeClass('jmp3_pause');
        } else {
          $jmp3_content.find('.jmp3_play').addClass('jmp3_pause');
        }
        return false;
      });

      // stop current sound
      $jmp3_content.find('.jmp3_stop').bind('click.jmp3', function(){
        methods._stopSound(currentSoundID); // stop the current track
        $jmp3_content.find('.jmp3_play').removeClass('jmp3_pause');
        return false;
      });

      // play previous sound
      $jmp3_content.find('.jmp3_prev').bind('click.jmp3', function(){
        methods._stopSound(currentSoundID); // stop the currently playing sound
        currentSoundID = methods._getPrevTrackFrom(trackIDs, currentSoundID); // currentSoundID = previous song
        methods._playSound(currentSoundID); // play the previous track
        $jmp3_content.find('.jmp3_play').addClass('jmp3_pause');
        return false;
      });

      // next
      $jmp3_content.find('.jmp3_next').bind('click.jmp3', function(){
        methods._stopSound(currentSoundID); // stop the currently playing sound
        currentSoundID = methods._getNextTrackFrom(trackIDs, currentSoundID); // currentSoundID = next song
        methods._playSound(currentSoundID); // play the next track
        $jmp3_content.find('.jmp3_play').addClass('jmp3_pause');
        return false;
      });

      matchedObjects.after($jmp3_content);

    });
  };
})(jQuery);

