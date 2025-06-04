import { useEffect, useState } from 'react';
import { ref, update, remove } from 'firebase/database'; 
import { db } from '../firebase.js';

export default function TaskItem({ task = {}, members = [], onStatusChange }) {
  const [isUpdating, setIsUpdating] = useState(false); 
  const [error, setError] = useState(null); // Hanterar felmeddelanden

  // Funktion för att tilldela en medlem till en uppgift och samtidigt ändra status till "in-progress"
  const handleAssign = async (memberId) => {
    if (!memberId || !task.id) return;

    // Hittar vald medlem baserat på ID
    const selectedMember = members.find((m) => m.id === memberId);

    // Kontrollerar att medlemmen finns
    if (!selectedMember) {
      setError('Selected member not found');
      return;
    }

    // Kontrollerar att medlemmens roll matchar uppgiftens kategori
    if (selectedMember.role !== task.category) {
      setError(`This task requires a ${task.category} member.`);
      return;
    }

    setIsUpdating(true);
    setError(null);

    try {
      // Uppdaterar uppgiften i databasen
      const taskRef = ref(db, `tasks/${task.id}`);
      await update(taskRef, {
        assignedTo: memberId,
        status: 'in-progress',
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error('Failed to assign member:', err);
      setError('Failed to assign task');
    } finally {
      setIsUpdating(false);
    }
  };

  // Funktion för att ta bort uppgiften från Firebase
  const handleDelete = async () => {
    if (!task.id) return;

    // Bekräftelse innan borttagning
    const confirm = window.confirm("Are you sure you want to delete this task?");
    if (!confirm) return;

    setIsUpdating(true);
    try {
      // Tar bort uppgiften från databasen
      const taskRef = ref(db, `tasks/${task.id}`);
      await remove(taskRef);
    } catch (err) {
      console.error('Failed to delete task:', err);
      setError('Failed to delete task');
    } finally {
      setIsUpdating(false);
    }
  };

  // Automatisk stängning av felmeddelande efter 5 sekunder
  useEffect(() => {
    if (error) {
      const timeout = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timeout);
    }
  }, [error]);

  return (
    <li className={`task-item ${task.status || 'new'} ${task.category || 'uncategorized'}`}>
      {/* Visar felmeddelande vid problem */}
      {error && (
        <div className="error-banner">
          <p>⚠️ <strong>Error:</strong> {error}</p>
          <button onClick={() => setError(null)}>✖ Close</button>
        </div>
      )}

      <div className="task-header">
        <h3>{task.title || 'Untitled Task'}</h3>
        <span className={`status-badge ${task.status}`}>
          {task.status ? task.status.replace('-', ' ') : 'undefined'}
        </span>
      </div>

      <p className="task-description">{task.description || 'No description'}</p>

      <div className="task-footer">
        {/* Tilldelning av medlem */}
        <div className="assignment-section">
          {task.status === 'new' ? (
            // Väljer medlem att tilldela om status är "new"
            <select
              value={task.assignedTo || ''}
              onChange={(e) => handleAssign(e.target.value)}
              disabled={isUpdating || members.length === 0}
              className="assign-select"
            >
              <option value="">Assign to...</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name} ({member.role})
                </option>
              ))}
            </select>
          ) : (
            // Visar vem uppgiften är tilldelad till 
            <div className="assignee-info">
              {task.assignedTo ? (
                <span className="assignee">
                  {members.find((m) => m.id === task.assignedTo)?.name || 'Unknown member'}
                </span>
              ) : (
                <span className="unassigned">Unassigned</span>
              )}
            </div>
          )}
        </div>

        {/* Ändrar status manuellt via dropdown */}
        <div className="status-select">
          <label htmlFor={`status-select-${task.id}`}>Change Status:</label>
          <select
            id={`status-select-${task.id}`}
            value={task.status}
            onChange={(e) => onStatusChange(task.id, e.target.value)}
            disabled={isUpdating}
          >
            <option value="new">New</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Finished</option>
          </select>
        </div>

        {/* Visar kategori och senaste uppdateringstid */}
        <div className="task-meta">
          <span className="category-tag">{task.category || 'uncategorized'}</span>
          <span className="update-time">
            {task.updatedAt ? `📅 ${new Date(task.updatedAt).toLocaleString()}` : 'No timestamp'}
          </span>
        </div>

        {/* Delete-knapp om status är "done" */}
        {task.status === 'done' && (
          <div className="delete-button">
            <button
              onClick={handleDelete}
              disabled={isUpdating}
              className="delete-task-btn"
            >
              Delete Task
            </button>
          </div>
        )}
      </div>
    </li>
  );
}
