import { useState } from "react";
import { FaceDetection } from "components";
import "./App.css";

function App() {
	const [captureImage, setCapture] = useState(false);
	const [loading, setLoading] = useState(false);
	const [image, setImage] = useState(null);
	const [apiErr, setErr] = useState("");

	const handleProceed = (image) => {
		console.log("done");
		setLoading(true);

		/**replace setTimeout with api call,
		 * set loading and capture to false, and apiErr to empty string if api call is successful,
		 * else set apiErr to the error message and return false
		 **/
		setTimeout(() => {
			setImage(`data:image/jpeg;base64,${image}`);
			setLoading(false);
			setCapture(false);
			return true;
		}, 3000);
	};

	return captureImage ? (
		<FaceDetection
			errMessage={apiErr}
			isProcessing={loading}
			closeSection={() => setCapture(false)}
			next={handleProceed}
		/>
	) : (
		<div className="App">
			<header className="App-header">
				{image ? (
					<img src={image} className="App-logo" alt="captured face" />
				) : null}
				<p>Click button to capture your face</p>
				<button className="btn btn-primary" onClick={() => setCapture(true)}>
					Capture face
				</button>
			</header>
		</div>
	);
}

export default App;
