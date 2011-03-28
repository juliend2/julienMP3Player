(function($){

  $.julienMP3Player = {version: '0.1.1'};

  var settings = {
    autoplay: false,
    playNextSoundOnFinish: true,
    soundManagerSwfURL: './swf/',
    soundManagerDebug: false,
    markup: '<div class="jmp3_container">\
              <a href="#" class="jmp3_play">Play</a>\
              <a href="#" class="jmp3_stop">Stop</a>\
              <span class="jmp3_currentTrackName"></span>\
              <a href="#" class="jmp3_prev">Previous</a>\
              <a href="#" class="jmp3_next">Next</a>\
            </div>'
  },

  isPlaying = false,

  methods = {
    _loading: function(){
      // console.log(((this.bytesLoaded/this.bytesTotal)*100)+'%');
    },
    _playSound: function(soundID, jmp3_content){
      isPlaying = true;
      soundManager.getSoundById(soundID).play({
        onfinish: function(){
          isPlaying = false;
          jmp3_content.find('.jmp3_play').removeClass('jmp3_pause');
        }
      });
      if (!jmp3_content.find('.jmp3_play').hasClass('jmp3_pause')){
        jmp3_content.find('.jmp3_play').addClass('jmp3_pause');
      }
    },
    _pauseSound: function(soundID, jmp3_content){
      isPlaying = false;
      soundManager.getSoundById(soundID).pause();
      jmp3_content.find('.jmp3_play').removeClass('jmp3_pause');
    },
    _stopSound: function(soundID, jmp3_content){
      isPlaying = false;
      soundManager.getSoundById(soundID).stop();
      jmp3_content.find('.jmp3_play').removeClass('jmp3_pause');
    },
    _getPrevTrackFrom: function(trackIDs, currentTrackID, jmp3_content){
      var currentIndex = trackIDs.indexOf(currentTrackID);
      if (trackIDs[currentIndex - 1]){ // does the previous element exist?
        return trackIDs[currentIndex - 1];
      } else {
        // otherwise, we're at the beginning, so return the last one
        return trackIDs[trackIDs.length - 1];
      }
    },
    _getNextTrackFrom: function(trackIDs, currentTrackID, jmp3_content){
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

      // SoundManager2 options:
      soundManager.url = settings.soundManagerSwfURL;
      soundManager.debugMode = settings.soundManagerDebug;
      soundManager.onload = function(){

        function playSound(soundID, jmp3_content){
          isPlaying = true;
          soundManager.getSoundById(soundID).play({
            onfinish: function(){
              isPlaying = false;
              jmp3_content.find('.jmp3_play').removeClass('jmp3_pause');
              currentSoundID = methods._getNextTrackFrom(trackIDs, currentSoundID);
              playSound(currentSoundID, $jmp3_content);
            }
          });
          if (!jmp3_content.find('.jmp3_play').hasClass('jmp3_pause')){
            jmp3_content.find('.jmp3_play').addClass('jmp3_pause');
          }
        }

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
          if (isPlaying){
            methods._pauseSound(currentSoundID, $jmp3_content); // pause the current track
          } else {
            playSound(currentSoundID, $jmp3_content); // play the current track
          }
          return false;
        });

        // stop current sound
        $jmp3_content.find('.jmp3_stop').bind('click.jmp3', function(){
          methods._stopSound(currentSoundID, $jmp3_content); // stop the current track
          return false;
        });

        // play previous sound
        $jmp3_content.find('.jmp3_prev').bind('click.jmp3', function(){
          methods._stopSound(currentSoundID, $jmp3_content); // stop the currently playing sound
          currentSoundID = methods._getPrevTrackFrom(trackIDs, currentSoundID); // currentSoundID = previous song
          playSound(currentSoundID, $jmp3_content); // play the previous track
          return false;
        });

        // play next sound
        $jmp3_content.find('.jmp3_next').bind('click.jmp3', function(){
          methods._stopSound(currentSoundID, $jmp3_content); // stop the currently playing sound
          currentSoundID = methods._getNextTrackFrom(trackIDs, currentSoundID); // currentSoundID = next song
          playSound(currentSoundID, $jmp3_content); // play the next track
          return false;
        });

        matchedObjects.after($jmp3_content);

        if (settings.autoplay){
          playSound(currentSoundID, $jmp3_content);
        }

      }
    });
  };
})(jQuery);

