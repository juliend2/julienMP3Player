(function($){

  var methods = {
    _loading: function(){
      // console.log(((this.bytesLoaded/this.bytesTotal)*100)+'%');
    },
    _playSound: function(soundID){
      soundManager.getSoundById(soundID).play();
    },
    _stopSound: function(soundID){
      soundManager.getSoundById(soundID).stop();
    },
    _getNextTrackFrom: function(trackIDs, currentTrackID){
      var currentIndex = trackIDs.indexOf(currentTrackID);
      if (trackIDs[currentIndex + 1]){ // does the next element exist?
        return trackIDs[currentIndex + 1];
      } else {
        // otherwise, we're at the end, so return the first one
        return trackIDs[0];
      }
    },
    _getPrevTrackFrom: function(trackIDs, currentTrackID){
      var currentIndex = trackIDs.indexOf(currentTrackID);
      if (trackIDs[currentIndex - 1]){ // does the previous element exist?
        return trackIDs[currentIndex + 1];
      } else {
        // otherwise, we're at the beginning, so return the last one
        return trackIDs[trackIDs.length - 1];
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

      $jmp3_content.find('.jmp3_play').bind('click.jmp3', function(){
        methods._playSound(currentSoundID); // play the current track
        return false;
      });

      $jmp3_content.find('.jmp3_stop').bind('click.jmp3', function(){
        methods._stopSound(currentSoundID); // stop the current track
        return false;
      });

      $jmp3_content.find('.jmp3_next').bind('click.jmp3', function(){
        methods._stopSound(currentSoundID); // stop the currently playing sound
        currentSoundID = methods._getNextTrackFrom(trackIDs, currentSoundID); // currentSoundID = next song
        methods._playSound(currentSoundID); // play the next track
        return false;
      });

      matchedObjects.after($jmp3_content);
    });
  };
})(jQuery);
