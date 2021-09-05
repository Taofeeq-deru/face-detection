export const trimImage = (img) => {
	let constant = "data:image/jpeg;base64,";
	let newTrimImg;
	newTrimImg = img.substring(constant.length, img.length);
	return newTrimImg;
};
