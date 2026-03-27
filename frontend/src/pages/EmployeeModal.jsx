import { useState, useEffect } from "react";
import axios from "axios";

const DEPARTMENTS = ["Engineering", "Product", "Design", "HR", "Finance", "Operations", "Marketing", "Sales", "Legal"];

const EMPTY = { name: "", email: "", department: "", position: "", status: "active", salary: "" };

export default function EmployeeModal({ employee, onClose, onSaved }) {
  const isEdit = Boolean(employee);
  const [form, setForm]     = useState(EMPTY);
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      setForm({
        employeeId: employee.employeeId || "",
        name:       employee.name       || "",
        email:      employee.email      || "",
        department: employee.department || "",
        position:   employee.position   || "",
        status:     employee.status     || "active",
        salary:     employee.salary     != null ? String(employee.salary) : "",
      });
    } else {
      setForm(EMPTY);
    }
  }, [employee]);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.email || !form.department || !form.position || !form.employee_id) {
        setError("Employee ID, name, email, department and position are required.");
        return;
    }
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };
    const payload = {
      ...form,
      salary: form.salary ? Number(form.salary) : null,
    };
    setLoading(true);
    try {
      if (isEdit) {
        const id = employee._id || employee.id;
        await axios.put(`http://127.0.0.1:8000/employees/${id}`, payload, { headers });
      } else {
        await axios.post("http://127.0.0.1:8000/employees/employee", payload, { headers });
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.detail || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');

        .modal-backdrop {
          position: fixed; inset: 0; z-index: 100;
          background: rgba(26,26,46,0.45);
          backdrop-filter: blur(3px);
          display: flex; align-items: center; justify-content: center;
          padding: 24px;
          animation: fadeIn 0.15s ease;
        }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

        .modal-card {
          background: #fff;
          border-radius: 16px;
          width: 100%; max-width: 480px;
          box-shadow: 0 24px 60px rgba(26,26,46,0.18);
          overflow: hidden;
          animation: slideUp 0.2s ease;
        }

        .modal-header {
          padding: 24px 28px 0;
          display: flex; align-items: flex-start; justify-content: space-between;
        }

        .modal-header h2 {
          font-family: 'DM Serif Display', serif;
          font-size: 22px; color: #1a1a2e;
        }

        .modal-header p { font-size: 13px; color: #4a4a6a; font-weight: 300; margin-top: 2px; }

        .modal-close {
          background: none; border: none; cursor: pointer;
          color: #9ca3af; padding: 2px; transition: color 0.12s;
          display: flex; flex-shrink: 0; margin-top: 2px;
        }
        .modal-close:hover { color: #1a1a2e; }
        .modal-close svg { width: 20px; height: 20px; }

        .modal-body { padding: 20px 28px 28px; }

        .m-error {
          background: #fef2f2; border: 1px solid #fecaca;
          border-radius: 8px; padding: 10px 14px;
          font-size: 13px; color: #dc2626; margin-bottom: 16px;
        }

        .m-field { margin-bottom: 16px; }

        .m-field label {
          display: block; font-size: 11px; font-weight: 500;
          color: #4a4a6a; text-transform: uppercase;
          letter-spacing: 0.08em; margin-bottom: 6px;
        }

        .m-field input,
        .m-field select {
          width: 100%; border: 1px solid #e2e2ef;
          border-radius: 10px; padding: 10px 13px;
          font-size: 14px; font-family: 'DM Sans', sans-serif;
          color: #1a1a2e; background: #fff;
          outline: none; transition: border-color 0.15s, box-shadow 0.15s;
          appearance: none;
        }

        .m-field input:focus,
        .m-field select:focus {
          border-color: #4f46e5;
          box-shadow: 0 0 0 3px rgba(79,70,229,0.1);
        }

        .m-field input::placeholder { color: #c0c0d8; }

        .m-select-wrap { position: relative; }
        .m-select-wrap::after { content: '▾'; position: absolute; right: 13px; top: 50%; transform: translateY(-50%); color: #4a4a6a; pointer-events: none; font-size: 11px; }

        .m-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

        .modal-footer {
          display: flex; gap: 10px; justify-content: flex-end;
          padding: 0 28px 24px;
        }

        .m-btn {
          padding: 10px 20px; border-radius: 9px;
          font-size: 13.5px; font-weight: 500;
          font-family: 'DM Sans', sans-serif; cursor: pointer;
          transition: background 0.15s, border-color 0.15s;
          border: 1px solid #e2e2ef;
        }

        .m-btn.cancel { background: #fff; color: #4a4a6a; }
        .m-btn.cancel:hover { border-color: #c0c0d8; background: #f7f7fb; }

        .m-btn.save { background: #4f46e5; color: white; border-color: #4f46e5; }
        .m-btn.save:hover:not(:disabled) { background: #3730a3; border-color: #3730a3; }
        .m-btn.save:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>

      <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        <div className="modal-card" role="dialog" aria-modal="true">
          <div className="modal-header">
            <div>
              <h2>{isEdit ? "Edit Employee" : "Add Employee"}</h2>
              <p>{isEdit ? `Updating ${employee.name || employee.username}` : "Fill in the details for the new hire"}</p>
            </div>
            <button className="modal-close" onClick={onClose} aria-label="Close">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="modal-body">
              {error && <div className="m-error" role="alert">{error}</div>}
              <div className="m-row">
               <div className="m-field">
                <label>Employee ID</label>
                <input 
                    type="text" 
                    value={form.employee_id} 
                    onChange={update("employee_id")} 
                    placeholder="EMP-001" 
                />
               </div>
              </div>
              <div className="m-row">
                <div className="m-field">
                  <label>Full Name</label>
                  <input type="text" value={form.name} onChange={update("name")} placeholder="Jane Smith" />
                </div>
                <div className="m-field">
                  <label>Email</label>
                  <input type="email" value={form.email} onChange={update("email")} placeholder="jane@company.com" />
                </div>
              </div>

              <div className="m-row">
                <div className="m-field">
                  <label>Department</label>
                  <div className="m-select-wrap">
                    <select value={form.department} onChange={update("department")}>
                      <option value="">Select…</option>
                      {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
                <div className="m-field">
                  <label>Position</label>
                  <input type="text" value={form.position} onChange={update("position")} placeholder="Senior Engineer" />
                </div>
              </div>

              <div className="m-row">
                <div className="m-field">
                  <label>Status</label>
                  <div className="m-select-wrap">
                    <select value={form.status} onChange={update("status")}>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                <div className="m-field">
                  <label>Salary (USD)</label>
                  <input type="number" value={form.salary} onChange={update("salary")} placeholder="75000" min="0" />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="m-btn cancel" onClick={onClose}>Cancel</button>
              <button type="submit" className="m-btn save" disabled={loading}>
                {loading ? (isEdit ? "Saving…" : "Adding…") : (isEdit ? "Save Changes" : "Add Employee")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}