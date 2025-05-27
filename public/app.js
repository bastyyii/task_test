const socket = io();

const taskForm = document.getElementById('taskForm');
const taskList = document.getElementById('taskList');

function renderTasks(tasks) {
  taskList.innerHTML = '';
  tasks.forEach((task) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <strong>${task.titulo}</strong> - ${task.descripcion || ''} 
      <em>[${task.status}]</em>
      <button onclick="toggleStatus(${task.id}, '${task.status}')">Cambiar estado</button>
      <button onclick="deleteTask(${task.id})">Eliminar</button>
    `;
    taskList.appendChild(li);
  });
}

async function fetchTasks() {
  const res = await fetch('/tasks');
  const data = await res.json();
  renderTasks(data);
}

taskForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const titulo = document.getElementById('titulo').value;
  const descripcion = document.getElementById('descripcion').value;
  await fetch('/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ titulo, descripcion }),
  });
  taskForm.reset();
  socket.emit('newTask');
});

async function toggleStatus(id, currentStatus) {
  const newStatus = currentStatus === 'pendiente' ? 'completada' : 'pendiente';
  await fetch(`/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: newStatus }),
  });
  socket.emit('newTask');
}

async function deleteTask(id) {
  await fetch(`/tasks/${id}`, { method: 'DELETE' });
  socket.emit('newTask');
}

socket.on('connect', () => {
  console.log('Conectado al servidor WebSocket');
  fetchTasks();
});

socket.on('tasksUpdated', (tasks) => {
  renderTasks(tasks);
});