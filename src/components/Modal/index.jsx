import PropTypes from "prop-types";
import "./styles.css";

const ModalComponent = ({ showModal, data, height, minHeight, classname }) => {
	const _class = showModal ? "block" : "none";
	const _height = height ? height : "";
	const _minHeight = minHeight ? minHeight : "";
	const _classname = classname
		? "card modal-container " + classname
		: "card modal-container";

	return (
		<div
			className={_classname}
			style={{ display: _class, height: _height, minHeight: _minHeight }}
		>
			<div className="card-body">{data}</div>
		</div>
	);
};

ModalComponent.propTypes = {
	showModal: PropTypes.bool.isRequired,
	data: PropTypes.element,
};

export default ModalComponent;
