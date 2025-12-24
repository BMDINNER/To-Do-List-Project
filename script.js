let todo = JSON.parse(localStorage.getItem("js-todo-main"))|| [];
const todoInput = document.getElementById("todoInput");
const todoList = document.getElementById("listed-task");
const todoCount = document.getElementById("todo-count");
const addButton = document.querySelector(".js-add-button");
const deleteButton = document.getElementById("deleteButton");


document.addEventListener("DOMContentLoaded",()=>{
  addButton.addEventListener("click",addTask);
  todoInput.addEventListener("keydown",(event)=>{
    if(event.key === "Enter"){
      event.preventDefault();
      addTask();
    }
  });
  deleteButton.addEventListener("click",deleteAllTasks);
  displayTasks();
});


async function addTask() {
  const newTask = todoInput.value.trim();
  if (newTask !== "") {
    await fetch("http://localhost:3000/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: newTask, disabled: false })
    });
    todoInput.value = "";
    displayTasks();
  }
} 


async function displayTasks() {
  const res = await fetch("http://localhost:3000/todos");
  const data = await res.json();
  todo = data;

  todoList.innerHTML = "";

  todo.forEach((item) => {
    const container = document.createElement("div");
    container.classList.add("todo-container");

    container.innerHTML = `
      <input 
        type="checkbox" 
        class="todo-checkbox" 
        id="input-${item.id}" 
        ${item.disabled ? "checked" : ""}>
      
      <p 
        id="todo-${item.id}" 
        class="task-text ${item.disabled ? "disabled" : ""}" 
        onclick="editTask(${item.id})">
        ${item.text}
      </p>
    `;

    container.querySelector(".todo-checkbox").addEventListener("change", () =>
      toggleTask(item.id)
    );

    todoList.appendChild(container);
  });

  todoCount.textContent = todo.length;
}




function editTask(id) {
  const todoItem = document.getElementById(`todo-${id}`);
  const taskTextElement = todoItem;  

  const currentText = taskTextElement.textContent;
  const inputElement = document.createElement("input");
  inputElement.value = currentText;
  inputElement.classList.add("task-edit-input");

  
  taskTextElement.replaceWith(inputElement);
  inputElement.focus();

  
  inputElement.addEventListener("blur", async function () {
    const updatedText = inputElement.value.trim();
    if (updatedText && updatedText !== currentText) {
      await fetch(`http://localhost:3000/todos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: updatedText })
      });
    }
    displayTasks();
  });
}






async function toggleTask(id) {
  const task = todo.find(item => item.id === id);
  await fetch(`http://localhost:3000/todos/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ disabled: !task.disabled })
  });
  displayTasks();
}

async function deleteAllTasks() {
  const res = await fetch("http://localhost:3000/todos");
  const data = await res.json();

  await Promise.all(
    data.map(task =>
      fetch(`http://localhost:3000/todos/${task.id}`, {
        method: "DELETE"
      })
    )
  );
  displayTasks();
}



