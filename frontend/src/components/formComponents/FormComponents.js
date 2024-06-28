import React, { useRef, useState } from 'react'
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./FormComponents.css";


export function TextInput({ label, id, variant, children, ...otherProps }) {
   return (
      <div className={`form-input text-input ${variant}`}>
         <label htmlFor={id}>{label}</label>
         <input id={id} {...otherProps} />
         {children}
      </div>
   );
}

export function TextArea({ label, id, variant, children, ...otherProps }) {
   return (
      <div className={`form-input text-area ${variant}`}>
         <label htmlFor={id}>{label}</label>
         <textarea id={id} {...otherProps} />
         {children}
      </div>
   );
}

export function PasswordInput({ label, id, variant, children, ...otherProps }) {
   const [showPassword, setShowPassword] = useState(false)
   return (
      <div className={`form-input password-input ${variant}`}>
         <label htmlFor={id}>{label}</label>
         <div className='input-wrapper'>
            <input id={id} {...otherProps} type={showPassword ? "text" : "password"} />
            <span className="icon" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <FaEye /> : <FaEyeSlash />}</span>
         </div>
         {children}
      </div>
   )
}

export function SelectInput({ label, id, variant, options, defaultValue, children, ...otherProps }) {
   return (
      <div className={`form-input select-input ${variant}`}>
         <label htmlFor={id}>{label}</label>
         <select id={id} defaultValue={defaultValue} {...otherProps}>
            {options.map((option, index) => (
               <option key={index} value={option.value}>{option.label}</option>
            ))}
         </select>
         {children}
      </div>
   );
}

export function FileInput({ label, id, variant, children, value = "null", ...otherProps }) {
   const fileInputRef = useRef(null);
   return (
      <div className={`form-input file-input ${variant}`}>
         <label htmlFor={id}>{label}</label>
         <input id={id} ref={fileInputRef} {...otherProps} />
         {variant === "variant-1" && (
            <button
               onClick={() => {
                  fileInputRef.current.click();
               }}>
               {value ? value : 'select file'}
            </button>
         )}
         {children}
      </div>
   );
}



