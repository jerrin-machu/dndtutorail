import { useState, useMemo } from "react";
import PlusIcon from "../icons/PlusIcon";
import { Column, Id, Task } from "../types";
import ColumnContainer from "./ColumnContainer";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, SortableContext } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import TaskCard from "./TaskCard";

export default function KanBoard() {
  const [columns, setColumns] = useState<Column[]>([]);
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  );

  const columnsId = useMemo(
    () => columns.map((column) => column.id),
    [columns]
  );

  function createNewColumn() {
    const columnToAdd: Column = {
      id: generateId(),
      title: `Column ${columns.length + 1}`,
    };
    setColumns([...columns, columnToAdd]);
  }

  function deleteColumn(id: Id) {
    setColumns(columns.filter((column) => column.id !== id));
    const newTasks = tasks.filter((task) => task.columnId !== id);
    setTasks(newTasks);
  }

  function generateId() {
    // Generate a random number between 0 and 10000
    return Math.floor(Math.random() * 10001);
  }
  function onDragStart(event: DragStartEvent) {
    console.log("DRAG START", event);
    if (event?.active?.data?.current?.type === "Column") {
      setActiveColumn(event?.active?.data?.current?.column);
      return;
    }
    if (event?.active?.data?.current?.type === "Task") {
      setActiveTask(event?.active?.data?.current?.task);
      return;
    }
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveColumn(null);
    setActiveTask(null);
    const { active, over } = event;
    if (!over) {
      return;
    }
    const activeColumnId = active?.id;
    const overColumnId = over?.id;

    if (activeColumnId === overColumnId) {
      return;
    }

    const activeColumnIndex = columns.findIndex(
      (col) => col.id === activeColumnId
    );

    const overColumnIndex = columns.findIndex((col) => col.id === overColumnId);

    const modified_arry = arrayMove(
      columns,
      activeColumnIndex,
      overColumnIndex
    );
    console.log(modified_arry);
    setColumns(modified_arry);
  }

  function updateColumn(id: Id, title: string) {
    const updatedColumns = columns.map((col) => {
      if (col.id === id) {
        return { ...col, title };
      }
      return col;
    });
    setColumns(updatedColumns);
  }

  function createTask(columnId: Id) {
    const newTask: Task = {
      id: generateId(),
      columnId,
      content: `Task ${tasks.length + 1}`,
    };
    setTasks([...tasks, newTask]);
  }

  function deleteTask(id: Id) {
    setTasks(tasks.filter((task) => task.id !== id));
  }

  function updateTask(id: Id, content: string) {
    const updatedTasks = tasks.map((task) => {
      if (task.id === id) {
        return { ...task, content };
      }
      return task;
    });
    setTasks(updatedTasks);
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) {
      return;
    }
    const activeId = active?.id;
    const overId = over?.id;

    if (activeId === overId) {
      return;
    }

    if (!activeTask) {
      return;
    }
    // I am dropping a task over another task
    const isActiveTask = active?.data?.current?.type === "Task";
    const isOverTask = over?.data?.current?.type === "Task";
    if (isActiveTask && isOverTask) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((task) => task.id === activeId);
        const overIndex = tasks.findIndex((task) => task.id === overId);

        // if(tasks[activeIndex].columnId !== tasks[overIndex].columnId){
        tasks[activeIndex].columnId = tasks[overIndex].columnId;
        // }
        return arrayMove(tasks, activeIndex, overIndex);
      });
    }

    // I am dropping a task over a column

    const isOverAcolumn = over?.data?.current?.type === "Column";

    if (isActiveTask && isOverAcolumn) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((task) => task.id === activeId);

        // if(tasks[activeIndex].columnId !== tasks[overIndex].columnId){
        tasks[activeIndex].columnId = overId;
        // }
        return arrayMove(tasks, activeIndex, activeIndex);
      });
    }
  }
  return (
    <div className="m-auto flex min-h-screen w-full items-center  overflow-x:auto overflow-y:hidden px-[40px]">
      <DndContext
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        sensors={sensors}
        onDragOver={onDragOver}
      >
        <div className="m-auto flex gap-4">
          <div className="flex gap-4">
            <SortableContext items={columnsId}>
              {columns.map((column) => (
                <ColumnContainer
                  key={column.id}
                  column={column}
                  deleteColumn={deleteColumn}
                  updateColumn={updateColumn}
                  createTask={createTask}
                  tasks={tasks?.filter((task) => task.columnId === column.id)}
                  deleteTask={deleteTask}
                  updateTask={updateTask}
                />
              ))}
            </SortableContext>
          </div>
          <button
            onClick={() => createNewColumn()}
            className="h-[60px] w-[350px] min-w-[350px] cursor-pointer rounded-lg bg-mainBackgroundColor border-columnBackgroundColor ring-rose-400 hover:ring-2 flex gap-2 justify-center items-center"
          >
            {" "}
            <PlusIcon /> Add new Column
          </button>
        </div>

        {createPortal(
          <DragOverlay>
            {activeColumn && (
              <ColumnContainer
                column={activeColumn}
                deleteColumn={deleteColumn}
                updateColumn={updateColumn}
                createTask={createTask}
                tasks={tasks?.filter(
                  (task) => task.columnId === activeColumn.id
                )}
                deleteTask={deleteTask}
                updateTask={updateTask}
              />
            )}

            {activeTask && (
              <TaskCard
                task={activeTask}
                deleteTask={deleteTask}
                updateTask={updateTask}
              />
            )}
          </DragOverlay>,
          document.body
        )}
      </DndContext>
    </div>
  );
}
