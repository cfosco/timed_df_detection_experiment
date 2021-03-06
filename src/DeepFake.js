import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Button, Popover, Typography } from '@material-ui/core';
import Slider from 'rc-slider';
import Tooltip from 'rc-tooltip';
import 'rc-slider/assets/index.css';

import { Progress } from 'react-sweet-progress';
import "react-sweet-progress/lib/style.css";

import PlusIcon from './plus.png';
import PlusIconBig from './plus_big.png';
import tmp from './jsons_2vig/json_0.json';
import $ from 'jquery';

import { Dropbox } from 'dropbox';
const accessToken = 'R8MlER2022sAAAAAAAAAAeAjhJAqaBrMcjUe3EOrJLfcvEXpIQm7PeAigVqKM0hy';
const dbx = new Dropbox({
  accessToken
});

const MTURK_SUBMIT_SUFFIX = "/mturk/externalSubmit";
const JSON_IDENTIFIER = 'data'

const styles = theme => ({
  root: {
    display: 'flex',
    width: '100vw',
    height: '100vh',
    alignItems: 'center',
    justifyContent: 'space-around',
    flexDirection: 'column',
  },
  irb: {
    width: "70%",
    fontSize: "0.45em",
    textAlign: "center",
    color: "gray",
    padding: 16,
  },
  bottomSection: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '90%',
  },
  fixationCross: {
    width: 32,
    height: 32,
  },
  levelProgress: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  popover: {
    padding: 16,
  },
  progressSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  },
  gazeButton: {
    borderRadius: 16,
    fontSize: 36,
    marginLeft: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  startButton: {
    borderRadius: 16,
    fontSize: 30,
    marginRight: 0,
    marginTop: 8,
    marginBottom: 8,
  },
  videoContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    padding: 8,
  },
  videoContainerSelected: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    padding: 8,
    backgroundColor: 'lightblue',
  },
  videoDisplaySection: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 376,
  },
  questionDisplaySection: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 376,
    width: '90%',
  },
  videoSection: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
});

const Handle = Slider.Handle;
const handle = (props) => {
  const { value, dragging, index, ...restProps } = props;
  return (
    <Tooltip
      prefixCls="rc-slider-tooltip"
      overlay={value}
      visible={dragging}
      placement="top"
      key={index}
    >
      <Handle value={value} {...restProps} />
    </Tooltip>
  );
};


class Experiment extends Component {
  constructor(props){
    super(props);
    this.state = {
      anchorEl: null,
      buttonText: 'START',
      currentLevel: 1,
      currentVideoIndex: 1,
      currentVideo: tmp["level0"][0]["url"],
      currentVideoInterval: tmp["level0"][0]["time"],
      currentVideoLabel: tmp["level0"][0]["label"],
      overclick: false,
      percentLevelCompletion: Math.round(Math.min((0) / tmp["level0"].length * 100, 100)),
      showGame: false,
      showQuestion: false,
      showSubmit: false,
      showEnd: false,
      showButton: false,
      startLoadingVideo: false,
      time: performance.now(),
      timer: performance.now(),
      response_times: [],
      videoChoices: [],
      videoSize: 360,
      videoData: tmp,
      maxLevels: Object.keys(tmp).length,
      maxVideos: tmp["level0"].length,
      responseButtonDisabled: false,
      mainButtonDisabled: false,
    };


    this._loadNextVideo = this._loadNextVideo.bind(this);
    this._loadNextLevel = this._loadNextLevel.bind(this);

    this._handleClick = this._handleClick.bind(this);
    this._handleClose = this._handleClose.bind(this);
    this._handleFakeButton = this._handleFakeButton.bind(this);
    this._handleRealButton = this._handleRealButton.bind(this);  
    this._handleResponseButton = this._handleResponseButton.bind(this);
    this._handleStartButton = this._handleStartButton.bind(this);
    this._handleSubmitButton = this._handleSubmitButton.bind(this);
    this._gup = this._gup.bind(this);
    this._submitHITform = this._submitHITform.bind(this);
    this._addHiddenField = this._addHiddenField.bind(this);
    this._onLoadedVideo = this._onLoadedVideo.bind(this);
  }

