document.addEventListener('DOMContentLoaded', () => {
  const socket = io();

  const taskForm = document.getElementById('taskForm');
  const taskList = document.getElementById('taskList');
  const errorDiv = document.getElementById('errors');

  const escapeHtml = (text) =>
    text.replace(/[&<>"']/g, (match) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }[match]));

  const handleError = (message) => {
    errorDiv.innerHTML = `<p>${escapeHtml(message)}</p>`;
  };

  const createTaskElement = (task) => {
    const li = document.createElement('li');
    li.className = 'task-item';
    li.dataset.id = task.id;
    li.innerHTML = `
      <div class="task-info">
        <strong class="task-title">${escapeHtml(task.title)}</strong>
        <p class="task-desc">${escapeHtml(task.description || '')}</p>
      </div>
      <div class="task-meta">
        <em class="task-status">[${task.status}]</em>
        <button class="btn btn-toggle">Cambiar estado</button>
        <button class="btn btn-delete">Eliminar</button>
      </div>
    `;

    li.querySelector('.btn-toggle').addEventListener('click', () =>
      toggleStatus(task.id, task.status)
    );
    li.querySelector('.btn-delete').addEventListener('click', () =>
      deleteTask(task.id)
    );

    return li;
  };

  const renderTasks = (tasks) => {
    taskList.innerHTML = '';
    if (tasks.length === 0) {
      taskList.innerHTML = '<li>No hay tareas aún.</li>';
      return;
    }
    tasks.forEach(task => taskList.appendChild(createTaskElement(task)));
  };

  const fetchTasks = async () => {
    try {
      const res = await fetch('/tasks');
      if (!res.ok) throw new Error('Error al obtener tareas');
      const data = await res.json();
      renderTasks(data);
    } catch (error) {
      handleError(error.message);
    }
  };

  taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorDiv.innerHTML = '';

    const title = document.getElementById('title').value.trim();
    const description = document.getElementById('description').value.trim();

    if (!title) return handleError('El título es obligatorio.');
    if (title.length > 100) return handleError('El título no puede superar 100 caracteres.');
    if (description.length > 500) return handleError('La descripción no puede superar 500 caracteres.');

    try {
      const res = await fetch('/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        if (errorData.errors) {
          errorDiv.innerHTML = errorData.errors
            .map(err => `<p>${escapeHtml(err.msg)}</p>`)
            .join('');
        } else {
          handleError(errorData.message || 'Error desconocido al crear tarea.');
        }
        return;
      }

      taskForm.reset();
      socket.emit('newTask');
    } catch (error) {
      console.error('Error en POST /tasks:', error);
      handleError('Error de conexión con el servidor.');
    }
  });

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';
    try {
      const res = await fetch(`/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        console.error('Error al actualizar estado');
        return;
      }
      socket.emit('newTask');
    } catch (error) {
      console.error('Error en PUT /tasks/:id:', error);
    }
  };

  const deleteTask = async (id) => {
    try {
      const res = await fetch(`/tasks/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        console.error('Error al eliminar tarea');
        return;
      }
      socket.emit('newTask');
    } catch (error) {
      console.error('Error en DELETE /tasks/:id:', error);
    }
  };

  socket.on('tasksUpdated', renderTasks);
  socket.on('connect', () => {
    console.log('Conectado al servidor WebSocket');
    fetchTasks();
  });
});