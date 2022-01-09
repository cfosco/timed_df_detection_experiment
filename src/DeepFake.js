import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Button, Popover, Typography } from '@material-ui/core';
import Slider from 'rc-slider';
import Tooltip from 'rc-tooltip';
import 'rc-slider/assets/index.css';

import { Progress } from 'react-sweet-progress';
import "react-sweet-progress/lib/style.css";

import PlusIcon from './plus.png';
import tmp from './jsons/json_4.json';

import { Dropbox } from 'dropbox';
const accessToken = 'sl.A8Q-9WfT_O8acNTt_T6RMM8CAfI46PqcmDdj9Spw2W5Kv5yWFXeg3cV2zGZyDMAUSj3-SXpcFz1vx2lXiLoqLSrqfoa7yfns7w-HsE6X__qTCvsxXW3u1RxUQAuxpRK3t-aDR3Q';
const dbx = new Dropbox({
  accessToken
});

const styles = theme => ({
  root: {
    display: 'flex',
    width: '100vw',
    height: '100vh',
    alignItems: 'center',
    justifyContent: 'space-around',
    flexDirection: 'column',
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
      // disabled: true,
      // left: false,
      // leftVideo: 'fake',
      overclick: false,
      // nullify: [],
      percentLevelCompletion: Math.round(Math.min((0) / tmp["level0"].length * 100, 100)),
      // right: false,
      // rightVideo: 'real',
      showGame: false,
      showQuestion: false,
      showSubmit: false,
      showEnd: false,
      showButton: false,
      // showVideo: false,
      startLoadingVideo: false,
      time: performance.now(),
      timer: performance.now(),
      // times: [],
      response_times: [],
      videoChoices: [],
      // videoDistance: 32,
      videoSize: 360,
      videoData: tmp,
      maxLevels: Object.keys(tmp).length,
      maxVideos: tmp["level0"].length,
    };


    this._loadNextVideo = this._loadNextVideo.bind(this);
    this._loadNextLevel = this._loadNextLevel.bind(this);

    this._handleClick = this._handleClick.bind(this);
    this._handleClose = this._handleClose.bind(this);
    this._handleYesButton = this._handleYesButton.bind(this);
    this._handleNoButton = this._handleNoButton.bind(this);
    this._handleNoButton = this._handleNoButton.bind(this);
    // this._handleKeyDown = this._handleKeyDown.bind(this);
    // this._handleLeftKeyPressed = this._handleLeftKeyPressed.bind(this);
    // this._handleRightKeyPressed = this._handleRightKeyPressed.bind(this);
    this._handleStartButton = this._handleStartButton.bind(this);
    this._handleSubmitButton = this._handleSubmitButton.bind(this);
    // this._handleNullify = this._handleNullify.bind(this);

  }


  componentDidMount(){
    var url = window.location.href;
    var identifier = "data=";
    if (url.indexOf(identifier) > 0) {
      var file = url.substring(url.indexOf(identifier) + identifier.length);
      console.log("Using file: " + file);
      var data = require('./jsons/' + file);
      this.setState({videoData: data}, () => this.setState({
        maxLevels: Object.keys(this.state.videoData).length,
        maxVideos: this.state.videoData["level0"].length,
        percentLevelCompletion: Math.round(Math.min((0) / this.state.videoData["level0"].length * 100, 100)),
        currentVideo: this.state.videoData["level0"][0]["url"],
        currentVideoInterval: this.state.videoData["level0"][0]["time"],
      }))
    }
    document.getElementById('instruction-button').click();
    // this.interval = setInterval(() => this.setState({ time: Date.now() }, () => {
    //   var leftVideoPlayer = document.getElementById("left-video");
    //   var rightVideoPlayer = document.getElementById("right-video");
    //   if (leftVideoPlayer && leftVideoPlayer.currentTime > 3) {
    //     leftVideoPlayer.currentTime = 0;
    //   }
    //   if (rightVideoPlayer && rightVideoPlayer.currentTime > 3) {
    //     rightVideoPlayer.currentTime = 0;
    //   }
    // }), 1000);
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

    console.log("entering _handleStartButton")
    console.log(this.state.buttonText )

    if (this.state.buttonText !== 'START') { return; }

    this.setState({buttonText: 3})
    setTimeout(() => this.setState({buttonText: 2}), 1000);
    setTimeout(() => this.setState({buttonText: 1}), 2000);
    setTimeout(() => this.setState({showGame: true, buttonText: 'NEXT LEVEL'}), 3000);

    setTimeout(() => this.setState({showGame: false, showQuestion: true}), this.state.currentVideoInterval + 3000)
    // setTimeout(() => document.addEventListener("keydown", this._handleKeyDown), 3000);

  }

  _handleYesButton() {
    // This handles the YES option after deepfakes are shown
    let response_time = performance.now() - this.state.timer
    this.state.response_times.push(response_time);
    this.state.videoChoices.push({'response': 'yes', 'response_time': response_time, 'video': this.state.currentVideo});

    this.setState({
      percentLevelCompletion: this.state.percentLevelCompletion + 100/this.state.maxVideos,
    });
    setTimeout(() => this._loadNextVideo(), 500);
  }


  _handleNoButton() {
    // This handles the NO option after deepfakes are shown
    // Should start a new deepfake showingright after this one
    let response_time = performance.now() - this.state.timer
    this.state.response_times.push(response_time);
    this.state.videoChoices.push({'response': 'no', 'response_time': response_time, 'video': this.state.currentVideo, 'pres_time': this.state.currentVideoInterval, 'label':this.state.currentVideoLabel});
    this.setState({
      percentLevelCompletion: this.state.percentLevelCompletion + 100/this.state.maxVideos,
    });
    setTimeout(() => this._loadNextVideo(), 500);

  }

  _handleSubmitButton() {
    // This handles the submit button logic
    console.log("entering _handleSubmitButton")
    if (this.state.currentLevel < this.state.maxLevels) {
      this._loadNextLevel();
    } else {
      console.log("entering SUBMIT portion of _handleSubmitButton")
      // var res = {'videoChoices': this.state.videoChoices, 'response_times': this.state.reponse_times};
      var myJSON = JSON.stringify(this.state.videoChoices);
      this.setState({showSubmit: false, showQuestion: false, showEnd: true, disabled: true});
      dbx.filesUpload({path: '/' + this._makeid(20) + '.json', contents: myJSON})
       .then(function(response) {
         alert("Thank you for completing the game.");
       })
       .catch(function(error) {
         console.log("error: ", error);
       });
    }
  }


  _loadNextVideo() {
    // Loads next video after clicking a Yes or a No inside a level
    // If there are no more videos, show submit button and return

    if (this.state.percentLevelCompletion === 100) {
      if (this.state.currentLevel < this.state.maxLevels) {
        this.setState({buttonText: "NEXT LEVEL"});
      } else {
        this.setState({buttonText: "SUBMIT"});
      }
      this.setState({showSubmit: true});
      return;
    }
    var videoData = this.state.videoData["level"+(this.state.currentLevel-1)][this.state.currentVideoIndex];

    if(videoData === undefined) {
      return;
    }

    this.setState({currentVideo: videoData["url"],
      currentVideoInterval: videoData["time"],
      currentVideoLabel: videoData["label"],
      currentVideoIndex: this.state.currentVideoIndex + 1})

    this.setState({showGame: true, showQuestion: false, overclick: false});

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
    }, () => this._loadNextVideo())
    // if (this.state.currentLevel >= this.state.maxLevels) {
    //   this.setState({buttonText: 'SUBMIT'})
    // }
  }

  render() {
    const {classes} = this.props;
    const { buttonText, currentLevel,
            percentLevelCompletion, showGame, showQuestion, showSubmit, showButton,
            currentVideo,
            videoSize, videoDistance, showEnd, disabled,
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
              <b>Instructions:</b> You will be shown short videos of faces. Some of them are  <t style={{color: "darkblue"}}>deepfakes</t>: the real face has been swapped with a different face. <br />
              Your task is to determine whether the videos shown are real or deepfakes. Focus on artifacts and search for any distortions in the video to spot the fakes.<br />

              Videos will be shown for <b>varying amounts of time</b>: some of them will appear for 3-5 seconds, 
              while others will be <b>much faster</b>, and only appear for 300-500 milliseconds. Stay alert! :)<br/>

              After seeing a video, you will be asked if what you saw was real or fake. You won't be able to rewatch the video. <br />

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
                    poster="./src/plus.png"
                    id="main-video"
                    style={{height: videoSize}}
                    src={currentVideo}
                    type="video/mp4"
                    autoPlay
                    loop
                    muted
                    onLoadStart={() => {
                      console.log('...I am loading...')
                      // this.setState({ videoSize: 0 });
                      // this.setState({showGame:false, showQuestion:false, buttonText: "3 | Please focus on the fixation cross"});
                      // setTimeout(() => this.setState({buttonText: "2 | Please focus on the fixation cross"}), 1000);
                      // setTimeout(() => this.setState({buttonText: "1 | Please focus on the fixation cross"}), 2000);
                      // setTimeout(() => this.setState({
                      //   showGame: true,
                      //   showQuestion: false,
                      //   timer: performance.now(),
                      //   overclick: false,
                      // }), 3000);
                    }}
                    onLoadedData={() => {
                        console.log('Data is loaded!')
                        // this.setState({ videoSize: 360 });
                        setTimeout(() => this.setState({showGame: false, showQuestion: true}), this.state.currentVideoInterval);
                    }}
                    />
                </div>
                
              </div>
            </React.Fragment>

          }
          {
            showQuestion && !showSubmit &&

          <React.Fragment>
            <div className={classes.questionDisplaySection}>
              <h2> Was the video fake? </h2>
              <div className={classes.videoContainer}>
              <Button variant="contained" className={classes.startButton} onClick={this._handleYesButton} style={{margin:32}}>
                Yes
              </Button>
              <Button variant="contained" className={classes.startButton} onClick={this._handleNoButton} style={{margin:32}}>
                No
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
              <Button disabled={disabled} variant="contained" className={classes.startButton} onClick={this._handleStartButton}>
                {buttonText}
              </Button>
            </div>
          }
          {
            showSubmit &&
            <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
              <Button disabled={disabled} variant="contained" className={classes.startButton} onClick={this._handleSubmitButton}>
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
      </div>
    );
  }

}
























































