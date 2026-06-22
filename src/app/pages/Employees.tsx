import React from "react";
import { Card } from "../components/Card";
import { Users, Calendar, Clock, Target, CheckCircle2, AlertCircle } from "lucide-react";
import { useCafeStore } from "../utils/store";
import { toast } from "sonner";

export function Employees() {
  const { employees, toggleEmployeeShift } = useCafeStore();

  // Dynamic calculations
  const totalEmployees = employees.length;
  const onShiftCount = employees.filter((e) => e.status === "On shift").length;
  const upcomingCount = employees.filter((e) => e.status === "Upcoming").length;
  const averageScore = Math.round(
    employees.reduce((acc, e) => acc + e.score, 0) / totalEmployees
  );

  const stats = [
    { label: "On the rota", value: totalEmployees.toString(), icon: Users, color: "text-clay bg-clay/10" },
    { label: "On shift now", value: onShiftCount.toString(), icon: Clock, color: "text-sage bg-sage/12" },
    { label: "Upcoming shifts", value: upcomingCount.toString(), icon: Calendar, color: "text-honey bg-honey/15" },
    { label: "Avg. service score", value: `${averageScore}%`, icon: Target, color: "text-espresso bg-sand" },
  ];

  const handleToggleShift = (name: string, currentStatus: string) => {
    toggleEmployeeShift(name);
    const nextStatus = currentStatus === "On shift" ? "Off shift" : "On shift";
    toast.success(`${name} is now ${nextStatus === "On shift" ? "ON SHIFT (Clocked In)" : "OFF SHIFT (Clocked Out)"}.`);
  };

  return (
    <div className="space-y-7 font-sans">
      <header className="flex justify-between items-end">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-bark-soft font-semibold">Staff Management</p>
          <h1 className="text-3xl mt-1 text-espresso font-display font-medium">The Team</h1>
          <p className="text-bark mt-1.5">Clock employees in/out, view roster schedules, and monitor floor performance scores.</p>
        </div>
        <div className="text-xs bg-paper border border-line px-3.5 py-1.5 rounded-full text-bark font-medium flex items-center gap-1.5 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-sage animate-pulse" />
          {onShiftCount} active baristas
        </div>
      </header>

      {/* Rota Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat) => (
          <Card key={stat.label} className="flex items-center gap-4 border-line rounded-2xl shadow-sm">
            <div className={`p-2.5 rounded-xl ${stat.color}`}>
              <stat.icon size={19} />
            </div>
            <div>
              <p className="text-bark text-xs font-semibold uppercase tracking-wider">{stat.label}</p>
              <h3 className="text-2xl font-mono text-espresso mt-1 font-bold">{stat.value}</h3>
            </div>
          </Card>
        ))}
      </div>

      {/* Roster Table */}
      <Card className="p-0 overflow-hidden rounded-[2rem] border-line shadow-lg bg-paper">
        <div className="p-5 border-b border-line">
          <h3 className="text-lg text-espresso font-semibold">Today's Roster</h3>
          <p className="text-xs text-bark-soft mt-0.5">Toggle active shifts to update service availability at checkout</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-line text-xs uppercase tracking-wider text-bark-soft font-semibold bg-sand/15">
                <th className="px-6 py-4 font-semibold">Member</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Shift Hours</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Service Score</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/40">
              {employees.map((emp) => (
                <tr key={emp.name} className="hover:bg-sand/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="w-9 h-9 rounded-full bg-espresso text-cream flex items-center justify-center text-sm font-bold shadow-xs">
                        {emp.name.charAt(0)}
                      </span>
                      <span className="text-sm font-semibold text-espresso">{emp.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-bark font-medium">{emp.role}</td>
                  <td className="px-6 py-4 text-sm font-mono text-bark">{emp.shift}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "inline-flex px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border",
                      emp.status === "On shift" 
                        ? "bg-sage/12 text-sage border-sage/15" 
                        : "bg-honey/15 text-honey border-honey/20"
                    )}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-24 h-1.5 bg-sand rounded-full overflow-hidden border border-line/30">
                        <div 
                          className={cn(
                            "h-full rounded-full transition-all",
                            emp.score >= 95 ? "bg-sage" : emp.score >= 90 ? "bg-clay" : "bg-honey"
                          )} 
                          style={{ width: `${emp.score}%` }} 
                        />
                      </div>
                      <span className="text-xs font-mono text-espresso w-9 font-bold text-right">{emp.score}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleToggleShift(emp.name, emp.status)}
                      className={cn(
                        "text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all cursor-pointer focus:outline-none",
                        emp.status === "On shift" 
                          ? "bg-destructive/5 hover:bg-destructive/10 text-destructive border-destructive/20" 
                          : "bg-sage/5 hover:bg-sage/10 text-sage border-sage/20"
                      )}
                    >
                      {emp.status === "On shift" ? "Clock out" : "Clock in"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
