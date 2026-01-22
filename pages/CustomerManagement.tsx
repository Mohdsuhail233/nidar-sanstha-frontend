import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, useNavigate, useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../App';
import { Customer, Role, FamilyMember } from '../types';
import { 
  Search, 
  Eye, 
  Edit3, 
  ChevronLeft, 
  Loader2, 
  Calendar,
  Plus,
  Trash2,
  Download,
  Smartphone,
  User,
  Upload,
  Users,
  Clock,
  Camera,
  Users2,
  Stethoscope,
  Info,
  UserCircle,
  CreditCard,
  HeartPulse,
  MapPin,
  Save,
  QrCode,
  X,
  Maximize2,
  BookOpen,
  Briefcase,
  CalendarCheck,
  ShieldCheck,
  Fingerprint,
  Droplet,
  FileText,
  Activity,
  CheckCircle2
} from 'lucide-react';

// ==========================================
// 1. CAMERA MODAL COMPONENT (EXPANDED)
// ==========================================
const CameraModal: React.FC<{ onCapture: (file: File) => void; onClose: () => void }> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    async function startCamera() {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } 
        });
        setStream(s);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }
      } catch (err) {
        console.error("Camera Error:", err);
        alert("Camera access denied or hardware not found.");
        onClose();
      }
    }
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const capture = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context?.drawImage(videoRef.current, 0, 0);
      
      canvasRef.current.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `node_capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
          onCapture(file);
          onClose();
        }
      }, 'image/jpeg', 0.95);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-[999] flex items-center justify-center p-4 backdrop-blur-md">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl relative border border-white/20">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <h3 className="text-xs font-black text-gray-700 uppercase tracking-[0.2em]">Live Registry Capture</h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-3 hover:bg-gray-200 rounded-full transition-all active:scale-90"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        
        <div className="relative aspect-video bg-black">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 border-[20px] border-black/20 pointer-events-none" />
        </div>
        
        <canvas ref={canvasRef} className="hidden" />
        
        <div className="p-10 text-center bg-white">
          <button 
            onClick={capture} 
            className="w-20 h-20 rounded-full border-[6px] border-blue-600 flex items-center justify-center group mx-auto transition-all active:scale-95 hover:shadow-2xl shadow-blue-200"
          >
             <div className="w-14 h-14 bg-blue-600 rounded-full group-hover:scale-90 transition-all shadow-inner" />
          </button>
          <p className="mt-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Commit to Registry Database</p>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 2. PHOTO PREVIEW MODAL (FULL SCREEN)
// ==========================================
const PhotoPreviewModal: React.FC<{ url: string; title: string; onClose: () => void }> = ({ url, title, onClose }) => (
  <div 
    className="fixed inset-0 bg-black/95 z-[1000] flex items-center justify-center p-6 backdrop-blur-xl animate-in fade-in duration-300"
    onClick={onClose}
  >
    <div className="max-w-5xl w-full relative animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
      <button 
        onClick={onClose} 
        className="absolute -top-16 right-0 text-white p-4 hover:bg-white/10 rounded-full transition-all"
      >
        <X size={40} strokeWidth={1.5} />
      </button>
      
      <div className="bg-white/5 p-2 rounded-[2.5rem] shadow-2xl border border-white/10">
        <img 
          src={url} 
          alt={title} 
          className="max-h-[75vh] w-auto mx-auto rounded-[2rem] object-contain shadow-2xl" 
        />
      </div>
      
      <div className="mt-8 text-center">
        <h4 className="text-white text-xl font-black uppercase tracking-[0.4em] mb-2">{title}</h4>
        <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Registry Asset Decryption Successful</p>
      </div>
    </div>
  </div>
);

// ==========================================
// 3. CUSTOMER LIST VIEW
// ==========================================
const CustomerList: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchCustomers(); }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/form/all');
      setCustomers(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("List Fetch Error:", err);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchValue.trim();
    if (!query) { fetchCustomers(); return; }
    
    setLoading(true);
    let endpoint = '';
    const upperQuery = query.toUpperCase();
    
    if (/^\d{10}$/.test(query)) {
      endpoint = `/form/mobile?mobile=${query}`;
    } else if (upperQuery.startsWith('NID') || upperQuery.startsWith('NDR') || /^\d+$/.test(query)) {
      endpoint = `/form/search-by-idCardNumber?idCard=${encodeURIComponent(query)}`;
    } else if (query.includes('-') || query.includes('/')) {
      endpoint = `/form/search-by-dob?dob=${query.replace(/\//g, '-')}`;
    } else {
      endpoint = `/form/search-by-name?name=${encodeURIComponent(query)}`;
    }

    try {
      const response = await api.get(endpoint);
      setCustomers(Array.isArray(response.data) ? response.data : (response.data ? [response.data] : []));
    } catch {
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">Patient Registry</h1>
          <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">Beneficiary Node Management System</p>
        </div>
        
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-96 h-14">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search Name, Mobile or ID..."
              className="w-full h-full pl-14 pr-6 bg-white border-2 border-gray-100 rounded-2xl outline-none focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/5 font-bold text-sm transition-all shadow-sm"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </div>
          <button 
            type="submit" 
            className="h-14 px-10 bg-blue-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-100 active:scale-95 transition-all"
          >
            Execute Search
          </button>
        </form>
      </div>

      <div className="bg-white rounded-[3.5rem] border border-gray-100 shadow-xl shadow-gray-50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Patient Profile Node</th>
                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Registry Metadata</th>
                <th className="px-10 py-6 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={3} className="px-10 py-32 text-center"><Loader2 className="animate-spin mx-auto text-blue-500" size={56} /></td></tr>
              ) : customers.length === 0 ? (
                <tr><td colSpan={3} className="px-10 py-32 text-center text-gray-300 font-black uppercase tracking-[0.2em] italic">No Records Found In Active Registry</td></tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-blue-50/30 transition-all group cursor-default">
                    <td className="px-10 py-7">
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-gray-100 border-2 border-white overflow-hidden ring-4 ring-gray-50 shadow-md group-hover:scale-105 transition-transform">
                          {c.patientPhotoUrl ? <img src={c.patientPhotoUrl} className="w-full h-full object-cover" /> : <UserCircle size={28} className="m-auto mt-3 text-gray-300" />}
                        </div>
                        <div>
                          <p className="font-black text-gray-900 capitalize text-lg tracking-tight leading-tight">{c.name}</p>
                          <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest mt-1 flex items-center gap-2">
                             <Droplet size={10} className="text-red-500" /> {c.gender} | {c.bloodGroup || 'PENDING'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-7">
                      <p className="font-black text-gray-700 tracking-tight text-md">{c.mobile}</p>
                      <p className="text-[10px] text-gray-400 mt-1 font-black uppercase tracking-widest flex items-center gap-2">
                         <Fingerprint size={12} /> {c.memberIdNo || 'UID_NODE_EMPTY'}
                      </p>
                    </td>
                    <td className="px-10 py-7 text-right space-x-3">
                      <Link to={`/customers/view/${c.id}`} className="inline-flex p-4 text-gray-400 hover:text-blue-600 hover:bg-blue-100/50 rounded-2xl transition-all shadow-sm active:scale-90"><Eye size={22} /></Link>
                      <Link to={`/customers/edit/${c.id}`} className="inline-flex p-4 text-gray-400 hover:text-indigo-600 hover:bg-indigo-100/50 rounded-2xl transition-all shadow-sm active:scale-90"><Edit3 size={22} /></Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 4. CUSTOMER FORM (REGISTRATION & SYNC)
// ==========================================
const CustomerForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!id);
  const [showCamera, setShowCamera] = useState<{ type: string; index?: number } | null>(null);

  // Core Form State
  const [formData, setFormData] = useState<Partial<Customer>>({
    name: '',
    gender: 'MALE',
    bloodGroup: '',
    mobile: '',
    whatsappNo: '',
    dateOfBirth: '',
    profession: '',
    email: '',
    address: '',
    bloodTestRequired: false,
    otherTestRequired: false,
    otherTestName: '',
    paymentMode: 'OFFLINE',
    familyMembers: [],
    regularMedicine: false,
    medicineName: '',
    noOfpatient: '0',
    cardValidityUpto: '',
    medicalServiceReferenceBy: ''
  });

  // Assets State
  const [files, setFiles] = useState<Record<string, File>>({});
  const [prescriptionFiles, setPrescriptionFiles] = useState<File[]>([]);
  const [familyPhotos, setFamilyPhotos] = useState<Record<number, File>>({});

  useEffect(() => {
    if (id) {
      const fetchData = async () => {
        setFetching(true);
        try {
          const resp = await api.get(`/form/view/${id}`);
          if (resp.data) {
            setFormData({ 
              ...resp.data, 
              familyMembers: resp.data.familyMembers || [] 
            });
          }
        } catch (err) { 
           console.error("Node Fetch Error:", err);
           navigate('/customers/list');
        } finally { 
           setFetching(false); 
        }
      };
      fetchData();
    }
  }, [id, navigate]);

  const handleInputChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleFileCapture = (file: File, type: string, index?: number) => {
    if (type === 'patientPhoto') setFiles(prev => ({ ...prev, patientPhoto: file }));
    if (type === 'paymentScreenshot') setFiles(prev => ({ ...prev, paymentScreenshot: file }));
    if (type === 'prescriptionPhoto') setPrescriptionFiles(prev => [...prev, file]);
    if (type === 'familyPhoto' && index !== undefined) setFamilyPhotos(prev => ({ ...prev, [index]: file }));
  };

  const addFamilyMember = () => {
    setFormData(prev => ({
      ...prev,
      familyMembers: [
        ...(prev.familyMembers || []), 
        { 
          name: '', 
          gender: 'MALE', 
          dateOfBirth: '', 
          educationQualification: '', 
          profession: '', 
          relationshipWithCardHolder: '', 
          mobile: '' 
        } as FamilyMember
      ]
    }));
  };

  const updateFamilyMember = (index: number, field: string, value: string) => {
    const updated = [...(formData.familyMembers || [])];
    updated[index] = { ...updated[index], [field]: value } as FamilyMember;
    setFormData(prev => ({ ...prev, familyMembers: updated }));
  };

  const removeFamilyMember = (index: number) => {
    setFormData(prev => ({ 
      ...prev, 
      familyMembers: (prev.familyMembers || []).filter((_, i) => i !== index) 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const data = new FormData();
    const submissionData = { ...formData };
    
    // Clean data for JSON Blob
    const urlsToStrip = [
      'patientPhotoUrl', 'familyPhotoUrl', 'onlinePaymentQrUrl', 
      'paymentScreenshotUrl', 'medicinePrescriptionPhotoUrl', 
      'idCardPdfUrl', 'createdAt', 'createdBy'
    ];
    urlsToStrip.forEach(f => delete (submissionData as any)[f]);
    
    data.append('data', new Blob([JSON.stringify(submissionData)], { type: 'application/json' }));
    
    // Append core files
    if (files.patientPhoto) data.append('patientPhoto', files.patientPhoto);
    if (files.paymentScreenshot) data.append('paymentScreenshot', files.paymentScreenshot);
    
    // Append multi-files
    prescriptionFiles.forEach(file => data.append('medicinePrescriptionPhoto', file));
    
    // Append family photos mapping
    submissionData.familyMembers?.forEach((_, i) => { 
      if (familyPhotos[i]) data.append('familyPhotos', familyPhotos[i]); 
    });

    try {
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      let response;
      
      if (id) response = await api.put(`/form/update/${id}`, data, config);
      else response = await api.post('/form/create', data, config);
      
      if (user?.role === Role.FIELD_STAFF) {
        alert(`NODE SYNC SUCCESSFUL!\nPatient: ${response.data.name}\nID: ${response.data.memberIdNo}`);
        navigate('/');
      } else {
        alert('Registry record synchronized successfully.');
        navigate('/customers/list');
      }
    } catch (err: any) { 
      alert(`Sync Failure: ${err.response?.data?.message || 'Server Link Fault'}`); 
    } finally { 
      setLoading(false); 
    }
  };

  if (fetching) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50/50">
        <Loader2 className="animate-spin text-blue-600 mb-6" size={64} />
        <p className="text-[11px] font-black uppercase tracking-[0.5em] text-gray-400">Decrypting Node Identity...</p>
      </div>
    );
  }

  const inputClass = "w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/5 focus:bg-white font-black text-sm transition-all placeholder:text-gray-300";
  const labelClass = "text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 block ml-2";

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-40 animate-in fade-in duration-500">
      {showCamera && <CameraModal onCapture={(f) => handleFileCapture(f, showCamera.type, showCamera.index)} onClose={() => setShowCamera(null)} />}
      
      <div className="flex items-center gap-6">
        <button onClick={() => navigate(-1)} className="p-5 bg-white border-2 border-gray-100 rounded-[1.5rem] shadow-sm hover:bg-gray-50 active:scale-90 transition-all"><ChevronLeft size={32} /></button>
        <div className="space-y-1">
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter uppercase">{id ? 'Edit Node' : 'New Registry'}</h1>
          <p className="text-gray-400 text-xs font-black uppercase tracking-[0.3em]">Beneficiary Data Integration</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-20 bg-white p-12 md:p-20 rounded-[4rem] border border-gray-100 shadow-2xl shadow-gray-200/50 relative overflow-hidden">
        {/* Section 1: Core Identity */}
        <section className="relative">
          <div className="flex items-center gap-4 mb-14 pb-6 border-b-2 border-gray-50">
            <UserCircle className="text-blue-600" size={32} strokeWidth={2.5} />
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-[0.5em]">01. Primary Identity Node</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="md:col-span-2 flex flex-col items-center gap-8 mb-10">
               <div className="w-64 h-64 bg-gray-50 border-4 border-dashed border-gray-200 rounded-[3.5rem] flex items-center justify-center overflow-hidden ring-[16px] ring-gray-50 shadow-inner relative group">
                  {(files.patientPhoto || formData.patientPhotoUrl) ? (
                    <img 
                      src={files.patientPhoto ? URL.createObjectURL(files.patientPhoto) : formData.patientPhotoUrl} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    />
                  ) : <Camera size={80} className="text-gray-200" />}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all cursor-pointer" onClick={() => setShowCamera({ type: 'patientPhoto' })}>
                    <Maximize2 className="text-white" size={40} />
                  </div>
               </div>
               <div className="flex gap-4">
                  <label className="px-10 py-4 bg-gray-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95">
                    Upload Asset
                    <input type="file" className="hidden" onChange={e => e.target.files && handleFileCapture(e.target.files[0], 'patientPhoto')} />
                  </label>
                  <button type="button" onClick={() => setShowCamera({ type: 'patientPhoto' })} className="px-10 py-4 bg-blue-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-200 active:scale-95 transition-all">
                    Live Capture
                  </button>
               </div>
            </div>
            
            <div className="space-y-2"><label className={labelClass}>Full Legal Name *</label><input name="name" value={formData.name || ''} onChange={handleInputChange} required className={inputClass} placeholder="Full name node" /></div>
            
            <div className="grid grid-cols-2 gap-6">
              <div><label className={labelClass}>Gender Identity *</label><select name="gender" value={formData.gender} onChange={handleInputChange} className={inputClass}><option value="MALE">MALE</option><option value="FEMALE">FEMALE</option></select></div>
              <div><label className={labelClass}>Blood Node Group</label><select name="bloodGroup" value={formData.bloodGroup || ''} onChange={handleInputChange} className={inputClass}><option value="">PENDING</option><option value="A+">A+</option><option value="A-">A-</option><option value="B+">B+</option><option value="B-">B-</option><option value="O+">O+</option><option value="O-">O-</option><option value="AB+">AB+</option><option value="AB-">AB-</option></select></div>
            </div>

            <div className="space-y-2"><label className={labelClass}>Primary Mobile *</label><input name="mobile" maxLength={10} value={formData.mobile || ''} onChange={handleInputChange} required className={inputClass} placeholder="10-digit primary" /></div>
            <div className="space-y-2"><label className={labelClass}>WhatsApp Link</label><input name="whatsappNo" maxLength={10} value={formData.whatsappNo || ''} onChange={handleInputChange} className={inputClass} placeholder="Optional" /></div>
            <div className="space-y-2"><label className={labelClass}>Registry Birth Date *</label><input type="date" name="dateOfBirth" value={formData.dateOfBirth || ''} onChange={handleInputChange} required className={inputClass} /></div>
            <div className="space-y-2"><label className={labelClass}>Email Sub-node</label><input type="email" name="email" value={formData.email || ''} onChange={handleInputChange} className={inputClass} placeholder="Registry email" /></div>

            <div className="md:col-span-2 space-y-2">
              <label className={labelClass}>Comprehensive Residential Address *</label>
              <textarea name="address" value={formData.address || ''} onChange={handleInputChange} required className={`${inputClass} h-40 pt-6 resize-none`} placeholder="Full detailed residential records" />
            </div>
          </div>
        </section>

        {/* Section 2: Medical Evidence & Data */}
        <section>
          <div className="flex items-center gap-4 mb-14 pb-6 border-b-2 border-gray-50">
            <HeartPulse className="text-blue-600" size={32} strokeWidth={2.5} />
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-[0.5em]">02. Health Assets & Diagnostics</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            {/* Medication Logic */}
            <div className="space-y-8">
               <label className="flex items-center gap-5 p-8 bg-gray-50 rounded-[2.5rem] border-2 border-gray-100 cursor-pointer group hover:bg-white hover:border-blue-200 transition-all shadow-sm">
                 <input type="checkbox" name="regularMedicine" checked={formData.regularMedicine} onChange={handleInputChange} className="w-8 h-8 rounded-xl accent-blue-600 transition-all shadow-md" />
                 <span className="text-md font-black text-gray-800 uppercase tracking-tight">Active Regular Medication</span>
               </label>
               
               {formData.regularMedicine && (
                 <div className="space-y-8 animate-in slide-in-from-top-6 duration-500">
                    <input name="medicineName" value={formData.medicineName || ''} onChange={handleInputChange} className={inputClass} placeholder="Primary medicine name node" />
                    
                    <div className="p-10 bg-gray-50 border-4 border-dashed border-gray-200 rounded-[3rem] flex flex-col items-center gap-8 relative">
                       <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-3"><FileText size={16} /> Attached Prescriptions ({prescriptionFiles.length})</p>
                       
                       <div className="flex flex-wrap gap-4 justify-center">
                          {prescriptionFiles.map((f, i) => (
                            <div key={i} className="w-20 h-20 rounded-2xl border-4 border-white shadow-xl overflow-hidden group relative">
                              <img src={URL.createObjectURL(f)} className="w-full h-full object-cover" />
                              <button type="button" onClick={() => setPrescriptionFiles(prev => prev.filter((_, idx) => idx !== i))} className="absolute inset-0 bg-red-600/80 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-all"><Trash2 size={24} /></button>
                            </div>
                          ))}
                          
                          <label className="w-20 h-20 bg-gray-900 text-white rounded-2xl flex items-center justify-center cursor-pointer shadow-xl hover:bg-black active:scale-90 transition-all ring-8 ring-white">
                            <Plus size={32} />
                            <input type="file" multiple className="hidden" onChange={e => e.target.files && Array.from(e.target.files).forEach(f => handleFileCapture(f, 'prescriptionPhoto'))} />
                          </label>
                       </div>
                       
                       <button type="button" onClick={() => setShowCamera({ type: 'prescriptionPhoto' })} className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">Or Capture Live Prescription</button>
                    </div>
                 </div>
               )}
            </div>

            {/* Test Requirements */}
            <div className="space-y-8">
               <label className="flex items-center gap-5 p-8 bg-gray-50 rounded-[2.5rem] border-2 border-gray-100 cursor-pointer group hover:bg-white hover:border-blue-200 transition-all shadow-sm">
                 <input type="checkbox" name="bloodTestRequired" checked={formData.bloodTestRequired} onChange={handleInputChange} className="w-8 h-8 rounded-xl accent-blue-600 shadow-md" />
                 <span className="text-md font-black text-gray-800 uppercase tracking-tight">Requires Blood Analysis</span>
               </label>
               
               <label className="flex items-center gap-5 p-8 bg-gray-50 rounded-[2.5rem] border-2 border-gray-100 cursor-pointer group hover:bg-white hover:border-blue-200 transition-all shadow-sm">
                 <input type="checkbox" name="otherTestRequired" checked={formData.otherTestRequired} onChange={handleInputChange} className="w-8 h-8 rounded-xl accent-blue-600 shadow-md" />
                 <span className="text-md font-black text-gray-800 uppercase tracking-tight">Other Diagnostic Procedures</span>
               </label>

               {formData.otherTestRequired && (
                 <input name="otherTestName" value={formData.otherTestName || ''} onChange={handleInputChange} className={inputClass} placeholder="Specify diagnostic procedure name" />
               )}
            </div>
          </div>
        </section>

        {/* Section 3: Kinship Registry (Family) */}
        <section>
          <div className="flex items-center justify-between mb-14 pb-6 border-b-2 border-gray-50">
            <div className="flex items-center gap-4">
               <Users2 className="text-blue-600" size={32} strokeWidth={2.5} />
               <h3 className="text-sm font-black text-gray-900 uppercase tracking-[0.5em]">03. Kinship Database Integration</h3>
            </div>
            <button 
              type="button" 
              onClick={addFamilyMember} 
              className="px-8 py-4 bg-blue-50 text-blue-600 rounded-[2rem] text-[11px] font-black uppercase tracking-widest hover:bg-blue-100 flex items-center gap-3 transition-all active:scale-95 shadow-sm"
            >
              <Plus size={20} /> Register New Member
            </button>
          </div>

          <div className="space-y-10">
             {formData.familyMembers?.map((m, idx) => (
               <div key={idx} className="p-10 bg-gray-50/50 rounded-[3.5rem] border-2 border-gray-100 relative group animate-in slide-in-from-right-8 duration-500 hover:bg-white hover:border-blue-100 transition-all">
                  <button 
                    type="button" 
                    onClick={() => removeFamilyMember(idx)} 
                    className="absolute top-8 right-8 p-3 text-gray-300 hover:text-red-500 hover:bg-white rounded-full shadow-md transition-all active:scale-90"
                  >
                    <Trash2 size={24} />
                  </button>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                     <div className="lg:col-span-3 flex flex-col items-center gap-6">
                        <div className="w-32 h-32 bg-white rounded-[2.5rem] border-4 border-dashed border-gray-200 flex items-center justify-center overflow-hidden ring-[10px] ring-gray-100 shadow-xl relative group/item">
                            {(familyPhotos[idx] || m.photoUrl) ? (
                              <img src={familyPhotos[idx] ? URL.createObjectURL(familyPhotos[idx]) : m.photoUrl} className="w-full h-full object-cover" />
                            ) : <User size={48} className="text-gray-100" />}
                        </div>
                        <div className="flex flex-col gap-2 w-full px-4">
                          <label className="text-[10px] font-black text-blue-600 cursor-pointer uppercase hover:underline text-center tracking-widest">
                            Upload
                            <input type="file" className="hidden" onChange={e => e.target.files && handleFileCapture(e.target.files[0], 'familyPhoto', idx)} />
                          </label>
                          <button type="button" onClick={() => setShowCamera({ type: 'familyPhoto', index: idx })} className="text-[10px] font-black text-emerald-600 uppercase hover:underline text-center tracking-widest">Live Scan</button>
                        </div>
                     </div>
                     
                     <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2"><label className={labelClass}>Member Name</label><input value={m.name} onChange={e => updateFamilyMember(idx, 'name', e.target.value)} className={inputClass} placeholder="Legal name" /></div>
                        <div className="space-y-2"><label className={labelClass}>Kinship Relation</label><input value={m.relationshipWithCardHolder} onChange={e => updateFamilyMember(idx, 'relationshipWithCardHolder', e.target.value)} className={inputClass} placeholder="e.g. Spouse / Sibling" /></div>
                        <div className="space-y-2"><label className={labelClass}>Mobile Primary</label><input value={m.mobile} onChange={e => updateFamilyMember(idx, 'mobile', e.target.value)} className={inputClass} placeholder="Contact" /></div>
                        <div className="space-y-2"><label className={labelClass}>Gender</label><select value={m.gender} onChange={e => updateFamilyMember(idx, 'gender', e.target.value)} className={inputClass}><option value="MALE">MALE</option><option value="FEMALE">FEMALE</option></select></div>
                        <div className="space-y-2"><label className={labelClass}>Registry Birth Date</label><input type="date" value={m.dateOfBirth} onChange={e => updateFamilyMember(idx, 'dateOfBirth', e.target.value)} className={inputClass} /></div>
                        <div className="space-y-2"><label className={labelClass}>Education Registry</label><input value={m.educationQualification} onChange={e => updateFamilyMember(idx, 'educationQualification', e.target.value)} className={inputClass} placeholder="Highest degree" /></div>
                        <div className="md:col-span-2 space-y-2"><label className={labelClass}>Active Profession Node</label><input value={m.profession} onChange={e => updateFamilyMember(idx, 'profession', e.target.value)} className={inputClass} placeholder="Occupation details" /></div>
                     </div>
                  </div>
               </div>
             ))}
             {formData.familyMembers?.length === 0 && (
               <div className="py-24 text-center border-4 border-dashed border-gray-50 rounded-[4rem] flex flex-col items-center">
                  <Users className="text-gray-100 mb-6" size={80} />
                  <p className="text-gray-300 font-black uppercase text-sm tracking-[0.4em]">No Kinship Nodes Discovered</p>
               </div>
             )}
          </div>
        </section>

        {/* Section 4: Registry Protocol & Validity */}
        <section>
          <div className="flex items-center gap-4 mb-14 pb-6 border-b-2 border-gray-50">
            <ShieldCheck className="text-blue-600" size={32} strokeWidth={2.5} />
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-[0.5em]">04. Protocol & Transaction Logs</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="md:col-span-2 bg-blue-50/50 p-10 rounded-[3rem] border-2 border-blue-100 shadow-inner flex flex-col gap-6">
               <label className="text-xs font-black text-blue-600 uppercase tracking-[0.4em] ml-2">Node Registry Expiration Protocol *</label>
               <input type="date" name="cardValidityUpto" value={formData.cardValidityUpto || ''} onChange={handleInputChange} required className={`${inputClass} border-blue-200 shadow-xl`} />
            </div>

            <div className="space-y-10">
               <div className="space-y-2"><label className={labelClass}>Payment Protocol *</label><select name="paymentMode" value={formData.paymentMode} onChange={handleInputChange} className={inputClass}><option value="OFFLINE">CASH DISPATCH (OFFLINE)</option><option value="ONLINE">CRYPTO/UPI SYNC (ONLINE)</option></select></div>
               <div className="space-y-2"><label className={labelClass}>Referred By Node</label><input name="medicalServiceReferenceBy" value={formData.medicalServiceReferenceBy || ''} onChange={handleInputChange} className={inputClass} placeholder="Reference Name" /></div>
            </div>

            <div className="p-10 bg-gray-50 rounded-[3.5rem] border-4 border-dashed border-gray-200 flex flex-col items-center gap-8 relative overflow-hidden group">
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em]">Transaction Evidence Hub</p>
                {(files.paymentScreenshot || formData.paymentScreenshotUrl) ? (
                  <div className="flex flex-col items-center gap-6 animate-in zoom-in-95">
                    <div className="w-36 h-36 rounded-[2rem] overflow-hidden border-8 border-white shadow-2xl relative group/ss">
                      <img src={files.paymentScreenshot ? URL.createObjectURL(files.paymentScreenshot) : formData.paymentScreenshotUrl} className="w-full h-full object-cover group-hover/ss:scale-110 transition-all duration-700" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/ss:opacity-100 flex items-center justify-center transition-all">
                        <CheckCircle2 className="text-white" size={40} />
                      </div>
                    </div>
                    <label className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] cursor-pointer hover:underline">Synchronize New Receipt<input type="file" className="hidden" onChange={e => e.target.files && handleFileCapture(e.target.files[0], 'paymentScreenshot')} /></label>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-6">
                    <QrCode size={64} className="text-gray-200" />
                    <div className="flex gap-4">
                      <label className="px-8 py-3 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer shadow-xl hover:bg-black transition-all">Upload SS<input type="file" className="hidden" onChange={e => e.target.files && handleFileCapture(e.target.files[0], 'paymentScreenshot')} /></label>
                      <button type="button" onClick={() => setShowCamera({ type: 'paymentScreenshot' })} className="px-8 py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-blue-700 active:scale-90 transition-all">Live SS</button>
                    </div>
                  </div>
                )}
            </div>
          </div>
        </section>

        {/* Submit Execution */}
        <div className="pt-10">
          <button 
            disabled={loading} 
            type="submit" 
            className="w-full py-10 bg-blue-600 text-white font-black rounded-[3rem] shadow-[0_30px_60px_-15px_rgba(37,99,235,0.3)] hover:bg-blue-700 hover:-translate-y-1 active:scale-[0.98] transition-all flex items-center justify-center gap-8 text-3xl uppercase tracking-[0.4em] antialiased border-b-[10px] border-blue-800"
          >
            {loading ? <Loader2 className="animate-spin" size={48} /> : <Save size={48} strokeWidth={2.5} />} 
            Execute Registry Sync
          </button>
          <p className="text-center mt-8 text-[9px] font-black text-gray-300 uppercase tracking-[0.6em]">System Protocol 4.10.2 - Authorized Personnel Only</p>
        </div>
      </form>
    </div>
  );
};

