'use client'
// import styling files
import "./dashboard.scss";

// import hooks
import { useAuth } from "@/hooks/useAuth"; 

// import components
import Header from "@/components/header";

// import functions
import { useEffect, useState } from "react";
import { createTaskRequest, DeleteTasksRequest, UpdateTask } from "@/functions/api";

// types
type Task = {id: number, title: string, done: boolean}


export default function Dashboard() {
  let {user, tasks, setTasks, accessToken} = useAuth()
  let [isCreateTask, setIsCreateTask] = useState<boolean>(false)
  let [isDeleteTask, setIsDeleteTask] = useState<boolean>(false)
  let [taskTitle, setTaskTitle] = useState<string>("")
  let [disableCreate, setDisableCreate] = useState<boolean>(true)
  let [tasksToDelete, setTasksToDelete] = useState<number[]>([])
  




  async function handleClickOnTask(taskId: number, taskDone: boolean) {
    let data = await UpdateTask(accessToken, {"task_id": taskId, "done": taskDone})
    setTasks(data)
  }

  async function toggleToDelete(taskId: number) {
    let tasksToDeleteClone = [...tasksToDelete]
    if (tasksToDeleteClone.includes(taskId)) {
      tasksToDeleteClone.splice(tasksToDeleteClone.indexOf(taskId), 1)
    } else {
      tasksToDeleteClone.push(taskId)
    }

    setTasksToDelete([...tasksToDeleteClone])

  }

  async function createTask() {
    let data = await createTaskRequest(accessToken, taskTitle)
    setTasks(data)
    setIsCreateTask(false)
    setTaskTitle("")
  }

  async function deleteTask() {
    if (tasksToDelete.length > 0) {
      let data = await DeleteTasksRequest(accessToken, tasksToDelete)
      setTasks(data)
      setTasksToDelete([])

    }
    setIsDeleteTask(false)
  }

  function cancelTask() {
    if (isCreateTask) {
      setTaskTitle("")
      setIsCreateTask(false)
    } else if (isDeleteTask) {
      setTasksToDelete([])
      setIsDeleteTask(false)
    }
  }

  useEffect(() => {
    if (taskTitle.length === 0) {
      setDisableCreate(true)
    } else {
      setDisableCreate(false)
    }
  }, [taskTitle])


  return (
    <div className="dashboard">
      <Header pageName="dashboard" />
      <div className="dashboard-container">
        <div className="container">
          <div className="box">

            <div className={isCreateTask || isDeleteTask ? "tasks-section hide" : "tasks-section"}>
              <h2>{user["username"]} Tasks</h2>
              <ul className="tasks">
                {tasks.length > 0 && tasks.map((task: Task) => (
                  <li key={task["id"]} className={task["done"] ? "task disable" : "task"} onClick={() => handleClickOnTask(task["id"], task["done"])}  >{task["title"]}</li>
                ))}
                <li className={tasks.length > 0 ? "task empty hide" : "task empty"}>There is no tasks</li>
              </ul>
              <div className="controls-container">
                <span className="main-button" onClick={() => setIsCreateTask(true)}>Make Task</span>
                <span className="main-button" onClick={() => setIsDeleteTask(true)}>Delete Task</span>
              </div>
            </div>

            <div className={isDeleteTask ? "delete-task-section" : "delete-task-section hide"}>
              <h2>Delete task</h2>
              <ul className="tasks">
                {tasks.length > 0 && tasks.map((task: Task) => (
                  <li key={task["id"]} className={tasksToDelete.includes(task["id"]) ? "task selected" : "task"} onClick={() => toggleToDelete(task["id"])}  >{task["title"]}</li>
                ))}
                <li className={tasks.length > 0 ? "task empty hide" : "task empty"}>There is no tasks</li>
              </ul>
              <div className="controls-container">
                <span className={tasksToDelete.length > 0 ? "main-button bad delete" : "main-button bad delete disable"} onClick={deleteTask}>Delete</span>
                <span className="main-button cancel" onClick={cancelTask}>Cancel</span>
              </div>
            </div>

            <div className={isCreateTask ? "create-task-section" : "create-task-section hide"}>
              <h2>Create task</h2>
              <input type="text" placeholder="Task title" value={taskTitle} className="main-input" onChange={(e) => setTaskTitle(e.currentTarget.value)} />
              <div className="controls-container">
                <span className={disableCreate ? "main-button create disable" : "main-button create"} onClick={createTask}>Create</span>
                <span className="main-button bad cancel" onClick={cancelTask}>Cancel</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
