import { GovernanceObjective, DesignFactor } from '../types';
import { DF2_MAPPING } from './mappings/df2Mapping';
import { DF3_MAPPING } from './mappings/df3Mapping';
import { DF4_MAPPING } from './mappings/df4Mapping';
import { DF5_MAPPING } from './mappings/df5Mapping';
import { DF6_MAPPING } from './mappings/df6Mapping';
import { DF7_MAPPING } from './mappings/df7Mapping';
import { DF8_MAPPING } from './mappings/df8Mapping';
import { DF9_MAPPING } from './mappings/df9Mapping';
import { DF10_MAPPING } from './mappings/df10Mapping';

export const GOVERNANCE_OBJECTIVES: GovernanceObjective[] = [
    { id: 'EDM01', name: 'Ensured Governance Framework Setting and Maintenance', domain: 'EDM' },
    { id: 'EDM02', name: 'Ensured Benefits Delivery', domain: 'EDM' },
    { id: 'EDM03', name: 'Ensured Risk Optimisation', domain: 'EDM' },
    { id: 'EDM04', name: 'Ensured Resource Optimisation', domain: 'EDM' },
    { id: 'EDM05', name: 'Ensured Stakeholder Engagement', domain: 'EDM' },
    { id: 'APO01', name: 'Managed I&T Management Framework', domain: 'APO' },
    { id: 'APO02', name: 'Managed Strategy', domain: 'APO' },
    { id: 'APO03', name: 'Managed Enterprise Architecture', domain: 'APO' },
    { id: 'APO04', name: 'Managed Innovation', domain: 'APO' },
    { id: 'APO05', name: 'Managed Portfolio', domain: 'APO' },
    { id: 'APO06', name: 'Managed Budget and Costs', domain: 'APO' },
    { id: 'APO07', name: 'Managed Human Resources', domain: 'APO' },
    { id: 'APO08', name: 'Managed Relationships', domain: 'APO' },
    { id: 'APO09', name: 'Managed Service Agreements', domain: 'APO' },
    { id: 'APO10', name: 'Managed Vendors', domain: 'APO' },
    { id: 'APO11', name: 'Managed Quality', domain: 'APO' },
    { id: 'APO12', name: 'Managed Risk', domain: 'APO' },
    { id: 'APO13', name: 'Managed Security', domain: 'APO' },
    { id: 'APO14', name: 'Managed Data', domain: 'APO' },
    { id: 'BAI01', name: 'Managed Programmes', domain: 'BAI' },
    { id: 'BAI02', name: 'Managed Requirements Definition', domain: 'BAI' },
    { id: 'BAI03', name: 'Managed Solutions Identification and Build', domain: 'BAI' },
    { id: 'BAI04', name: 'Managed Availability and Capacity', domain: 'BAI' },
    { id: 'BAI05', name: 'Managed Organisational Change', domain: 'BAI' },
    { id: 'BAI06', name: 'Managed IT Changes', domain: 'BAI' },
    { id: 'BAI07', name: 'Managed IT Change Acceptance and Transitioning', domain: 'BAI' },
    { id: 'BAI08', name: 'Managed Knowledge', domain: 'BAI' },
    { id: 'BAI09', name: 'Managed Assets', domain: 'BAI' },
    { id: 'BAI10', name: 'Managed Configuration', domain: 'BAI' },
    { id: 'BAI11', name: 'Managed Projects', domain: 'BAI' },
    { id: 'DSS01', name: 'Managed Operations', domain: 'DSS' },
    { id: 'DSS02', name: 'Managed Service Requests and Incidents', domain: 'DSS' },
    { id: 'DSS03', name: 'Managed Problems', domain: 'DSS' },
    { id: 'DSS04', name: 'Managed Continuity', domain: 'DSS' },
    { id: 'DSS05', name: 'Managed Security Services', domain: 'DSS' },
    { id: 'DSS06', name: 'Managed Business Process Controls', domain: 'DSS' },
    { id: 'MEA01', name: 'Managed Performance and Conformance Monitoring', domain: 'MEA' },
    { id: 'MEA02', name: 'Managed System of Internal Control', domain: 'MEA' },
    { id: 'MEA03', name: 'Managed Compliance with External Requirements', domain: 'MEA' },
    { id: 'MEA04', name: 'Managed Assurance', domain: 'MEA' },
];

