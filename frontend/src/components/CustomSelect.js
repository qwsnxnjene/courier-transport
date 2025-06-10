import React, { useState, useEffect, useRef } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

const CustomSelect = ({ options, selectedValue, onChange, placeholder = "Выберите..." }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentValue, setCurrentValue] = useState(selectedValue);
    const selectRef = useRef(null);

    useEffect(() => {
        setCurrentValue(selectedValue);
    }, [selectedValue]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (selectRef.current && !selectRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleOptionClick = (value) => {
        setCurrentValue(value);
        onChange(value);
        setIsOpen(false);
    };

    const getDisplayValue = () => {
        const selectedOption = options.find(option => option.value === currentValue);
        return selectedOption ? selectedOption.label : placeholder;
    };

    return (
        <div className="custom-select-container" ref={selectRef}>
            <div className="custom-select-value" onClick={() => setIsOpen(!isOpen)}>
                {getDisplayValue()}
                {isOpen ? <FaChevronUp /> : <FaChevronDown />}
            </div>
            <ul className={`custom-select-options ${isOpen ? 'open' : ''}`}>
                {options.map((option) => (
                    <li
                        key={option.value}
                        className={`custom-select-option ${option.value === currentValue ? 'selected' : ''}`}
                        onClick={() => handleOptionClick(option.value)}
                    >
                        {option.label}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default CustomSelect;
