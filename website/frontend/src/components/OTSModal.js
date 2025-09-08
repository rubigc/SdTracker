import React from 'react';
import PropTypes from 'prop-types';

const OTSModal = ({ isOpen, onClose, title, otsData }) => {
  if (!isOpen) return null;

  return (
    <div className="ots-modal-overlay" onClick={onClose}>
      <div className="ots-modal-content" onClick={e => e.stopPropagation()}>
        <div className="ots-modal-header">
          <h2>{title}</h2>
          <button className="ots-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="ots-modal-body">
          <pre>{otsData}</pre>
        </div>
      </div>
    </div>
  );
};

OTSModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  otsData: PropTypes.string.isRequired
};

export default OTSModal;