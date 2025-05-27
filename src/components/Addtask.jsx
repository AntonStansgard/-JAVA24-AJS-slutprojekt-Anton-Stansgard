// src/components/AddTask.jsx
import { useState, useEffect } from 'react';
import { ref, push, set, onValue } from 'firebase/database';
import { db } from '../firebase.js';

export default function AddTask() {
  // State-variabler för formulärfält
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('frontend');
  const [assignedTo, setAssignedTo] = useState('');
  const [members, setMembers] = useState([]); 
  const [isSubmitting, setIsSubmitting] = useState(false); 
  const [error, setError] = useState(null);

  // Hämtar medlemmar från Firebase när komponenten laddas
  useEffect(() => {
    const membersRef = ref(db, 'members');
    const unsubscribe = onValue(membersRef, (snapshot) => {
      if (snapshot.exists()) {
        const membersData = snapshot.val();
        const membersArray = Object.keys(membersData).map((key) => ({
          id: key,
          ...membersData[key]
        }));
        setMembers(membersArray); // Sparar i state
      }
    });
    return () => unsubscribe(); 
  }, []);

  // Funktion som körs när användaren skickar formuläret
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (!db) throw new Error('Firebase not initialized');

      // Rollbaserad validering, medlemmen måste ha samma roll som kategorin
      const assignedMember = members.find(m => m.id === assignedTo);
      if (assignedTo && assignedMember?.role !== category) {
        setIsSubmitting(false);
        return setError(
          `The selected member's role (${assignedMember?.role}) does not match the selected category (${category}).`
        );
      }

      // Skapar ny uppgift i Firebase
      const tasksRef = ref(db, 'tasks');
      const newTaskRef = push(tasksRef); // genererar unikt ID

      await set(newTaskRef, {
        id: newTaskRef.key,
        title: title.trim(),
        description: description.trim(),
        category,
        assignedTo: assignedTo || null,
        status: assignedTo ? 'in-progress' : 'new', // Status beroende på om uppgiften är tilldelad
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      // Återställ formuläret
      setTitle('');
      setDescription('');
      setCategory('frontend');
      setAssignedTo('');
    } catch (error) {
      console.error('Error adding task:', error.message);
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-task">
      <h2>Create New Task</h2>

      {/* Visar felmeddelande om något gått fel */}
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task title"
          required
          minLength={2} 
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Task description"
        />
        <div className="form-row">
          {/* Dropdown för kategori */}
          <div className="form-group">
            <label>Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="frontend">Frontend</option>
              <option value="backend">Backend</option>
              <option value="ux">UX/Design</option>
            </select>
          </div>

          {/* Dropdown för att tilldela uppgiften */}
          <div className="form-group">
            <label>Assign To</label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
            >
              <option value="">Unassigned</option>
              {members.map(member => (
                <option key={member.id} value={member.id}>
                  {member.name} ({member.role})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Skicka-knapp, inaktiverad om titel saknas eller skickas */}
        <button 
          type="submit" 
          disabled={isSubmitting || !title.trim()}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? 'Adding...' : 'Add Task'}
        </button>
      </form>
    </div>
  );
}