  _gup(name) {
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var tmpURL = window.location.href;
    var results = regex.exec(tmpURL);
    if (results == null) return "";
    else return results[1];
  }


  componentDidMount(){
    var url = window.location.href;
    if (url.indexOf(JSON_IDENTIFIER) > 0) {
      console.log("Trying to locate file");
      var file = this._gup(JSON_IDENTIFIER);
      console.log("Using json file: " + file);
      var data = require('./jsons_2vig/' + file);
      this.state.videoData = data
      this.setState({
        maxLevels: Object.keys(this.state.videoData).length,
        maxVideos: this.state.videoData["level0"].length,
        percentLevelCompletion: Math.round(Math.min((0) / this.state.videoData["level0"].length * 100, 100)),
        currentVideo: this.state.videoData["level0"][0]["url"],
        currentVideoInterval: this.state.videoData["level0"][0]["time"],
        currentVideoLabel: this.state.videoData["level0"][0]["label"],
      })
    }
    else {
      console.log("USING DEFAULT JSON FILE (./jsons_2vig/json_0.json)");
    }
    console.log("Using the following video data for this HIT: ", this.state.videoData);
    document.getElementById('instruction-button').click();
  }

  componentDidUpdate(){}

  componentWillUnmount() {
    clearInterval(this.interval);
    // document.removeEventListener("keydown", this._handleKeyDown);
  }


  _makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  _handleClick(e) {
    this.setState({anchorEl: e.currentTarget});
  }

  _handleClose() {
    this.setState({anchorEl: null});
  }


  _handleStartButton() {
    // Handles the start button: starts countdown and shows first deepfake

    if (this.state.buttonText !== 'START' || this.state.mainButtonDisabled) { return; }

    console.log("entering _handleStartButton")


    this.setState({mainButtonDisabled: true, buttonText: "3 | Please focus on the fixation cross"});
    setTimeout(() => this.setState({buttonText: "2 | Please focus on the fixation cross"}), 1000);
    setTimeout(() => this.setState({buttonText: "1 | Please focus on the fixation cross"}), 2000);
    setTimeout(() => this.setState({showGame: true, buttonText: 'NEXT LEVEL', timer: performance.now()}), 3000);
  }

  _handleFakeButton() {
    // This handles the FAKE option after video is shown
    this._handleResponseButton('FAKE');
  }

  _handleRealButton() {
    // This handles the REAL option after video is shown
    this._handleResponseButton('REAL');
  }

  _handleResponseButton(resp) {
    // General function to handle clicking either FAKE or REAL

    // If button disabled, do nothing
    if (this.state.responseButtonDisabled) {
      return;
    }

    // Disable button to avoid double clicking
    this.setState({responseButtonDisabled: true});

    // Compute response_time
    let response_time = performance.now() - this.state.timer

    // Push response to videoChoices
    this.state.videoChoices.push({'response': resp, 
                                  'response_time': response_time, 
                                  'video': this.state.currentVideo, 
                                  'pres_time': this.state.currentVideoInterval, 
                                  'label':this.state.currentVideoLabel});
    
    // Update level completion
    this.setState({
      percentLevelCompletion: this.state.percentLevelCompletion + 100/this.state.maxVideos,
    });

    // Debugging logs
    console.log("length of videoChoices: ", this.state.videoChoices.length)

    // Load next video after a few miliseconds (better UX, feels smoother)
    setTimeout(() => this._loadNextVideo(), 150);
  }

