import { motion } from 'framer-motion';
import { Users, Brain, AlertTriangle, TrendingUp } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import DashboardLayout from '@/components/DashboardLayout';
import { mockStudents, generateCognitiveLoadData } from '@/lib/mock-data';

const classLoadData = generateCognitiveLoadData(20).map((d, i) => ({
  ...d,
  timestamp: `Day ${i + 1}`,
}));

const engagementData = [
  { name: 'Low', value: 15, color: 'hsl(var(--cognitive-low))' },
  { name: 'Medium', value: 55, color: 'hsl(var(--cognitive-medium))' },
  { name: 'High', value: 30, color: 'hsl(var(--cognitive-high))' },
];

const courseEngagement = [
  { course: 'ML Intro', engagement: 85 },
  { course: 'DSA', engagement: 72 },
  { course: 'Web Dev', engagement: 91 },
  { course: 'Statistics', engagement: 65 },
];

const stats = [
  { label: 'Total Students', value: '127', icon: Users, color: 'text-primary' },
  { label: 'Avg Cognitive Load', value: '0.58', icon: Brain, color: 'text-warning' },
  { label: 'Struggling Students', value: '12', icon: AlertTriangle, color: 'text-destructive' },
  { label: 'Avg Engagement', value: '79%', icon: TrendingUp, color: 'text-success' },
];

export default function TeacherDashboard() {
  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-display font-bold mb-1">Teacher Dashboard</h1>
          <p className="text-muted-foreground mb-6">Monitor student performance and engagement</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-card rounded-xl shadow-card p-4"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-5 mb-6">
          {/* Cognitive Load Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-xl shadow-card p-5"
          >
            <h3 className="text-sm font-semibold mb-4">Class Cognitive Load Trend</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={classLoadData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="timestamp" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis domain={[0, 1]} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                <Line type="monotone" dataKey="loadScore" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Engagement by Course */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card rounded-xl shadow-card p-5"
          >
            <h3 className="text-sm font-semibold mb-4">Engagement by Course</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={courseEngagement}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="course" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="engagement" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Load Distribution Pie + Student Table */}
        <div className="grid lg:grid-cols-3 gap-5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card rounded-xl shadow-card p-5"
          >
            <h3 className="text-sm font-semibold mb-4">Load Distribution</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={engagementData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={4}>
                  {engagementData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 text-xs">
              {engagementData.map((e) => (
                <span key={e.name} className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: e.color }} />
                  {e.name} ({e.value}%)
                </span>
              ))}
            </div>
          </motion.div>

          {/* Student List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-2 bg-card rounded-xl shadow-card p-5"
          >
            <h3 className="text-sm font-semibold mb-4">Students Overview</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="text-left py-2 font-medium">Student</th>
                    <th className="text-left py-2 font-medium">Avg Load</th>
                    <th className="text-left py-2 font-medium">Engagement</th>
                    <th className="text-left py-2 font-medium">Status</th>
                    <th className="text-left py-2 font-medium">Last Active</th>
                  </tr>
                </thead>
                <tbody>
                  {mockStudents.map((s) => (
                    <tr key={s.id} className="border-b last:border-0">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-xs font-semibold">
                            {s.name[0]}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{s.name}</p>
                            <p className="text-xs text-muted-foreground">{s.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            s.avgLoad > 0.7
                              ? 'bg-destructive/10 text-destructive'
                              : s.avgLoad > 0.4
                              ? 'bg-warning/10 text-warning'
                              : 'bg-success/10 text-success'
                          }`}
                        >
                          {s.avgLoad.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-muted rounded-full h-1.5">
                            <div className="bg-primary h-full rounded-full" style={{ width: `${s.engagement}%` }} />
                          </div>
                          <span className="text-xs">{s.engagement}%</span>
                        </div>
                      </td>
                      <td className="py-3">
                        {s.avgLoad > 0.7 ? (
                          <span className="flex items-center gap-1 text-xs text-destructive font-medium">
                            <AlertTriangle className="w-3.5 h-3.5" /> Struggling
                          </span>
                        ) : (
                          <span className="text-xs text-success font-medium">On Track</span>
                        )}
                      </td>
                      <td className="py-3 text-xs text-muted-foreground">{s.lastActive}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
