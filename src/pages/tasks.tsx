import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check, Trash2, ListTodo, LogOut, Loader2,
  ChevronLeft, ChevronRight, Plus, RepeatIcon, CalendarDays, CheckCircle2
} from "lucide-react";
import { format, addDays, subDays, isToday } from "date-fns";
import { ru } from "date-fns/locale";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTasks, isTaskCompletedForDate, type FirestoreTask } from "@/hooks/use-tasks";
import { AddTaskDialog } from "@/components/AddTaskDialog";
import { cn } from "@/lib/utils";
import { type TaskType } from "@/lib/firebase";

const WEEKDAY_SHORT: Record<number, string> = {
  0: "Вс", 1: "Пн", 2: "Вт", 3: "Ср", 4: "Чт", 5: "Пт", 6: "Сб",
};

function taskTypeBadge(task: FirestoreTask) {
  if (task.taskType === "regular") return null;
  if (task.taskType === "recurring") {
    const days = [...task.recurringDays]
      .sort((a, b) => [1, 2, 3, 4, 5, 6, 0].indexOf(a) - [1, 2, 3, 4, 5, 6, 0].indexOf(b))
      .map((d) => WEEKDAY_SHORT[d])
      .join(", ");
    return (
      <span className="inline-flex items-center gap-1 text-[11px] text-purple-400/60 font-medium mt-1">
        <RepeatIcon className="w-3 h-3" /> {days}
      </span>
    );
  }
  if (task.taskType === "dated" && task.dueDate) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] text-purple-400/60 font-medium mt-1">
        <CalendarDays className="w-3 h-3" />
        {format(new Date(task.dueDate + "T00:00:00"), "d MMM", { locale: ru })}
      </span>
    );
  }
  return null;
}

export default function Tasks() {
  const { user, logout } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const { tasks, addTask, toggleTask, deleteTask, isLoading, selectedDateStr } =
    useTasks(selectedDate);

  const handleAdd = async (title: string, taskType: TaskType, dueDate: string | null, recurringDays: number[]) => {
    setDialogOpen(false);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
    await addTask(title, taskType, dueDate, recurringDays);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <Loader2 className="h-8 w-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  const completedCount = tasks.filter((t) => isTaskCompletedForDate(t, selectedDateStr)).length;
  const progress = tasks.length === 0 ? 0 : (completedCount / tasks.length) * 100;

  const avatarUrl = user?.photoURL || `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(user?.email || "angel")}&backgroundColor=transparent`;

  return (
    <div className="min-h-screen bg-[#050505] pb-24 relative overflow-x-hidden">
      
      {/* 2. НЕОНОВАЯ ЛИНИЯ ПРОГРЕССА (ПОД ХЕДЕРОМ) */}
      <div className="fixed top-16 left-0 w-full h-[2px] z-[60] bg-white/5">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="h-full bg-purple-500 shadow-[0_0_12px_#a855f7,0_0_20px_#a855f7]"
          transition={{ type: "spring", stiffness: 50, damping: 20 }}
        />
      </div>

      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 80, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-0 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-sm"
          >
            <div className="bg-[#1a1a2e]/80 backdrop-blur-xl border border-purple-500/50 shadow-[0_0_25px_rgba(168,85,247,0.4)] px-6 py-4 rounded-2xl flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-purple-500" />
              <span className="text-white font-medium">Задача в списке!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="sticky top-0 z-50 bg-[#050505]/60 backdrop-blur-md border-b border-white/5 px-4">
        <div className="max-w-4xl mx-auto h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.5)]">
               <div className="w-3 h-3 bg-white rounded-sm rotate-45 animate-pulse" />
            </div>
            <h1 className="font-bold text-xl text-white tracking-tight">Angel</h1>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <img src={avatarUrl} alt="Avatar" className="w-9 h-9 rounded-full border border-purple-500/30 p-0.5 bg-purple-500/10" />
            <button onClick={logout} className="p-2 text-white/40 hover:text-red-500 transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 mt-10">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <button onClick={() => setSelectedDate((d) => subDays(d, 1))} className="p-1 text-purple-400 hover:bg-purple-500/10 rounded-full transition-colors"><ChevronLeft className="w-5 h-5" /></button>
              <h2 className="text-3xl font-black text-white capitalize tracking-tighter italic">
                {isToday(selectedDate) ? "СЕГОДНЯ" : format(selectedDate, "d MMMM", { locale: ru })}
              </h2>
              <button onClick={() => setSelectedDate((d) => addDays(d, 1))} className="p-1 text-purple-400 hover:bg-purple-500/10 rounded-full transition-colors"><ChevronRight className="w-5 h-5" /></button>
            </div>
            <p className="text-purple-400/50 text-xs font-bold uppercase tracking-widest ml-1">{tasks.length} ПЛАНОВ В РАБОТЕ</p>
          </div>
          <div className="text-right hidden sm:block">
            <span className="text-2xl font-black text-purple-500 leading-none">{Math.round(progress)}%</span>
          </div>
        </div>

        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {tasks.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-24 text-center border border-dashed border-white/10 rounded-[2rem] bg-white/[0.02]">
                <ListTodo className="w-12 h-12 text-white/10 mx-auto mb-4" />
                <p className="text-white/30 font-medium">Свободное время — это редкость</p>
              </motion.div>
            ) : (
              tasks.map((task) => {
                const completed = isTaskCompletedForDate(task, selectedDateStr);
                return (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={cn(
                      "group flex items-center gap-4 p-5 rounded-[1.5rem] border transition-all duration-500",
                      // 1. ЭФФЕКТ СТЕКЛА (GLASSMORPISM)
                      completed 
                        ? "bg-white/[0.02] border-transparent opacity-40 scale-[0.98]" 
                        : "bg-white/[0.03] backdrop-blur-md border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:border-purple-500/40 hover:bg-white/[0.05]"
                    )}
                  >
                    <button 
                      onClick={() => toggleTask(task.id)} 
                      className={cn(
                        "w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all duration-300", 
                        completed 
                          ? "bg-purple-600 border-purple-600 shadow-[0_0_15px_#a855f7]" 
                          : "border-white/20 group-hover:border-purple-500/50"
                      )}
                    >
                      {completed && <Check className="w-4 h-4 text-white" strokeWidth={4} />}
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-lg transition-all duration-500 truncate tracking-tight", 
                        completed ? "text-white/30 line-through" : "text-white/90 font-semibold"
                      )}>
                        {task.title}
                      </p>
                      {taskTypeBadge(task)}
                    </div>

                    <button 
                      onClick={() => deleteTask(task.id)} 
                      className="p-2 text-white/10 hover:text-red-500/80 hover:bg-red-500/10 rounded-xl transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </main>

      <button
        onClick={() => setDialogOpen(true)}
        className="fixed bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-purple-600 hover:bg-purple-500 text-white px-8 py-5 rounded-[2rem] font-black uppercase tracking-tighter shadow-[0_15px_40px_rgba(168,85,247,0.4)] transition-all z-[70] active:scale-90 hover:scale-105"
      >
        <Plus className="w-6 h-6 stroke-[3]" />
        <span>Создать</span>
      </button>

      <AddTaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        defaultDate={selectedDate}
        onAdd={handleAdd}
      />
    </div>
  );
}