export const DESIGN_FACTORS: DesignFactor[] = [
    // Stage 1
    { id: 'df1', name: 'Enterprise Strategy', description: 'Rate the importance (1-5) of each strategy archetype.', type: 'rating', archetypes: [{id: 'growth', name: 'Growth/Acquisition'}, {id: 'innovation', name: 'Innovation/Differentiation'}, {id: 'cost', name: 'Cost Leadership'}, {id: 'client', name: 'Client Service/Stability'}] },
    { id: 'df2', name: 'Enterprise Goals', description: 'Rate the importance (1-5) of each enterprise goal.', type: 'rating', categories: [
        {id: 'eg01', name: 'EG01—Portfolio of competitive products and services'}, {id: 'eg02', name: 'EG02—Managed business risk'}, {id: 'eg03', name: 'EG03—Compliance with external laws and regulations'}, {id: 'eg04', name: 'EG04—Quality of financial information'}, {id: 'eg05', name: 'EG05—Customer-oriented service culture'}, {id: 'eg06', name: 'EG06—Business-service continuity and availability'}, {id: 'eg07', name: 'EG07—Quality of management information'}, {id: 'eg08', name: 'EG08—Optimisation of internal business process functionality'}, {id: 'eg09', name: 'EG09—Optimisation of business process costs'}, {id: 'eg10', name: 'EG10—Staff skills, motivation and productivity'}, {id: 'eg11', name: 'EG11—Compliance with internal policies'}, {id: 'eg12', name: 'EG12—Managed digital transformation programmes'}, {id: 'eg13', name: 'EG13—Product and business innovation'}
    ] },
    { id: 'df3', name: 'Risk Profile', description: 'Assess the impact (1-5) and likelihood (1-5) of I&T risk scenarios.', type: 'rating-2d', riskScenarios: [
        {id: 'risk01', name: 'IT investment decision making'}, {id: 'risk02', name: 'Program & projects life cycle management'}, {id: 'risk03', name: 'IT cost & oversight'}, {id: 'risk04', name: 'IT expertise, skills & behavior'}, {id: 'risk05', name: 'Enterprise/IT architecture'}, {id: 'risk06', name: 'IT operational infrastructure incidents'}, {id: 'risk07', name: 'Unauthorized actions'}, {id: 'risk08', name: 'Software adoption/usage problems'}, {id: 'risk09', name: 'Hardware incidents'}, {id: 'risk10', name: 'Software failures'}, {id: 'risk11', name: 'Logical attacks (hacking, malware, etc.)'}, {id: 'risk12', name: 'Third-party/supplier incidents'}, {id: 'risk13', name: 'Noncompliance'}, {id: 'risk14', name: 'Geopolitical Issues'}, {id: 'risk15', name: 'Industrial action'}, {id: 'risk16', name: 'Acts of nature'}, {id: 'risk17', name: 'Technology-based innovation'}, {id: 'risk18', name: 'Environmental'}, {id: 'risk19', name: 'Data & information management'}
    ] },
    // Stage 2
    { id: 'df4', name: 'I&T-Related Issues', description: 'Rate the importance (1-3) of common I&T-related issues.', type: 'rating-1-3', issues: [
        { id: 'issue01', name: 'Frustration between different IT entities across the organization because of a perception of low contribution to business value' }, { id: 'issue02', name: 'Frustration between business departments (i.e., the IT customer) and the IT department because of failed initiatives or a perception of low contribution to business value' }, { id: 'issue03', name: 'Significant I&T-related incidents, such as data loss, security breaches, project failure and application errors, linked to IT' }, { id: 'issue04', name: 'Service delivery problems by the IT outsourcer(s) ' }, { id: 'issue05', name: 'Failures to meet IT-related regulatory or contractual requirements ' }, { id: 'issue06', name: 'Regular audit findings or other assessment reports about poor IT performance or reported IT quality or service problems' }, { id: 'issue07', name: 'Substantial hidden and rogue IT spending, that is, I&T spending by user departments outside the control of the normal I&T investment decision mechanisms and approved budgets' }, { id: 'issue08', name: 'Duplications or overlaps between various initiatives, or other forms of wasted resources' }, { id: 'issue09', name: 'Insufficient IT resources, staff with inadequate skills or staff burnout/dissatisfaction' }, { id: 'issue10', name: 'IT-enabled changes or projects frequently failing to meet business needs and delivered late or over budget' }, { id: 'issue11', name: 'Reluctance by board members, executives or senior management to engage with IT, or a lack of committed business sponsorship for IT' }, { id: 'issue12', name: 'Complex IT operating model and/or unclear decision mechanisms for IT-related decisions' }, { id: 'issue13', name: 'Excessively high cost of IT' }, { id: 'issue14', name: 'Obstructed or failed implementation of new initiatives or innovations caused by the current IT architecture and systems' }, { id: 'issue15', name: 'Gap between business and technical knowledge, which leads to business users and information and/or technology specialists speaking different languages' }, { id: 'issue16', name: 'Regular issues with data quality and integration of data across various sources' }, { id: 'issue17', name: 'High level of end-user computing, creating (among other problems) a lack of oversight and quality control over the applications that are being developed and put in operation' }, { id: 'issue18', name: 'Business departments implementing their own information solutions with little or no involvement of the enterprise IT department (related to end-user computing, which often stems from dissatisfaction with IT solutions and services)' }, { id: 'issue19', name: 'Ignorance of and/or noncompliance with privacy regulations' }, { id: 'issue20', name: 'Inability to exploit new technologies or innovate using I&T' }
    ]},
    { id: 'df5', name: 'Threat Landscape', description: 'Distribute 100% between threat levels.', type: 'percentage', options: [{id: 'df5_high', name: 'High', value: 33}, {id: 'df5_normal', name: 'Normal', value: 67}] },
    { id: 'df6', name: 'Compliance Requirements', description: 'Distribute 100% between compliance levels.', type: 'percentage', options: [{id: 'df6_high', name: 'High', value: 0}, {id: 'df6_normal', name: 'Normal', value: 100}, {id: 'df6_low', name: 'Low', value: 0}] },
    { id: 'df7', name: 'Role of IT', description: 'Rate the importance (1-5) of each role of IT.', type: 'rating', categories: [{id: 'support', name: 'Support'}, {id: 'factory', name: 'Factory'}, {id: 'turnaround', name: 'Turnaround'}, {id: 'strategic', name: 'Strategic'}]},
    { id: 'df8', name: 'Sourcing Model for IT', description: 'Distribute 100% between sourcing models.', type: 'percentage', options: [{id: 'outsourcing', name: 'Outsourcing', value: 33}, {id: 'cloud', name: 'Cloud', value: 33}, {id: 'insourced', name: 'Insourced', value: 34}]},
    { id: 'df9', name: 'IT Implementation Methods', description: 'Distribute 100% between implementation methods.', type: 'percentage', options: [{id: 'agile', name: 'Agile', value: 15}, {id: 'devops', name: 'DevOps', value: 10}, {id: 'traditional', name: 'Traditional', value: 75}]},
    { id: 'df10', name: 'Technology Adoption Strategy', description: 'Distribute 100% between adoption strategies.', type: 'percentage', options: [{id: 'first_mover', name: 'First Mover', value: 15}, {id: 'follower', name: 'Follower', value: 70}, {id: 'slow_adopter', name: 'Slow Adopter', value: 15}] },
];