  _handleSubmitButton() {
    // This handles the submit button logic
    console.log("entering _handleSubmitButton")
    if (this.state.mainButtonDisabled === true) { return; }

    if (this.state.currentLevel < this.state.maxLevels) {
      this._loadNextLevel();
    } else {
      console.log("entering SUBMIT portion of _handleSubmitButton")
      // var res = {'videoChoices': this.state.videoChoices, 'response_times': this.state.reponse_times};
      this.setState({showSubmit: false, showQuestion: false, showEnd: true, mainButtonDisabled: true});
      this._submitHITform();
      
      // Prepare for dropbox
      let hitId = this._gup("HITId");
      let assigId = this._gup("assignmentId");
      let workerId = this._gup("workerId");

      var url = window.location.href;
      if (url.indexOf(JSON_IDENTIFIER) > 0) {
        var current_json = this._gup(JSON_IDENTIFIER).split('.')[0]
      } else {
        var current_json = 'default'
      }

      var res = { 'HITId': hitId, 
                  'AssignmentId': assigId,
                  'WorkerId': workerId,
                  'json': current_json,
                  'results': this.state.videoChoices}
      var dbxJSON = JSON.stringify(res);
      var dbx_name = 'HITId_' + hitId + '_workerId_' + workerId + '_' + current_json

      // Upload to dropbox
      dbx.filesUpload({path: '/' + dbx_name + '.json', contents: dbxJSON})
      //  .then(function(response) {
      //    alert("Thank you for completing the game.");
      //  })
       .catch(function(error) {
         console.log("error: ", error);
       });
    }
  }

  _submitHITform() {
    // this.setState({disabled: true, overclick: true});
    var submitUrl = decodeURIComponent(this._gup("turkSubmitTo")) + MTURK_SUBMIT_SUFFIX;
    var form = $("#submit-form");

    console.log("submitUrl: ", submitUrl);
    console.log("Gup output for assignmentId, workerId:", this._gup("assignmentId"),this._gup("workerId"))

    this._addHiddenField(form, 'assignmentId', this._gup("assignmentId"));
    this._addHiddenField(form, 'workerId', this._gup("workerId"));
    this._addHiddenField(form, 'json', this._gup(JSON_IDENTIFIER));
    // this._addHiddenField(form, 'taskTime', (Date.now() - this.state.timer)/1000);
    // this._addHiddenField(form, 'feedback', $("#feedback-input").val());
    this._addHiddenField(form, 'results', JSON.stringify(this.state.videoChoices));
    // $("#submit-form").attr("action", submitUrl);
    // $("#submit-form").attr("method", "POST");
    // $("#submit-form").submit();
  }

  _addHiddenField(form, name, value) {
    // form is a jQuery object, name and value are strings
    var input = $("<input type='hidden' name='" + name + "' value=''>");
    input.val(value);
    form.append(input);
  }

  _loadNextVideo() {
    // Loads next video after clicking a REAL or FAKE button inside a level
    // If there are no more videos, show submit button and return

    if (Math.round(this.state.percentLevelCompletion) >= 100) {
      this.setState({percentLevelCompletion: 100});
      console.log("Level completed. Loading next level")
      if (this.state.currentLevel < this.state.maxLevels) {
        this.setState({mainButtonDisabled: false, buttonText: "NEXT LEVEL"});
      } else {
        this.setState({mainButtonDisabled: false, buttonText: "SUBMIT"});
      }
      this.setState({showSubmit: true});
      return;
    }


    console.log("entering _loadNextVideo")
    var videoData = this.state.videoData["level"+(this.state.currentLevel-1)][this.state.currentVideoIndex];

    // console.log("New video loaded: ", videoData)

    if(videoData === undefined) {
      return;
    }

    // Setting the current video data into the state
    this.setState({currentVideo: videoData["url"],
      currentVideoInterval: videoData["time"],
      currentVideoLabel: videoData["label"],
      currentVideoIndex: this.state.currentVideoIndex + 1})

    // this.setState({showGame: true, showQuestion: false, overclick: false});

    // Hiding the Game and showing button countdown
    this.setState({showGame: false, showQuestion: false, buttonText: "3 | Please focus on the fixation cross"});
    setTimeout(() => this.setState({buttonText: "2 | Please focus on the fixation cross"}), 1000);
    setTimeout(() => this.setState({buttonText: "1 | Please focus on the fixation cross"}), 2000);
    setTimeout(() => this.setState({
      showGame: true,
      showQuestion: false,
      timer: performance.now(),
      // currentVideo: videoData["url"],
      // currentVideoInterval: videoData["time"],
      // currentVideoLabel: videoData["label"],
      // currentVideoIndex: this.state.currentVideoIndex + 1,
      overclick: false,
    }), 3000);

    // setTimeout(() => this.setState({showVideo: true}), 4000);
    
    // console.log(videoData)
    console.log("current video interval: " + this.state.currentVideoInterval)
    // setTimeout(() => this.setState({showGame: false, showQuestion: true}), this.state.currentVideoInterval + 3000)

    // document.addEventListener("keydown", this._handleKeyDown);
  }

