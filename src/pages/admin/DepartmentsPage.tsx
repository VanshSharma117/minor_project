import React, { useEffect, useState } from 'react';
import { Building, Users, GraduationCap } from 'lucide-react';
import { api } from '../../services/api';
import { Department } from '../../types';

export const DepartmentsPage: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDepts() {
      try {
        const data = await api.getDepartments();
        setDepartments(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadDepts();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Academic Departments</h1>
        <p className="text-xs text-slate-500 mt-1">
          Engineering branches and academic faculties active in EduPilot AI mentoring system.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {departments.map(dept => (
          <div key={dept.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
            <span className="text-xs font-black text-[#7A1528] bg-rose-50 px-2 py-0.5 rounded">
              {dept.code}
            </span>
            <h3 className="font-bold text-base text-slate-900 mt-3">{dept.name}</h3>
            <p className="text-xs text-slate-500 mt-1">Head of Department: <strong>{dept.headOfDepartment}</strong></p>

            <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-400 block font-semibold">Faculty Advisors</span>
                <span className="text-lg font-bold text-slate-900">{dept.totalFaculty}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-400 block font-semibold">Enrolled Students</span>
                <span className="text-lg font-bold text-slate-900">{dept.totalStudents}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
