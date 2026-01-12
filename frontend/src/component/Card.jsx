import React from 'react';
import '../styles/card.css';

const Card = ({ title, description, icon: Icon }) => {
  return (
    <div className="feature-card">
      <div className="feature-card-icon-wrapper">
        {Icon && <Icon className="feature-card-icon" />}
      </div>
      <h3 className="feature-card-title">
        {title}
      </h3>
      <p className="feature-card-description">
        {description}
      </p>
    </div>
  );
};

export default Card;
