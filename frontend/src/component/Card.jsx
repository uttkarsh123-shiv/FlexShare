import React from 'react';
const Card = ({ title, description, icon: Icon, bgColor = "bg-[#3333]" }) => {
  return (
    <div className={`w-80 h-60 ${bgColor} rounded-xl p-8 pr-9 shadow-[0_4px_30px_rgba(0,0,0,0.1)] border border-white/10 bg-white/5 backdrop-blur-lg backdrop-saturate-150`}>
      {Icon && <Icon className="text-orange-600 text-4xl" />}
      <h1 className="mb-2 mt-5 text-[22px] font-semibold font-serif text-white instrument-serif-regular">
        {title}
      </h1>
      <p className="text-[16px] text-gray-200">
        {description}
      </p>
    </div>
  );
};

export default Card;
