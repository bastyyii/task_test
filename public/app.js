document.addEventListener('DOMContentLoaded', () => {
  const socket = io();

  const taskForm = document.getElementById('taskForm');
  const taskList = document.getElementById('taskList');
  const errorDiv = document.getElementById('errors');

  function renderTasks(tasks) {
    taskList.innerHTML = '';
    if (tasks.length === 0) {
      taskList.innerHTML = '<li>No hay tareas aún.</li>';
      return;
    }
    tasks.forEach(task => {
  const li = document.createElement('li');
  li.classList.add('task-item');
  li.innerHTML = `
    <div class="task-info">
      <strong class="task-title">${escapeHtml(task.title)}</strong>
      <p class="task-desc">${escapeHtml(task.description || '')}</p>
    </div>
    <div class="task-meta">
      <em class="task-status">[${task.status}]</em>
      <button class="btn btn-toggle" onclick="toggleStatus(${task.id}, '${task.status}')">Cambiar estado</button>
      <button class="btn btn-delete" onclick="deleteTask(${task.id})">Eliminar</button>
    </div>
  `;
  taskList.appendChild(li);
});
  }

  function escapeHtml(text) {
    return text.replace(/[&<>"']/g, function(match) {
      const escape = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      };
      return escape[match];
    });
  }

  async function fetchTasks() {
    try {
      const res = await fetch('/tasks');
      if (!res.ok) throw new Error('Error al obtener tareas');
      const data = await res.json();
      renderTasks(data);
    } catch (error) {
      errorDiv.innerHTML = `<p>${error.message}</p>`;
    }
  }

  taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorDiv.innerHTML = '';

    const title = document.getElementById('title').value.trim();
    const description = document.getElementById('description').value.trim();
    console.log(title)
    if (!title) {
      errorDiv.innerHTML = '<p>El título es obligatorio.</p>';
      return;
    }
    if (title.length > 100) {
      errorDiv.innerHTML = '<p>El título no puede superar 100 caracteres.</p>';
      return;
    }
    if (description.length > 500) {
      errorDiv.innerHTML = '<p>La descripción no puede superar 500 caracteres.</p>';
      return;
    }

    try {
      const res = await fetch('/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        if (errorData.errors) {
          errorDiv.innerHTML = errorData.errors.map(err => `<p>${escapeHtml(err.msg)}</p>`).join('');
        } else if (errorData.message) {
          errorDiv.innerHTML = `<p>${escapeHtml(errorData.message)}</p>`;
        } else {
          errorDiv.innerHTML = '<p>Error desconocido al crear tarea.</p>';
        }
        return;
      }

      errorDiv.innerHTML = '';
      taskForm.reset();

      socket.emit('newTask');

    } catch (error) {
      errorDiv.innerHTML = `<p>Error de conexión con el servidor.</p>`;
      console.error('Error en fetch POST /tasks:', error);
    }
  });

  window.toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';
    try {
      const res = await fetch(`/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        console.error('Error al actualizar estado');
      } else {
        socket.emit('newTask');
      }
    } catch (error) {
      console.error('Error en fetch PUT /tasks/:id:', error);
    }
  };

  window.deleteTask = async (id) => {
    try {
      const res = await fetch(`/tasks/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        console.error('Error al eliminar tarea');
      } else {
        socket.emit('newTask');
      }
    } catch (error) {
      console.error('Error en fetch DELETE /tasks/:id:', error);
    }
  };

  socket.on('tasksUpdated', (tasks) => {
    renderTasks(tasks);
  });

  socket.on('connect', () => {
    console.log('Conectado al servidor WebSocket');
    fetchTasks();
  });
});