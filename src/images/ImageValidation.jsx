import React, { Component, Fragment } from "react";
import { connect } from "react-redux";

import Webcam from "react-webcam";
import {
  loadModels,
  getFullFaceDescription2,
  determineProofOfLife,
} from "../../factories/FaceApi";
import Button from "../../components/button";
import Modal from "../../components/Modals";

import cameraIcon from "../../assets/img/25@4x.png";
import camInstruction from "../../assets/img/cam_instruction.png";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import PerfectShot from "../../assets/img/perfect_shot.svg";
import photo_error from "../../assets/img/photo_error.svg";
import Loading from "../../assets/img/loading.gif";

import "./style.css";
import ticked from "../../assets/img/ticked.gif";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { trimImage } from "../../factories/FormatHandlers";
// import { actionDispatcher } from "../../../store/actions/onboarding";
// import { REDUX_CONSTANTS } from "../../../constants/reduxConstants";

// import { trimPhoneNumber2, trimImage } from "../../../factories/FormatHandlers";
// import { ErrorHandler } from "../../../factories/errorHandler";

// import { responseCode } from "../../../constants/responseCodes";
// import { ROUTES } from "../../../constants/routepaths";

var expCount = 0;
var imageD = null;
export class ImageValidation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showContinueButton: true,
      expression: ["happy", "neutral"],
      expressionIndex: 0,
      webCamFound: true,
      smileDetected: false,
      stillDetected: false,
      LifeProofDetected: false,
      message: "Smile for the camera",
      placeHolder: "",
      isProcessing: false,
      isPicVerfied: false,
      faceDetected: true,
      validationPassed: true,
      storeUserObj: {},
      navigateToExistAccount: false,
      navigateToExistingProfile: false,
      retryCount: 0,
      token: "",
    };
  }

  componentDidMount = async () => {
    try {
      await loadModels();
    } catch (error) {
      window.location.reload(true);
    }
  };

  returnDialCode = (dialCode) => {
    return `+${dialCode}`;
  };

  postInfoAndImage = async () => {
    let x = await this.props.next();
    this.setState({ validationPassed: x });
  };

  delayAction = (time, fn) => {
    var timer = setInterval(() => {
      fn();
      clearInterval(timer);
    }, time);
  };

  delayCapture = (time) => {
    var timer = setInterval(() => {
      this.WebcamCapture();
      clearInterval(timer);
    }, time);
  };

  handleBackButton = () => {
    this.state.showContinueButton && !this.state.LifeProofDetected
      ? this.props.closeSection()
      : this.setState({
          showContinueButton: !this.state.showContinueButton,
          smileDetected: false,
          stillDetected: false,
          LifeProofDetected: false,
          message: "Smile for the camera",
        });
    expCount = 0;
  };

  handleContinue = () => {
    !this.state.LifeProofDetected
      ? this.setState(
          {
            showContinueButton: !this.state.showContinueButton,
            smileDetected: false,
            stillDetected: false,
            message: "Smile for the camera",
          },
          () => {
            // this.delayCapture(2000);
          }
        )
      : this.setState({ isProcessing: !this.state.isProcessing }, () => {
          // simulate api call to backend
          this.postInfoAndImage();
        });
  };

  handleRetry = () => {
    this.setState({
      faceDetected: true,
      validationPassed: true,
      webCamFound: true,
    });
  };

  handleNoWebcam = () => {
    this.setState({ webCamFound: false });
  };

  WebcamCapture = () => {
    if (this.webcam && expCount <= 1) {
      imageD = this.webcam.getScreenshot();
      this.setState({ imageData: imageD });
      this.handleImage();
    }
  };

  handleSuccessContinue = () => {
    //handleNavigation(this.props, 1);
  };

  handleImage = async () => {
    //const { imageData } = this.state;
    if (!imageD) this.WebcamCapture();

    await getFullFaceDescription2(imageD).then(async (fullDesc) => {
      if (fullDesc.length > 1) {
        expCount = 0;
        await this.setState(
          {
            message: "Just you please",
            smileDetected: false,
            stillDetected: false,
          },
          () => {
            this.WebcamCapture();
          }
        );
      } else if (fullDesc.length === 0) {
        if (expCount === 0)
          await this.setState({ message: "move closer and smile" });
        if (expCount === 1)
          await this.setState({ message: "move closer and stay still" });
        this.WebcamCapture();
      } else if (fullDesc.length === 1) {
        const userExpression = await determineProofOfLife(
          fullDesc[0]["expressions"]
        );
        if (this.state.expression[expCount] === userExpression) {
          //  console.log(userExpression);
          //  console.log(expCount);
          //  console.log(this.state.expression[expCount]);
          if (expCount === 0) {
            await this.setState({
              message: "Now give a straight face",
              smileDetected: true,
            });
          }
          if (expCount === 1) {
            await this.setState(
              { message: " All Done!", stillDetected: true },
              () => {
                this.props.imageCaptured(trimImage(this.state.imageData));
                var timer = setInterval(() => {
                  this.setState({
                    LifeProofDetected: true,
                    showContinueButton: !this.state.showContinueButton,
                  });
                  clearInterval(timer);
                }, 5000);
              }
            );
          }
          expCount += 1;
          this.delayCapture(5000);
        } else {
          if (expCount === 0)
            await this.setState({ message: "Now give a huge smile" });
          if (expCount === 1)
            await this.setState({ message: "now give a straight face" });
          this.WebcamCapture();
        }
      }
    });
  };

  handleTakeAnother = () => {
    expCount = 0;
    this.setState(
      {
        smileDetected: false,
        stillDetected: false,
        LifeProofDetected: false,
        showContinueButton: false,
        message: "Smile for the camera",
      },
      () => {
        this.delayCapture(2000);
      }
    );
  };

  handleWebcamActivation = () => {
    this.delayCapture(2000);
  };

  setRef = (webcam) => {
    this.webcam = webcam;
  };

  componentWillUnmount() {
    this.webcam = null;
    expCount = 0;
  }

  render() {
    const {
      showContinueButton,
      smileDetected,
      stillDetected,
      message,
      LifeProofDetected,
      isPicVerfied,
      webCamFound,
      faceDetected,
      validationPassed,
      retryCount,
    } = this.state;

    const successModal = (
      <Fragment>
        <div className="row suc-modal">
          <div className="col-sm-12 modal-center">
            <img alt="" src={PerfectShot} />
            <h5>
              {" "}
              <span role="img" aria-labelledby="success">
                Perfect Shot! 👍🏿
              </span>
            </h5>
            <Button
              type="button"
              handleButtonClick={this.handleSuccessContinue}
              className="btn btn-outline-success"
              text="Continue"
            />
          </div>
        </div>
      </Fragment>
    );

    const VerifyingPicModal = (
      <Fragment>
        <div className="text-center">
          <img
            className="img-fluid loading-gif"
            height="150"
            width="150"
            src={Loading}
            alt="loading gif"
          />
        </div>
        <div className="text-center">
          <strong className="mt-5 ins-text gif-text">
            {/* {verifyingPic} */}
            Processing...
          </strong>
        </div>
      </Fragment>
    );

    const retryModal = (
      <Fragment>
        <div className="row retry-modal">
          <div className="retry-content">
            <img src={photo_error} alt="" />
            <p className="mt-2">Uh-Oh!</p>
            {!validationPassed && (
              <Fragment>
                <p className="info-text-orange">
                  {/* We couldn't find a match for your picture */}
                  {this.props.apiErr}
                </p>
                <img
                  className="retry-modal-pic"
                  alt="final capture"
                  src={this.state.imageData}
                />
              </Fragment>
            )}

            {!webCamFound && (
              <Fragment>
                <p className="info-text-orange">
                  We couldn't detect your camera
                </p>
              </Fragment>
            )}
            {!faceDetected && (
              <Fragment>
                <p className="info-text-orange">We couldn't see your face</p>
                <img alt="final capture" src={this.state.imageData} />
              </Fragment>
            )}
            {retryCount < 5 && (
              <Fragment>
                {!this.state.navigateToExistAccount &&
                  !this.state.navigateToExistingProfile && (
                    <Button
                      handleButtonClick={this.handleRetry}
                      className="btn btn-secondary polaris-primary btn-sm mt-4"
                      type="button"
                      text="RETRY"
                    />
                  )}
                {(this.state.navigateToExistAccount ||
                  this.state.navigateToExistingProfile) && (
                  <Button
                    handleButtonClick={this.handleExistingAccountNavigation}
                    className="btn btn-secondary polaris-primary btn-sm mt-4"
                    type="button"
                    text="CONTINUE"
                  />
                )}
              </Fragment>
            )}
            {retryCount >= 5 && (
              <div className="mt-3">
                {(!validationPassed || !webCamFound || !faceDetected) && (
                  <p>
                    Not to worry{" "}
                    <span
                      onClick={this.handleWalletNavigation}
                      className="inline-btn"
                    >
                      {" "}
                      CONTINUE
                    </span>{" "}
                    to get a wallet
                  </p>
                )}

                {!validationPassed && (
                  <Fragment>
                    <p>OR</p>
                    <p className="center-text">
                      Visit the bank where you registered for your BVN to review
                      your information
                    </p>
                  </Fragment>
                )}
              </div>
            )}
          </div>
        </div>
      </Fragment>
    );

    const videoConstraints = {
      width: 480,
      height: 480,
      facingMode: "user",
    };
    const BackArrow = <FontAwesomeIcon icon={faArrowLeft} />;
    return (
      <Fragment>
        {this.props.isProcessing ? (
          <Modal
            showModal={this.props.isProcessing}
            height="80vh"
            data={VerifyingPicModal}
          />
        ) : (
          <Modal
            showModal={
              !webCamFound || !faceDetected || !validationPassed ? true : false
            }
            minHeight="500px"
            data={retryModal}
          />
        )}
        <Modal showModal={isPicVerfied} height="70vh" data={successModal} />
        {!this.props.isProcessing &&
          !isPicVerfied &&
          webCamFound &&
          faceDetected &&
          validationPassed && (
            <Fragment>
              <div className="row">
                <img
                  src={cameraIcon}
                  className="header-icon rounded mx-auto d-block"
                  alt="Account without BVN"
                />
              </div>
              {!showContinueButton && !LifeProofDetected && (
                <div className="text-center mt-4 info-text">
                  <h4>Take a photo</h4>
                </div>
              )}
              {showContinueButton && !LifeProofDetected && (
                <div className="ins-box-ctn">
                  <div className="ins-box">
                    <img src={camInstruction} alt="camera instructions" />
                    <p className="small-text mt-4 mb-4">
                      Please ensure there are neither glasses on your eyes nor
                      any form of covering on your head
                    </p>
                    <p className="small-text">Click on CONTINUE to proceed</p>
                  </div>
                </div>
              )}
              {/* <img src={this.state.imageData} /> */}
              {/* {!showContinueButton &&<div className="cam-box">

           </div>} */}

              {!showContinueButton && !LifeProofDetected && (
                <Fragment>
                  <div className="webcam-text mt-1">
                    <p className="cam-ins-text">
                      <strong>{message}</strong>
                    </p>
                    <div>
                      <span></span>
                      <Webcam
                        className=""
                        audio={false}
                        height={250}
                        ref={this.setRef}
                        screenshotFormat="image/jpeg"
                        width={250}
                        videoConstraints={videoConstraints}
                        onUserMediaError={this.handleNoWebcam}
                        onUserMedia={this.handleWebcamActivation}
                      />
                      <div className="prg-text-mobile">
                        <p>
                          <strong>Smile</strong>{" "}
                          {smileDetected && (
                            <img width="20" alt="Smile detected" src={ticked} />
                          )}
                        </p>
                        <p>
                          <strong>Still</strong>{" "}
                          {stillDetected && (
                            <img
                              width="20"
                              alt="Straight face detected"
                              src={ticked}
                            />
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="prg-text">
                      <p>
                        <strong>Smile</strong>{" "}
                        {smileDetected && (
                          <img width="20" alt="Smile detected" src={ticked} />
                        )}
                      </p>
                      <p>
                        <strong>Still</strong>{" "}
                        {stillDetected && (
                          <img
                            width="20"
                            alt="Straight face detected"
                            src={ticked}
                          />
                        )}
                      </p>
                    </div>
                  </div>
                </Fragment>
              )}
              {LifeProofDetected && (
                <Fragment>
                  <div className="mt-3 img-box">
                    <img
                      id="finalPicImg"
                      src={this.state.imageData}
                      alt="final capture"
                    />
                  </div>
                  <div id="anotherPicBox" className="m-2 text-center mt-3">
                    <span className="block-display mb-1 not-satisfied">
                      Not Satisfied?
                    </span>
                    <Button
                      text="Take another photo"
                      handleButtonClick={this.handleTakeAnother}
                      className="btn btn-outline-warning btn-sm"
                      type="button"
                      dotted={true}
                    />
                  </div>
                </Fragment>
              )}
              <div className="row btn-bottom center mt-5">
                {/* {!showContinueButton && ( */}
                <Button
                  id="backbtn"
                  type="button"
                  text="Back"
                  icon={BackArrow}
                  className="btn btn-back mr-5"
                  handleButtonClick={this.handleBackButton}
                />
                {/* )} */}
                {showContinueButton && (
                  <Button
                    id="continue"
                    type="submit"
                    text="Continue"
                    className="btn btn-secondary polaris-primary"
                    handleButtonClick={this.handleContinue}
                  />
                )}
              </div>
            </Fragment>
          )}
      </Fragment>
    );
  }
}

const mapStateToProps = (state) => ({
  pageTrack: state.pageTrack,
  bvnuserinfo: state.bvnuserinfo,
  userinfo: state.userinfo,
  walletinfo: state.walletinfo,
  auth: state.auth,
});

const mapDispatchToProps = (dispatch) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(ImageValidation);
