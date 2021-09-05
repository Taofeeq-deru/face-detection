import * as faceapi from "face-api.js";

// Load models and weights
export async function loadModels() {
	const MODEL_URL = process.env.PUBLIC_URL + "/static/faceApiModels";
	await faceapi.loadFaceExpressionModel(MODEL_URL);
	await faceapi.loadTinyFaceDetectorModel(MODEL_URL);
	await faceapi.loadFaceRecognitionModel(MODEL_URL);
	// await faceapi.loadFaceLandmarkTinyModel(MODEL_URL);
	// await faceapi.loadFaceRecognitionModel(MODEL_URL);
}

export async function getFaceSimilarity(img1, img2) {
	const scoreThreshold = 0.3;

	// fetch image to api
	const fetchImg1 = await faceapi.fetchImage(img1);
	const fetchImg2 = await faceapi.fetchImage(img2);

	const desc1 = await faceapi.computeFaceDescriptor(fetchImg1);
	const desc2 = await faceapi.computeFaceDescriptor(fetchImg2);

	const distance = faceapi.utils.round(faceapi.euclideanDistance(desc1, desc2));
	// console.log(distance, "distance");
	//return true if similarity is confirmed, ie distance is less than scoreThreshold
	if (distance < scoreThreshold) return true;
}

export async function getFullFaceDescription(blob, inputSize = 512) {
	// tiny_face_detector options
	let scoreThreshold = 0.5;
	const OPTION = new faceapi.TinyFaceDetectorOptions({
		inputSize,
		scoreThreshold,
	});
	//const useTinyModel = true;

	// fetch image to api
	let img = await faceapi.fetchImage(blob);

	// detect all faces and generate full description from image
	// including landmark and face expression of each face
	let fullDesc = await faceapi
		.detectAllFaces(img, OPTION)
		// .withFaceLandmarks(useTinyModel)
		.withFaceExpressions();
	// .withFaceDescriptors();
	return fullDesc;
}

export async function getFullFaceDescription2(blob, inputSize = 416) {
	// tiny_face_detector options]
	let scoreThreshold = 0.5;
	const OPTION = new faceapi.TinyFaceDetectorOptions(inputSize, scoreThreshold);
	//const useTinyModel = true;

	// fetch image to api
	//console.log(2)
	let img = await faceapi.fetchImage(blob);

	// detect all faces and generate full description from image
	// including landmark and face expression of each face
	//console.log(4)
	let fullDesc = await faceapi
		.detectAllFaces(img, OPTION)
		.withFaceExpressions();
	//console.log(5);
	// .withFaceDescriptors();
	return fullDesc;
}

// export async function compareFaces(blob1, blob2){

// }

export const randomFaceExpression = (firstExpression) => {
	let options = ["happy", "neutral"];
	if (firstExpression) {
		//filter the expression from the array
		const newOptions = options.filter((item) => item !== firstExpression);
		//const index = Math.round(Math.random());
		return newOptions[0];
	} else {
		const index = Math.round(Math.random());
		return options[index];
	}
};

export const determineProofOfLife = ({
	neutral,
	happy,
	sad,
	angry,
	fearful,
	disgusted,
	surprised,
}) => {
	//set neutral to be the face expression nad then replace it if other expressions come up with higher scores
	let faceExpression = ["neutral", neutral];

	if (happy > faceExpression[1]) faceExpression = ["happy", happy];
	else if (sad > faceExpression[1]) faceExpression = ["sad", sad];
	else if (angry > faceExpression[1]) faceExpression = ["angry", angry];
	else if (fearful > faceExpression[1]) faceExpression = ["fearful", fearful];
	else if (disgusted > faceExpression[1])
		faceExpression = ["disgusted", disgusted];
	else if (surprised > faceExpression[1])
		faceExpression = ["surprised", surprised];

	//set threshold score of 0.6 else return null
	//if highest score is either angry or disgusted, select surprised as the final result because they are similar..
	//const maxEmotionScore = faceExpression[1];
	//if(faceExpression[0] === "angry") faceExpression = ["surprised", maxEmotionScore];
	return faceExpression[1] >= 0.7 ? faceExpression[0] : null;
};
