import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './style.css'; // Adjust the path if necessary
import { useNavigate } from 'react-router-dom'; // For redirection

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Navigation for redirection

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/todos', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setTasks(response.data);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        setError('Could not fetch tasks. Please try again later.');
      }
    };

    fetchTasks();
  }, []);

  const handleAddTask = async () => {
    try {
      // Add new task with default status "pending"
      await axios.post('http://localhost:5000/api/todos', {
        title: newTask,
        description: '', // Placeholder for description
        status: 'pending', // Default status for new tasks
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setNewTask(''); // Reset input field
      // Refetch tasks after adding a new one
      const response = await axios.get('http://localhost:5000/api/todos', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setTasks(response.data);
    } catch (error) {
      console.error('Error adding task:', error);
      setError('Could not add task. Please try again.');
    }
  };

  const handleUpdateTask = async (taskId, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/todos/${taskId}`, {
        status: newStatus,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      // Refetch tasks after updating the status
      const response = await axios.get('http://localhost:5000/api/todos', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setTasks(response.data);
    } catch (error) {
      console.error('Error updating task:', error);
      setError('Could not update task. Please try again.');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await axios.delete(`http://localhost:5000/api/todos/${taskId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      // Refetch tasks after deleting
      const response = await axios.get('http://localhost:5000/api/todos', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setTasks(response.data);
    } catch (error) {
      console.error('Error deleting task:', error);
      setError('Could not delete task. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login'); // Redirect to login page
  };

  return (
    <div className="dashboard">
      <div className="header">
        <h1>Dashboard</h1>
        <button className="btn btn-secondary" onClick={handleLogout}>
          Log Out
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      
      <div className="task-input">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add a new task"
        />
        <button onClick={handleAddTask}>Add Task</button>
      </div>

      <ul className="task-list">
        {tasks.map((task) => (
          <li key={task.id} className="task-item">
            <h2>{task.title}</h2>
            <p>Status: {task.status}</p>
            <select
              value={task.status}
              onChange={(e) => handleUpdateTask(task.id, e.target.value)}
            >
              <option value="pending">Pending</option>
              <option value="in progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="done">Done</option>
            </select>
            <button onClick={() => handleDeleteTask(task.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;
