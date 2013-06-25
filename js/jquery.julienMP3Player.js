(function($){

  $.julienMP3Player = { version: '0.1.6' };

  var settings = {
    autoplay: false,
    playNextSoundOnFinish: true,
    hideTrackDetailsAfterPlay: 3, /* N (Number) seconds, or false (Boolean) to always show it */
    soundManagerSwfURL: './swf/', /* path (String), relative to your html page that contains the SWF files that are needed by SoundManager2 */
    soundManagerDebug: false, /* if true, displays the SoundManager2 debug info into the page and in the console */
    soundManagerHandleFlashBlock: true,
    soundManagerHTML5Audio: true,
    soundManagerFlashLoadTimeout: 1000,
    markup: '<div class="jmp3_container">\
              <a href="javascript:void(0);" class="jmp3_play" title="Play/Pause">Play</a>\
              <a href="javascript:void(0);" class="jmp3_stop" title="Stop">Stop</a>\
              <span class="jmp3_trackbar"><span class="jmp3_loaded"></span><span class="jmp3_playhead"></span></span>\
              <span class="jmp3_timer"></span>\
              <a href="javascript:void(0);" class="jmp3_prev" title="Previous">Previous</a>\
              <a href="javascript:void(0);" class="jmp3_next" title="Next">Next</a>\
              <a href="javascript:void(0);" class="jmp3_infos" title="Show track information">Infos</a>\
              <span class="jmp3_currentTrackDetails"></span>\
            </div>',
    afterInstanciate: function(){}, /* called right after instanciation of the player */
    afterPlay: function(){} /* called right after a song is played */
  },

  isPlaying = false,
  timeoutID = 0,

  methods = {
    _playSound: function(soundID){
      var that = this;
      isPlaying = true;
      methods._displaySong(soundID, this.jmp3_content);
      soundManager.getSoundById(soundID).play({
        onfinish: function(){
          isPlaying = false;
          that.jmp3_content.find('.jmp3_play').removeClass('jmp3_pause');
          that.currentSoundID = methods._getNextTrackFrom(that.trackIDs, that.currentSoundID);
          methods._playSound.apply(that, [that.currentSoundID, that.jmp3_content]);
        }
      });
      settings.afterPlay();
      if (this.jmp3_content.find('.jmp3_play').hasClass('jmp3_pause')){ // resume
      } else { // pause
        this.jmp3_content.find('.jmp3_play').addClass('jmp3_pause');
      }
    },
    _pauseSound: function(soundID, jmp3_content){
      isPlaying = false;
      soundManager.getSoundById(soundID).pause();
      jmp3_content.find('.jmp3_play').removeClass('jmp3_pause');
      clearTimeout(timeoutID);
    },
    _stopSound: function(soundID, jmp3_content, changeSong){
      isPlaying = false;
      changeSong = changeSong || false;
      soundManager.getSoundById(soundID).stop();
      jmp3_content.find('.jmp3_play').removeClass('jmp3_pause');
      if (! changeSong){
        jmp3_content.find('.jmp3_currentTrackDetails').fadeOut();
        jmp3_content.find('.jmp3_playhead').css({left: -(this.playheadWidth/2)});
      }
      clearTimeout(timeoutID);
    },
    _playheadStartDrag: function(event, ui) {
      // pause the current sound until we release the playhead
      methods._pauseSound(this.currentSoundID, this.jmp3_content);
    },
    _playheadStopDrag: function(event, ui) {
      var currentSound = soundManager.getSoundById(this.currentSoundID);
      var newPlayheadPosition = this.jmp3_content.find('.jmp3_playhead').offset().left;
      var newTrackPosition = currentSound.durationEstimate * (newPlayheadPosition - this.defaultSliderOffset) / this.trackbarWidth;
      currentSound.setPosition(newTrackPosition);
      methods._playSound.apply(this, [this.currentSoundID]);
    },
    _updateLoading: function(bytesLoaded, bytesTotal){
      this.jmp3_content.find('.jmp3_loaded').width(bytesLoaded / bytesTotal * this.trackbarWidth);
    },
    _updateTime: function(currentPosition, totalTime){
      // change the timer's value:
      this.jmp3_content.find('.jmp3_timer').text( methods._toMinutesAndSeconds(currentPosition / 1000) );
      // move the playhead:
      this.jmp3_content.find('.jmp3_playhead').css({left: (currentPosition / totalTime * this.trackbarWidth)-(this.playheadWidth/2)});
    },
    _getPrevTrackFrom: function(trackIDs, currentTrackID, jmp3_content){
      var currentIndex = $.inArray(currentIndex, trackIDs);
      if (trackIDs[currentIndex - 1]){ // does the previous element exist?
        return trackIDs[currentIndex - 1];
      } else {
        // otherwise, we're at the beginning
        return trackIDs[trackIDs.length - 1]; // so return the last one
      }
    },
    _getNextTrackFrom: function(trackIDs, currentTrackID, jmp3_content){
      var currentIndex = $.inArray(currentTrackID, trackIDs);
      if (trackIDs[currentIndex + 1]){ // does the next element exist?
        return trackIDs[currentIndex + 1];
      } else {
        // otherwise, we're at the end
        return trackIDs[0]; // so return the first one
      }
    },
    _displaySong: function(currentTrackID, jmp3_content, toggle){
      toggle = toggle || false;
      currentTrackDetails = jmp3_content.find('.jmp3_currentTrackDetails');
      if      ( toggle && currentTrackDetails.is(':hidden') ){
        currentTrackDetails.fadeIn();
        currentTrackDetails.text( $('.'+currentTrackID+':eq(0)').attr('title') );
      }
      else if ( toggle && !currentTrackDetails.is(':hidden') ) {
        currentTrackDetails.fadeOut();
      }
      else    {
        currentTrackDetails.fadeIn();
        currentTrackDetails.text( $('.'+currentTrackID+':eq(0)').attr('title') );
        this._fadeOutDetails(currentTrackDetails);
      }
    },
    _fadeOutDetails: function(currentTrackDetails){
      if (settings.hideTrackDetailsAfterPlay !== false) {
        timeoutID = setTimeout(function(){
          currentTrackDetails.fadeOut();
        }, settings.hideTrackDetailsAfterPlay * 1000);
      }
    },
    _toMinutesAndSeconds: function(number){
      var m = Math.floor(number / 60);
      var s = Math.floor(number % 60);
      return (m+":"+(s<10?"0":"")+s);
    }
  };

  $.fn.julienMP3Player = function(options){

    // We need SoundManager2 and jQuery ui
    if (!soundManager) {
      alert("You need to include SoundManager2 for this plugin to work.");
      return false;
    }
    if (!$.fn.draggable) {
      alert("You need to include jQuery UI's draggable plugin for this plugin to work.");
      return false;
    }

    return this.each(function(elementIndex){

      if (options){ // merge the settings
        $.extend(settings, options);
      }

      var tracks = [], trackIDs = [], matchedObjects = $(this), that = this;

      var privates = {
        jmp3_content: $(settings.markup),
        playheadWidth: null,
        trackbarWidth: null,
        defaultSliderOffset: null,
        currentSoundID: null,
        trackIDs: []
      };

      // inject the player's markup into the DOM
      matchedObjects.after(privates.jmp3_content);
      matchedObjects.hide(); // hide the UL markup

      // SoundManager2 options:
      soundManager.url = settings.soundManagerSwfURL;
      soundManager.debugMode = settings.soundManagerDebug;
      soundManager.useFlashBlock = settings.soundManagerHandleFlashBlock;
      soundManager.useHTML5Audio = settings.soundManagerHTML5Audio;
      // soundManager.debugFlash = true;
      soundManager.flashLoadTimeout = settings.soundManagerFlashLoadTimeout;
      soundManager.onerror = function() {
        soundManager.reboot(); // HACK FOR IE !!!!
      };
      soundManager.onload = function(){

        // add the songs from the UL into the tracks array
        matchedObjects.find('li>a').each(function(i){
          var songID = 'jmp3_song_'+elementIndex+'_'+i.toString();
          $(this).addClass(songID);
          privates.trackIDs.push(songID);
          var sound = soundManager.createSound({
            id: privates.trackIDs[privates.trackIDs.length-1],
            url: $(this).attr('href'),
            whileplaying: function(){
              methods._updateTime.apply(privates, [this.position, this.durationEstimate]);
            },
            whileloading: function(){
              methods._updateLoading.apply(privates, [this.bytesLoaded, this.bytesTotal]);
            }
          });
          $(this).addClass(privates.trackIDs[trackIDs.length-1]);
          tracks.push( sound );
        });

        privates.currentSoundID = tracks[0].sID;

        // play/pause current sound
        privates.jmp3_content.find('.jmp3_play').bind('click.jmp3', function(){
          if (isPlaying){
            methods._pauseSound(privates.currentSoundID, privates.jmp3_content); // pause the current track
          } else {
            methods._playSound.apply(privates, [privates.currentSoundID]); // play the current track
          }
          return false;
        });

        // stop current sound
        privates.jmp3_content.find('.jmp3_stop').bind('click.jmp3', function(){
          methods._stopSound.apply(privates, [privates.currentSoundID, privates.jmp3_content]); // stop the current track
          return false;
        });

        // play previous sound
        privates.jmp3_content.find('.jmp3_prev').bind('click.jmp3', function(){
          methods._stopSound(privates.currentSoundID, privates.jmp3_content, true); // stop the currently playing sound
          privates.currentSoundID = methods._getPrevTrackFrom(privates.trackIDs, privates.currentSoundID); // currentSoundID = previous song
          methods._playSound.apply(privates, [privates.currentSoundID]); // play the previous track
          return false;
        });

        // play next sound
        privates.jmp3_content.find('.jmp3_next').bind('click.jmp3', function(){
          methods._stopSound(privates.currentSoundID, privates.jmp3_content, true); // stop the currently playing sound
          privates.currentSoundID = methods._getNextTrackFrom(privates.trackIDs, privates.currentSoundID); // currentSoundID = next song
          methods._playSound.apply(privates, [privates.currentSoundID]); // play the next track
          return false;
        });

        // show track infos
        privates.jmp3_content.find('.jmp3_infos').bind('click.jmp3', function(){
          methods._displaySong(privates.currentSoundID, privates.jmp3_content, true);
          return false;
        });

        privates.jmp3_content.find('.jmp3_playhead').draggable({
          containment: 'parent', // ...which is .jmp3_trackbar
          axis: 'x',
          start: function(e, ui){
            methods._playheadStartDrag.apply(privates, [e, ui]);
          },
          stop: function(e, ui){
            methods._playheadStopDrag.apply(privates, [e, ui]);
          }
        });

        privates.defaultSliderOffset = privates.jmp3_content.find('.jmp3_playhead').offset().left;
        privates.trackbarWidth = privates.jmp3_content.find('.jmp3_trackbar').width();
        privates.playheadWidth = privates.jmp3_content.find('.jmp3_playhead').width();

        if (settings.autoplay){
          methods._playSound.apply(privates, [privates.currentSoundID]);
        }

        settings.afterInstanciate(); // call the callback
      }
    });
  };
})(jQuery);