// DEPRECATED
class DeepFake extends Component {
  constructor(props){
    super(props);
    this.state = {
      anchorEl: null,
      buttonText: 'START',
      currentLevel: 1,
      currentVideoIndex: 1,
      currentVideoPair: tmp[0][0],
      disabled: true,
      left: false,
      leftVideo: 'fake',
      overclick: false,
      nullify: [],
      percent: Math.round(Math.min((0) / tmp[0].length * 100, 100)),
      right: false,
      rightVideo: 'real',
      showGame: false,
      time: performance.now(),
      timer: performance.now(),
      times: [],
      videoChoices: [],
      videoDistance: 32,
      videoSize: 360,
      videoData: tmp,
      maxLevels: Object.keys(tmp).length,
      maxImages: tmp[0].length,
    };

    console.log("constructor called")

    this._loadNextVideoPair = this._loadNextVideoPair.bind(this);
    this._loadNextLevel = this._loadNextLevel.bind(this);

    this._handleClick = this._handleClick.bind(this);
    this._handleClose = this._handleClose.bind(this);
    this._handleKeyDown = this._handleKeyDown.bind(this);
    this._handleLeftKeyPressed = this._handleLeftKeyPressed.bind(this);
    this._handleRightKeyPressed = this._handleRightKeyPressed.bind(this);
    this._handleStartButton = this._handleStartButton.bind(this);
    this._handleSubmitButton = this._handleSubmitButton.bind(this);
    this._handleNullify = this._handleNullify.bind(this);
  }

