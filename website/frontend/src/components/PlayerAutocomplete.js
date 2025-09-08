import React, { useRef } from 'react';
import PropTypes from 'prop-types';

const PlayerAutocomplete = ({ value, onChange, placeholder }) => {
  const inputRef = useRef(null);

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    onChange(inputValue);
  };

  return (
    <div className="autocomplete-container" ref={inputRef}>
      <input
        type="text"
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
        className="autocomplete-input"
      />
    </div>
  );
};

PlayerAutocomplete.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string
};

PlayerAutocomplete.defaultProps = {
  placeholder: 'Enter player name'
};

export default PlayerAutocomplete;