
export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  FIELD_STAFF = 'FIELD_STAFF'
}

export interface UserSession {
  message: string;
  employeeId: string;
  name?: string;
  role: Role;
}

export interface FormCount {
  today: number;
  monthly: number;
  total: number;
}

export interface FamilyMember {
  id?: number;
  name: string;
  gender: string;
  dateOfBirth?: string;
  educationQualification?: string;
  profession?: string;
  relationshipWithCardHolder?: string;
  mobile?: string;
  photoUrl?: string;
  // Staff specific fields (fallback)
  phone?: string; 
  relation?: string;
}

export interface Customer {
  id: string;
  memberIdNo: string;
  name: string; 
  gender: string;
  mobile: string;
  whatsappNo: string;
  dateOfBirth: string;
  profession: string;
  email: string;
  address: string;
  
  patientPhotoUrl?: string;
  familyPhotoUrl?: string;
  
  bloodTestRequired: boolean;
  otherTestRequired: boolean;
  otherTestName?: string;
  
  regularMedicine: boolean;
  medicineName?: string;
  medicinePrescriptionPhotoUrl?: string; // Comma separated string from backend
  
  paymentMode: 'ONLINE' | 'OFFLINE';
  onlinePaymentQrUrl?: string;
  paymentScreenshotUrl?: string;
  
  joiningDate: string;
  cardValidityUpto: string;
  noOfpatient?: string;
  
  medicalServiceReferenceBy: string;
  idCardPdfUrl?: string;
  familyMembers: FamilyMember[];
  
  createdAt?: string;
  createdBy?: any;
}

export interface Staff {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  mobileNumber: string; 
  password?: string;
  alternateMobileNumber?: string;
  role: Role;
  bloodGroup?: string;
  gender?: string;
  dateOfBirth?: string;
  address?: string;
  designation?: string;
  
  profileImageUrl?: string;
  resumeUrl?: string;
  aadharFrontSideUrl?: string;
  aadharBackSideUrl?: string;
  idCardPdfUrl?: string;
  
  familyMembers: FamilyMember[];
}

export interface SurveyForm {
  id: string;
  formName: string;
  fields: SurveyField[];
}

export interface SurveyField {
  name: string;
  label: string;
  fieldType: 'SHORT_TEXT' | 'NUMBER' | 'DATE' | 'IMAGE';
  required: boolean;
  fieldOrder: number;
}

export interface SurveyResult {
  id: string;
  submittedBy: string;
  submissionDate: string;
  data: Record<string, any>;
}
