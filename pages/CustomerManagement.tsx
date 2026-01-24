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

 FileText,

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

  Droplet

} from 'lucide-react';



// Camera Modal Component

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



const PhotoPreviewModal: React.FC<{ url: string; title: string; onClose: () => void }> = ({ url, title, onClose }) => (

  <div className="fixed inset-0 bg-black/90 z-[110] flex items-center justify-center p-4" onClick={onClose}>

    <div className="max-w-4xl w-full relative" onClick={e => e.stopPropagation()}>

      <button onClick={onClose} className="absolute -top-12 right-0 text-white p-2"><X size={32} /></button>

      <img src={url} alt={title} className="max-h-[80vh] w-auto mx-auto rounded-2xl shadow-2xl" />

      <p className="text-white text-center mt-4 font-bold uppercase tracking-widest text-sm">{title}</p>

    </div>

  </div>

);



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

    }

    else if (query.includes('-') || query.includes('/')) {

      const cleanDate = query.replace(/\//g, '-');

      endpoint = `/form/search-by-dob?dob=${cleanDate}`;

    }

    else if (upperQuery.startsWith('NID') || upperQuery.startsWith('NDR') || /^\d+$/.test(query)) {

      endpoint = `/form/search-by-idCardNumber?idCard=${encodeURIComponent(query)}`;

    }

    else {

      endpoint = `/form/search-by-name?name=${encodeURIComponent(query)}`;

    }



    try {

      const response = await api.get(endpoint);

      const results = Array.isArray(response.data) ? response.data : (response.data ? [response.data] : []);

      setCustomers(results);

    } catch (err) {

      console.error("Search node error:", err);

      setCustomers([]);

    } finally {

      setLoading(false);

    }

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

            <input

              type="text"

              placeholder="Name, Mobile or ID..."

              className="w-full h-full pl-11 pr-4 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 font-bold text-sm"

              value={searchValue}

              onChange={(e) => setSearchValue(e.target.value)}

            />

          </div>

          <button type="submit" className="bg-blue-600 text-white px-6 rounded-xl font-bold text-sm hover:bg-blue-700 shadow-md active:scale-95 transition-all">

            Search

          </button>

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

            ) : customers.length === 0 ? (

              <tr><td colSpan={3} className="px-6 py-20 text-center text-gray-400 font-medium">No records found.</td></tr>

            ) : (

              customers.map((c) => (

                <tr key={c.id} className="hover:bg-gray-50 transition-colors">

                  <td className="px-6 py-4">

                    <div className="flex items-center gap-4">

                      <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0">

                        {c.patientPhotoUrl ? <img src={c.patientPhotoUrl} className="w-full h-full object-cover" /> : <User size={20} className="m-auto mt-2 text-gray-300" />}

                      </div>

                      <div>

                        <p className="font-bold text-gray-900 capitalize">{c.name}</p>

                        <p className="text-[10px] text-blue-600 font-bold uppercase">{c.gender} {c.bloodGroup ? `| ${c.bloodGroup}` : ''}</p>

                      </div>

                    </div>

                  </td>

                  <td className="px-6 py-4">

                    <p className="font-semibold text-gray-700">{c.mobile}</p>

                    <p className="text-[10px] text-gray-400 mt-0.5 font-black uppercase tracking-wider">{c.memberIdNo || 'ID_PENDING'}</p>

                  </td>

                  <td className="px-6 py-4 text-right space-x-1">

                    <Link to={`/customers/view/${c.id}`} className="inline-flex p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Eye size={18} /></Link>

                    <Link to={`/customers/edit/${c.id}`} className="inline-flex p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"><Edit3 size={18} /></Link>

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

        } catch (err) {

           console.error("Fetch detail failed:", err);

           navigate('/customers/list');

        }

        finally { setFetching(false); }

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

   

    ['patientPhotoUrl', 'familyPhotoUrl', 'onlinePaymentQrUrl', 'paymentScreenshotUrl', 'medicinePrescriptionPhotoUrl', 'idCardPdfUrl', 'createdAt', 'createdBy'].forEach(f => delete (submissionData as any)[f]);

   

    data.append('data', new Blob([JSON.stringify(submissionData)], { type: 'application/json' }));

   

    if (files.patientPhoto) data.append('patientPhoto', files.patientPhoto);

    if (files.paymentScreenshot) data.append('paymentScreenshot', files.paymentScreenshot);

   

    prescriptionFiles.forEach(file => data.append('medicinePrescriptionPhoto', file));

   

    submissionData.familyMembers?.forEach((_, i) => {

      if (familyPhotos[i]) data.append('familyPhotos', familyPhotos[i]);

    });



    try {

      const config = { headers: { 'Content-Type': 'multipart/form-data' } };

      let response;

      if (id) response = await api.put(`/form/update/${id}`, data, config);

      else response = await api.post('/form/create', data, config);

     

      const savedCustomer = response.data;

     

      if (user?.role === Role.FIELD_STAFF) {

        alert(`REGISTRATION SUCCESSFUL!\n\nPatient Name: ${savedCustomer.name}\nCard ID: ${savedCustomer.memberIdNo}`);

        navigate('/');

      } else {

        alert('Record saved successfully.');

        navigate('/customers/list');

      }

    } catch (err: any) {

      alert(`Sync Failed: ${err.response?.data?.message || 'Server Error'}`);

    } finally { setLoading(false); }

  };



  if (fetching) return <div className="h-96 flex flex-col items-center justify-center gap-4"><Loader2 className="animate-spin text-blue-600" size={40} /><p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Loading Registry...</p></div>;



  const inputClass = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 font-bold text-sm transition-all";

  const labelClass = "text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1";



  return (

    <div className="max-w-4xl mx-auto space-y-8 pb-32 animate-in fade-in duration-500">

      {showCamera && <CameraModal onCapture={(f) => handleFileCapture(f, showCamera.type, showCamera.index)} onClose={() => setShowCamera(null)} />}

      <div className="flex items-center gap-4">

        <button onClick={() => navigate(-1)} className="p-3 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 shadow-sm active:scale-95 transition-all"><ChevronLeft size={24} /></button>

        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{id ? 'Edit Patient' : 'New Registration'}</h1>

      </div>



      <form onSubmit={handleSubmit} className="space-y-12 bg-white p-8 md:p-12 rounded-3xl border border-gray-100 shadow-sm">

        {/* Record Metadata display in edit mode */}

        {id && formData.createdBy && (

          <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 flex items-center justify-between mb-2">

             <div className="flex items-center gap-3">

                <ShieldCheck className="text-blue-500" size={24} />

                <div>

                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Registered By</p>

                  <p className="font-bold text-gray-900 text-sm">{formData.createdBy.name} ({formData.createdBy.employeeId})</p>

                </div>

             </div>

             <div className="text-right">

                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Join Date</p>

                <p className="font-bold text-gray-700 text-sm">{formData.createdAt ? new Date(formData.createdAt).toLocaleDateString() : '-'}</p>

             </div>

          </div>

        )}



        <section>

          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-50">

            <User className="text-blue-600" size={20} />

            <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">Personal Details</h3>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div className="md:col-span-2 flex flex-col items-center gap-4 mb-4">

               <div className="w-40 h-40 bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl flex items-center justify-center overflow-hidden">

                 {(files.patientPhoto || formData.patientPhotoUrl) ? <img src={files.patientPhoto ? URL.createObjectURL(files.patientPhoto) : formData.patientPhotoUrl} className="w-full h-full object-cover" /> : <User size={40} className="text-gray-200" />}

               </div>

               <div className="flex gap-2">

                 <label className="px-4 py-2 bg-gray-900 text-white rounded-lg text-[10px] font-bold uppercase cursor-pointer hover:bg-black transition-all shadow-md">Upload Photo<input type="file" className="hidden" onChange={e => e.target.files && handleFileCapture(e.target.files[0], 'patientPhoto')} /></label>

                 <button type="button" onClick={() => setShowCamera({ type: 'patientPhoto' })} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-[10px] font-bold uppercase hover:bg-blue-700 transition-all active:scale-95 shadow-md">Capture</button>

               </div>

            </div>

           

            <div><label className={labelClass}>Patient Name *</label><input name="name" value={formData.name || ''} onChange={handleInputChange} required className={inputClass} placeholder="Full Name" /></div>

           

            <div className="grid grid-cols-2 gap-4">

              <div>

                <label className={labelClass}>Gender *</label>

                <select name="gender" value={formData.gender} onChange={handleInputChange} className={inputClass}>

                  <option value="MALE">MALE</option>

                  <option value="FEMALE">FEMALE</option>

                </select>

              </div>

              <div>

                <label className={labelClass}>Blood Group</label>

                <select name="bloodGroup" value={formData.bloodGroup || ''} onChange={handleInputChange} className={inputClass}>

                  <option value="">Select Group</option>

                  <option value="A+">A+</option><option value="A-">A-</option>

                  <option value="B+">B+</option><option value="B-">B-</option>

                  <option value="O+">O+</option><option value="O-">O-</option>

                  <option value="AB+">AB+</option><option value="AB-">AB-</option>

                </select>

              </div>

            </div>



            <div><label className={labelClass}>Mobile Number *</label><input name="mobile" maxLength={10} value={formData.mobile || ''} onChange={handleInputChange} required className={inputClass} placeholder="10-digit number" /></div>

            <div><label className={labelClass}>WhatsApp Number</label><input name="whatsappNo" maxLength={10} value={formData.whatsappNo || ''} onChange={handleInputChange} className={inputClass} placeholder="Optional" /></div>

            <div><label className={labelClass}>Date of Birth *</label><input type="date" name="dateOfBirth" value={formData.dateOfBirth || ''} onChange={handleInputChange} required className={inputClass} /></div>

            <div><label className={labelClass}>Profession</label><input name="profession" value={formData.profession || ''} onChange={handleInputChange} className={inputClass} placeholder="Enter Profession" /></div>

            <div><label className={labelClass}>Email Address</label><input type="email" name="email" value={formData.email || ''} onChange={handleInputChange} className={inputClass} placeholder="Official/Personal Email" /></div>

           

            <div>

              <label className={labelClass}>No. of Patients</label>

              <select name="noOfpatient" value={formData.noOfpatient || '0'} onChange={handleInputChange} className={inputClass}>

                {[...Array(11)].map((_, i) => (

                  <option key={i} value={i.toString()}>{i}</option>

                ))}

              </select>

            </div>



            <div className="md:col-span-2"><label className={labelClass}>Full Address *</label><textarea name="address" value={formData.address || ''} onChange={handleInputChange} required className={`${inputClass} h-24 pt-3 resize-none`} placeholder="Detailed Address" /></div>

          </div>

        </section>



        <section>

          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-50">

            <HeartPulse className="text-blue-600" size={20} />

            <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">Medical Information</h3>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            <div className="space-y-4">

               <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" name="bloodTestRequired" checked={formData.bloodTestRequired} onChange={handleInputChange} className="w-5 h-5 accent-blue-600" /><span className="text-sm font-bold text-gray-700">Blood Test Required?</span></label>

               <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" name="otherTestRequired" checked={formData.otherTestRequired} onChange={handleInputChange} className="w-5 h-5 accent-blue-600" /><span className="text-sm font-bold text-gray-700">Other Diagnostics?</span></label>

               {formData.otherTestRequired && <input name="otherTestName" value={formData.otherTestName || ''} onChange={handleInputChange} className={inputClass} placeholder="Specify Test Name" />}

            </div>

            <div className="space-y-4">

               <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" name="regularMedicine" checked={formData.regularMedicine} onChange={handleInputChange} className="w-5 h-5 accent-blue-600" /><span className="text-sm font-bold text-gray-700">Regular Medication?</span></label>

               {formData.regularMedicine && (
  <div className="space-y-4 pt-2">
    <input name="medicineName" value={formData.medicineName || ''} onChange={handleInputChange} className={inputClass} placeholder="Medicine Name" />
    <div className="p-4 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center gap-3">
      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Prescriptions ({prescriptionFiles.length})</p>
      <div className="flex flex-wrap gap-2 justify-center">
        {/* YE HAI LOCAL PREVIEW LOGIC */}
        {prescriptionFiles.map((f, i) => (
          <img key={i} src={URL.createObjectURL(f)} className="w-12 h-12 object-cover rounded-lg border border-white shadow-sm" />
        ))}
        <label className="w-12 h-12 bg-gray-900 text-white rounded-lg flex items-center justify-center cursor-pointer shadow-md">
          <Plus size={18} />
          <input type="file" multiple className="hidden" onChange={e => e.target.files && Array.from(e.target.files).forEach(f => handleFileCapture(f, 'prescriptionPhoto'))} />
        </label>
      </div>
    </div>
  </div>
)}

            </div>

          </div>

        </section>



        <section>

          <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-50">

            <div className="flex items-center gap-3">

               <Users2 className="text-blue-600" size={20} />

               <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">Family Registry</h3>

            </div>

            <button type="button" onClick={addFamilyMember} className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 flex items-center gap-2 transition-all">

              <Plus size={16} /> Add Member

            </button>

          </div>

          <div className="space-y-6">

             {formData.familyMembers?.map((m, idx) => (

               <div key={idx} className="p-6 bg-gray-50/50 rounded-3xl border border-gray-100 relative group animate-in slide-in-from-right-4 duration-300">

                  <button type="button" onClick={() => removeFamilyMember(idx)} className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                     <div className="lg:col-span-1 flex flex-col items-center gap-3 mb-2">

                        <div className="w-20 h-20 bg-white rounded-2xl border-2 border-dashed border-gray-100 flex items-center justify-center overflow-hidden">

                           {(familyPhotos[idx] || m.photoUrl) ? <img src={familyPhotos[idx] ? URL.createObjectURL(familyPhotos[idx]) : m.photoUrl} className="w-full h-full object-cover" /> : <User size={24} className="text-gray-100" />}

                        </div>

                        <div className="flex flex-col gap-2">

                          <label className="text-[9px] font-bold text-blue-600 cursor-pointer uppercase hover:underline text-center">Upload<input type="file" className="hidden" onChange={e => e.target.files && handleFileCapture(e.target.files[0], 'familyPhoto', idx)} /></label>

                          <button type="button" onClick={() => setShowCamera({ type: 'familyPhoto', index: idx })} className="text-[9px] font-bold text-emerald-600 uppercase hover:underline text-center">Capture</button>

                        </div>

                     </div>

                     <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">

                        <div><label className={labelClass}>Name</label><input value={m.name} onChange={e => updateFamilyMember(idx, 'name', e.target.value)} className={inputClass} placeholder="Full Name" /></div>

                        <div><label className={labelClass}>Mobile</label><input value={m.mobile} onChange={e => updateFamilyMember(idx, 'mobile', e.target.value)} className={inputClass} placeholder="Contact" /></div>

                        <div><label className={labelClass}>Gender</label><select value={m.gender} onChange={e => updateFamilyMember(idx, 'gender', e.target.value)} className={inputClass}><option value="MALE">MALE</option><option value="FEMALE">FEMALE</option></select></div>

                        <div><label className={labelClass}>Relationship</label><input value={m.relationshipWithCardHolder} onChange={e => updateFamilyMember(idx, 'relationshipWithCardHolder', e.target.value)} className={inputClass} placeholder="e.g. Spouse" /></div>

                        <div><label className={labelClass}>DOB</label><input type="date" value={m.dateOfBirth} onChange={e => updateFamilyMember(idx, 'dateOfBirth', e.target.value)} className={inputClass} /></div>

                        <div><label className={labelClass}>Education</label><input value={m.educationQualification} onChange={e => updateFamilyMember(idx, 'educationQualification', e.target.value)} className={inputClass} placeholder="Qualification" /></div>

                        <div className="md:col-span-2"><label className={labelClass}>Profession</label><input value={m.profession} onChange={e => updateFamilyMember(idx, 'profession', e.target.value)} className={inputClass} placeholder="Occupation" /></div>

                     </div>

                  </div>

               </div>

             ))}

             {formData.familyMembers?.length === 0 && <p className="text-center py-10 text-gray-300 font-bold uppercase text-[10px] tracking-widest border-2 border-dashed border-gray-50 rounded-3xl">No family members added</p>}

          </div>

        </section>



        <section>

          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-50">

            <CreditCard className="text-blue-600" size={20} />

            <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">Payments & Validity</h3>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div className="md:col-span-2 bg-blue-50/50 p-4 rounded-2xl border border-blue-100 mb-2">

               <label className={`${labelClass} text-blue-600`}>Card Validity Upto *</label>

               <input type="date" name="cardValidityUpto" value={formData.cardValidityUpto || ''} onChange={handleInputChange} required className={`${inputClass} border-blue-200 focus:bg-white`} />

            </div>



            <div><label className={labelClass}>Payment Mode *</label><select name="paymentMode" value={formData.paymentMode} onChange={handleInputChange} className={inputClass}><option value="OFFLINE">CASH (OFFLINE)</option><option value="ONLINE">ONLINE (QR/TRANSFER)</option></select></div>

           

            <div className="space-y-6">

           {formData.paymentMode === 'ONLINE' && (

              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex flex-col items-center gap-3 animate-in slide-in-from-top-2">

                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Scan to Pay</p>

                <div className="w-48 h-48 bg-white p-2 rounded-xl shadow-sm border border-blue-100 flex items-center justify-center overflow-hidden">

                  <img src=" GooglePay_QR.png" alt="Payment QR" className="w-full h-full object-contain" />

                </div>

              </div>

            )}

              {/* CustomerForm ke andar Payment Proof section replace karein */}
<div className="p-5 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center gap-4">
  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Proof of Payment</p>
  
  {/* LOCAL PREVIEW AGAR FILE SELECT HUI HAI */}
  {(files.paymentScreenshot || formData.paymentScreenshotUrl) && (
    <img src={files.paymentScreenshot ? URL.createObjectURL(files.paymentScreenshot) : formData.paymentScreenshotUrl} className="w-20 h-20 object-cover rounded-xl shadow-md border-2 border-white" />
  )}

  <div className="flex gap-2">
    <label className="px-3 py-1.5 bg-gray-900 text-white rounded-lg text-[9px] font-bold uppercase cursor-pointer">Upload Receipt<input type="file" className="hidden" onChange={e => e.target.files && handleFileCapture(e.target.files[0], 'paymentScreenshot')} /></label>
    <button type="button" onClick={() => setShowCamera({ type: 'paymentScreenshot' })} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[9px] font-bold uppercase">Capture</button>
  </div>
</div>
            </div>



            <div className="md:col-span-2"><label className={labelClass}>Referred By</label><input name="medicalServiceReferenceBy" value={formData.medicalServiceReferenceBy || ''} onChange={handleInputChange} className={inputClass} placeholder="Staff/Doctor Name" /></div>

          </div>

        </section>



        <button disabled={loading} type="submit" className="w-full py-5 bg-blue-600 text-white font-bold rounded-2xl shadow-xl hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-lg uppercase tracking-widest shadow-blue-500/20">

          {loading ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />}

          {id ? 'Synchronize Record' : 'Submit Registration'}

        </button>

      </form>

    </div>

  );

};



const CustomerDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [c, setC] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const resp = await api.get(`/form/view/${id}`);
        if (resp.data) setC(resp.data);
      } catch (err: any) {
        console.error("Fetch detail failed:", err);
        setC(null);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const downloadIdCard = async () => {
    if (!id) return;
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
        link.setAttribute('download', `ID_Card_${c?.memberIdNo || id}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch { alert("Identity PDF generation failed."); } finally { setDownloading(false); }
  };

  if (loading) return <div className="h-96 flex flex-col items-center justify-center gap-4"><Loader2 className="animate-spin text-blue-600" size={40} /><p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Fetching Details...</p></div>;
  if (!c) return <div className="h-96 flex flex-col items-center justify-center gap-4"><Info size={48} className="text-gray-200" /><p className="text-gray-400 font-bold">Patient not found.</p></div>;

  // Prescription Records logic
  const prescriptionUrls = c.medicinePrescriptionPhotoUrl ? c.medicinePrescriptionPhotoUrl.split(',') : [];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
      {previewUrl && <PhotoPreviewModal url={previewUrl} title="Asset Preview" onClose={() => setPreviewUrl(null)} />}
      
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate(-1)} className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all"><ChevronLeft size={24} /></button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 capitalize leading-tight">{c.name}</h1>
            <div className="flex flex-wrap gap-3 mt-2">
               <span className="text-blue-600 bg-blue-50 px-3 py-1 rounded-lg text-[10px] font-black uppercase border border-blue-100 tracking-wider">ID: {c.memberIdNo}</span>
               <span className="text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg text-[10px] font-black uppercase border border-emerald-100 tracking-wider">Valid: {c.cardValidityUpto || 'N/A'}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={downloadIdCard} disabled={downloading} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-blue-700 shadow-md">
            {downloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />} ID Card
          </button>
          <Link to={`/customers/edit/${c.id}`} className="p-3 bg-gray-900 text-white rounded-xl hover:bg-black transition-all shadow-md"><Edit3 size={20} /></Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: Profile info */}
        <div className="space-y-8">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 flex flex-col items-center">
            <div className="w-44 h-44 rounded-full border-4 border-gray-50 shadow-inner overflow-hidden mb-6 bg-gray-50 cursor-pointer group relative" onClick={() => c.patientPhotoUrl && setPreviewUrl(c.patientPhotoUrl)}>
              {c.patientPhotoUrl ? <img src={c.patientPhotoUrl} className="w-full h-full object-cover" /> : <UserCircle size={80} className="m-auto text-gray-200" />}
              {c.patientPhotoUrl && <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white"><Maximize2 size={32} /></div>}
            </div>
            <div className="w-full space-y-4">
              <div className="p-4 bg-gray-50 rounded-2xl flex items-center gap-4"><Smartphone size={24} className="text-blue-500" /><div><p className="text-[9px] font-bold text-gray-400 uppercase">Mobile</p><p className="font-bold text-gray-800">{c.mobile}</p></div></div>
              <div className="p-4 bg-gray-50 rounded-2xl flex items-center gap-4"><MapPin size={24} className="text-blue-500" /><div><p className="text-[9px] font-bold text-gray-400 uppercase">Address</p><p className="text-xs font-semibold text-gray-700 leading-tight">{c.address}</p></div></div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Merged Cards */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* Card 1: Medical & Prescriptions */}
          <div className="bg-white rounded-[3.5rem] border border-gray-100 shadow-sm p-10">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-4 mb-10"><Stethoscope size={24} className="text-blue-500" /> Medical Summary & Records</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
              <div className={`p-6 rounded-2xl border text-center ${c.bloodGroup ? 'bg-red-50 border-red-100 text-red-700' : 'bg-gray-50 text-gray-300'}`}><p className="text-[9px] font-bold uppercase mb-2">Blood Group</p><p className="text-xl font-black">{c.bloodGroup || 'N/A'}</p></div>
              <div className="p-6 rounded-2xl border text-center bg-gray-50"><p className="text-[9px] font-bold uppercase mb-2">Blood Test</p><p className="text-xl font-bold">{c.bloodTestRequired ? 'YES' : 'NO'}</p></div>
              <div className="p-6 rounded-2xl border text-center bg-indigo-50 border-indigo-100 text-indigo-700"><p className="text-[9px] font-bold uppercase mb-2">Medication</p><p className="text-sm font-bold truncate">{c.medicineName || 'NONE'}</p></div>
              <div className="p-6 rounded-2xl border bg-green-50 border-green-100 text-green-700 text-center"><p className="text-[9px] font-bold uppercase mb-2">Billing</p><p className="text-xl font-bold uppercase">{c.paymentMode}</p></div>
            </div>

            {prescriptionUrls.length > 0 && (
              <div className="mt-8 pt-10 border-t border-gray-50 space-y-6">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2"><FileText size={14} /> Prescription Gallery ({prescriptionUrls.length})</p>
                <div className="flex flex-wrap gap-5">
                   {prescriptionUrls.map((url, i) => (
                    <div key={i} className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-white shadow-lg cursor-pointer hover:scale-105 transition-all group relative" onClick={() => setPreviewUrl(url)}>
                      <img src={url} className="w-full h-full object-cover" alt="prescription" />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"><Maximize2 size={20} /></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Card 2: Family Registry */}
          <div className="bg-white rounded-[3.5rem] border border-gray-100 shadow-sm p-10">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-3 mb-8"><Users size={20} className="text-blue-500" /> Family Registry</h3>
            <div className="overflow-x-auto rounded-2xl border border-gray-50">
              <table className="w-full text-left text-xs min-w-[600px]">
                <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase border-b border-gray-50">
                  <tr><th className="px-6 py-4">Name</th><th className="px-6 py-4">Birth & Mobile</th><th className="px-6 py-4">Relationship</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {c.familyMembers && c.familyMembers.length > 0 ? c.familyMembers.map((m, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-gray-900">{m.name}</td>
                      <td className="px-6 py-4"><span>{m.dateOfBirth}</span> | <span className="text-gray-400">{m.mobile}</span></td>
                      <td className="px-6 py-4 capitalize text-blue-600 font-bold">{m.relationshipWithCardHolder || 'Member'}</td>
                    </tr>
                  )) : (<tr><td colSpan={3} className="px-6 py-20 text-center text-gray-300 font-bold uppercase tracking-widest italic opacity-40">No family members registered.</td></tr>)}
                </tbody>
              </table>
            </div>
          </div>

          {/* Card 3: Payment Proof */}
          <div className="bg-white rounded-[3.5rem] border border-gray-100 shadow-sm p-10">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-4 mb-8"><CreditCard size={24} className="text-blue-500" /> Payment Confirmation</h3>
            <div className="p-8 bg-gray-50 border border-gray-100 rounded-[3rem] flex items-center justify-between group hover:bg-white hover:shadow-2xl transition-all duration-500">
               <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-white rounded-2xl border border-gray-200 flex items-center justify-center overflow-hidden shadow-inner ring-4 ring-gray-100">
                    {c.paymentScreenshotUrl ? (<img src={c.paymentScreenshotUrl} className="w-full h-full object-cover" alt="payment" />) : (<QrCode size={32} className="text-gray-200" />)}
                  </div>
                  <div><p className="text-xl font-black text-gray-900 uppercase tracking-tighter">{c.paymentMode} Receipt</p><p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Verified ✓</p></div>
               </div>
               {c.paymentScreenshotUrl && (
                 <button onClick={() => setPreviewUrl(c.paymentScreenshotUrl!)} className="px-10 py-4 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase hover:bg-blue-600 active:scale-95 flex items-center gap-3 shadow-lg transition-all"><Maximize2 size={16} /> Asset Preview</button>
               )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

const CustomerManagement: React.FC = () => (

  <Routes>

    <Route path="list" element={<CustomerList />} /><Route path="create" element={<CustomerForm />} />

    <Route path="edit/:id" element={<CustomerForm />} /><Route path="view/:id" element={<CustomerDetail />} />

  </Routes>

);

export default CustomerManagement;