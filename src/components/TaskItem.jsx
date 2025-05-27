import { useEffect, useState } from 'react';
import { ref, update } from 'firebase/database';
import { db } from '../firebase.js';

export default function TaskItem({ task = {}, members = [], onStatusChange }) {
  const [isUpdating, setIsUpdating] = useState(false); 
  const [error, setError] = useState(null); // 

  //  Funktion för att tilldela en medlem till en uppgift och samtidigt ändra status till "in-progress"
  const handleAssign = async (memberId) => {
    if (!memberId || !task.id) return;

    // Hittar vald medlem baserat på ID
    const selectedMember = members.find((m) => m.id === memberId);

    //  Kontrollerar att medlemmen finns
    if (!selectedMember) {
      setError('Selected member not found');
      return;
    }

    //  Kontrollerar att medlemmens roll matchar uppgiftens kategori
    if (selectedMember.role !== task.category) {
      setError(`This task requires a ${task.category} member.`);
      return;
    }

    
    setIsUpdating(true);
    setError(null);

    try {
      // Uppdaterar  i databasen
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

  return (
    <li className={`task-item ${task.status || 'new'} ${task.category || 'uncategorized'}`}>
      
      {error && (
        <div className="error-banner">
          
          <button onClick={() => setError(null)}>Dismiss</button>
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
        {/*  Tilldelning av medlem */}
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
                  👤 {members.find((m) => m.id === task.assignedTo)?.name || 'Unknown member'}
                </span>
              ) : (
                <span className="unassigned">Unassigned</span>
              )}
            </div>
          )}
        </div>

        {/*  Ändrar status manuellt via dropdown */}
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

        {/*  Visar kategori och senaste uppdateringstid */}
        <div className="task-meta">
          <span className="category-tag">{task.category || 'uncategorized'}</span>
          <span className="update-time">
            {task.updatedAt ? `📅 ${new Date(task.updatedAt).toLocaleString()}` : 'No timestamp'}
          </span>
        </div>
      </div>
    </li>
  );
}
