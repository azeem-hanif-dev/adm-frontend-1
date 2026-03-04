import React from "react";
import SearchableDropdown from "../fields/DropdownSearchField";
import { useState } from "react";

const Header = ({
  title,
  subTitle,
  options,
  placeholder,
  onChange,
  value,
}: any) => {
  // const [selected, setSelected] = useState(null);

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-4 md:px-0 mb-5">
      <div>
        <h1 className="text-3xl md:text-[42px] font-bold text-[#1a1a2e]">
          {title}
        </h1>
        <p className="text-gray-400 mt-1 md:mt-2 text-sm md:text-lg">
          {subTitle}
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
        <SearchableDropdown
          options={options}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
};

export default Header;
