import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import styles from './CustomSelect.module.css';

const CustomSelect = ({
    options = [],
    value,
    onChange,
    placeholder = "Select an option",
    disabled = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (option) => {
        onChange(option.value);
        setIsOpen(false);
    };

    const selectedOption = options.find(opt => opt.value === value);

    return (
        <div className={styles.container} ref={containerRef}>
            <div
                className={`${styles.trigger} ${isOpen ? styles.active : ''}`}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                style={disabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
            >
                <span className={!selectedOption ? styles.placeholder : ''}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown size={16} className={styles.icon} />
            </div>

            {isOpen && !disabled && (
                <div className={styles.dropdown}>
                    {options.length > 0 ? (
                        options.map((option) => (
                            <div
                                key={option.value}
                                className={`${styles.option} ${value === option.value ? styles.selected : ''}`}
                                onClick={() => handleSelect(option)}
                            >
                                {option.label}
                            </div>
                        ))
                    ) : (
                        <div className={styles.option} style={{ cursor: 'default', color: '#999' }}>
                            No options available
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CustomSelect;
