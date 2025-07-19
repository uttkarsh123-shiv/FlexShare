import React from 'react';
const Card = ({ title, description, icon: Icon, bgColor = "bg-[#3333]" }) => {
  return (
    <div className={`w-80 h-50 ${bgColor} rounded-lg p-5 pr-9 shadow-lg backdrop-blur-md`}>
      {Icon && <Icon className="text-orange-800 text-4xl" />}
      <h1 className="mb-2 mt-5 text-[20px] font-semibold font-serif text-white">
        {title}
      </h1>
      <p className="text-[16px] text-gray-200">
        {description}
      </p>
    </div>
  );
};

export default Card;
