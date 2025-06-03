import React from 'react';
import { Service } from 'shared/types';

interface ServiceCardProps {
  service: Service;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => (
  <div style={{ border: '1px solid #ccc', borderRadius: 8, padding: 16, margin: 8 }}>
    <h3>{service.name}</h3>
    <p><b>Plaka:</b> {service.plate}</p>
    <p><b>Güzergah:</b> {service.route}</p>
    <p><b>Şoför ID:</b> {service.driverId}</p>
  </div>
);

export default ServiceCard; 