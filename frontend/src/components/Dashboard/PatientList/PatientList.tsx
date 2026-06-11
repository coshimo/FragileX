import React, { useState, useEffect } from 'react';
import AnimatedList from '../../Shared/AnimatedList';
import { apiFetch } from '../../../services/apiFetch';
import './PatientList.css';

interface PatientListProps {
  onPatientClick: (patient: any) => void;
  role: string;
}

const PatientList = ({ onPatientClick, role }: PatientListProps) => {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await apiFetch('/pacientes');
        if (!res.ok) {
          throw new Error('Falha ao buscar pacientes');
        }
        const data = await res.json();
        setPatients(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  if (loading) return <div className="patient-list-container">Carregando pacientes...</div>;
  if (error) return <div className="patient-list-container">Erro: {error}</div>;

  const animatedItems = patients.map((patient) => ({
    ...patient,
    id: patient.id,
    render: (
      <div className="patient-list-item">
        <div>
          <h3 className="patient-list-name">{patient.nome}</h3>
          <p className="patient-list-details">
            Idade: {patient.idade || '?'} | Sexo: {patient.sexo_biologico}
          </p>
        </div>
      </div>
    )
  }));

  return (
    <div className="patient-list-container">
      <div className="patient-list-header">
        <h2 className="patient-list-title">{role === 'medico' ? 'Meus Pacientes' : 'Todos os Pacientes'}</h2>
        <div className="patient-list-controls">
          <input 
            type="text" 
            placeholder="Buscar por nome..." 
            className="patient-search-input"
          />
          <button className="patient-filter-btn" aria-label="Filtros" title="Filtrar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
            </svg>
          </button>
        </div>
      </div>
      <AnimatedList 
        items={animatedItems} 
        onItemSelect={(item) => onPatientClick(item)} 
        className="patient-animated-list"
        displayScrollbar={false}
      />
    </div>
  );
};

export default PatientList;
