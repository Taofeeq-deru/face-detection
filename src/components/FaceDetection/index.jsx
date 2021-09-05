import { useState, useEffect, useRef } from "react";
import Webcam from "react-webcam";
import {
	loadModels,
	getFullFaceDescription2,
	determineProofOfLife,
} from "utils/faceApi";
import { trimImage } from "utils";
import { Modal } from "components";

import cameraIcon from "images/25@4x.png";
import camInstruction from "images/cam_instruction.png";
import photo_error from "images/photo_error.svg";
import Loading from "images/loading.gif";
import ticked from "images/ticked.gif";

import "./styles.css";

var expCount = 0;
var imageD = null;

const FaceDetection = ({
	closeSection,
	next,
	errMessage,
	isProcessing,
	backBtnCSS,
	continueBtnCSS,
}) => {
	const [continueButton, setContinue] = useState(true);
	const [webcamFound, setWebcam] = useState(true);
	const [detections, setDetections] = useState({
		smileDetected: false,
		stillDetected: false,
		lifeProofDetected: false,
		faceDetected: true,
		message: "Smile for the camera",
	});
	const [validationPassed, setValid] = useState(true);
	const [imageData, setImage] = useState();
	const [another, setAnother] = useState(false);

	const webcamRef = useRef();

	const loadFaceModels = async () => {
		try {
			await loadModels();
		} catch (error) {
			window.location.reload(true);
		}
	};

	useEffect(() => {
		loadFaceModels();

		return () => {
			expCount = 0;
		};
	}, []);

	const expression = ["happy", "neutral"];

	const delayCapture = (time) => {
		var timer = setInterval(() => {
			webcamCapture();
			clearInterval(timer);
		}, time);
	};

	const smileForCamera = (
		smileDetected,
		stillDetected,
		lifeProofDetected,
		faceDetected
	) => {
		setDetections({
			...detections,
			smileDetected,
			stillDetected,
			lifeProofDetected,
			faceDetected,
			message: "Smile for the camera",
		});
		setContinue((prevContinue) => !prevContinue);
	};

	const postInfoAndImage = async () => {
		let x = await next(trimImage(imageData));
		setValid(x);
	};

	const handleBackButton = () => {
		continueButton && !detections?.lifeProofDetected
			? closeSection()
			: smileForCamera(false, false, false, true);

		expCount = 0;
	};

	const handleContinue = () => {
		!detections?.lifeProofDetected
			? smileForCamera(false, false, detections?.lifeProofDetected, true)
			: postInfoAndImage();
	};

	const handleRetry = () => {
		smileForCamera(false, false, false, true);
		setValid(true);
		setWebcam(true);
	};

	const handleNoWebcam = () => {
		setWebcam(false);
	};

	const webcamCapture = () => {
		if (webcamRef.current && expCount <= 1) {
			imageD = webcamRef.current.getScreenshot();
			setImage(imageD);
			handleImage();
		}
	};

	const handleImage = async () => {
		if (!imageD) webcamCapture();

		await getFullFaceDescription2(imageD).then(async (fullDesc) => {
			if (fullDesc.length > 1) {
				expCount = 0;
				setDetections({
					...detections,
					smileDetected: false,
					stillDetected: false,
					message: "Just you please",
				});
				webcamCapture();
			} else if (fullDesc.length === 0) {
				if (expCount === 0)
					setDetections({
						...detections,
						message: "Move closer and smile",
					});
				if (expCount === 1)
					setDetections({
						...detections,
						message: "Move closer and stay still",
					});
				webcamCapture();
			} else if (fullDesc.length === 1) {
				const userExpression = await determineProofOfLife(
					fullDesc[0]["expressions"]
				);
				if (expression[expCount] === userExpression) {
					if (expCount === 0) {
						setDetections({
							...detections,
							smileDetected: true,
							message: "Now give a straight face",
						});
					}
					if (expCount === 1) {
						setDetections({
							...detections,
							smileDetected: true,
							stillDetected: true,
							message: "All Done",
						});
					}
					expCount += 1;
					delayCapture(1500);
				} else {
					if (expCount === 0)
						setDetections({ ...detections, message: "Now give a huge smile" });
					if (expCount === 1)
						setDetections({
							...detections,
							message: "Now give a straight face",
						});

					webcamCapture();
				}
			}
		});
	};

	const handleTakeAnother = () => {
		expCount = 0;
		setDetections({
			...detections,
			smileDetected: false,
			stillDetected: false,
			lifeProofDetected: false,
			message: "Smile for the camera",
		});
		setContinue(false);
		setAnother(true);
	};

	const handleWebcamActivation = () => {
		delayCapture(1000);
	};

	useEffect(() => {
		if (detections?.stillDetected) {
			var timer = setInterval(() => {
				setDetections({ ...detections, lifeProofDetected: true });
				setContinue((prevContinue) => !prevContinue);
				clearInterval(timer);
			}, 1500);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [detections?.stillDetected]);

	useEffect(() => {
		if (another) {
			delayCapture(1000);
			setAnother(false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [another]);

	const videoConstraints = {
		width: 480,
		height: 480,
		facingMode: "user",
	};

	const VerifyingPicModal = (
		<>
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
				<strong className="mt-5 ins-text gif-text">Processing...</strong>
			</div>
		</>
	);

	const retryModal = (
		<div className="retry-modal">
			<div className="retry-content">
				<img src={photo_error} alt="" />
				<p className="mt-2">Uh-Oh!</p>
				{!validationPassed && (
					<>
						<p className="info-text-orange">{errMessage}</p>
					</>
				)}

				{!webcamFound && (
					<>
						<p className="info-text-orange">We couldn't detect your camera</p>
					</>
				)}
				{!detections?.faceDetected && (
					<>
						<p className="info-text-orange">We couldn't see your face</p>
					</>
				)}
				<button
					type="button"
					className="btn btn-secondary polaris-primary btn-sm mt-4"
					onClick={handleRetry}
				>
					RETRY
				</button>
			</div>
		</div>
	);

	const {
		faceDetected,
		stillDetected,
		smileDetected,
		lifeProofDetected,
		message,
	} = detections;

	return (
		<div className="wrapper">
			{isProcessing ? (
				<Modal
					showModal={isProcessing}
					height="60vh"
					data={VerifyingPicModal}
				/>
			) : (
				<Modal
					showModal={!webcamFound || !faceDetected || !validationPassed}
					minHeight="60vh"
					data={retryModal}
				/>
			)}
			{!isProcessing && webcamFound && faceDetected && validationPassed && (
				<>
					<div>
						<img
							src={cameraIcon}
							className="header-icon rounded mx-auto d-block"
							alt="camera"
						/>
					</div>
					{!continueButton && !lifeProofDetected && (
						<div className="text-center mt-4 info-text">
							<h4>Take a photo</h4>
						</div>
					)}
					{continueButton && !lifeProofDetected && (
						<div className="ins-box-ctn">
							<div className="ins-box">
								<img src={camInstruction} alt="camera instructions" />
								<p className="small-text mt-4 mb-4">
									Please ensure there are neither glasses on your eyes nor any
									form of covering on your head
								</p>
								<p className="small-text">Click on CONTINUE to proceed</p>
							</div>
						</div>
					)}

					{!continueButton && !lifeProofDetected && (
						<>
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
										ref={webcamRef}
										screenshotFormat="image/jpeg"
										width={250}
										videoConstraints={videoConstraints}
										onUserMediaError={handleNoWebcam}
										onUserMedia={handleWebcamActivation}
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
						</>
					)}
					{lifeProofDetected && (
						<>
							<div className="mt-3 img-box">
								<img id="finalPicImg" src={imageData} alt="final capture" />
							</div>
							<div
								id="anotherPicBox"
								className="m-2 text-center mt-3 d-flex flex-column align-items-center"
							>
								<span className="block-display mb-1 not-satisfied">
									Not Satisfied?
								</span>
								<button
									className="btn btn-outline-warning btn-sm"
									type="button"
									onClick={handleTakeAnother}
								>
									Take another photo
								</button>
							</div>
						</>
					)}
					<div className="d-flex justify-content-center mt-5">
						<div className="btn-bottom d-flex">
							<button
								id="backbtn"
								type="button"
								className={`${backBtnCSS || "btn btn-secondary mr-auto"}`}
								onClick={handleBackButton}
							>
								Back
							</button>
							{continueButton && (
								<button
									id="continue"
									type="submit"
									className={`${continueBtnCSS || "btn btn-primary"}`}
									onClick={handleContinue}
								>
									Continue
								</button>
							)}
						</div>
					</div>
				</>
			)}
		</div>
	);
};

export default FaceDetection;