// ==========================================
// 5. CUSTOMER DETAIL VIEW (COMPLETE PREVIEWS)
// ==========================================
const CustomerDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [c, setC] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const resp = await api.get(`/form/view/${id}`);
        if (resp.data) setC(resp.data);
      } catch (err) {
        console.error("Detail Error:", err);
        setC(null);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handlePreview = (url: string) => {
    if (url.toLowerCase().endsWith('.pdf')) window.open(url, '_blank');
    else setPreviewUrl(url);
  };

  const downloadIdCard = async () => {
    if (!id || !c) return;
    setDownloading(true);
    try {
      const response = await api.post(`/patient/generate-idcard/${id}`);
      const cloudUrl = typeof response.data === 'string' ? response.data : response.data?.url || response.data?.data;
      if (cloudUrl && cloudUrl.startsWith('http')) {
        const fileResponse = await fetch(cloudUrl);
        const blob = await fileResponse.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Patient_ID_${c.memberIdNo}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch { alert("Identity Protocol Fault."); } finally { setDownloading(false); }
  };

  if (loading) return <div className="h-screen flex flex-col items-center justify-center"><Loader2 className="animate-spin text-blue-600 mb-6" size={64} /><p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400">Accessing Node Database...</p></div>;
  if (!c) return <div className="h-screen flex flex-col items-center justify-center gap-6"><Info size={80} className="text-gray-100" /><p className="text-gray-400 font-black uppercase tracking-widest">Personnel Node Not Found</p></div>;

  const prescriptionUrls = c.medicinePrescriptionPhotoUrl ? c.medicinePrescriptionPhotoUrl.split(',') : [];

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-32 animate-in fade-in duration-700">
      {/* Dynamic Asset Preview */}
      {previewUrl && <PhotoPreviewModal url={previewUrl} title="Asset Decryption" onClose={() => setPreviewUrl(null)} />}
      
      {/* Header Profile Section */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-10 bg-white p-10 md:p-14 rounded-[4rem] shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row items-center gap-10">
          <button onClick={() => navigate(-1)} className="p-5 bg-gray-50 rounded-[1.5rem] hover:bg-gray-100 transition-all active:scale-90 shadow-inner border border-gray-100"><ChevronLeft size={32} /></button>
          <div className="text-center md:text-left space-y-4">
            <h1 className="text-5xl font-black text-gray-900 capitalize tracking-tighter leading-none">{c.name}</h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
               <span className="text-blue-600 bg-blue-50 px-6 py-2 rounded-2xl text-[11px] font-black uppercase border-2 border-blue-100 tracking-widest shadow-sm">NODE_ID: {c.memberIdNo}</span>
               <span className="text-emerald-600 bg-emerald-50 px-6 py-2 rounded-2xl text-[11px] font-black uppercase border-2 border-emerald-100 tracking-widest shadow-sm">VALID_UPTO: {c.cardValidityUpto || 'TBD'}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <button onClick={downloadIdCard} disabled={downloading} className="px-10 py-5 bg-blue-600 text-white rounded-[2rem] font-black text-[11px] uppercase tracking-[0.2em] flex items-center gap-4 hover:bg-blue-700 shadow-[0_20px_40px_-10px_rgba(37,99,235,0.4)] active:scale-95 disabled:opacity-50 transition-all">
            {downloading ? <Loader2 size={22} className="animate-spin" /> : <Download size={22} strokeWidth={2.5} />} Generate ID Protocol
          </button>
          <Link to={`/customers/edit/${c.id}`} className="p-5 bg-gray-900 text-white rounded-[1.5rem] hover:bg-black transition-all shadow-xl active:scale-95"><Edit3 size={32} /></Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Profile Sidebar */}
        <div className="lg:col-span-4 space-y-12">
          <div className="bg-white rounded-[4rem] border border-gray-100 shadow-sm p-12 flex flex-col items-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-indigo-600" />
            <div className="w-56 h-56 rounded-full border-[8px] border-gray-50 shadow-2xl overflow-hidden mb-10 bg-gray-50 cursor-pointer group relative" onClick={() => c.patientPhotoUrl && setPreviewUrl(c.patientPhotoUrl)}>
              {c.patientPhotoUrl ? <img src={c.patientPhotoUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" /> : <UserCircle size={120} className="m-auto text-gray-100 h-full" />}
              {c.patientPhotoUrl && <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all"><Maximize2 className="text-white" size={48} /></div>}
            </div>
            
            <div className="w-full space-y-5">
              <div className="p-6 bg-gray-50 rounded-[2.5rem] flex items-center gap-6 border border-gray-100 shadow-sm"><Smartphone size={28} className="text-blue-500" /><div className="font-black text-gray-800 text-lg tracking-tight">{c.mobile}</div></div>
              <div className="p-6 bg-gray-50 rounded-[2.5rem] flex items-center gap-6 border border-gray-100 shadow-sm"><Calendar size={28} className="text-blue-500" /><div className="font-black text-gray-800 text-lg tracking-tight">{c.dateOfBirth}</div></div>
              <div className="p-8 bg-gray-50 rounded-[2.5rem] flex items-center gap-6 border border-gray-100 shadow-sm"><MapPin size={32} className="text-blue-500 flex-shrink-0" /><div className="font-bold text-gray-700 text-sm leading-relaxed antialiased">{c.address}</div></div>
            </div>
          </div>
          
          {/* Metadata Card */}
          <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm p-10 space-y-6">
             <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.4em] mb-4 flex items-center gap-3"><Activity size={18} className="text-blue-500" /> System Metrics</h4>
             <div className="p-6 bg-blue-50/50 rounded-[2rem] border border-blue-100 space-y-4">
                <div><p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Integrator Node</p><p className="font-black text-gray-900 text-md capitalize">{c.createdBy?.name || 'System Auto'}</p></div>
                <div><p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Integration Timestamp</p><p className="font-black text-gray-700 text-md">{c.createdAt ? new Date(c.createdAt).toLocaleString() : 'N/A'}</p></div>
             </div>
          </div>
        </div>

        {/* Main Records Section */}
        <div className="lg:col-span-8 space-y-12">
          
          {/* Clinical Assets - EXPANDED PREVIEW */}
          <div className="bg-white rounded-[4rem] border border-gray-100 shadow-sm p-12 md:p-16">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.5em] flex items-center gap-5 mb-14"><Stethoscope size={28} className="text-blue-500" /> Clinical Data Repository</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
               <div className="p-8 bg-red-50 rounded-[2.5rem] border-2 border-red-100 text-center shadow-sm"><p className="text-[11px] font-black text-red-600 uppercase tracking-widest mb-2">Blood Group</p><p className="text-4xl font-black text-red-700">{c.bloodGroup || 'TBD'}</p></div>
               <div className="p-8 bg-indigo-50 rounded-[2.5rem] border-2 border-indigo-100 text-center shadow-sm"><p className="text-[11px] font-black text-indigo-600 uppercase tracking-widest mb-2">Medication</p><p className="text-md font-black text-indigo-700 truncate capitalize">{c.medicineName || 'No Protocol'}</p></div>
               <div className="p-8 bg-emerald-50 rounded-[2.5rem] border-2 border-emerald-100 text-center shadow-sm"><p className="text-[11px] font-black text-emerald-600 uppercase tracking-widest mb-2">Billing</p><p className="text-4xl font-black text-emerald-700 uppercase tracking-tighter">{c.paymentMode}</p></div>
            </div>

            {/* PREVIEW GALLERY: Digital Prescriptions */}
            <div className="space-y-8">
              <div className="flex items-center justify-between ml-2">
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-3"><FileText size={18} className="text-blue-500" /> Encrypted Prescription Records ({prescriptionUrls.length})</p>
                <span className="h-0.5 flex-1 mx-8 bg-gray-50" />
              </div>
              
              {prescriptionUrls.length > 0 ? (
                <div className="flex flex-wrap gap-8">
                   {prescriptionUrls.map((url, i) => (
                     <div 
                      key={i} 
                      className="w-32 h-32 rounded-[2rem] overflow-hidden border-4 border-white shadow-2xl cursor-pointer hover:scale-110 hover:rotate-2 transition-all group relative ring-4 ring-gray-50" 
                      onClick={() => handlePreview(url)}
                     >
                        <img src={url} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-blue-600/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-all"><Eye size={32} strokeWidth={2.5} /></div>
                     </div>
                   ))}
                </div>
              ) : (
                <div className="py-10 text-center bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-100">
                  <p className="text-gray-300 font-black uppercase text-[10px] tracking-[0.3em]">No Medical Assets Discovered</p>
                </div>
              )}
            </div>
          </div>

          {/* Transaction Logs - EXPANDED PREVIEW */}
          <div className="bg-white rounded-[4rem] border border-gray-100 shadow-sm p-12 md:p-16">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.5em] flex items-center gap-5 mb-10"><CreditCard size={28} className="text-blue-500" /> Financial Audit Trail</h3>
            
            <div className="p-10 bg-gray-50 rounded-[3.5rem] border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-10 group hover:bg-white hover:shadow-2xl hover:border-blue-100 transition-all duration-500">
               <div className="flex items-center gap-8">
                  <div className="w-28 h-28 bg-white rounded-[2rem] border-4 border-gray-100 flex items-center justify-center overflow-hidden shadow-xl ring-8 ring-white group-hover:scale-110 transition-all duration-700">
                    {c.paymentScreenshotUrl ? <img src={c.paymentScreenshotUrl} className="w-full h-full object-cover" /> : <QrCode size={48} className="text-gray-200" />}
                  </div>
                  <div>
                    <p className="text-2xl font-black text-gray-900 uppercase tracking-tighter leading-none mb-2">{c.paymentMode} Receipt Node</p>
                    <p className="text-[11px] font-black text-emerald-500 uppercase tracking-[0.2em] flex items-center gap-2"><CheckCircle2 size={16} /> Asset Identity Verified</p>
                  </div>
               </div>
               
               {c.paymentScreenshotUrl ? (
                 <button 
                  onClick={() => handlePreview(c.paymentScreenshotUrl!)} 
                  className="px-12 py-5 bg-gray-900 text-white rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.3em] hover:bg-blue-600 hover:shadow-2xl active:scale-90 transition-all flex items-center gap-4 group/btn"
                 >
                    <Maximize2 size={20} className="group-hover/btn:rotate-90 transition-all" /> Decrypt Asset
                 </button>
               ) : (
                 <div className="text-[11px] font-black text-gray-300 uppercase tracking-widest italic border-2 border-dashed border-gray-200 px-8 py-4 rounded-2xl">Pending Verification</div>
               )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

// ==========================================
// 6. MAIN ROUTING PROTOCOL
// ==========================================
const CustomerManagement: React.FC = () => (
  <Routes>
    <Route index element={<CustomerList />} />
    <Route path="list" element={<CustomerList />} />
    <Route path="create" element={<CustomerForm />} />
    <Route path="edit/:id" element={<CustomerForm />} />
    <Route path="view/:id" element={<CustomerDetail />} />
  </Routes>
);

export default CustomerManagement;