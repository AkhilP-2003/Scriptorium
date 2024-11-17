import React, {ChangeEvent} from "react";

interface InputProps {
    title: string;
    value: string;
    className?: string;
    onChange: (value: string) => void;
}

const AuthInput: React.FC<InputProps> = ({value, title, className, onChange}) => {
    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        onChange(event.target.value);
    };

    return (
        <div className="flex flex-col w-full">
            <label className="text-sm font-medium md:font-small m:font-small text-gray-700 mb-1"> {title} </label>
            <input className={`${className}`}
            type="text"
            value={value}
            onChange={handleChange}
            />
        </div>
    );
};

export default AuthInput;