  _onLoadedVideo() {
    // This is called when the video is loaded
    console.log('Video is loaded!')
    setTimeout(() => this.setState({showGame: false, showQuestion: true, responseButtonDisabled: false}), this.state.currentVideoInterval);
  
  }

  _loadNextLevel() {
    console.log("entering _loadNextLevel")
    this.setState({
      currentLevel: this.state.currentLevel + 1,
      percentLevelCompletion: 0,
      showGame: true,
      buttonText: 'NEXT LEVEL',
      timer: performance.now(),
      showSubmit: false,
      currentVideoIndex: 0,
      mainButtonDisabled: true,
    }, () => this._loadNextVideo())
    // if (this.state.currentLevel >= this.state.maxLevels) {
    //   this.setState({buttonText: 'SUBMIT'})
    // }
  }


  render() {
    const {classes} = this.props;
    const { buttonText, currentLevel,
            percentLevelCompletion, showGame, showQuestion, showSubmit, showButton,
            currentVideo, responseButtonDisabled, mainButtonDisabled,
            videoSize, videoDistance, showEnd,
            maxLevels, maxVideos, anchorEl } = this.state;
    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;

    return (
      <div className={classes.root}>
        <div className={classes.progressSection}>
          <Typography variant="h2" gutterBottom align="center" style={{fontSize: "40px"}}>
            Timed Deepfake Detection Experiment
          </Typography>
          <Button id="instruction-button" variant="contained" color="primary" onClick={this._handleClick}>Instructions</Button>
          <Popover
            id={id}
            open={open}
            anchorEl={anchorEl}
            onClose={this._handleClose}
            className={classes.popover}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'center',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'center',
            }}
          >
            <Typography variant="subtitle1" align="center" style={{padding: 32}}>
              <b>Instructions:</b> 
              You will be shown short videos of faces. Some of them are <b style={{color: "darkblue"}}>deepfakes</b>: the face in the original video has been swapped with a different face by a computer. <br />
 
              <u>Your task is to determine whether the videos shown are real or deepfakes.</u> To spot the deepfakes, look for distortions that make something feel unnatural about the way the faces move or look. <br />
              
