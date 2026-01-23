import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, useNavigate, useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Staff, Role, FamilyMember } from '../types';
import { 
  Search, 
  UserPlus, 
  Edit3, 
  Eye,
  Loader2, 
  ChevronLeft, 
  Phone,
  Briefcase,
  Download,
  User,
  ShieldCheck,
  Trash2,
  Plus,
  Users,
  Camera,
  Upload,
  Users2,
  Droplets,
  Save,
  Info,
  X,
  Mail,
  MapPin,
  Calendar,
  BookOpen,
  UserCircle,
  Maximize2,
  Smartphone,
  FileText
} from 'lucide-react';

// ==========================================
// 1. CAMERA MODAL COMPONENT
// ==========================================
const CameraModal: React.FC<{ onCapture: (file: File) => void; onClose: () => void; title?: string }> = ({ onCapture, onClose, title }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    async function startCamera() {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        setStream(s);
        if (videoRef.current) videoRef.current.srcObject = s;
      } catch (err) {
        alert("Camera access denied or not found.");
        onClose();
      }
    }
    startCamera();
    return () => stream?.getTracks().forEach(track => track.stop());
  }, []);

  const capture = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context?.drawImage(videoRef.current, 0, 0);
      canvasRef.current.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `staff_capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
          onCapture(file);
          onClose();
        }
      }, 'image/jpeg', 0.9);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4 backdrop-blur-md">
      <div className="bg-gray-900 w-full max-w-xl rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-6 right-6 text-white/50 hover:text-white z-10 p-2 bg-white/10 rounded-full transition-all"><X size={24} /></button>
        <video ref={videoRef} autoPlay playsInline className="w-full aspect-square object-cover" />
        <canvas ref={canvasRef} className="hidden" />
        <div className="p-10 flex flex-col items-center">
          <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] mb-8">{title || 'Personnel Node Capture'}</p>
          <button onClick={capture} className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center group active:scale-90 transition-all">
             <div className="w-14 h-14 bg-white rounded-full group-hover:scale-90 transition-all" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 2. PHOTO PREVIEW MODAL
// ==========================================
const PhotoPreviewModal: React.FC<{ url: string; title: string; onClose: () => void }> = ({ url, title, onClose }) => (
  <div className="fixed inset-0 bg-black/90 z-[110] flex items-center justify-center p-4" onClick={onClose}>
    <div className="max-w-4xl w-full relative" onClick={e => e.stopPropagation()}>
      <button onClick={onClose} className="absolute -top-12 right-0 text-white p-2 hover:bg-white/10 rounded-full transition-all"><X size={32} /></button>
      <img src={url} alt={title} className="max-h-[80vh] w-auto mx-auto rounded-2xl shadow-2xl border-4 border-white/5" />
      <p className="text-white text-center mt-6 font-bold uppercase tracking-widest text-sm">{title}</p>
    </div>
  </div>
);

// ==========================================
// 3. STAFF LIST VIEW
// ==========================================
const StaffList: React.FC = () => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchStaff(); }, []);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const response = await api.get('/staff/all');
      setStaff(response.data);
    } catch (err) { console.error("Error fetching staff:", err); }
    finally { setLoading(false); }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchValue.trim();
    if (!query) { fetchStaff(); return; }
    setLoading(true);
    let endpoint = '';
    const upperQuery = query.toUpperCase();
    
    if (/^\d{10}$/.test(query)) {
      endpoint = `/staff/by-mobile?mobile=${query}`;
    } else if (upperQuery.startsWith('EMP') || upperQuery.startsWith('NID') || upperQuery.startsWith('NDR') || /^\d+$/.test(query)) {
      endpoint = `/staff/by-employee-id?id=${encodeURIComponent(query)}`;
    } else {
      endpoint = `/staff/search?name=${encodeURIComponent(query)}`;
    }

    try {
      const response = await api.get(endpoint);
      const results = Array.isArray(response.data) ? response.data : (response.data ? [response.data] : []);
      setStaff(results);
    } catch (err) { setStaff([]); } finally { setLoading(false); }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Employe Records</h1>
          <p className="text-gray-500 font-medium tracking-tight">System users and field agents dispatch.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto items-stretch h-16">
          <form onSubmit={handleSearch} className="relative flex-1 sm:w-80 h-full">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
            <input type="text" placeholder="Search Employe Name..." className="pl-12 pr-4 bg-white border border-gray-200 rounded-2xl outline-none w-full h-full font-bold shadow-sm" value={searchValue} onChange={(e) => setSearchValue(e.target.value)} />
          </form>
          <Link to="/staff/create" className="bg-blue-600 text-white px-8 rounded-2xl hover:bg-blue-700 transition-all flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95">
            <UserPlus size={18} /> Register Employe
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          <div className="col-span-full py-40 text-center flex flex-col items-center">
            <Loader2 className="animate-spin text-blue-500 mb-6" size={56} />
            <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Accessing Personnel Nodes...</p>
          </div>
        ) : (
          staff.map(m => (
            <div key={m.id} className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm hover:shadow-2xl transition-all group flex flex-col">
              <div className="flex justify-between items-start mb-8">
                 <div className="px-5 py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-100 shadow-sm">{m.role}</div>
                 <div className="w-24 h-24 rounded-[2rem] bg-gray-50 border border-gray-100 overflow-hidden shadow-inner group-hover:border-blue-200 ring-4 ring-white transition-all">
                    {m.profileImageUrl ? <img src={m.profileImageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-200"><User size={40} /></div>}
                 </div>
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2 leading-tight capitalize">{m.name}</h3>
              <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-8">{m.employeeId || 'NDR-OFFLINE'}</p>
              
              <div className="space-y-4 mb-10 bg-gray-50/50 p-6 rounded-[2.5rem] border border-gray-100">
                <div className="flex items-center gap-4 text-[13px] font-bold text-gray-700"><Phone size={18} className="text-blue-400" /> {m.mobileNumber}</div>
                <div className="flex items-center gap-4 text-[13px] font-bold text-gray-700"><Briefcase size={18} className="text-blue-400" /> {m.designation || 'Coordinator'}</div>
                <div className="flex items-center gap-4 text-[13px] font-bold text-gray-700"><Droplets size={18} className="text-red-400" /> {m.bloodGroup || 'TBD'}</div>
              </div>

              <div className="flex gap-2 mt-auto">
                <Link to={`/staff/view/${m.id}`} className="p-5 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all shadow-md active:scale-95"><Eye size={24} /></Link>
                <Link to={`/staff/edit/${m.id}`} className="p-5 bg-white text-gray-400 rounded-2xl hover:text-indigo-600 transition-all border border-gray-100 shadow-sm active:scale-95"><Edit3 size={24} /></Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// ==========================================
// 4. STAFF FORM (CREATE & EDIT)
// ==========================================
const StaffForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!id);
  const [showCamera, setShowCamera] = useState<{ type: string; index?: number } | null>(null);

  const [formData, setFormData] = useState<Partial<Staff>>({
    name: '', email: '', mobileNumber: '', password: '', alternateMobileNumber: '',
    role: Role.FIELD_STAFF, bloodGroup: '', gender: 'MALE', dateOfBirth: '',
    address: '', designation: '', familyMembers: []
  });

  const [files, setFiles] = useState<Record<string, File>>({});

  useEffect(() => {
    if (id) {
      const fetchStaffData = async () => {
        setFetching(true);
        try {
          const response = await api.get(`/staff/view/${id}`);
          if (response.data) {
            setFormData({ ...response.data, familyMembers: response.data.familyMembers || [] });
          }
        } catch (err) { navigate('/staff/list'); }
        finally { setFetching(false); }
      };
      fetchStaffData();
    }
  }, [id, navigate]);

  const handleInputChange = (e: any) => { setFormData({ ...formData, [e.target.name]: e.target.value }); };

  const handleFileCapture = (file: File, type: string) => {
  // 1. Filename se spaces hatakar underscore lagana
  const cleanName = file.name.replaceAll(/\s+/g, '_');
  
  // 2. Nayi File object banana kyunki original file name read-only hota hai
  const cleanFile = new File([file], cleanName, { type: file.type });
  
  // 3. State mein save karna
  setFiles(prev => ({ ...prev, [type]: cleanFile }));
};

  const addFamilyMember = () => {
    setFormData(prev => ({
      ...prev,
      familyMembers: [...(prev.familyMembers || []), { 
        name: '', gender: 'MALE', dateOfBirth: '', educationQualification: '', 
        profession: '', relationshipWithCardHolder: '', mobile: ''
      } as FamilyMember]
    }));
  };

  const updateFamilyMember = (index: number, field: string, value: string) => {
    const updated = [...(formData.familyMembers || [])];
    updated[index] = { ...updated[index], [field]: value };
    setFormData(prev => ({ ...prev, familyMembers: updated }));
  };

  const removeFamilyMember = (index: number) => {
    setFormData(prev => ({ ...prev, familyMembers: (prev.familyMembers || []).filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();
    const submissionData = { ...formData };
    
    ['profileImageUrl', 'resumeUrl', 'aadharFrontSideUrl', 'aadharBackSideUrl', 'idCardPdfUrl', 'createdAt', 'familyMembers'].forEach(f => delete (submissionData as any)[f]);
    
    data.append('staff', new Blob([JSON.stringify(submissionData)], { type: 'application/json' }));
    
    if (files.profileImage) data.append('profileImage', files.profileImage);
    if (files.resume) data.append('resume', files.resume);
    if (files.aadharFront) data.append('aadharFrontSide', files.aadharFront);
    if (files.aadharBack) data.append('aadharBackSide', files.aadharBack);

    try {
      if (id) await api.put(`/staff/update/${id}`, data);
      else await api.post('/staff/create', data);
      alert('Personnel record synchronized.');
      navigate('/staff/list');
    } catch (err: any) { alert(`Sync Error: ${err.message}`); }
    finally { setLoading(false); }
  };

  if (fetching) return <div className="h-96 flex flex-col items-center justify-center"><Loader2 className="animate-spin text-blue-600 mb-6" size={56} /><p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">Loading State...</p></div>;

  const inputClass = "w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-bold text-sm transition-all";
  const labelClass = "text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1";

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-24 animate-in fade-in duration-500">
       {showCamera && <CameraModal title={`Capture ${showCamera.type}`} onCapture={(f) => handleFileCapture(f, showCamera.type)} onClose={() => setShowCamera(null)} />}
       
       <div className="flex items-center gap-8">
        <button onClick={() => navigate(-1)} className="p-6 bg-white hover:bg-gray-50 rounded-[2.5rem] shadow-sm border border-gray-100 transition-all active:scale-95"><ChevronLeft size={32} /></button>
        <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tight">{id ? 'Edit Staff Node' : 'Register New Personnel'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-12 bg-white rounded-[4rem] shadow-sm border border-gray-100 p-12 md:p-16">
        {/* Section 1: Personal Identity */}
        <section>
          <h3 className="text-xs font-black text-blue-600 uppercase tracking-[0.4em] border-b border-blue-50 pb-6 mb-12 flex items-center gap-4"><User size={24} /> 01. Personal Identity</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
            <div className="md:col-span-2 flex flex-col items-center mb-8 gap-6">
               <div className="w-56 h-56 rounded-[3.5rem] bg-gray-50 border-4 border-dashed border-gray-200 flex items-center justify-center relative overflow-hidden ring-4 ring-gray-50">
                  {(files.profileImage || formData.profileImageUrl) ? (
                    <img src={files.profileImage ? URL.createObjectURL(files.profileImage) : formData.profileImageUrl} className="w-full h-full object-cover" />
                  ) : <Camera size={48} className="text-gray-200" />}
               </div>
               <div className="flex gap-4">
                  <label className="flex items-center gap-3 px-8 py-3 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-gray-800 transition-all shadow-lg">
                     <Upload size={18} /> Upload
                     <input type="file" className="hidden" onChange={e => e.target.files && handleFileCapture(e.target.files[0], 'profileImage')} />
                  </label>
                  <button type="button" onClick={() => setShowCamera({ type: 'profileImage' })} className="flex items-center gap-3 px-8 py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-95 shadow-lg">
                     <Camera size={18} /> Capture
                  </button>
               </div>
            </div>
            <div><label className={labelClass}>Full Legal Name *</label><input name="name" value={formData.name || ''} onChange={handleInputChange} required className={inputClass} placeholder="Enter Name" /></div>
            <div><label className={labelClass}>Mobile Number *</label><input name="mobileNumber" maxLength={10} value={formData.mobileNumber || ''} onChange={handleInputChange} required className={inputClass} placeholder="10-digit number" /></div>
            <div><label className={labelClass}>Alternate Mobile</label><input name="alternateMobileNumber" maxLength={10} value={formData.alternateMobileNumber || ''} onChange={handleInputChange} className={inputClass} placeholder="Backup contact" /></div>
            <div><label className={labelClass}>Email Address *</label><input name="email" type="email" value={formData.email || ''} onChange={handleInputChange} required className={inputClass} placeholder="Official/Personal Email" /></div>
            {!id && <div><label className={labelClass}>Portal Password *</label><input name="password" type="password" onChange={handleInputChange} required className={inputClass} placeholder="Access secret" /></div>}
            <div><label className={labelClass}>Gender</label><select name="gender" value={formData.gender || 'MALE'} onChange={handleInputChange} className={inputClass}><option value="MALE">MALE</option><option value="FEMALE">FEMALE</option></select></div>
            <div><label className={labelClass}>Date of Birth</label><input type="date" name="dateOfBirth" value={formData.dateOfBirth || ''} onChange={handleInputChange} className={inputClass} /></div>
            <div><label className={labelClass}>Blood Group</label><select name="bloodGroup" value={formData.bloodGroup || ''} onChange={handleInputChange} className={inputClass}><option value="">Select Group</option><option value="A+">A+</option><option value="A-">A-</option><option value="B+">B+</option><option value="B-">B-</option><option value="O+">O+</option><option value="O-">O-</option><option value="AB+">AB+</option><option value="AB-">AB-</option></select></div>
            <div><label className={labelClass}>Access Role *</label><select name="role" value={formData.role || Role.FIELD_STAFF} onChange={handleInputChange} className={inputClass}><option value="SUPER_ADMIN">SUPER_ADMIN</option><option value="ADMIN">ADMIN</option><option value="FIELD_STAFF">FIELD_STAFF</option></select></div>
            <div><label className={labelClass}>Designation</label><input name="designation" value={formData.designation || ''} onChange={handleInputChange} className={inputClass} placeholder="Work Title" /></div>
            <div className="md:col-span-2"><label className={labelClass}>Residential Address </label><textarea name="address" value={formData.address || ''} onChange={handleInputChange} className={`${inputClass} h-32 pt-5 resize-none`} placeholder="Full Detailed Address" /></div>
          </div>
        </section>

        {/* Section 2: Documents & Assets (FULL UI) */}
        <section>
          <h3 className="text-xs font-black text-blue-600 uppercase tracking-[0.4em] border-b border-blue-50 pb-6 mb-12 flex items-center gap-4"><ShieldCheck size={24} /> 02. Verification Documents</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Resume */}
            <div className="space-y-4">
              <label className={labelClass}>Employe Resume</label>
              <div className="p-6 bg-gray-50 border border-gray-100 rounded-[2rem] flex flex-col items-center gap-4">
                <FileText size={40} className={files.resume ? "text-blue-500" : "text-gray-200"} />
                <label className="w-full text-center px-4 py-2 bg-white border border-gray-200 rounded-xl text-[9px] font-black uppercase cursor-pointer hover:bg-gray-50 transition-all truncate">
                   {files.resume ? files.resume.name : 'Select PDF'}
                   <input type="file" accept=".pdf" className="hidden" onChange={e => e.target.files && handleFileCapture(e.target.files[0], 'resume')} />
                </label>
              </div>
            </div>
            {/* Aadhar Front */}
            <div className="space-y-4">
              <label className={labelClass}>Aadhar Front Side</label>
              <div className="p-6 bg-gray-50 border border-gray-100 rounded-[2rem] flex flex-col items-center gap-4">
                {files.aadharFront ? <img src={URL.createObjectURL(files.aadharFront)} className="w-20 h-12 object-cover rounded-lg" /> : <ShieldCheck size={40} className="text-gray-200" />}
                <div className="flex gap-2 w-full">
                   <label className="flex-1 text-center py-2 bg-white border border-gray-200 rounded-xl text-[8px] font-black uppercase cursor-pointer hover:bg-gray-50 transition-all">Upload <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files && handleFileCapture(e.target.files[0], 'aadharFront')} /></label>
                   <button type="button" onClick={() => setShowCamera({ type: 'aadharFront' })} className="flex-1 py-2 bg-blue-600 text-white rounded-xl text-[8px] font-black uppercase active:scale-95">Capture</button>
                </div>
              </div>
            </div>
            {/* Aadhar Back */}
            <div className="space-y-4">
              <label className={labelClass}>Aadhar Back Side</label>
              <div className="p-6 bg-gray-50 border border-gray-100 rounded-[2rem] flex flex-col items-center gap-4">
                {files.aadharBack ? <img src={URL.createObjectURL(files.aadharBack)} className="w-20 h-12 object-cover rounded-lg" /> : <ShieldCheck size={40} className="text-gray-200" />}
                <div className="flex gap-2 w-full">
                   <label className="flex-1 text-center py-2 bg-white border border-gray-200 rounded-xl text-[8px] font-black uppercase cursor-pointer hover:bg-gray-50 transition-all">Upload <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files && handleFileCapture(e.target.files[0], 'aadharBack')} /></label>
                   <button type="button" onClick={() => setShowCamera({ type: 'aadharBack' })} className="flex-1 py-2 bg-blue-600 text-white rounded-xl text-[8px] font-black uppercase active:scale-95">Capture</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Family Registry */}
        <section>
          <div className="flex items-center justify-between border-b border-blue-50 pb-6 mb-10">
            <h3 className="text-xs font-black text-blue-600 uppercase tracking-[0.4em] flex items-center gap-4"><Users2 size={24} /> 03. Family Registry</h3>
            <button type="button" onClick={addFamilyMember} className="bg-blue-600 text-white px-8 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl active:scale-95">
              <Plus size={16} className="inline mr-2" /> Add Member
            </button>
          </div>
          <div className="space-y-6">
            {formData.familyMembers?.map((m, idx) => (
              <div key={idx} className="relative bg-gray-50/50 rounded-[2.5rem] border border-gray-100 p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in slide-in-from-left duration-300">
                <button type="button" onClick={() => removeFamilyMember(idx)} className="absolute top-4 right-4 p-2 text-red-400 hover:bg-white rounded-xl shadow-sm transition-colors"><Trash2 size={20} /></button>
                <div><label className={labelClass}>Name</label><input value={m.name || ''} onChange={e => updateFamilyMember(idx, 'name', e.target.value)} className={inputClass} /></div>
                <div><label className={labelClass}>Gender</label><select value={m.gender || 'MALE'} onChange={e => updateFamilyMember(idx, 'gender', e.target.value)} className={inputClass}><option value="MALE">MALE</option><option value="FEMALE">FEMALE</option></select></div>
                <div><label className={labelClass}>Mobile</label><input value={m.mobile || ''} maxLength={10} onChange={e => updateFamilyMember(idx, 'mobile', e.target.value)} className={inputClass} /></div>
                <div><label className={labelClass}>Relationship</label><input value={m.relationshipWithCardHolder || ''} onChange={e => updateFamilyMember(idx, 'relationshipWithCardHolder', e.target.value)} className={inputClass} /></div>
                <div><label className={labelClass}>DOB</label><input type="date" value={m.dateOfBirth || ''} onChange={e => updateFamilyMember(idx, 'dateOfBirth', e.target.value)} className={inputClass} /></div>
                <div><label className={labelClass}>Education</label><input value={m.educationQualification || ''} onChange={e => updateFamilyMember(idx, 'educationQualification', e.target.value)} className={inputClass} /></div>
                <div className="md:col-span-2"><label className={labelClass}>Profession</label><input value={m.profession || ''} onChange={e => updateFamilyMember(idx, 'profession', e.target.value)} className={inputClass} /></div>
              </div>
            ))}
          </div>
        </section>

        <button disabled={loading} type="submit" className="w-full py-10 bg-blue-600 text-white font-black rounded-[3.5rem] shadow-2xl flex items-center justify-center gap-8 hover:bg-blue-700 transition-all text-2xl uppercase tracking-[0.3em] active:scale-[0.98]">
          {loading ? <Loader2 size={48} className="animate-spin" /> : <Save size={48} />} 
          Synchronize Sync
        </button>
      </form>
    </div>
  );
};

// ==========================================
// 5. STAFF DETAIL VIEW (WITH FULL PREVIEW)
// ==========================================
const StaffDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [s, setS] = useState<Staff | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const resp = await api.get(`/staff/view/${id}`);
        if (resp.data) setS(resp.data);
      } catch (err: any) { 
        console.error("Fetch detail failed:", err);
        setS(null);
      }
      finally { setLoading(false); }
    };
    fetch();
  }, [id]);

  const handlePreview = (url: string) => {
    if (url.toLowerCase().endsWith('.pdf')) window.open(url, '_blank');
    else setPreviewUrl(url);
  };

  const downloadStaffIdCard = async () => {
    if (!id || !s) return;
    setDownloading(true);
    try {
      const memberId = s.employeeId || id;
      const response = await api.post(`/generate-emp-pdf/${memberId}`);
      const cloudUrl = typeof response.data === 'string' ? response.data : response.data?.url || response.data?.data;
      if (cloudUrl && cloudUrl.startsWith('http')) window.open(cloudUrl, '_blank');
      else alert("Cloud PDF link failed.");
    } catch { alert("Identity PDF generation failed."); } finally { setDownloading(false); }
  };

  if (loading) return <div className="h-96 flex flex-col items-center justify-center gap-4"><Loader2 className="animate-spin text-blue-600" size={40} /><p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] text-center">Fetching Personnel Profile...</p></div>;
  if (!s) return <div className="h-96 flex flex-col items-center justify-center gap-4"><Info size={48} className="text-gray-200" /><p className="text-gray-400 font-bold">Personnel node not found.</p></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
      {previewUrl && <PhotoPreviewModal url={previewUrl} title="Asset Preview" onClose={() => setPreviewUrl(null)} />}
      
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate(-1)} className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all"><ChevronLeft size={24} /></button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 capitalize">{s.name}</h1>
            <div className="flex flex-wrap gap-3 mt-2">
               <span className="text-blue-600 bg-blue-50 px-3 py-1 rounded-lg text-[10px] font-black uppercase border border-blue-100 tracking-wider">ID: {s.employeeId}</span>
               <span className="text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg text-[10px] font-black uppercase border border-emerald-100 tracking-wider">Role: {s.role}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={downloadStaffIdCard} disabled={downloading} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-blue-700 shadow-md active:scale-95 transition-all disabled:opacity-50">
            {downloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />} ID Card
          </button>
          <Link to={`/staff/edit/${s.id}`} className="p-3 bg-gray-900 text-white rounded-xl hover:bg-black transition-all shadow-md active:scale-95"><Edit3 size={20} /></Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-8">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 flex flex-col items-center">
            <div className="w-44 h-44 rounded-[2.5rem] border-4 border-gray-50 shadow-inner overflow-hidden mb-6 bg-gray-50 cursor-pointer group relative" onClick={() => s.profileImageUrl && handlePreview(s.profileImageUrl)}>
              {s.profileImageUrl ? <img src={s.profileImageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform" /> : <UserCircle size={80} className="m-auto text-gray-200 h-full" />}
              {s.profileImageUrl && <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"><Maximize2 size={32} /></div>}
            </div>
            <div className="w-full space-y-4">
              <div className="p-4 bg-gray-50 rounded-2xl flex items-center gap-4"><Smartphone size={24} className="text-blue-500" /><div><p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Primary Contact</p><p className="font-bold text-gray-800">{s.mobileNumber}</p></div></div>
              <div className="p-4 bg-gray-50 rounded-2xl flex items-center gap-4"><Mail size={24} className="text-blue-500" /><div><p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Email</p><p className="font-bold text-gray-800 truncate text-xs">{s.email}</p></div></div>
              <div className="p-4 bg-gray-50 rounded-2xl flex items-center gap-4"><MapPin size={24} className="text-blue-500" /><div><p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Base Address</p><p className="text-xs font-semibold text-gray-700 leading-tight">{s.address}</p></div></div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-3 mb-8"><ShieldCheck size={20} className="text-blue-500" /> System Identity Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div className="p-6 bg-gray-50 border border-gray-100 rounded-2xl flex flex-col gap-2">
                 <p className="text-[9px] font-bold text-gray-400 uppercase">Resume</p>
                 {s.resumeUrl ? <button onClick={() => handlePreview(s.resumeUrl!)} className="text-blue-600 font-bold text-xs hover:underline flex items-center gap-2"><FileText size={14}/> View PDF</button> : <span className="text-gray-300 italic text-xs">Not Uploaded</span>}
              </div>
              <div className="p-6 bg-gray-50 border border-gray-100 rounded-2xl flex flex-col gap-2">
                 <p className="text-[9px] font-bold text-gray-400 uppercase">Aadhar Front</p>
                 {s.aadharFrontSideUrl ? <button onClick={() => handlePreview(s.aadharFrontSideUrl!)} className="text-blue-600 font-bold text-xs hover:underline flex items-center gap-2"><Eye size={14}/> View Asset</button> : <span className="text-gray-300 italic text-xs">Not Uploaded</span>}
              </div>
              <div className="p-6 bg-gray-50 border border-gray-100 rounded-2xl flex flex-col gap-2">
                 <p className="text-[9px] font-bold text-gray-400 uppercase">Aadhar Back</p>
                 {s.aadharBackSideUrl ? <button onClick={() => handlePreview(s.aadharBackSideUrl!)} className="text-blue-600 font-bold text-xs hover:underline flex items-center gap-2"><Eye size={14}/> View Asset</button> : <span className="text-gray-300 italic text-xs">Not Uploaded</span>}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-3"><Users size={20} className="text-blue-500" /> Family Registry (Kinship)</h3>
              <span className="px-3 py-1 bg-gray-50 border border-gray-100 rounded-lg text-[9px] font-black text-gray-500 uppercase tracking-widest">{s.familyMembers?.length || 0} Registered</span>
            </div>
            <div className="overflow-x-auto rounded-2xl border border-gray-50">
                <table className="w-full text-left text-xs min-w-[700px]">
                  <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50">
                    <tr>
                      <th className="px-6 py-4">Name</th>
                      <th className="px-6 py-4">Birth & Contact</th>
                      <th className="px-6 py-4">Education/Work</th>
                      <th className="px-6 py-4">Kinship</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {s.familyMembers && s.familyMembers.length > 0 ? s.familyMembers.map((m, i) => (
                      <tr key={i} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                           <p className="font-bold text-gray-800 capitalize text-sm">{m.name || 'Member'}</p>
                           <p className="text-[9px] text-blue-500 font-bold uppercase">{m.gender}</p>
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex flex-col gap-1">
                              <span className="flex items-center gap-1.5 font-bold text-gray-700 text-[10px]"><Calendar size={12} className="text-gray-400" /> {m.dateOfBirth || '-'}</span>
                              <span className="flex items-center gap-1.5 font-bold text-gray-500 text-[10px]"><Smartphone size={12} className="text-gray-400" /> {m.mobile || 'No Contact'}</span>
                           </div>
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex flex-col gap-1">
                              <span className="flex items-center gap-1.5 font-bold text-gray-700 text-[10px]"><BookOpen size={12} className="text-indigo-400" /> {m.educationQualification || 'N/A'}</span>
                              <span className="flex items-center gap-1.5 font-bold text-gray-500 text-[10px]"><Briefcase size={12} className="text-emerald-400" /> {m.profession || 'N/A'}</span>
                           </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex px-3 py-1 bg-blue-50 text-blue-600 rounded-lg font-black uppercase text-[9px] border border-blue-100">
                            {m.relationshipWithCardHolder || 'Kin'}
                          </span>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan={4} className="px-6 py-16 text-center text-gray-300 font-bold uppercase tracking-widest italic opacity-40">No kinship records found.</td></tr>
                    )}
                  </tbody>
                </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StaffManagement: React.FC = () => (
  <Routes>
    <Route path="list" element={<StaffList />} />
    <Route path="create" element={<StaffForm />} />
    <Route path="edit/:id" element={<StaffForm />} />
    <Route path="view/:id" element={<StaffDetail />} />
  </Routes>
);

export default StaffManagement;