  componentDidMount(){
    var url = window.location.href;
    var identifier = "data=";
    if (url.indexOf(identifier) > 0) {
      var file = url.substring(url.indexOf(identifier) + identifier.length);
      var data = require('./' + file);
      this.setState({videoData: data}, () => this.setState({
        maxLevels: Object.keys(this.state.videoData).length,
        maxImages: this.state.videoData[0].length,
        percent: Math.round(Math.min((0) / this.state.videoData[0].length * 100, 100)),
        currentVideoPair: this.state.videoData[0][0],
      }))
    }
    document.getElementById('instruction-button').click();
    this.interval = setInterval(() => this.setState({ time: Date.now() }, () => {
      var leftVideoPlayer = document.getElementById("left-video");
      var rightVideoPlayer = document.getElementById("right-video");
      if (leftVideoPlayer && leftVideoPlayer.currentTime > 3) {
        leftVideoPlayer.currentTime = 0;
      }
      if (rightVideoPlayer && rightVideoPlayer.currentTime > 3) {
        rightVideoPlayer.currentTime = 0;
      }
    }), 1000);
  }

  componentDidUpdate(){}

  componentWillUnmount() {
    clearInterval(this.interval);
    document.removeEventListener("keydown", this._handleKeyDown);
  }

  _handleClick(e) {
    this.setState({anchorEl: e.currentTarget});
  }

