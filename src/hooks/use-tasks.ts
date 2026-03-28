import { useState } from "react";

export const useTasks = (date: Date) => {
  const [tasks] = useState([]);
  return { 
    tasks, 
    addTask: async () => {}, 
    toggleTask: async () => {}, 
    deleteTask: async () => {}, 
    isLoading: false, 
    selectedDateStr: date.toISOString().split('T')[0] 
  };
};

export const isTaskCompletedForDate = (task: any, dateStr: string) => false;
export type FirestoreTask = any;
