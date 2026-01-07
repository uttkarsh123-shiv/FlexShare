import React from 'react';

const Card = ({ title, description, icon: Icon }) => {
  return (
    <div className="group relative bg-[#171717] border border-[#383838] rounded-xl p-8 shadow-xl hover:shadow-2xl hover:shadow-orange-600/10 transition-all duration-300 hover:scale-105 hover:border-orange-600/50">
      <div className="mb-4 inline-flex p-3 bg-orange-900/20 rounded-lg group-hover:bg-orange-900/30 transition">
        {Icon && <Icon className="text-orange-500 text-3xl" />}
      </div>
      <h3 className="mb-3 text-xl font-bold text-white">
        {title}
      </h3>
      <p className="text-[#a8a29e] leading-relaxed">
        {description}
      </p>
    </div>
  );
};

export default Card;
