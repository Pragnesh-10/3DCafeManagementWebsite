import React from "react";
import { Card } from "../components/Card";
import { Users, Calendar, Clock, Target } from "lucide-react";
import { useCafeStore } from "../utils/store";
import { toast } from "sonner";

export function Employees() {
  const { employees, toggleEmployeeShift } = useCafeStore();

  // Dynamic calculations based on store values
  const totalEmployees = employees.length;
  const onShiftCount = employees.filter(e => e.status === "On shift").length;
  const upcomingCount = employees.filter(e => e.status === "Upcoming").length;
  const averageScore = employees.length > 0 
    ? Math.round(employees.reduce((acc, curr) => acc + curr.score, 0) / employees.length) 
    : 0;

  const STATS = [
    { label: "On the rota", value: totalEmployees.toString(), icon: Users },
    { label: "On shift now", value: onShiftCount.toString(), icon: Clock },
    { label: "Upcoming shifts", value: upcomingCount.toString(), icon: Calendar },
    { label: "Avg. service score", value: `${averageScore}%`, icon: Target },
  ];

  const handleToggleShift = (name: string) => {
    navigator.vibrate?.(22);
    toggleEmployeeShift(name);
    const updatedEmployee = employees.find(e => e.name === name);
    const nextStatus = updatedEmployee?.status === "On shift" ? "Off shift" : "On shift";
    toast.success(`${name} shift updated to ${nextStatus}!`, {
      description: "Roster updates saved dynamically in database."
    });
  };

  return (
    <div className="space-y-7">
      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-bark-soft">People</p>
        <h1 className="text-3xl mt-1 text-espresso">The team</h1>
        <p className="text-bark mt-1.5">Who's on, who's next, and how the floor is running.</p>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {STATS.map((stat) => (
          <Card key={stat.label} className="flex items-center gap-4">
            <div className="p-2.5 rounded-lg bg-sand text-clay"><stat.icon size={19} /></div>
            <div>
              <p className="text-bark text-sm">{stat.label}</p>
              <h3 className="text-2xl font-mono text-espresso mt-0.5">{stat.value}</h3>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="p-5 border-b border-line">
          <h3 className="text-lg text-espresso">Today's roster</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-line">
                {["Member", "Role", "Shift", "Status", "Service score"].map((h, i) => (
                  <th key={h} className={`px-5 py-3 text-xs uppercase tracking-wider text-bark-soft font-medium ${i === 4 ? "text-right" : ""}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.name} className="border-b border-line/60 last:border-0 hover:bg-sand/40 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-espresso text-cream flex items-center justify-center text-sm">{emp.name.charAt(0)}</span>
                      <span className="text-sm text-espresso">{emp.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-bark">{emp.role}</td>
                  <td className="px-5 py-4 text-sm font-mono text-bark">{emp.shift}</td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => handleToggleShift(emp.name)}
                      className="cursor-pointer text-left bg-transparent border-0 p-0"
                    >
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium transition-colors ${emp.status === "On shift" ? "bg-sage/12 text-sage" : "bg-honey/15 text-honey"}`}>
                        {emp.status}
                      </span>
                    </button>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2.5">
                      <div className="w-24 h-1.5 bg-sand rounded-full overflow-hidden">
                        <div className="h-full bg-clay rounded-full" style={{ width: `${emp.score}%` }} />
                      </div>
                      <span className="text-sm font-mono text-espresso w-9 text-right">{emp.score}%</span>
                    </div>
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
