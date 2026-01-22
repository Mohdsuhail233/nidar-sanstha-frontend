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
  FileText
} from 'lucide-react';

// --- Camera Modal Component ---
const CameraModal: React.FC<{ onCapture: (file: File) => void; onClose: () => void }> = ({ onCapture, onClose }) => {
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
        alert("Camera access denied.");
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
          const file = new File([blob], `capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
          onCapture(file);
          onClose();
        }
      }, 'image/jpeg', 0.9);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl relative">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-sm font-bold text-gray-700">Capture Image</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X size={20} /></button>
        </div>
        <video ref={videoRef} autoPlay playsInline className="w-full aspect-video object-cover bg-black" />
        <canvas ref={canvasRef} className="hidden" />
        <div className="p-8 text-center">
          <button onClick={capture} className="w-16 h-16 rounded-full border-4 border-blue-600 flex items-center justify-center group mx-auto transition-transform active:scale-90">
             <div className="w-12 h-12 bg-blue-600 rounded-full group-hover:scale-95 transition-all" />
          </button>
          <p className="mt-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Click to Capture</p>
        </div>
      </div>
    </div>
  );
};

// --- Photo Preview Modal ---
const PhotoPreviewModal: React.FC<{ url: string; title: string; onClose: () => void }> = ({ url, title, onClose }) => (
  <div className="fixed inset-0 bg-black/90 z-[110] flex items-center justify-center p-4" onClick={onClose}>
    <div className="max-w-4xl w-full relative" onClick={e => e.stopPropagation()}>
      <button onClick={onClose} className="absolute -top-12 right-0 text-white p-2"><X size={32} /></button>
      <img src={url} alt={title} className="max-h-[80vh] w-auto mx-auto rounded-2xl shadow-2xl" />
      <p className="text-white text-center mt-4 font-bold uppercase tracking-widest text-sm">{title}</p>
    </div>
  </div>
);

// --- Customer List Component ---
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
    } catch { setCustomers([]); } finally { setLoading(false); }
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
    } else {
      endpoint = `/form/search-by-name?name=${encodeURIComponent(query)}`;
    }
    try {
      const response = await api.get(endpoint);
      setCustomers(Array.isArray(response.data) ? response.data : (response.data ? [response.data] : []));
    } catch { setCustomers([]); } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight uppercase">Patient Registry</h1>
          <p className="text-gray-500 font-medium text-sm">Active beneficiary management</p>
        </div>
        <form onSubmit={handleSearch} className="flex gap-2 w-full lg:w-auto h-12">
          <div className="relative flex-1 lg:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Name, Mobile or ID..." className="w-full h-full pl-11 pr-4 bg-white border border-gray-200 rounded-xl outline-none font-bold text-sm" value={searchValue} onChange={(e) => setSearchValue(e.target.value)} />
          </div>
          <button type="submit" className="bg-blue-600 text-white px-6 rounded-xl font-bold text-sm shadow-md">Search</button>
        </form>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-widest">
              <th className="px-6 py-4">Patient Profile</th>
              <th className="px-6 py-4">Contact Info</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={3} className="px-6 py-20 text-center"><Loader2 className="animate-spin mx-auto text-blue-500" size={32} /></td></tr>
            ) : (
              customers.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 overflow-hidden">
                        {c.patientPhotoUrl ? <img src={c.patientPhotoUrl} className="w-full h-full object-cover" /> : <User size={20} className="m-auto mt-2 text-gray-300" />}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 capitalize">{c.name}</p>
                        <p className="text-[10px] text-blue-600 font-bold uppercase">{c.gender}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-700">{c.mobile}</p>
                    <p className="text-[10px] text-gray-400 font-black uppercase">{c.memberIdNo || 'ID_PENDING'}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link to={`/customers/view/${c.id}`} className="inline-flex p-2 text-gray-400 hover:text-blue-600"><Eye size={18} /></Link>
                    <Link to={`/customers/edit/${c.id}`} className="inline-flex p-2 text-gray-400 hover:text-indigo-600"><Edit3 size={18} /></Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- Customer Form Component ---
const CustomerForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!id);
  const [showCamera, setShowCamera] = useState<{ type: string; index?: number } | null>(null);

  const [formData, setFormData] = useState<Partial<Customer>>({
    name: '', gender: 'MALE', bloodGroup: '', mobile: '', whatsappNo: '', dateOfBirth: '', profession: '', email: '', address: '',
    bloodTestRequired: false, otherTestRequired: false, paymentMode: 'OFFLINE', familyMembers: [],
    regularMedicine: false, noOfpatient: '0', cardValidityUpto: ''
  });

  const [files, setFiles] = useState<Record<string, File>>({});
  const [prescriptionFiles, setPrescriptionFiles] = useState<File[]>([]);
  const [familyPhotos, setFamilyPhotos] = useState<Record<number, File>>({});

  useEffect(() => {
    if (id) {
      const fetchData = async () => {
        setFetching(true);
        try {
          const resp = await api.get(`/form/view/${id}`);
          if (resp.data) setFormData({ ...resp.data, familyMembers: resp.data.familyMembers || [] });
        } catch { navigate('/customers/list'); } finally { setFetching(false); }
      };
      fetchData();
    }
  }, [id, navigate]);

  const handleInputChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
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
      familyMembers: [...(prev.familyMembers || []), { 
        name: '', gender: 'MALE', dateOfBirth: '', educationQualification: '', 
        profession: '', relationshipWithCardHolder: '', mobile: ''
      }]
    }));
  };

  const updateFamilyMember = (index: number, field: string, value: string) => {
    const updated = [...(formData.familyMembers || [])];
    updated[index] = { ...updated[index], [field]: value } as FamilyMember;
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
    ['patientPhotoUrl', 'familyPhotoUrl', 'onlinePaymentQrUrl', 'paymentScreenshotUrl', 'medicinePrescriptionPhotoUrl', 'idCardPdfUrl', 'createdAt', 'createdBy'].forEach(f => delete (submissionData as any)[f]);
    data.append('data', new Blob([JSON.stringify(submissionData)], { type: 'application/json' }));
    if (files.patientPhoto) data.append('patientPhoto', files.patientPhoto);
    if (files.paymentScreenshot) data.append('paymentScreenshot', files.paymentScreenshot);
    prescriptionFiles.forEach(file => data.append('medicinePrescriptionPhoto', file));
    submissionData.familyMembers?.forEach((_, i) => { if (familyPhotos[i]) data.append('familyPhotos', familyPhotos[i]); });
    try {
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      if (id) await api.put(`/form/update/${id}`, data, config);
      else await api.post('/form/create', data, config);
      alert('Record saved successfully.');
      navigate('/customers/list');
    } catch { alert('Sync failed.'); } finally { setLoading(false); }
  };

  if (fetching) return <div className="h-96 flex flex-col items-center justify-center gap-4"><Loader2 className="animate-spin text-blue-600" size={40} /><p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Loading...</p></div>;

  const inputClass = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 font-bold text-sm transition-all";
  const labelClass = "text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1";

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-32 animate-in fade-in duration-500">
      {showCamera && <CameraModal onCapture={(f) => handleFileCapture(f, showCamera.type, showCamera.index)} onClose={() => setShowCamera(null)} />}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-3 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 shadow-sm active:scale-95"><ChevronLeft size={24} /></button>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{id ? 'Edit Patient' : 'New Registration'}</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-12 bg-white p-8 md:p-12 rounded-3xl border border-gray-100 shadow-sm">
        <section>
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-50"><User className="text-blue-600" size={20} /><h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">Personal Details</h3></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 flex flex-col items-center gap-4 mb-4">
               <div className="w-40 h-40 bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl flex items-center justify-center overflow-hidden">
                  {(files.patientPhoto || formData.patientPhotoUrl) ? <img src={files.patientPhoto ? URL.createObjectURL(files.patientPhoto) : formData.patientPhotoUrl} className="w-full h-full object-cover" /> : <User size={40} className="text-gray-200" />}
               </div>
               <div className="flex gap-2">
                  <label className="px-4 py-2 bg-gray-900 text-white rounded-lg text-[10px] font-bold uppercase cursor-pointer hover:bg-black transition-all">Upload Photo<input type="file" className="hidden" onChange={e => e.target.files && handleFileCapture(e.target.files[0], 'patientPhoto')} /></label>
                  <button type="button" onClick={() => setShowCamera({ type: 'patientPhoto' })} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-[10px] font-bold uppercase active:scale-95 transition-all">Capture</button>
               </div>
            </div>
            <div><label className={labelClass}>Patient Name *</label><input name="name" value={formData.name || ''} onChange={handleInputChange} required className={inputClass} /></div>
            <div><label className={labelClass}>Mobile Number *</label><input name="mobile" maxLength={10} value={formData.mobile || ''} onChange={handleInputChange} required className={inputClass} /></div>
            <div><label className={labelClass}>Date of Birth *</label><input type="date" name="dateOfBirth" value={formData.dateOfBirth || ''} onChange={handleInputChange} required className={inputClass} /></div>
            <div><label className={labelClass}>Blood Group</label><select name="bloodGroup" value={formData.bloodGroup || ''} onChange={handleInputChange} className={inputClass}><option value="">Select Group</option><option value="A+">A+</option><option value="B+">B+</option><option value="O+">O+</option><option value="AB+">AB+</option></select></div>
            <div className="md:col-span-2"><label className={labelClass}>Full Address *</label><textarea name="address" value={formData.address || ''} onChange={handleInputChange} required className={`${inputClass} h-24 pt-3 resize-none`} /></div>
          </div>
        </section>
        {/* Family Member & Medication sections follow same structure */}
        <button disabled={loading} type="submit" className="w-full py-5 bg-blue-600 text-white font-bold rounded-2xl shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-3 text-lg uppercase tracking-widest">{loading ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />} Submit Sync</button>
      </form>
    </div>
  );
};

// --- Customer Detail Component (ROLL BACK VERSION WITH PREVIEW) ---
const CustomerDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [c, setC] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const resp = await api.get(`/form/view/${id}`);
        if (resp.data) setC(resp.data);
      } catch { setC(null); } finally { setLoading(false); }
    };
    fetch();
  }, [id]);

  if (loading) return <div className="h-96 flex flex-col items-center justify-center gap-4"><Loader2 className="animate-spin text-blue-600" size={40} /><p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Fetching...</p></div>;
  if (!c) return <div className="h-96 flex flex-col items-center justify-center gap-4"><Info size={48} className="text-gray-200" /><p className="text-gray-400 font-bold">Node not found.</p></div>;

  const prescriptionUrls = c.medicinePrescriptionPhotoUrl ? c.medicinePrescriptionPhotoUrl.split(',') : [];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
      {previewUrl && <PhotoPreviewModal url={previewUrl} title="Asset Preview" onClose={() => setPreviewUrl(null)} />}
      
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate(-1)} className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all"><ChevronLeft size={24} /></button>
          <div><h1 className="text-3xl font-bold text-gray-900 capitalize">{c.name}</h1><span className="text-blue-600 bg-blue-50 px-3 py-1 rounded-lg text-[10px] font-black uppercase">ID: {c.memberIdNo}</span></div>
        </div>
        <Link to={`/customers/edit/${c.id}`} className="p-3 bg-gray-900 text-white rounded-xl hover:bg-black transition-all shadow-md active:scale-95"><Edit3 size={20} /></Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-8">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 flex flex-col items-center text-center">
            <div className="w-44 h-44 rounded-full border-4 border-gray-50 shadow-inner overflow-hidden mb-6 bg-gray-50 cursor-pointer group relative" onClick={() => c.patientPhotoUrl && setPreviewUrl(c.patientPhotoUrl)}>
              {c.patientPhotoUrl ? <img src={c.patientPhotoUrl} className="w-full h-full object-cover" /> : <UserCircle size={80} className="m-auto text-gray-200" />}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"><Maximize2 size={32} /></div>
            </div>
            <div className="w-full space-y-4 font-bold text-gray-700">
              <div className="p-4 bg-gray-50 rounded-2xl flex items-center gap-4"><Smartphone size={24} className="text-blue-500" /> {c.mobile}</div>
              <div className="p-4 bg-gray-50 rounded-2xl flex items-center gap-4"><Calendar size={24} className="text-blue-500" /> {c.dateOfBirth}</div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-3 mb-8"><Stethoscope size={20} className="text-blue-500" /> Medical Data & Prescriptions</h3>
            {/* Gallery style for multiple prescriptions */}
            <div className="flex flex-wrap gap-4">
              {prescriptionUrls.map((url, i) => (
                <div key={i} className="w-24 h-24 rounded-2xl overflow-hidden border border-gray-200 cursor-pointer hover:border-blue-500 transition-all shadow-sm" onClick={() => setPreviewUrl(url)}>
                  <img src={url} className="w-full h-full object-cover" />
                </div>
              ))}
              {prescriptionUrls.length === 0 && <p className="text-gray-300 italic text-sm">No prescriptions found.</p>}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-3 mb-8"><CreditCard size={20} className="text-blue-500" /> Payment Evidence</h3>
            <div className="flex items-center justify-between p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
               <div className="flex items-center gap-4">
                 <div className="w-16 h-16 bg-white rounded-xl border border-gray-200 overflow-hidden">
                    {c.paymentScreenshotUrl ? <img src={c.paymentScreenshotUrl} className="w-full h-full object-cover" /> : <QrCode size={24} className="text-gray-200 m-4" />}
                 </div>
                 <p className="font-bold text-gray-700 uppercase text-xs">{c.paymentMode} Receipt</p>
               </div>
               {c.paymentScreenshotUrl && <button onClick={() => setPreviewUrl(c.paymentScreenshotUrl!)} className="px-6 py-2 bg-gray-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all shadow-md">Open Preview</button>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

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