  _handleClose() {
    this.setState({anchorEl: null});
  }

  _handleKeyDown = (event) => {
    document.removeEventListener("keydown", this._handleKeyDown);
    console.log(this.state.videoChoices);
    if (this.state.percent === 100) { return; }
    switch(event.keyCode) {
      case 32:
        this._handleNullify();
        break;
      case 37: // Left arrow keycode
        this._handleLeftKeyPressed();
        break;
      case 39: // Right arrow keycode
        this._handleRightKeyPressed();
        break;
      default:
        document.addEventListener("keydown", this._handleKeyDown);
        break
    }
  }

  _handleLeftKeyPressed() {
    this.state.times.push(performance.now() - this.state.timer);
    this.state.videoChoices.push({'choice': this.state.leftVideo, 'left': this.state.leftVideo, 'right': this.state.rightVideo, 'videoPair': this.state.currentVideoPair});
    this.setState({
      left: true,
      percent: this.state.percent + 100/this.state.maxImages,
    });
    setTimeout(() => this._loadNextVideoPair(), 500);
  }

  _handleRightKeyPressed() {
    this.state.times.push(performance.now() - this.state.timer);
    this.state.videoChoices.push({'choice': this.state.rightVideo, 'left': this.state.leftVideo, 'right': this.state.rightVideo, 'videoPair': this.state.currentVideoPair});
    this.setState({
      right: true,
      percent: this.state.percent + 100/this.state.maxImages,
    });
    setTimeout(() => this._loadNextVideoPair(), 500);
  }