              Videos will be shown for <b>varying amounts of time</b>: some of them will appear for 3-5 seconds, while others will be <b>much faster</b>, and only appear for 300-500 milliseconds. Stay alert! :) <br />
              
              After seeing a video, you will be asked if what you saw was real or fake. You won't be able to rewatch the video. <br />

              <br/>
              <b>The videos you will be shown will look like the ones below.</b> Be vigilant: some fake videos look a lot like real ones! All of these examples are FAKE VIDEOS.
              Use the examples below as references to try to spot fakes as best you can.
              <br />

              <video
                    preload="auto"
                    poster={PlusIconBig}
                    id="main-video"
                    style={{height: videoSize}}
                    src="http://visiongpu23.csail.mit.edu/scratch/datasets/DeepfakeDetection/facenet_smooth_frames/dfdc_train_part_0/aymlynzeni.mp4/face_0.mp4"
                    type="video/mp4"
                    autoPlay
                    loop
                    muted
              />
              <video
                    preload="auto"
                    poster={PlusIconBig}
                    id="main-video"
                    style={{height: videoSize}}
                    src="http://visiongpu23.csail.mit.edu/scratch/datasets/DeepfakeDetection/facenet_smooth_frames/dfdc_train_part_1/wgzrhqihqt.mp4/face_0.mp4"
                    type="video/mp4"
                    autoPlay
                    loop
                    muted
              />
              <video
                    preload="auto"
                    poster={PlusIconBig}
                    id="main-video"
                    style={{height: videoSize}}
                    src="http://visiongpu23.csail.mit.edu/scratch/datasets/DeepfakeDetection/facenet_smooth_frames/dfdc_train_part_2/jtuiddncpo.mp4/face_0.mp4"
                    type="video/mp4"
                    autoPlay
                    loop
                    muted
              />

              <br/>
              
              There are {maxLevels} levels with {maxVideos} videos per level. Each level should take less than two minutes. You can take breaks between levels. Good luck! 

            </Typography>
          </Popover>
          <Typography variant="h5" style={{marginTop: 32, marginBottom: 12}}>
            Current Level: {currentLevel} / {maxLevels}
          </Typography>
          <div className={classes.levelProgress}>
            <Typography variant="caption">
              Level Progress:
            </Typography>
            <Progress
              style={{width: '70%', marginLeft: 8}}
              percent={Math.ceil(percentLevelCompletion)}
              theme={{
                active: {
                  symbol: Math.ceil(percentLevelCompletion) + '%',
                  color: 'green'
                },
                success: {
                  symbol: Math.ceil(percentLevelCompletion) + '%',
                  color: 'green'
                }
              }}
            />
          </div>
        </div>

        <div className={classes.videoSection}>
            {
            showGame &&
            <React.Fragment>
              <div className={classes.videoDisplaySection}>
                <div className={classes.videoContainer}
                     style={{width: videoSize, height: videoSize}}>
                  <video
                    preload="auto"
                    poster={PlusIconBig}
                    id="main-video"
                    style={{height: videoSize}}
                    src={currentVideo}
                    type="video/mp4"
                    autoPlay
                    loop
                    muted
                    onLoadStart={() => {
                      console.log('...I am loading...')
                    }}
                    onLoadedData={this._onLoadedVideo}
                    />
                </div>
                
              </div>
            </React.Fragment>

          }
          {
            showQuestion && !showSubmit &&

          <React.Fragment>
            <div className={classes.questionDisplaySection}>
              <h2> Was the video fake or real? </h2>
              <div className={classes.videoContainer}>
              <Button disabled={responseButtonDisabled} variant="contained" className={classes.startButton} onClick={this._handleFakeButton} style={{margin:32}}>
                Fake
              </Button>
              <Button disabled={responseButtonDisabled} variant="contained" className={classes.startButton} onClick={this._handleRealButton} style={{margin:32}}>
                Real
              </Button>
              </div>
            </div>
          </React.Fragment>


        }

        {
          !showGame && !showQuestion && !showEnd &&
            <div className={classes.questionDisplaySection}>
              <img src={PlusIcon} className={classes.fixationCross}
               style={{marginLeft: videoDistance, marginRight: videoDistance}}/>
            </div>
        }

        </div>

        <div className={classes.bottomSection}>
          {
            !showGame && !showQuestion && !showEnd &&
            <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
              <Button disabled={mainButtonDisabled} variant="contained" className={classes.startButton} onClick={this._handleStartButton}>
                {buttonText}
              </Button>
            </div>
          }
          {
            showSubmit &&
            <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
              <Button disabled={mainButtonDisabled} variant="contained" className={classes.startButton} onClick={this._handleSubmitButton}>
                {buttonText}
              </Button>
            </div>
          }
          {
            showEnd &&
            <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
              <Typography variant="h5">
                Thank you for completing the game!
              </Typography> 
            </div>
          }

        </div>

        <form id="submit-form" name="submit-form">
        </form>
        <Typography className={classes.irb} variant="caption">
          This HIT is part of a MIT scientific research project. Your decision to complete this HIT is voluntary. 
          There is no way for us to identify you. The only information we will have, in addition to your responses, 
          is the time at which you completed the study. The results of the research may be presented at scientific 
          meetings or published in scientific journals. Clicking on the 'SUBMIT' button at the end of the experiment 
          indicates that you are at least 18 years of age and agree to complete this HIT voluntarily.
        </Typography>
      </div>
    );
  }

}




export default withStyles(styles)(Experiment);
