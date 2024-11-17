import React, {ChangeEvent} from "react";

interface InputProps {
    title: string;
    value: string;
    className?: string;
    onChange: (value: string) => void;
}

const PasswordInput: React.FC<InputProps> = ({value, title, className, onChange}) => {
    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        onChange(event.target.value);
    };

    return (
        <div className="flex flex-col w-full">
            <label className="text-sm font-medium text-gray-700 mb-1"> {title} </label>
            <input className={`${className}`}
            type="password"
            value={value}
            onChange={handleChange}
            />
        </div>
    );
};

export default PasswordInput;