export const DESIGN_FACTOR_BASELINES: { [key: string]: { [key: string]: number } } = {
  df1: {
    growth: 3,
    innovation: 3,
    cost: 3,
    client: 3,
  },
  df2: {
    eg01: 3, eg02: 3, eg03: 3, eg04: 3, eg05: 3,
    eg06: 3, eg07: 3, eg08: 3, eg09: 3, eg10: 3,
    eg11: 3, eg12: 3, eg13: 3,
  },
  df3: {
    risk01: 9, risk02: 9, risk03: 9, risk04: 9, risk05: 9,
    risk06: 9, risk07: 9, risk08: 9, risk09: 9, risk10: 9,
    risk11: 9, risk12: 9, risk13: 9, risk14: 9, risk15: 9,
    risk16: 9, risk17: 9, risk18: 9, risk19: 9,
  },
  df4: {
    default: 2,
  },
  df5: {
    df5_high: 33,
    df5_normal: 67,
  },
  df6: {
    df6_high: 0,
    df6_normal: 100,
    df6_low: 0,
  },
  df7: {
    support: 3,
    factory: 3,
    turnaround: 3,
    strategic: 3,
  },
  df8: {
    outsourcing: 33,
    cloud: 33,
    insourced: 34,
  },
  df9: {
    agile: 15,
    devops: 10,
    traditional: 75,
  },
  df10: {
    first_mover: 15,
    follower: 70,
    slow_adopter: 15,
  },
};

