export const AddTaskDialog = ({ open, onOpenChange }: any) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#1a1a2e] border border-purple-500/30 p-6 rounded-3xl w-full max-w-sm">
        <h2 className="text-white text-xl font-bold mb-4">Новая задача</h2>
        <button 
          onClick={() => onOpenChange(false)} 
          className="bg-purple-600 text-white px-4 py-2 rounded-xl w-full"
        >
          Закрыть
        </button>
      </div>
    </div>
  );
};