  _handleStartButton() {
    if (this.state.buttonText !== 'START') { return; }

    this.setState({buttonText: 3})
    setTimeout(() => this.setState({buttonText: 2}), 1000);
    setTimeout(() => this.setState({buttonText: 1}), 2000);
    setTimeout(() => this.setState({showGame: true, buttonText: 'NEXT LEVEL'}), 3000);
    setTimeout(() => document.addEventListener("keydown", this._handleKeyDown), 3000);

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

  _handleSubmitButton() {
    if (this.state.buttonText === "NEXT LEVEL") {
      this.setState({showGame: false, buttonText: "3 | Please focus on the fixation cross"});
      setTimeout(() => this.setState({buttonText: "2 | Please focus on the fixation cross"}), 1000);
      setTimeout(() => this.setState({buttonText: "1 | Please focus on the fixation cross"}), 2000);
      setTimeout(() => this._loadNextLevel(), 3000);
    } else if (this.state.buttonText === "SUBMIT") {
      var res = {'videoChoices': this.state.videoChoices, 'times': this.state.times, 'nullify': this.state.nullify};
      var myJSON = JSON.stringify(res);
      this.setState({disabled: true, overclick: true});
      dbx.filesUpload({path: '/' + this._makeid(20) + '.json', contents: myJSON})
       .then(function(response) {
         alert("Thank you for completing the game.");
       })
       .catch(function(error) {
         console.log("error: ", error);
       });
    }
  }

  _handleNullify() {
    this.setState({overclick: true});
    this.state.nullify.push([this.state.currentLevel, this.state.currentVideoIndex]);
    this.state.times.push(performance.now() - this.state.timer);
    this.state.videoChoices.push({'choice': 'null', 'left': this.state.leftVideo, 'right': this.state.rightVideo, 'videoPair': this.state.currentVideoPair});
    this.setState({
      percent: this.state.percent + 100/this.state.maxImages,
    });
    setTimeout(() => this._loadNextVideoPair(), 500);
  }

  _loadNextVideoPair() {
    if (this.state.percent === 100) {
      this.setState({disabled: false});
      return;
    }
    var videoPair = this.state.videoData[this.state.currentLevel-1][this.state.currentVideoIndex];
    var random = Math.round(Math.random());
    var nextLeftVideo = random ? "fake" : "real";
    var nextRightVideo = random ? "real" : "fake";
    if(videoPair === undefined) {
      return;
    }
    this.setState({
      left: false,
      right: false,
      timer: performance.now(),
      currentVideoPair: videoPair,
      leftVideo: nextLeftVideo,
      rightVideo: nextRightVideo,
      currentVideoIndex: this.state.currentVideoIndex + 1,
      overclick: false,
    })
    document.addEventListener("keydown", this._handleKeyDown);
  }

  _loadNextVideo() {
    if (this.state.percent === 100) {
      this.setState({disabled: false});
      return;
    }
    var videoPair = this.state.videoData[this.state.currentLevel-1][this.state.currentVideoIndex];
    var random = Math.round(Math.random());
    var nextLeftVideo = random ? "fake" : "real";
    var nextRightVideo = random ? "real" : "fake";
    if(videoPair === undefined) {
      return;
    }
    this.setState({
      left: false,
      right: false,
      timer: performance.now(),
      currentVideoPair: videoPair,
      leftVideo: nextLeftVideo,
      rightVideo: nextRightVideo,
      currentVideoIndex: this.state.currentVideoIndex + 1,
      overclick: false,
    })
    document.addEventListener("keydown", this._handleKeyDown);
  }

  _loadNextLevel() {
    document.addEventListener("keydown", this._handleKeyDown);
    this.setState({
      currentLevel: this.state.currentLevel + 1,
      percent: 0,
      showGame: true,
      buttonText: 'NEXT LEVEL',
      timer: performance.now(),
      disabled: true,
      currentVideoIndex: 0,
    }, () => this._loadNextVideoPair())
    if (this.state.currentLevel >= this.state.maxLevels) {
      this.setState({buttonText: 'SUBMIT'})
    }
  }

  render() {
    const {classes} = this.props;
    const { buttonText, disabled, currentLevel,
            percent, left, right, showGame,
            currentVideoPair, leftVideo, rightVideo,
            videoSize, videoDistance, overclick,
            maxLevels, anchorEl } = this.state;
    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;
    return (
      <div className={classes.root}>
        <div className={classes.progressSection}>
          <Typography variant="h2" gutterBottom>
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
              <b>Instructions:</b> You will be shown pairs of videos. One of them is real, the other is a deepfake. <br />
              Your task is to detect which one is fake <b>without moving your gaze from the fixation cross</b>. <br/>
              There are 20 levels with 10 pairs per level. Each level should take 30 to 60 seconds. You can take breaks between levels. <br /><br />

              During a level, keep your eyes focused on the fixation cross in the center at all times.<br />
              Press the <b>left</b> or <b>right arrow key</b> to select which video you believe is fake. <br />
              Try not to shift your gaze from the cross. If you accidentally do so, please press the <b>space bar</b> or the 'shifted gaze' button.

              <br /><br />
              <b>The first level is a warm-up run:</b> take the time to get used to staring at the cross.
              <br/>During this run, please <b>adjust the video's distance to the cross</b>  using the slider below such that the videos are in your peripheral vision.
              <br/>The videos should not be too close to disturb you from fixating at the center,
              and not too far away to notably reduce your ability to distinguish them.
              <br/>Find the distance that feels more comfortable to you.
              <br/><b> Once the distance is adjusted, it will be kept constant for the rest of the experiment</b>.
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
              percent={Math.ceil(percent)}
              theme={{
                active: {
                  symbol: Math.ceil(percent) + '%',
                  color: 'green'
                },
                success: {
                  symbol: Math.ceil(percent) + '%',
                  color: 'green'
                }
              }}
            />
          </div>
        </div>

        <div className={classes.videoSection}>
          {
            showGame ?
            <React.Fragment>
              <div className={classes.videoDisplaySection}>
                <div className={left ? classes.videoContainerSelected : classes.videoContainer}
                     style={{width: videoSize, height: videoSize}}>
                  <video
                    id="left-video"
                    style={{height: videoSize}}
                    src={currentVideoPair[leftVideo]}
                    type="video/mp4"
                    autoPlay
                    loop
                    muted
                    />
                </div>
                <img src={PlusIcon} className={classes.fixationCross}
                     style={{marginLeft: videoDistance, marginRight: videoDistance}}/>
                <div className={right ? classes.videoContainerSelected : classes.videoContainer}
                     style={{width: videoSize, height: videoSize}}>
                  <video
                    id="right-video"
                    style={{height: videoSize}}
                    src={currentVideoPair[rightVideo]}
                    type="video/mp4"
                    autoPlay
                    loop
                    muted
                    />
                </div>
              </div>
              {/* <Slider style={{marginTop: 32, width: '40%'}} min={64} max={320} defaultValue={videoSize} handle={handle}
                      onAfterChange={(val) => this.setState({videoSize: val})} /> */}
              {/* <Typography variant="caption" gutterBottom>
                Adjust video display size: {videoSize}px
              </Typography> */}
            </React.Fragment>

            :
            <img src={PlusIcon} className={classes.fixationCross}
                 style={{marginLeft: videoDistance, marginRight: videoDistance}}/>
          }
        </div>

        <div className={classes.bottomSection}>
          {
            showGame ?
            <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
              {
                currentLevel === 1 ?
                <React.Fragment>
                  <Typography variant="h4">WARM-UP RUN</Typography>
                  <Typography variant="caption" gutterBottom>
                    Adjust video distance from fixation cross: {videoDistance}px
                  </Typography>
                  <Slider style={{marginTop: 16, width: '40%'}} min={0} max={64} defaultValue={videoDistance} handle={handle}
                  onAfterChange={(val) => this.setState({videoDistance: val})} />
                </React.Fragment>
                : <React.Fragment />
              }
              <div style={{display: 'flex', flexDirection: 'row'}}>
                <Button disabled={disabled} variant="contained" className={classes.startButton} onClick={this._handleSubmitButton}>
                  {buttonText}
                </Button>
                <Button disabled={overclick || !disabled} variant="contained" className={classes.gazeButton} onClick={this._handleNullify}>
                  shifted gaze
                </Button>
              </div>
            </div>
            :
            <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
              <Button variant="contained" className={classes.startButton} onClick={this._handleStartButton}>
                {buttonText}
              </Button>
            </div>
          }
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(Experiment);
