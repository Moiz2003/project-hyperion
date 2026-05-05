import SolutionPageTemplate from '../../components/solutions/SolutionPageTemplate';
import { solutionContent } from './solutionContent';

const makeSolutionPage = (key) => function SolutionPage({ onNavigate }) {
  const content = solutionContent[key];
  return <SolutionPageTemplate onNavigate={onNavigate} {...content} />;
};

export const RadiologyAIAssistantPage = makeSolutionPage('radiology-ai-assistant');
export const RuralClinicsPage = makeSolutionPage('rural-clinics-low-resource-settings');
export const EmergencyDiagnosisSupportPage = makeSolutionPage('emergency-diagnosis-support');
export const TelemedicineIntegrationPage = makeSolutionPage('telemedicine-integration');
