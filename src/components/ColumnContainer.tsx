import { SortableContext, useSortable } from "@dnd-kit/sortable";
import DeleteIcon from "../icons/DeleteIcon";
import { Column, Id } from "../types";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import PlusIcon from "../icons/PlusIcon";
import { Task } from "../types";
import TaskCard from "./TaskCard";

interface ColumnContainerProps {
  column: Column;
  deleteColumn: (id: Id) => void;
  updateColumn: (id: Id, title: string) => void;
  createTask: (id: Id) => void;
  tasks: Task[];
  deleteTask: (id:Id)=> void
  updateTask:(id:Id, content: string) => void;
}

function ColumnContainer(props: ColumnContainerProps) {
  const { column, deleteColumn, updateColumn, createTask, tasks,deleteTask,updateTask } = props;
  const [editMode, setEditMode] = useState(false);
  const {
    setNodeRef,
    listeners,
    attributes,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: "Column",
      column,
    },
    disabled: editMode,
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="bg-columnBackgroundColor w-[350px] h-[500px] max-h[500px]rounded-md flex flex-col border-2 border-rose-500 opacity-60"
      >
        {" "}
      </div>
    );
  }



  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-columnBackgroundColor w-[350px] h-[500px] max-h[500px]rounded-md flex flex-col"
    >
      {/* Column Title */}
      <div className=" flex gap-2">
        <div className="flex justify-center items-center bg-columnBackgroundColor px-2 py-1 text-sm rounded-full">
          0
        </div>
        {!editMode && column.title}
        {editMode && (
          <input
            className="bg-black focus:border-rose-500 border rounded outline-none px-2"
            autoFocus
            onBlur={() => setEditMode(false)}
            onKeyDown={(e) => {
              if (e.key !== "Enter") return;
              setEditMode(false);
            }}
            onChange={(e) => updateColumn(column.id, e.target.value)}
          />
        )}

        <div
          {...attributes}
          {...listeners}
          onClick={() => setEditMode(true)}
          className="bg-mainBackgroundColor text-md cursor-grab rounded-md rounded-b-none p-3 font-bold border-columnBackgroundColor border-4 "
        >
          {column.title}
        </div>
        <button
          onClick={() => deleteColumn(column.id)}
          className="stroke-gray-500 hover:stroke-white hover:bg-columnBackgroundColor px-1 py-1"
        >
          <DeleteIcon />
        </button>
      </div>
      {/* Column Task Container */}
      <div className="flex flex-grow flex-col gap-4 p-2 overflow-x-hidden overflow-y-auto">
        {" "}
        <SortableContext items={tasks?.map((task)=> task.id)}>
        {tasks?.map((task) => (

          <TaskCard key={task.id} task = {task} deleteTask={deleteTask} updateTask={updateTask}/>
        ))}
        </SortableContext>
      </div>

      {/* Colum Footer */}
      <button
        onClick={() => createTask(column.id)}
        className="flex gap-2 items-center border-columnBackgroundColor border-2 rounded-md p-4 border-x-columnBackgroundColor hover: bg-mainBackgroundColor active:bg-black"
      >
        {" "}
        <PlusIcon /> Add Task
      </button>
    </div>
  );
}

export default ColumnContainer;