export const OBJECTIVE_BASELINES: { [objectiveId: string]: { [factorId: string]: number } } = {
    "EDM01": { "df1": 15, "df2": 111, "df3": 189, "df4": 70, "df5": 1.66, "df6": 2, "df7": 25.5, "df8": 1, "df9": 1, "df10": 2.5 },
    "EDM02": { "df1": 24, "df2": 117, "df3": 135, "df4": 70, "df5": 1, "df6": 1, "df7": 22.5, "df8": 1, "df9": 1, "df10": 2.575 },
    "EDM03": { "df1": 15, "df2": 69, "df3": 162, "df4": 47, "df5": 1.99, "df6": 2, "df7": 24, "df8": 1.33, "df9": 1, "df10": 1.075 },
    "EDM04": { "df1": 22.5, "df2": 138, "df3": 198, "df4": 67, "df5": 1, "df6": 1, "df7": 15, "df8": 1, "df9": 1, "df10": 2 },
    "EDM05": { "df1": 18, "df2": 63, "df3": 189, "df4": 41, "df5": 1.33, "df6": 1, "df7": 15, "df8": 1, "df9": 1, "df10": 1.075 },
    "APO01": { "df1": 12, "df2": 183, "df3": 324, "df4": 56, "df5": 1.66, "df6": 1.5, "df7": 19.5, "df8": 1, "df9": 1, "df10": 1.575 },
    "APO02": { "df1": 28.5, "df2": 135, "df3": 144, "df4": 50, "df5": 1, "df6": 1, "df7": 24, "df8": 1, "df9": 1, "df10": 2.925 },
    "APO03": { "df1": 24, "df2": 138, "df3": 171, "df4": 66, "df5": 1.66, "df6": 1, "df7": 18, "df8": 1, "df9": 1.1, "df10": 1.15 },
    "APO04": { "df1": 21, "df2": 126, "df3": 45, "df4": 32, "df5": 1, "df6": 1, "df7": 27, "df8": 1, "df9": 1, "df10": 2.85 },
    "APO05": { "df1": 33, "df2": 141, "df3": 144, "df4": 68, "df5": 1, "df6": 1, "df7": 22.5, "df8": 1, "df9": 1, "df10": 2.5 },
    "APO06": { "df1": 22.5, "df2": 117, "df3": 153, "df4": 62, "df5": 1, "df6": 1, "df7": 15, "df8": 1, "df9": 1, "df10": 1.35 },
    "APO07": { "df1": 15, "df2": 114, "df3": 216, "df4": 47, "df5": 1.33, "df6": 1, "df7": 13.5, "df8": 1, "df9": 1.05, "df10": 1.225 },
    "APO08": { "df1": 21, "df2": 195, "df3": 153, "df4": 70, "df5": 1, "df6": 1, "df7": 19.5, "df8": 1, "df9": 1, "df10": 1.65 },
    "APO09": { "df1": 22.5, "df2": 63, "df3": 117, "df4": 43, "df5": 1.33, "df6": 1, "df7": 19.5, "df8": 2.98, "df9": 1, "df10": 1.425 },
    "APO10": { "df1": 21, "df2": 78, "df3": 216, "df4": 39, "df5": 1.66, "df6": 1, "df7": 21, "df8": 2.98, "df9": 1, "df10": 1.575 },
    "APO11": { "df1": 21, "df2": 132, "df3": 99, "df4": 43, "df5": 1.33, "df6": 1, "df7": 18, "df8": 1, "df9": 1, "df10": 1.425 },
    "APO12": { "df1": 18, "df2": 42, "df3": 90, "df4": 52, "df5": 1.99, "df6": 2, "df7": 22.5, "df8": 1.66, "df9": 1.05, "df10": 1.5 },
    "APO13": { "df1": 16.5, "df2": 45, "df3": 99, "df4": 33, "df5": 1.99, "df6": 1, "df7": 22.5, "df8": 1, "df9": 1, "df10": 1 },
    "APO14": { "df1": 12, "df2": 81, "df3": 198, "df4": 60, "df5": 1.66, "df6": 1.5, "df7": 19.5, "df8": 1, "df9": 1, "df10": 1.925 },
    "BAI01": { "df1": 27, "df2": 129, "df3": 81, "df4": 35, "df5": 1, "df6": 1, "df7": 19.5, "df8": 1, "df9": 1.2, "df10": 2.925 },
    "BAI02": { "df1": 13.5, "df2": 174, "df3": 117, "df4": 51, "df5": 1, "df6": 1, "df7": 24, "df8": 1, "df9": 1.475, "df10": 2.425 },
    "BAI03": { "df1": 13.5, "df2": 165, "df3": 117, "df4": 41, "df5": 1, "df6": 1, "df7": 24, "df8": 1, "df9": 1.65, "df10": 2.5 },
    "BAI04": { "df1": 18, "df2": 72, "df3": 9, "df4": 23, "df5": 1.33, "df6": 1, "df7": 21, "df8": 1, "df9": 1, "df10": 1.425 },
    "BAI05": { "df1": 25.5, "df2": 183, "df3": 72, "df4": 28, "df5": 1, "df6": 1, "df7": 15, "df8": 1, "df9": 1.275, "df10": 2 },
    "BAI06": { "df1": 19.5, "df2": 90, "df3": 135, "df4": 42, "df5": 1.66, "df6": 1, "df7": 19.5, "df8": 1, "df9": 1.475, "df10": 1.925 },
    "BAI07": { "df1": 18, "df2": 69, "df3": 117, "df4": 38, "df5": 1, "df6": 1, "df7": 18, "df8": 1, "df9": 1.375, "df10": 2.425 },
    "BAI08": { "df1": 19.5, "df2": 141, "df3": 135, "df4": 31, "df5": 1, "df6": 1, "df7": 15, "df8": 1, "df9": 1, "df10": 1.075 },
    "BAI09": { "df1": 12, "df2": 51, "df3": 36, "df4": 23, "df5": 1, "df6": 1, "df7": 15, "df8": 1, "df9": 1, "df10": 1 },
    "BAI10": { "df1": 12, "df2": 42, "df3": 99, "df4": 25, "df5": 1.66, "df6": 1, "df7": 16.5, "df8": 1, "df9": 1.175, "df10": 1.075 },
    "BAI11": { "df1": 27, "df2": 138, "df3": 36, "df4": 45, "df5": 1, "df6": 1, "df7": 18, "df8": 1, "df9": 1.225, "df10": 2.425 },
    "DSS01": { "df1": 13.5, "df2": 63, "df3": 135, "df4": 27, "df5": 1, "df6": 1, "df7": 25.5, "df8": 1, "df9": 1.15, "df10": 1 },
    "DSS02": { "df1": 21, "df2": 57, "df3": 144, "df4": 33, "df5": 1.66, "df6": 1, "df7": 25.5, "df8": 1, "df9": 1.05, "df10": 1 },
    "DSS03": { "df1": 18, "df2": 57, "df3": 108, "df4": 32, "df5": 1.33, "df6": 1, "df7": 27, "df8": 1, "df9": 1.05, "df10": 1.075 },
    "DSS04": { "df1": 21, "df2": 69, "df3": 216, "df4": 21, "df5": 1.99, "df6": 1, "df7": 27, "df8": 1, "df9": 1, "df10": 1.075 },
    "DSS05": { "df1": 16.5, "df2": 87, "df3": 216, "df4": 29, "df5": 1.66, "df6": 1, "df7": 27, "df8": 1, "df9": 1, "df10": 1.075 },
    "DSS06": { "df1": 13.5, "df2": 108, "df3": 144, "df4": 29, "df5": 1.66, "df6": 1, "df7": 16.5, "df8": 1, "df9": 1, "df10": 1 },
    "MEA01": { "df1": 12, "df2": 135, "df3": 216, "df4": 61, "df5": 1.66, "df6": 1, "df7": 15, "df8": 2.32, "df9": 1.125, "df10": 2 },
    "MEA02": { "df1": 12, "df2": 138, "df3": 243, "df4": 48, "df5": 1.33, "df6": 1, "df7": 15, "df8": 1, "df9": 1, "df10": 1 },
    "MEA03": { "df1": 12, "df2": 39, "df3": 153, "df4": 29, "df5": 1.66, "df6": 2, "df7": 13.5, "df8": 1, "df9": 1, "df10": 1 },
    "MEA04": { "df1": 12, "df2": 114, "df3": 225, "df4": 58, "df5": 1.66, "df6": 2, "df7": 15, "df8": 1, "df9": 1, "df10": 1 }
};

export const MAPPING_TABLES = {
    ...DF2_MAPPING,
    ...DF3_MAPPING,
    ...DF4_MAPPING,
    ...DF5_MAPPING,
    ...DF6_MAPPING,
    ...DF7_MAPPING,
    ...DF8_MAPPING,
    ...DF9_MAPPING,
    ...DF10_MAPPING,
};