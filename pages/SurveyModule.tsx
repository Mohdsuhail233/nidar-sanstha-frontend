import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../App';
import { 
  ClipboardList, Send, Eye, Clock, CheckCircle2, Loader2, ChevronLeft,
  Plus, Trash2, Save, Image as ImageIcon, Activity, History
} from 'lucide-react';

// ==========================================
// 1. SURVEY LIST (DASHBOARD)
// ==========================================
const SurveyList: React.FC = () => {
  const { user } = useAuth();
  const [forms, setForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';

  useEffect(() => {
    let isMounted = true;
    api.get('/survey/active-forms')
      .then(res => {
        if (isMounted) setForms(Array.isArray(res.data) ? res.data : []);
      })
      .catch(err => console.error("Fetch error", err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="p-6 space-y-10 animate-in fade-in pb-20">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tighter">Operational Surveys</h1>
          <p className="text-gray-500 text-sm font-medium mt-1">Select a session to begin data collection.</p>
        </div>
        {isAdmin && (
          <Link to="/surveys/builder" className="bg-gray-900 text-white px-10 py-5 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest shadow-2xl active:scale-95 transition-all">
            + Create New Campaign
          </Link>
        )}
      </div>

      {loading ? (
        <div className="py-40 text-center"><Loader2 className="animate-spin mx-auto text-blue-500 mb-4" size={48}/> <p className="font-black text-gray-400 uppercase text-xs tracking-widest">Syncing Matrix...</p></div>
      ) : forms.length === 0 ? (
        <div className="py-40 text-center bg-white rounded-[4rem] border-2 border-dashed border-gray-100">
           <History size={64} className="mx-auto text-gray-100 mb-6" />
           <p className="text-gray-400 font-black uppercase tracking-widest">No active sessions found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {forms.map(form => (
            <div key={form.id} className="bg-white p-10 rounded-[3.5rem] border border-gray-50 shadow-sm hover:shadow-2xl transition-all flex flex-col group">
              <div className="mb-8">
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2 mb-3">
                   <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div> Live Session
                </span>
                <h3 className="text-2xl font-black text-gray-900 capitalize leading-tight group-hover:text-blue-600 transition-colors">{form.formName || 'Untitled'}</h3>
              </div>
              <div className="mt-auto space-y-3">
                <button onClick={() => navigate(`/surveys/submit/${form.id}`)} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-blue-100 active:scale-95 transition-all">Launch Survey</button>
                {isAdmin && <button onClick={() => navigate(`/surveys/results/${form.id}`)} className="w-full py-5 bg-gray-50 text-gray-400 border border-gray-100 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-100 transition-all">View Results</button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ==========================================
// 2. SURVEY BUILDER (ADMIN)
// ==========================================
const SurveyBuilder: React.FC = () => {
  const navigate = useNavigate();
  const [formName, setFormName] = useState('');
  const [fields, setFields] = useState<any[]>([{ label: '', fieldType: 'SHORT_TEXT', required: true }]);
  const [loading, setLoading] = useState(false);

  const addField = () => setFields([...fields, { label: '', fieldType: 'SHORT_TEXT', required: false, fieldOrder: fields.length + 1 }]);
  
  const handleSave = async () => {
    if (!formName.trim()) return alert('Form title required');
    setLoading(true);
    try {
      const payload = {
        formName,
        active: true,
        fields: fields.map((f, i) => ({
          label: f.label || `Question ${i + 1}`,
          fieldType: f.fieldType,
          required: f.required,
          fieldOrder: i + 1,
          name: `field_${Date.now()}_${i}` // Unique name for backend mapping
        }))
      };
      await api.post('/survey/create-form', payload);
      alert('Campaign Published!');
      navigate('/surveys/list');
    } catch (err) { alert('Save failed'); } finally { setLoading(false); }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-10 pb-20 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate(-1)} className="p-4 bg-white border rounded-2xl shadow-sm hover:bg-gray-50 transition-all"><ChevronLeft size={24}/></button>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Campaign Architect</h1>
        </div>
        <button onClick={handleSave} disabled={loading} className="px-12 py-5 bg-blue-600 text-white rounded-[1.8rem] font-black uppercase text-xs shadow-2xl hover:bg-blue-700 active:scale-95 transition-all">
          {loading ? <Loader2 className="animate-spin" /> : 'Publish Form'}
        </button>
      </div>

      <div className="bg-white p-12 md:p-16 rounded-[4rem] border shadow-sm space-y-16">
        <div className="space-y-4">
          <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest ml-2">Session Title</label>
          <input type="text" placeholder="E.g., Field Inspection Report" className="w-full text-3xl font-black outline-none border-b-4 border-gray-50 focus:border-blue-500 transition-all py-4" value={formName} onChange={e => setFormName(e.target.value)} />
        </div>

        <div className="space-y-8">
          <div className="flex justify-between items-center border-b border-gray-50 pb-6">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Question Matrix</span>
            <button onClick={addField} className="flex items-center gap-2 bg-blue-50 text-blue-600 px-6 py-3 rounded-xl font-black text-[10px] uppercase hover:bg-blue-100 transition-all">+ Add Parameter</button>
          </div>
          
          <div className="space-y-6">
            {fields.map((f, i) => (
              <div key={i} className="p-10 bg-gray-50/50 rounded-[3rem] border border-gray-100 space-y-8 relative group hover:border-blue-200 transition-all">
                <button onClick={() => setFields(fields.filter((_, idx) => idx !== i))} className="absolute top-8 right-8 text-red-300 hover:text-red-600 transition-all bg-white p-2 rounded-xl shadow-sm"><Trash2 size={20}/></button>
                <div className="space-y-3">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Label Name (Visible to Staff)</span>
                  <input type="text" placeholder="What is the heading of this field?" className="w-full p-5 bg-white border border-gray-100 rounded-2xl font-bold shadow-sm outline-none focus:ring-4 focus:ring-blue-500/5" value={f.label} onChange={e => {
                    const nf = [...fields]; nf[i].label = e.target.value; setFields(nf);
                  }} />
                </div>
                <div className="flex flex-wrap gap-6 items-center">
                  <div className="bg-white px-6 py-3 rounded-xl border shadow-sm">
                    <select className="bg-transparent text-[10px] font-black uppercase outline-none cursor-pointer" value={f.fieldType} onChange={e => {
                      const nf = [...fields]; nf[i].fieldType = e.target.value; setFields(nf);
                    }}>
                      <option value="SHORT_TEXT">Text Input</option>
                      <option value="NUMBER">Numeric Value</option>
                      <option value="DATE">Calendar Date</option>
                      <option value="IMAGE">Visual Asset (Photo)</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => {
                     const nf = [...fields]; nf[i].required = !nf[i].required; setFields(nf);
                  }}>
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${f.required ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-200'}`}>
                      {f.required && <CheckCircle2 size={14} className="text-white" />}
                    </div>
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Required</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 3. SURVEY SUBMISSION (STAFF)
// ==========================================
const SurveySubmit: React.FC = () => {
  const { formId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState<any>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/survey/active-forms').then(res => {
      const found = res.data.find((f: any) => String(f.id) === String(formId));
      setForm(found || null);
    });
  }, [formId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();
    data.append('data', new Blob([JSON.stringify(formData)], { type: 'application/json' }));

    try {
      await api.post(`/survey/submit/${formId}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
      alert('Operational Report Logged!'); navigate('/surveys/list');
    } catch (err) { alert('Transmission Error'); } finally { setLoading(false); }
  };

  if (!form) return <div className="text-center py-40 font-black text-gray-300 animate-pulse uppercase tracking-widest">Initializing Interface...</div>;

  return (
    <div className="max-w-2xl mx-auto p-4 pb-20 space-y-10 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-6">
        <button onClick={() => navigate(-1)} className="p-4 bg-white border rounded-2xl shadow-sm"><ChevronLeft size={24} /></button>
        <h1 className="text-4xl font-black text-gray-900 tracking-tight capitalize leading-tight">{form.formName}</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-12 md:p-16 rounded-[4rem] border shadow-sm space-y-12">
        <div className="flex justify-between border-b border-gray-50 pb-8">
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Submission Matrix</p>
           <Activity className="text-blue-500" size={24} />
        </div>

        {form.fields && [...form.fields].sort((a,b) => a.fieldOrder - b.fieldOrder).map((field: any, index: number) => {
          // HEADING FIX: Backend property 'label' mapping
          const headingText = field.label || `Parameter ${index+1}`;
          
          return (
            <div key={index} className="space-y-4">
              <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                 {headingText} {field.required && <span className="text-red-500">*</span>}
              </label>
              
              {field.fieldType === 'IMAGE' ? (
                <div className="flex flex-col items-center p-10 bg-gray-50 border-2 border-dashed border-gray-200 rounded-[2.5rem] hover:border-blue-400 hover:bg-white transition-all group">
                  <ImageIcon size={48} className="text-gray-300 group-hover:text-blue-500 transition-colors mb-4"/>
                  <div className="text-center">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Upload Visual Asset</p>
                    <input type="file" accept="image/*" required={field.required} className="text-[10px] font-black uppercase cursor-pointer file:bg-blue-600 file:text-white file:border-0 file:px-4 file:py-2 file:rounded-full file:mr-4 file:hover:bg-blue-700" onChange={e => {
                       setFormData({...formData, [headingText]: e.target.files?.[0]?.name || 'Photo_Captured'});
                    }} />
                  </div>
                </div>
              ) : (
                <input
                  type={field.fieldType === 'NUMBER' ? 'number' : field.fieldType === 'DATE' ? 'date' : 'text'}
                  required={field.required}
                  placeholder={`Enter ${headingText.toLowerCase()}...`}
                  className="w-full px-8 py-6 bg-gray-50 border border-gray-100 rounded-[1.8rem] outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/5 font-bold transition-all text-lg"
                  onChange={e => setFormData({ ...formData, [headingText]: e.target.value })}
                />
              )}
            </div>
          );
        })}
        
        <button type="submit" disabled={loading} className="w-full py-7 bg-blue-600 text-white font-black rounded-[2.2rem] shadow-2xl uppercase tracking-widest active:scale-95 transition-all text-xl hover:bg-blue-700">
          {loading ? <Loader2 className="animate-spin mx-auto"/> : 'Complete Submission'}
        </button>
      </form>
    </div>
  );
};

// ==========================================
// 4. ANALYTICS (ADMIN VIEW)
// ==========================================

// Helper: Check if a value is an image URL or image filename
const isImageValue = (val: any): boolean => {
  if (typeof val !== 'string') return false;
  const str = val.trim().toLowerCase();
  // Check for image file extensions
  if (/\.(png|jpg|jpeg|gif|webp|bmp|svg)(\?.*)?$/i.test(str)) return true;
  // Check for URL patterns that are likely images
  if ((str.startsWith('http://') || str.startsWith('https://')) && 
      (str.includes('/images/') || str.includes('/uploads/') || str.includes('/photos/'))) return true;
  return false;
};

// Helper: Convert filename to full URL if it's not already a URL
const getImageUrl = (val: string): string => {
  const str = val.trim();
  if (str.startsWith('http://') || str.startsWith('https://')) return str;
  // Construct URL using API base - backend serves uploaded files
  return `https://nidarsanstha.xyz/uploads/${str}`;
};

const SurveyResults: React.FC = () => {
  const { formId } = useParams();
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    api.get(`/survey/results/${formId}`).then(res => {
      setResults(Array.isArray(res.data) ? res.data : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [formId]);

  const getSafeName = (submittedBy: any) => {
    if (!submittedBy) return 'Unknown Staff';
    return typeof submittedBy === 'object' ? (submittedBy.name || submittedBy.username || 'System User') : String(submittedBy);
  };

  return (
    <div className="p-6 space-y-10 pb-20 animate-in fade-in">
      {/* Image Preview Modal */}
      {previewUrl && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setPreviewUrl(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <button 
              onClick={() => setPreviewUrl(null)}
              className="absolute -top-12 right-0 text-white font-black text-sm uppercase tracking-widest hover:text-red-400 transition-colors"
            >
              ✕ Close
            </button>
            <img 
              src={previewUrl} 
              alt="Preview" 
              className="w-full h-full object-contain rounded-3xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-black uppercase tracking-tight text-gray-900 flex items-center gap-4">
          <Activity className="text-blue-600" size={36}/> Analytics Dashboard
        </h1>
      </div>

      {loading ? <div className="py-40 text-center"><Loader2 className="animate-spin text-blue-500 mx-auto" size={48}/></div> : (
        <div className="space-y-8">
          {results.map((res: any) => {
            const name = getSafeName(res.submittedBy);
            return (
              <div key={res.id} className="bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-8 border-b border-gray-50">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-blue-600 text-white rounded-3xl flex items-center justify-center font-black text-2xl uppercase shadow-lg shadow-blue-100">{name.charAt(0)}</div>
                    <div>
                      <p className="font-black text-2xl text-gray-900">{name}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1 flex items-center gap-2">
                        <Clock size={12} /> {new Date(res.submittedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="px-6 py-2 bg-green-50 text-green-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-100 flex items-center gap-2">
                    <CheckCircle2 size={14}/> Integrity Verified
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {Object.entries(res.answers || res.data || {}).map(([key, val]) => (
                    <div key={key} className="bg-gray-50 p-6 rounded-[2rem] border border-gray-50 hover:border-blue-100 transition-all">
                      <span className="text-[9px] font-black text-blue-400 uppercase block mb-3 tracking-[0.2em]">{key.replace(/_/g, ' ')}</span>
                      {isImageValue(val) ? (
                        <div 
                          className="mt-2 cursor-pointer group relative"
                          onClick={() => setPreviewUrl(getImageUrl(String(val)))}
                        >
                          <img 
                            src={getImageUrl(String(val))} 
                            alt={key}
                            className="w-full h-40 object-cover rounded-xl border-2 border-white shadow-md group-hover:scale-[1.02] transition-transform"
                            onError={(e) => {
                              // If image fails to load, show filename as fallback
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                          <div className="hidden text-base font-bold text-gray-800 break-words">
                            <div className="flex items-center gap-2">
                              <ImageIcon size={16} className="text-gray-400" />
                              {String(val)}
                            </div>
                          </div>
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 rounded-xl flex items-center justify-center transition-opacity">
                            <Eye size={24} className="text-white" />
                          </div>
                        </div>
                      ) : (
                        <span className="text-base font-bold text-gray-800 break-words">{String(val)}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {results.length === 0 && (
            <div className="text-center py-32 bg-gray-50 rounded-[4rem] border-2 border-dashed border-gray-200">
              <History className="mx-auto text-gray-200 mb-4" size={56} />
              <p className="font-black text-gray-300 uppercase tracking-widest text-sm">Matrix currently empty</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ==========================================
// 5. MAIN ROUTING
// ==========================================
const SurveyModule: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';
  
  return (
    <Routes>
      <Route path="list" element={<SurveyList />} />
      <Route path="submit/:formId" element={<SurveySubmit />} />
      <Route path="results/:formId" element={isAdmin ? <SurveyResults /> : <SurveyList />} />
      <Route path="builder" element={isAdmin ? <SurveyBuilder /> : <SurveyList />} />
    </Routes>
  );
};

export default SurveyModule;